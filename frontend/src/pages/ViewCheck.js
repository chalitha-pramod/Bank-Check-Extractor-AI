import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { extractCheckInformation } from '../utils/jsonDataHelper';

// Change this if your backend URL changes
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://bank-check-extractor-ai-backend.vercel.app';

const Dashboard = ({ user }) => {
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChecks();
  }, []);

  const fetchChecks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/checks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setChecks(response.data.checks || []);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        toast.error('Failed to fetch checks');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (checkId) => {
    if (window.confirm('Are you sure you want to delete this check?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/checks/${checkId}`);
        setChecks(checks.filter(check => check.id !== checkId));
        toast.success('Check deleted successfully');
      } catch (error) {
        toast.error('Failed to delete check');
      }
    }
  };

  const handleExportCSV = async (checkId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/checks/${checkId}/export-csv`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bank_check_${checkId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV exported successfully');
    } catch (error) {
      toast.error('Failed to export CSV');
    }
  };

  const handleExportPDF = async (checkId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/checks/${checkId}/export-pdf`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bank_check_${checkId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF exported successfully');
    } catch (error) {
      toast.error('Failed to export PDF');
    }
  };

  const handleInsertSampleData = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/checks/insert-sample`);
      toast.success('Sample data inserted successfully!');
      fetchChecks();
    } catch (error) {
      toast.error('Failed to insert sample data');
    }
  };

  const getPayeeName = (check) => {
    const fromJson = check.extractedInfo?.payee_name;
    const fromDb = check.payee_name;
    const name = (fromJson && fromJson.trim()) || (fromDb && fromDb.trim());
    return name || 'Unnamed Check';
  };

  const getPayeeBadge = (check) => {
    if (check.extractedInfo?.payee_name && !check.payee_name) {
      return (
        <span className="badge" style={{ marginLeft: 8, background:'#e6f4ff', color:'#1d4ed8', border:'1px solid #93c5fd' }}>
          AI
        </span>
      );
    }
    return null;
  };

  const getAmountDisplay = (check) => {
    const amount = check.extractedInfo?.amount_number || check.amount_number;
    const currency = check.extractedInfo?.currency || check.currency_name || 'USD';
    return amount ? `${amount} ${currency}` : null;
  };

  const getCheckDetail = (check, fieldName) => {
    return check.extractedInfo?.[fieldName] || check[fieldName];
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <span>Loading your checks...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="welcome-message">Welcome back, {user.username}! 👋</h1>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>
            Manage your extracted bank checks and extract new ones
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/extract" className="btn btn-success">
            <span style={{ fontSize: '18px', marginRight: '8px' }}>+</span>
            Extract New Check
          </Link>
        </div>
      </div>

      {checks.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
          <h3 style={{ color: '#333', marginBottom: '1rem' }}>
            No checks extracted yet
          </h3>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            Upload your first bank check image to get started with AI-powered extraction
          </p>
          <Link to="/extract" className="btn btn-success">
            Extract Your First Check
          </Link>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: '#333', margin: 0 }}>
              Your Extracted Checks ({checks.length})
            </h2>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
          
          {checks.map(check => (
            <div key={check.id} className="check-card">
              <div className="check-header">
                <h3 className="check-title">
                  {getPayeeName(check)}{getPayeeBadge(check)}
                </h3>
                <div className="check-amount">
                  {getAmountDisplay(check) && (
                    <span className="amount-display">
                      {getAmountDisplay(check)}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="check-details">
                {getCheckDetail(check, 'cheque_date') && (
                  <p><strong>Date:</strong> {getCheckDetail(check, 'cheque_date')}</p>
                )}
                {getCheckDetail(check, 'micr_code') && (
                  <p><strong>MICR Code:</strong> {getCheckDetail(check, 'micr_code')}</p>
                )}
                {getCheckDetail(check, 'account_number') && (
                  <p><strong>Account:</strong> {getCheckDetail(check, 'account_number')}</p>
                )}
                {getCheckDetail(check, 'amount_words') && (
                  <p><strong>Amount in Words:</strong> {getCheckDetail(check, 'amount_words')}</p>
                )}
              </div>
              
              <div className="check-meta">
                <span>Extracted: {new Date(check.created_at).toLocaleDateString()}</span>
              </div>
              
              <div className="check-actions">
                <Link to={`/check/${check.id}`} className="btn btn-secondary">👁️ View Details</Link>
                <Link to={`/insert-data/${check.id}`} className="btn btn-warning">📝 Insert Data</Link>
                <button onClick={() => handleExportCSV(check.id)} className="btn btn-info">📊 Export CSV</button>
                <button onClick={() => handleExportPDF(check.id)} className="btn btn-info">📄 Export PDF</button>
                <button onClick={() => handleDelete(check.id)} className="btn btn-danger">🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
