export const getUserFromBackend = async (userId) => {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/${userId}`);
  return res.json();
};

export const addUserToBackend = async (user) => {
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  return res.json();
};
