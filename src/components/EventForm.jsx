// components/EventForm.jsx
import React, { useState } from 'react';
import { Upload, Calendar, Type, Check, AlertCircle, Download } from 'lucide-react';
import '../styles/form.css';

const EventForm = ({ user }) => {
  const [formData, setFormData] = useState({
    eventName: '',
    eventDate: '',
    dataset: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      dataset: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Prepare form data for backend
     // inside handleSubmit
const payload = new FormData();
payload.append("user_id", user?.id); // ✅ Use Kinde id
console.log("Submitting event for user_id:", user?.id);
payload.append("event_name", formData.eventName);
payload.append("event_date", formData.eventDate);

if (!user?.id) {
  setSubmitStatus("error");
  setMessage("User not authenticated. Cannot create event.");
  setIsSubmitting(false);
  return;
}



      if (formData.dataset) {
        payload.append("dataset", formData.dataset);
      }

      const response = await fetch("https://rsvp-aiagent-backend.onrender.com/api/events", {
        method: "POST",
        body: payload
      });

      if (!response.ok) {
        throw new Error("Failed to create event");
      }

      const data = await response.json();
      console.log("✅ Event created:", data);

      setSubmitStatus('success');
      setMessage('Event created successfully!');

      // Reset form
      setFormData({
        eventName: '',
        eventDate: '',
        dataset: null
      });
      const fileInput = document.getElementById('dataset');
      if (fileInput) fileInput.value = '';

    } catch (error) {
      setSubmitStatus('error');
      setMessage('Failed to create event. Please try again.');
      console.error('Error creating event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadTemplate = () => {
  const link = document.createElement('a');
  link.href = "https://docs.google.com/spreadsheets/d/1FGZaAMEMNjG_8iwyUnlLdC5-BiDQrcosprs6awrADQo/export?format=csv";
  link.download = "RSVP_Mockup_template.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-group">
          <label htmlFor="eventName" className="form-label">
            <Type size={20} />
            Event Name
          </label>
          <input
            type="text"
            id="eventName"
            name="eventName"
            value={formData.eventName}
            onChange={handleInputChange}
            required
            className="form-input"
            placeholder="Enter event name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="eventDate" className="form-label">
            <Calendar size={20} />
            Event Date
          </label>
          <input
            type="date"
            id="eventDate"
            name="eventDate"
            value={formData.eventDate}
            onChange={handleInputChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="dataset" className="form-label">
            <Upload size={20} />
            Upload Dataset (CSV)
          </label>
          <div className="upload-instructions">
            <p className="upload-note">
              Please upload your RSVP list in the given format. You can download the sample template here.
            </p>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="template-download-btn"
            >
              <Download size={16} />
              Download Sample Template
            </button>
          </div>
          <input
            type="file"
            id="dataset"
            accept=".csv"
            onChange={handleFileChange}
            required
            className="form-input file-input"
          />
          {formData.dataset && (
            <p className="file-info">Selected: {formData.dataset.name}</p>
          )}
        </div>

        {submitStatus && (
          <div className={`status-message ${submitStatus}`}>
            {submitStatus === 'success' ? (
              <Check size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span>{message}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="submit-button"
        >
          {isSubmitting ? 'Creating Event...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
};

export default EventForm;
