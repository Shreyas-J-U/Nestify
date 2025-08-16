import supabase from "../config/supabaseClient.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing or invalid Authorization header" });
    }

    const token = authHeader.split(" ")[1];

    // ✅ Validate token and get user from Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      console.error("Auth error:", error);
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // ✅ Attach clean user object to req
    req.user = {
      id: data.user.id,
      email: data.user.email,
      raw: data.user // store full object in case we need it later
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ message: err.message });
  }
};
