import React from 'react';
import { Link } from 'react-router-dom';

const CheckDetails = () => {
  // Sample extracted data from the user - this is the JSON data that should be displayed
  const extractedData = {
    micr_code: "056111 063-978⑆ 1007928",
    cheque_date: "07 November 2017",
    amount_number: "8.01",
    amount_words: "EIGHT DOLLARS AND ONE CENT",
    payee_name: "JULIUS EVENTS COLLEGE PTY LTD",
    account_number: "",
    anti_fraud_features: "Watermark (likely, based on the background pattern), microprinting (possibly, but not clearly visible in the provided image), 'Not Negotiable' printed on the cheque."
  };

  return (
    <div className="card">
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/dashboard" className="btn btn-secondary">
          <span style={{ marginRight: '8px' }}>←</span>
          Back to Dashboard
        </Link>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#333', marginBottom: '0.5rem' }}>
          Bank Check Details
        </h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          AI-extracted information from your uploaded check
        </p>
      </div>
      
      <div style={{ 
        marginBottom: '2rem', 
        padding: '1rem', 
        backgroundColor: 'rgba(102, 126, 234, 0.1)', 
        borderRadius: '8px',
        fontSize: '14px',
        color: '#667eea',
        border: '1px solid rgba(102, 126, 234, 0.2)'
      }}>
        <strong>📅 Extracted On:</strong> {new Date().toLocaleString()}
        <span> | <strong>📁 Image File:</strong> sample-check.jpg</span>
      </div>

      {/* Extracted Information - This is what should be displayed from JSON data */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>
          <span style={{ marginRight: '8px' }}>📋</span>
          Extracted Information
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1.5rem',
          marginTop: '1rem'
        }}>
          <div className="info-section">
            <h4>Basic Details</h4>
            <div className="info-item">
              <strong>👤 Payee Name:</strong> {extractedData.payee_name}
            </div>
            <div className="info-item">
              <strong>💰 Amount:</strong> {extractedData.amount_number} USD
            </div>
            <div className="info-item">
              <strong>📝 Amount in Words:</strong> {extractedData.amount_words}
            </div>
            <div className="info-item">
              <strong>📅 Cheque Date:</strong> {extractedData.cheque_date}
            </div>
          </div>

          <div className="info-section">
            <h4>Bank Details</h4>
            <div className="info-item">
              <strong>🔢 MICR Code:</strong> {extractedData.micr_code}
            </div>
            <div className="info-item">
              <strong>🏦 Account Number:</strong> {extractedData.account_number || 'Not available'}
            </div>
            <div className="info-item">
              <strong>💱 Currency:</strong> USD
            </div>
          </div>

          {extractedData.anti_fraud_features && (
            <div className="info-section">
              <h4>Security Features</h4>
              <div className="info-item">
                <strong>🔒 Anti-Fraud Features:</strong> {extractedData.anti_fraud_features}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* JSON Data that was used to populate the above information */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: '#28a745', marginBottom: '1rem' }}>
          <span style={{ marginRight: '8px' }}>🔍</span>
          JSON Data Used for Extraction
        </h3>
        <div style={{ 
          backgroundColor: 'rgba(40, 167, 69, 0.1)',
          padding: '1.5rem',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '14px',
          whiteSpace: 'pre-wrap',
          maxHeight: '300px',
          overflowY: 'auto',
          border: '1px solid rgba(40, 167, 69, 0.3)'
        }}>
          {JSON.stringify(extractedData, null, 2)}
        </div>
      </div>

      <div style={{ 
        marginTop: '2rem', 
        padding: '1.5rem', 
        backgroundColor: 'rgba(40, 167, 69, 0.1)', 
        borderRadius: '12px',
        border: '1px solid rgba(40, 167, 69, 0.3)'
      }}>
        <h4 style={{ color: '#28a745', marginBottom: '1rem' }}>
          <span style={{ marginRight: '8px' }}>✅</span>
          Expected Result
        </h4>
        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
          This shows exactly how the extracted information should appear when the JSON data is properly parsed and displayed. 
          The data above comes directly from the JSON object and should match what you see in the "Extracted Information" section.
        </p>
      </div>

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        flexWrap: 'wrap',
        justifyContent: 'center',
        padding: '1.5rem',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        marginTop: '2rem'
      }}>
        <button className="btn btn-info">
          <span style={{ marginRight: '8px' }}>📊</span>
          Export CSV
        </button>
        <button className="btn btn-info">
          <span style={{ marginRight: '8px' }}>📄</span>
          Export PDF
        </button>
        <button className="btn btn-danger">
          <span style={{ marginRight: '8px' }}>🗑️</span>
          Delete Check
        </button>
      </div>
    </div>
  );
};

export default CheckDetails;
