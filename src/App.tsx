import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login.tsx";
import Dashboard from "./pages/dashboard.tsx";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const getTokenFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      let token = params.get("token") || params.get("access_token");
      if (!token && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        token = hashParams.get("token") || hashParams.get("access_token");
      }
      return token;
    };

    const token = getTokenFromUrl();
    console.log("AuthSuccess: current URL ->", window.location.href);

    if (token) {
      sessionStorage.setItem("github_token", token);
      const masked = token.length > 12 ? `${token.slice(0,6)}...${token.slice(-6)}` : token;
      console.log("AuthSuccess: token saved (masked):", masked);
      navigate("/dashboard");
    } else {
      console.warn("AuthSuccess: no token found in url", window.location.href);
      navigate("/");
    }
  }, [navigate]);

  return <div>Logging in...</div>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
