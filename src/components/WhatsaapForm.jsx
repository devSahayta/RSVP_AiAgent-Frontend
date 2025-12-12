import React, { useState, useEffect } from "react";
import "../styles/document-form.css"; // your custom CSS file

const WhatsaapForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    user_id: "", // gets automatically from backend
    app_id: "",
    waba_id: "",
    phone_number_id: "",
    business_phone_number: "",
    system_user_access_token: "",
  });

  // FETCH USER_ID FROM BACKEND AUTOMATICALLY
  useEffect(() => {
    const getUserId = async () => {
      try {
        const res = await fetch("http://localhost:5000/get-user-id");
        const data = await res.json();
        setForm((prev) => ({ ...prev, user_id: data.user_id }));
      } catch (err) {
        console.error("Error fetching user_id:", err);
      }
    };

    getUserId();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(form);
  };

  return (
    <div className="form-card">
      <h2 className="form-title">Connect WhatsApp Account</h2>

      <form onSubmit={handleSubmit}>
        {/* NEW FIELDS START HERE */}

        <label className="form-label">App ID</label>
        <input
          type="text"
          name="app_id"
          className="form-input"
          value={form.app_id}
          onChange={handleChange}
        />

        <label className="form-label">Whatsaap Business Account ID</label>
        <input
          type="text"
          name="waba_id"
          className="form-input"
          value={form.waba_id}
          onChange={handleChange}
        />

        <label className="form-label">Phone Number ID</label>
        <input
          type="text"
          name="phone_number_id"
          className="form-input"
          value={form.phone_number_id}
          onChange={handleChange}
        />

        <label className="form-label">Business Phone Number</label>
        <input
          type="text"
          name="business_phone_number"
          className="form-input"
          value={form.business_phone_number}
          onChange={handleChange}
        />

        <label className="form-label">System User Access Token</label>
        <input
          type="text"
          name="system_user_access_token"
          className="form-input"
          value={form.system_user_access_token}
          onChange={handleChange}
        />

        {/* user_id stays hidden */}
        <input type="hidden" name="user_id" value={form.user_id} />

        <button className="submit-btn" type="submit">
          Submit
        </button>
      </form>
    </div>
  );
};

export default WhatsaapForm;
