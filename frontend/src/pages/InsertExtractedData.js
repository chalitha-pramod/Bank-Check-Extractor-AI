import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const InsertExtractedData = () => {
  const { id } = useParams();
  const [check, setCheck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [extractedData, setExtractedData] = useState({
    micr_code: "056111 063-978⑆ 1007928",
    cheque_date: "07 November 2017",
    amount_number: "8.01",
    amount_words: "EIGHT DOLLARS AND ONE CENT",
    payee_name: "JULIUS EVENTS COLLEGE PTY LTD",
    account_number: "",
    anti_fraud_features: "Watermark (likely, based on the background pattern), microprinting (possibly, but not clearly visible in the provided image), 'Not Negotiable' printed on the cheque."
  });

  useEffect(() => {
    if (id) {
      fetchCheck();
    } else {
      setLoading(false);
    }
  }, [id, fetchCheck]);

  const fetchCheck = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/checks/${id}`);
      setCheck(response.data.check);
    } catch (error) {
      toast.error('Failed to fetch check details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setExtractedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/checks/${id}/insert-extracted-data`, {
        extractedData: extractedData
      });

      toast.success('Extracted data inserted successfully!');
      
      // Refresh the check data
      await fetchCheck();
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to insert extracted data';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickInsert = async () => {
    setSubmitting(true);

    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/checks/${id}/insert-extracted-data`, {
        extractedData: extractedData
      });

      toast.success('Sample extracted data inserted successfully!');
      
      // Refresh the check data
      await fetchCheck();
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to insert extracted data';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <span>Loading check details...</span>
      </div>
    );
  }

  if (!check) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
        <h2 style={{ color: '#333', marginBottom: '1rem' }}>Check not found</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          The check you're looking for doesn't exist or has been deleted.
        </p>
        <Link to="/dashboard" className="btn btn-secondary">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

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
          Insert Extracted Data
        </h1>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Add extracted information for check ID: {check.id}
        </p>
      </div>

      {/* Current Check Info */}
      <div style={{ 
        marginBottom: '2rem', 
        padding: '1rem', 
        backgroundColor: 'rgba(102, 126, 234, 0.1)', 
        borderRadius: '8px',
        fontSize: '14px',
        color: '#667eea',
        border: '1px solid rgba(102, 126, 234, 0.2)'
      }}>
        <strong>📁 Current Check:</strong> {check.image_filename || 'No image'}
        <span> | <strong>📅 Created:</strong> {new Date(check.created_at).toLocaleString()}</span>
      </div>

      {/* Quick Insert Button */}
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={handleQuickInsert}
          disabled={submitting}
          className="btn btn-success"
          style={{ width: '100%', marginBottom: '1rem' }}
        >
          {submitting ? 'Inserting...' : 'Quick Insert Sample Data'}
        </button>
        <p style={{ color: '#666', fontSize: '14px', textAlign: 'center', margin: 0 }}>
          This will insert the sample extracted data shown below
        </p>
      </div>

      {/* Extracted Data Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div>
            <h4>Basic Details</h4>
            <div className="form-group">
              <label>Payee Name:</label>
              <input
                type="text"
                value={extractedData.payee_name}
                onChange={(e) => handleInputChange('payee_name', e.target.value)}
                className="form-control"
                placeholder="Enter payee name"
              />
            </div>
            <div className="form-group">
              <label>Amount (Numbers):</label>
              <input
                type="text"
                value={extractedData.amount_number}
                onChange={(e) => handleInputChange('amount_number', e.target.value)}
                className="form-control"
                placeholder="Enter amount (e.g., 8.01)"
              />
            </div>
            <div className="form-group">
              <label>Amount in Words:</label>
              <input
                type="text"
                value={extractedData.amount_words}
                onChange={(e) => handleInputChange('amount_words', e.target.value)}
                className="form-control"
                placeholder="Enter amount in words"
              />
            </div>
            <div className="form-group">
              <label>Cheque Date:</label>
              <input
                type="text"
                value={extractedData.cheque_date}
                onChange={(e) => handleInputChange('cheque_date', e.target.value)}
                className="form-control"
                placeholder="Enter cheque date"
              />
            </div>
          </div>

          <div>
            <h4>Bank Details</h4>
            <div className="form-group">
              <label>MICR Code:</label>
              <input
                type="text"
                value={extractedData.micr_code}
                onChange={(e) => handleInputChange('micr_code', e.target.value)}
                className="form-control"
                placeholder="Enter MICR code"
              />
            </div>
            <div className="form-group">
              <label>Account Number:</label>
              <input
                type="text"
                value={extractedData.account_number}
                onChange={(e) => handleInputChange('account_number', e.target.value)}
                className="form-control"
                placeholder="Enter account number"
              />
            </div>
            <div className="form-group">
              <label>Anti-Fraud Features:</label>
              <textarea
                value={extractedData.anti_fraud_features}
                onChange={(e) => handleInputChange('anti_fraud_features', e.target.value)}
                className="form-control"
                placeholder="Enter anti-fraud features"
                rows="3"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ textAlign: 'center' }}>
          <button 
            type="submit" 
            disabled={submitting}
            className="btn btn-primary"
            style={{ minWidth: '200px' }}
          >
            {submitting ? 'Inserting...' : 'Insert Extracted Data'}
          </button>
        </div>
      </form>

      {/* Preview */}
      <div style={{ marginTop: '2rem' }}>
        <h4>Data Preview:</h4>
        <div style={{ 
          backgroundColor: 'rgba(102, 126, 234, 0.05)',
          padding: '1rem',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '12px',
          whiteSpace: 'pre-wrap',
          border: '1px solid rgba(102, 126, 234, 0.2)'
        }}>
          {JSON.stringify(extractedData, null, 2)}
        </div>
      </div>
    </div>
  );
};

export default InsertExtractedData;


