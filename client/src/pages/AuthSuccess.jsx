// src/pages/AuthSuccess.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    let token;

    // Check query parameters
    const queryParams = new URLSearchParams(window.location.search);
    token = queryParams.get("token");

    // If not in query, check hash fragment (OAuth)
    if (!token && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1)); // remove '#'
      token = hashParams.get("access_token") || hashParams.get("token");
    }

    if (token) {
      localStorage.setItem("authToken", token);
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return <p>Logging you in...</p>;
}
