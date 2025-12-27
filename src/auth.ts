export const verifyToken = async () => {
  const token = sessionStorage.getItem("github_token");
  if (!token) return null;

  const res = await fetch("http://localhost:8000/api/auth/verify", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    sessionStorage.clear();
    return null;
  }

  return res.json();
};
