import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Landing from "../pages/landing.tsx";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const user = params.get("user");

    if (token && user) {
      sessionStorage.setItem("github_token", token);
      sessionStorage.setItem("github_user", user);
      navigate("/dashboard");
    }
  }, []);

  return (
    <div>
      <h1>Welcome to Octopus</h1>
      <Landing />
    </div>
  );
};

export default Login;
