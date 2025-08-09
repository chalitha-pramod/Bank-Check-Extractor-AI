import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const TestExtraction = () => {
  // Sample extracted data from the user
  const sampleData = {
    "micr_code": "056111 063-978⑆ 1007928",
    "cheque_date": "07 November 2017",
    "amount_number": "8.01",
    "amount_words": "EIGHT DOLLARS AND ONE CENT",
    "payee_name": "JULIUS EVENTS COLLEGE PTY LTD",
    "account_number": "",
    "anti_fraud_features": "Watermark (likely, based on the background pattern), microprinting (possibly, but not clearly visible in the provided image), 'Not Negotiable' printed on the cheque."
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
          Test Extraction Display
        </h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          This shows how the extracted data should be displayed
        </p>
      </div>

      {/* Extracted Information */}
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
              <strong>👤 Payee Name:</strong> {sampleData.payee_name || 'Not available'}
            </div>
            <div className="info-item">
              <strong>💰 Amount:</strong> {sampleData.amount_number || 'Not available'} USD
            </div>
            <div className="info-item">
              <strong>📝 Amount in Words:</strong> {sampleData.amount_words || 'Not available'}
            </div>
            <div className="info-item">
              <strong>📅 Cheque Date:</strong> {sampleData.cheque_date || 'Not available'}
            </div>
          </div>

          <div className="info-section">
            <h4>Bank Details</h4>
            <div className="info-item">
              <strong>🔢 MICR Code:</strong> {sampleData.micr_code || 'Not available'}
            </div>
            <div className="info-item">
              <strong>🏦 Account Number:</strong> {sampleData.account_number || 'Not available'}
            </div>
            <div className="info-item">
              <strong>💱 Currency:</strong> USD
            </div>
          </div>

          {sampleData.anti_fraud_features && (
            <div className="info-section">
              <h4>Security Features</h4>
              <div className="info-item">
                <strong>🔒 Anti-Fraud Features:</strong> {sampleData.anti_fraud_features}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Raw Extracted Text */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>
          <span style={{ marginRight: '8px' }}>📄</span>
          Raw Extracted Text
        </h3>
        <div style={{ 
          backgroundColor: 'rgba(102, 126, 234, 0.05)',
          padding: '1.5rem',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '14px',
          whiteSpace: 'pre-wrap',
          maxHeight: '300px',
          overflowY: 'auto',
          border: '1px solid rgba(102, 126, 234, 0.2)'
        }}>
          {JSON.stringify(sampleData, null, 2)}
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
          This is how the extracted information should appear when the system is working correctly. 
          The data should be properly parsed from the JSON response and displayed in the appropriate fields.
        </p>
      </div>
    </div>
  );
};

export default TestExtraction;
