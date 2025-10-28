export const addUserToBackend = async (user) => {
  try {
    // Use email prefix if name is missing
    const userName = user.name || (user.email ? user.email.split('@')[0] : "Unknown");

    // Check if user exists
    const check = await fetch([`https://rsvp-aiagent-backend.onrender.com/api/users/${user.id}`,`http://localhost:5000/api/user${user.id}`]);
    if (check.ok) {
      const existingUser = await check.json();
      if (existingUser) return existingUser; // already exists
    }

    // Add user
    const response = await fetch(["https://rsvp-aiagent-backend.onrender.com/api/users","http://localhost:5000/api/user"], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        name: userName,
        email: user.email,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to add user");

    return data.user;
  } catch (error) {
    console.error("Error adding user to backend:", error);
    return null;
  }
};
