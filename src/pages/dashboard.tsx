import { useEffect, useState } from "react";
import { verifyToken } from "../auth.ts";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    verifyToken().then((data) => {
      if (!data) {
        window.location.href = "/";
      } else {
        setUser(data);
      }
    });
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h2>Welcome, {user.login}</h2>
      <p>GitHub ID: {user.id}</p>
    </div>
  );
};

export default Dashboard;
