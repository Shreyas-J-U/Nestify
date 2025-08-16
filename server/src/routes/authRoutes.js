import express from "express";
import supabase from "../config/supabaseClient.js";

const router = express.Router();

// Just a health check for auth
router.get("/status", (req, res) => {
  res.json({ message: "Auth service is running" });
});

// Login failed (optional)
router.get("/login-failed", (req, res) => {
  res.status(401).json({ message: "❌ Login failed" });
});

// Logout (client should also clear local storage)
router.post("/logout", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(400).json({ message: "No token provided" });

  const { error } = await supabase.auth.admin.signOut(token);
  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: "✅ Logged out successfully" });
});

export default router;
