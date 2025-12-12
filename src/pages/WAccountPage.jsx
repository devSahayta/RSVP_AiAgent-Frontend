import React from "react";
import WhatsaapForm from "../components/WhatsaapForm";

const WAccountPage = () => {
  const handleFormSubmit = async (data) => {
    console.log("Frontend sending:", data);

    try {
      const response = await fetch("http://localhost:5000/create-waccount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await response.json();
      console.log("Backend Response:", resData);
      alert("WhatsApp account created successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong!");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <WhatsaapForm onSubmit={handleFormSubmit} />
    </div>
  );
};

export default WAccountPage;
