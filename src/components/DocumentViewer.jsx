import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, Eye, Loader2 } from 'lucide-react';
import '../styles/DocumentViewer.css';
import { useParams } from 'react-router-dom';

const DocumentViewer = ({ onBack }) => {
  const { participantId } = useParams(); // ✅ Read from URL
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
  console.log("📄 Viewing documents for participant:", participantId);
}, [participantId]);


  // ✅ Fetch documents from backend
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError('');

        // 👇 Replace this URL with your actual backend endpoint
        const response = await fetch(
          `http://localhost:5000/api/uploads/${participantId}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch documents');
        }

        const data = await response.json();
        console.log(data)
        setDocuments(data.uploads || []);
      } catch (err) {
        console.error(err);
        setError('Error fetching documents. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (participantId) {
      fetchDocuments();
    }
  }, [participantId]);

  const handleViewDocument = (documentUrl) => {
    window.open(documentUrl, '_blank', 'noopener,noreferrer');
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="document-viewer">
      {/* Header */}
      <div className="document-viewer-header">
        <button className="back-button" onClick={handleBack}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="header-content">
          <h1>Document Viewer</h1>
          {/* <p>View all uploaded documents</p> */}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="loading-state">
          <Loader2 size={32} className="spin" />
          <p>Loading documents...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <FileText size={48} />
          <h3>{error}</h3>
        </div>
      ) : (
        <div className="documents-container">
          {documents.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} />
              <h3>No documents uploaded yet</h3>
              <p>Documents will appear here once they are uploaded</p>
            </div>
          ) : (
            <div className="documents-grid">
              {documents.map((doc) => (
                <div key={doc.upload_id} className="document-card">
                  <div className="document-header">
                    <div className="document-icon">
                      <FileText size={24} />
                    </div>
                    <div className="document-info">
                      <h3 className="participant-name">
                        {doc.participant_relatives_name || 'Self'}
                      </h3>
                      <p className="document-type">{doc.document_type}</p>
                    </div>
                  </div>

                  <div className="document-details">
                    <span className="role-badge">{doc.role}</span>
                  </div>

                  <div className="document-actions">
                    <button
                      className="view-document-btn"
                      onClick={() => handleViewDocument(doc.document_url)}
                    >
                      <Eye size={16} />
                      View Document
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;
