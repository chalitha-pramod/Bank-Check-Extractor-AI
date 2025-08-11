import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { extractCheckInformation } from '../utils/jsonDataHelper';
import { logHealthReport, displayHealthReport } from '../utils/databaseHealth';

const Dashboard = ({ user }) => {
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showHealthReport, setShowHealthReport] = useState(false);
  const [healthReportContainer, setHealthReportContainer] = useState(null);
  const [dbConnectionStatus, setDbConnectionStatus] = useState('unknown'); // 'unknown', 'connected', 'failed'

  useEffect(() => {
    fetchChecks();
    // Test database connection on component mount
    testDatabaseConnection();
  }, []);

  const fetchChecks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        toast.error('Authentication required. Please login again.');
        setError('Authentication required');
        return;
      }

      console.log('🔍 Fetching checks from:', 'https://bank-check-extractor-ai-backend.vercel.app/api/checks');
      
      const response = await axios.get('https://bank-check-extractor-ai-backend.vercel.app/api/checks', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000 // 10 second timeout
      });
      
      console.log('📊 API Response:', response.data);
      
      if (response.data && response.data.checks) {
        setChecks(response.data.checks);
        console.log('✅ Checks loaded successfully:', response.data.checks.length, 'checks');
      } else {
        console.warn('⚠️ No checks data in response:', response.data);
        setChecks([]);
      }
      
    } catch (error) {
      console.error('❌ Failed to fetch checks:', error);
      
      let errorMessage = 'Failed to fetch checks';
      let shouldRetry = false;
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Database connection issue.';
          shouldRetry = true;
        } else if (error.response.status === 404) {
          errorMessage = 'API endpoint not found.';
        } else {
          errorMessage = `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Check your connection.';
        shouldRetry = true;
      } else {
        // Something else happened
        errorMessage = error.message || 'Network error';
        shouldRetry = true;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Auto-retry for connection issues
      if (shouldRetry && retryCount < 3) {
        console.log(`🔄 Retrying in 3 seconds... (attempt ${retryCount + 1}/3)`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchChecks();
        }, 3000);
      }
      
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (checkId) => {
    if (window.confirm('Are you sure you want to delete this check?')) {
      try {
        await axios.delete(`https://bank-check-extractor-ai-backend.vercel.app/api/checks/${checkId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setChecks(checks.filter(check => check.id !== checkId));
        toast.success('Check deleted successfully');
      } catch (error) {
        console.error('Failed to delete check:', error);
        toast.error('Failed to delete check');
      }
    }
  };

  const handleExportCSV = async (checkId) => {
    try {
      const response = await axios.get(`https://bank-check-extractor-ai-backend.vercel.app/api/checks/${checkId}/export-csv`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
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
      console.error('Failed to export CSV:', error);
      toast.error('Failed to export CSV');
    }
  };

  const handleExportPDF = async (checkId) => {
    try {
      const response = await axios.get(`https://bank-check-extractor-ai-backend.vercel.app/api/checks/${checkId}/export-pdf`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
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
      console.error('Failed to export PDF:', error);
      toast.error('Failed to export PDF');
    }
  };

  const handleInsertSampleData = async () => {
    try {
      setLoading(true);
      await axios.post('https://bank-check-extractor-ai-backend.vercel.app/api/checks/insert-sample', {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      toast.success('Sample data inserted successfully!');
      // Refresh the checks list
      fetchChecks();
    } catch (error) {
      console.error('Failed to insert sample data:', error);
      toast.error('Failed to insert sample data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRetryCount(0);
    fetchChecks();
  };

  const handleHealthCheck = async () => {
    try {
      setShowHealthReport(true);
      // Log to console first
      await logHealthReport();
      
      // Display in UI if container is ready
      if (healthReportContainer) {
        await displayHealthReport(healthReportContainer);
      }
    } catch (error) {
      console.error('Health check failed:', error);
      toast.error('Health check failed');
    }
  };

  // Debug function to show raw data
  const showDebugInfo = () => {
    console.log('🔍 Current checks state:', checks);
    console.log('🔍 User info:', user);
    console.log('🔍 Error state:', error);
    console.log('🔍 Loading state:', loading);
    
    checks.forEach((check, index) => {
      console.log(`📊 Check ${index + 1}:`, check);
      console.log('Raw check data:', check);
      console.log('Extracted info:', check.extractedInfo);
      console.log('JSON data:', check.extractedInfo?.jsonData);
    });
  };

  // Helper function to get payee name from check data
  const getPayeeName = (check) => {
    const fromJson = check.extractedInfo?.payee_name;
    const fromDb = check.payee_name;
    
    // Try to get the best available payee name
    if (fromJson && fromJson.trim()) {
      return fromJson.trim();
    } else if (fromDb && fromDb.trim()) {
      return fromDb.trim();
    }
    
    // If no payee name found, show a placeholder with check ID
    return `Check #${check.id}`;
  };

  const getPayeeBadge = (check) => {
    if (check.extractedInfo?.payee_name && !check.payee_name) {
      return <span className="badge" style={{ marginLeft: 8, background:'#e6f4ff', color:'#1d4ed8', border:'1px solid #93c5fd' }}>AI</span>;
    }
    return null;
  };

  // Helper function to test database connection
  const testDatabaseConnection = async () => {
    try {
      setLoading(true);
      setDbConnectionStatus('unknown');
      console.log('🔍 Testing database connection...');
      
      const response = await fetch('https://bank-check-extractor-ai-backend.vercel.app/api/test-db');
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Database connection successful:', data);
        toast.success('✅ Database connection successful!');
        setDbConnectionStatus('connected');
        
        // Show additional database info
        if (data.message) {
          console.log('📊 Database Info:', data.message);
        }
        if (data.test) {
          console.log('🧪 Database Test Result:', data.test);
        }
        
        return true;
      } else {
        console.error('❌ Database connection failed:', data);
        toast.error(`❌ Database connection failed: ${data.message || 'Unknown error'}`);
        setDbConnectionStatus('failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Database connection error:', error);
      toast.error('❌ Database connection error: ' + error.message);
      setDbConnectionStatus('failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get amount display
  const getAmountDisplay = (check) => {
    const amount = check.extractedInfo?.amount_number || check.amount_number;
    const currency = check.extractedInfo?.currency || check.currency_name || 'USD';
    const display = amount ? `${amount} ${currency}` : null;
    console.log(`💰 Check ${check.id} amount display:`, display);
    return display;
  };

  // Helper function to get check detail with fallback
  const getCheckDetail = (check, fieldName) => {
    // First try to get from database fields, then from extractedInfo if it exists
    const value = check[fieldName] || check.extractedInfo?.[fieldName];
    console.log(`📋 Check ${check.id} ${fieldName}:`, value);
    return value;
  };

  // Helper function to get all available database fields
  const getDatabaseFields = (check) => {
    const fields = [
      { key: 'micr_code', label: '🏦 MICR Code', icon: '🏦' },
      { key: 'cheque_date', label: '📅 Check Date', icon: '📅' },
      { key: 'amount_number', label: '💰 Amount (Numbers)', icon: '💰' },
      { key: 'amount_words', label: '📝 Amount in Words', icon: '📝' },
      { key: 'currency_name', label: '💱 Currency', icon: '💱' },
      { key: 'payee_name', label: '👤 Payee Name', icon: '👤' },
      { key: 'account_number', label: '💳 Account Number', icon: '💳' },
      { key: 'anti_fraud_features', label: '🔒 Anti-Fraud Features', icon: '🔒' },
      { key: 'image_filename', label: '🖼️ Image File', icon: '🖼️' },
      { key: 'created_at', label: '📅 Created Date', icon: '📅' }
    ];

    return fields.filter(field => {
      const value = check[field.key];
      return value && value.toString().trim() !== '';
    });
  };

  // Helper function to get raw database data for debugging
  const getRawDatabaseData = (check) => {
    return {
      id: check.id,
      user_id: check.user_id,
      micr_code: check.micr_code,
      cheque_date: check.cheque_date,
      amount_number: check.amount_number,
      amount_words: check.amount_words,
      currency_name: check.currency_name,
      payee_name: check.payee_name,
      account_number: check.account_number,
      anti_fraud_features: check.anti_fraud_features,
      image_filename: check.image_filename,
      extracted_text: check.extracted_text,
      created_at: check.created_at
    };
  };

  // Helper function to format date clearly
  const formatDate = (dateString) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // If it's not a valid date, try to parse common formats
        const parsed = Date.parse(dateString);
        if (isNaN(parsed)) {
          return dateString; // Return as-is if can't parse
        }
        return new Date(parsed).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString; // Return as-is if error
    }
  };

  // Helper function to get check date with clear formatting
  const getCheckDate = (check) => {
    // Priority: extracted date, then database date
    const extractedDate = check.extractedInfo?.cheque_date;
    const dbDate = check.cheque_date;
    
    if (extractedDate) {
      return formatDate(extractedDate);
    } else if (dbDate) {
      return formatDate(dbDate);
    }
    
    return null;
  };

  // Helper function to get creation date
  const getCreationDate = (check) => {
    if (check.created_at) {
      return formatDate(check.created_at);
    }
    return null;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <div>Loading your checks...</div>
        {retryCount > 0 && <div style={{ fontSize: '14px', marginTop: '10px', color: '#666' }}>
          Retry attempt {retryCount}/3
        </div>}
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h2 style={{ color: '#dc3545', marginBottom: '1rem' }}>Connection Error</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>{error}</p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={handleRefresh} className="btn btn-primary">
            🔄 Retry Connection
          </button>
          <button onClick={testDatabaseConnection} className="btn btn-info">
            🗄️ Test DB Connection
          </button>
          <button onClick={handleHealthCheck} className="btn btn-warning">
            🏥 Run Health Check
          </button>
          <button onClick={showDebugInfo} className="btn btn-secondary">
            🐛 Show Debug Info
          </button>
        </div>
        
        {showHealthReport && (
          <div 
            ref={setHealthReportContainer}
            style={{ marginTop: '2rem' }}
          />
        )}
        
        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <h4 style={{ color: '#495057', marginBottom: '0.5rem' }}>Troubleshooting Tips:</h4>
          <ul style={{ textAlign: 'left', color: '#666', fontSize: '14px' }}>
            <li>Check if the backend server is running</li>
            <li>Verify your internet connection</li>
            <li>Check browser console for detailed errors</li>
            <li>Try refreshing the page</li>
            <li>Run the health check for detailed diagnostics</li>
            <li>Contact support if the issue persists</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="welcome-message">Welcome back, {user?.username || 'User'}!</h1>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>
            You have {checks.length} check{checks.length !== 1 ? 's' : ''} in your account
          </p>
          {/* Database Connection Status */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            marginTop: '0.5rem',
            fontSize: '14px'
          }}>
            <span>Database Status:</span>
            {dbConnectionStatus === 'connected' && (
              <span style={{ 
                color: '#28a745', 
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                🟢 Connected
              </span>
            )}
            {dbConnectionStatus === 'failed' && (
              <span style={{ 
                color: '#dc3545', 
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                🔴 Failed
              </span>
            )}
            {dbConnectionStatus === 'unknown' && (
              <span style={{ 
                color: '#ffc107', 
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                🟡 Testing...
              </span>
            )}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/extract" className="btn btn-success">
            📷 Extract New Check
          </Link>
          <button onClick={handleInsertSampleData} className="btn btn-info">
            📊 Insert Sample Data
          </button>
          <button onClick={testDatabaseConnection} className="btn btn-primary">
            🗄️ Test DB Connection
          </button>
          <button onClick={handleHealthCheck} className="btn btn-warning">
            🏥 Health Check
          </button>
          <button onClick={showDebugInfo} className="btn btn-secondary">
            🐛 Debug Info
          </button>
        </div>
      </div>

      {/* Health Report Display */}
      {showHealthReport && (
        <div 
          ref={setHealthReportContainer}
          style={{ marginBottom: '2rem' }}
        />
      )}

      {checks.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
          <h2 style={{ color: '#333', marginBottom: '1rem' }}>No Checks Found</h2>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            It looks like you haven't extracted any checks yet, or there might be a database connection issue.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/extract" className="btn btn-success">
              📷 Extract Your First Check
            </Link>
            <button onClick={handleInsertSampleData} className="btn btn-info">
              📊 Insert Sample Data
            </button>
            <button onClick={testDatabaseConnection} className="btn btn-primary">
              🗄️ Test DB Connection
            </button>
            <button onClick={handleRefresh} className="btn btn-secondary">
              🔄 Refresh
            </button>
            <button onClick={handleHealthCheck} className="btn btn-warning">
              🏥 Health Check
            </button>
          </div>
          
          <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeaa7' }}>
            <h4 style={{ color: '#856404', marginBottom: '0.5rem' }}>💡 Getting Started:</h4>
            <ol style={{ textAlign: 'left', color: '#856404', fontSize: '14px' }}>
              <li>Upload a bank check image</li>
              <li>AI will automatically extract information</li>
              <li>View and manage your extracted data</li>
              <li>Export to CSV or PDF formats</li>
            </ol>
          </div>
          
          <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8d7da', borderRadius: '8px', border: '1px solid #f5c6cb' }}>
            <h4 style={{ color: '#721c24', marginBottom: '0.5rem' }}>🔧 If You're Having Issues:</h4>
            <ul style={{ textAlign: 'left', color: '#721c24', fontSize: '14px' }}>
              <li>Run the Health Check to diagnose connection issues</li>
              <li>Check if you're running in a hosted environment</li>
              <li>Verify backend deployment status</li>
              <li>Check browser console for error messages</li>
            </ul>
          </div>
        </div>
      ) : (
        <div>
          {checks.map((check) => (
            <div key={check.id} className="check-card">
              {/* Prominent Date Display */}
              {getCheckDate(check) && (
                <div className="check-date-display">
                  📅 Check Date: {getCheckDate(check)}
                </div>
              )}

              {/* Prominent Payee Name Display */}
              <div className="check-payee-display">
                👤 Payee: {getPayeeName(check)}
                {getPayeeBadge(check)}
              </div>

              <div className="check-header">
                <div>
                  <h3 className="check-title">
                    Check #{check.id}
                  </h3>
                  <div className="check-meta">
                    <span>ID: {check.id}</span>
                    <span> • </span>
                    <span>Created: {getCreationDate(check)}</span>
                    {check.image_filename && (
                      <>
                        <span> • </span>
                        <span>Image: {check.image_filename}</span>
                      </>
                    )}
                  </div>
                </div>
                
                {getAmountDisplay(check) && (
                  <div className="amount-display">
                    {getAmountDisplay(check)}
                  </div>
                )}
              </div>

              {/* Key Information Summary */}
              <div className="check-info-summary">
                <div className="check-info-grid">
                  {getDatabaseFields(check).map((field) => (
                    <div key={field.key} className="check-info-item">
                      <div className="check-info-label">{field.label}</div>
                      <div className="check-info-value">
                        {field.key === 'created_at' 
                          ? formatDate(check[field.key])
                          : check[field.key]
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Details */}
              <div className="check-details">
                {getCheckDetail(check, 'anti_fraud_features') && (
                  <p><strong>Anti-Fraud Features:</strong> {getCheckDetail(check, 'anti_fraud_features')}</p>
                )}
                {getCheckDetail(check, 'extracted_text') && (
                  <p><strong>Extracted Text:</strong> {getCheckDetail(check, 'extracted_text')}</p>
                )}
              </div>

              {/* Database Data Debug Section */}
              <div style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '8px', 
                border: '1px solid #dee2e6',
                fontSize: '12px'
              }}>
                <details>
                  <summary style={{ cursor: 'pointer', fontWeight: '600', color: '#495057' }}>
                    🔍 Database Data Structure (Click to expand)
                  </summary>
                  <div style={{ marginTop: '0.5rem', fontFamily: 'monospace' }}>
                    <pre style={{ 
                      whiteSpace: 'pre-wrap', 
                      wordBreak: 'break-word',
                      fontSize: '11px',
                      lineHeight: '1.4'
                    }}>
                      {JSON.stringify(getRawDatabaseData(check), null, 2)}
                    </pre>
                  </div>
                </details>
              </div>

              <div className="check-actions">
                <Link to={`/check/${check.id}`} className="btn btn-primary">
                  👁️ View Details
                </Link>
                <button onClick={() => handleExportCSV(check.id)} className="btn btn-success">
                  📊 Export CSV
                </button>
                <button onClick={() => handleExportPDF(check.id)} className="btn btn-info">
                  📄 Export PDF
                </button>
                <button onClick={() => handleDelete(check.id)} className="btn btn-danger">
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard; 