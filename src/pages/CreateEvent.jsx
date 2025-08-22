import React from 'react';
import EventForm from '../components/EventForm';
import '../styles/pages.css';

const CreateEvent = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Create New Event</h1>
        <p className="page-subtitle">Set up your RSVP event and upload guest data</p>
      </div>
      <EventForm />
    </div>
  );
};

export default CreateEvent;