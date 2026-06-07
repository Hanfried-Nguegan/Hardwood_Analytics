import { Router, Request, Response } from "express";
import { supabase } from "../db/client";
import { generateJWT, verifyJWT } from "../services/auth.service";
import { AuthResponse } from "../types/auth";

const router = Router();

router.post("/auth/google-callback", async (req: Request, res: Response) => {
  try {
    // extract supabase token from the frontend
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({ error: "No access token provided" });
    }
    // ask supabase is the token valid ? if yes who is the user ?
    const { data, error } = await supabase.auth.getUser(access_token);

    if (error || !data.user) {
      return res.status(401).json({ error: "Invalid supabase token" });
    }

    // extract user info from supabase response
    const { email, user_metadata } = data.user;
    const google_id = data.user.id;

    if (!email) {
      return res
        .status(400)
        .json({ error: "User Email is missing from the provider" });
    }

    // tries to find user by email
    let { data: authUser } = await supabase
      .from("auth_users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    // if not found by email default back to using google_id
    if (!authUser) {
      const { data: byGoogle } = await supabase
        .from("auth_users")
        .select("*")
        .eq("google_id", google_id)
        .maybeSingle();

      authUser = byGoogle || null;
    }

    //if user still doesn't exist create a new user
    if (!authUser) {
      const { data: newUser, error: createError } = await supabase
        .from("auth_users")
        .insert({
          email,
          google_id,
          username: user_metadata?.preferred_username || email.split("@")[0],
        })
        .select()
        .single();

      if (createError || !newUser) {
        console.error("Failed to create user:", createError);

        return res.status(500).json({ error: "Failed to create user" });
      }

      authUser = newUser;
    }

    // generate my own backend jwt
    const token = generateJWT(authUser.id, authUser.email, authUser.username);
    
    // build final response sent to frontend
    const response: AuthResponse = {
      token,
      user: {
        id: authUser.id,
        email: authUser.email,
        username: authUser.username,
      },
    };
    return res.json(response);
  } catch (err) {
    console.error("Auth error", err);

    return res.status(500).json({ error: "Authentication failed" });
  }
});

// checks if the backend jwt is valid
router.get("/auth/verify", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ valid: false });
  }

  const decoded = verifyJWT(token);

  if (!decoded) {
    return res.status(401).json({ valid: false });
  }

  return res.json({ valid: true, user: decoded });
});

export default router;
