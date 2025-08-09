import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { extractCheckInformation, formatCheckForDisplay } from '../utils/jsonDataHelper';

const ViewCheck = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [check, setCheck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkInfo, setCheckInfo] = useState(null);
  const [displayData, setDisplayData] = useState(null);

  useEffect(() => {
    fetchCheck();
  }, [id]);

  const fetchCheck = async () => {
    try {
      const response = await axios.get(`/api/checks/${id}`);
      const checkData = response.data.check;
      setCheck(checkData);
      
      // Extract information using helper function
      const extractedInfo = extractCheckInformation(checkData);
      setCheckInfo(extractedInfo);
      
      // Format data for display
      const formattedData = formatCheckForDisplay(extractedInfo);
      setDisplayData(formattedData);
      
      console.log('📊 Check data:', checkData);
      console.log('🔍 Extracted info:', extractedInfo);
      console.log('📋 Display data:', formattedData);
      
    } catch (error) {
      console.error('Failed to fetch check details:', error);
      toast.error('Failed to fetch check details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this check?')) {
      try {
        await axios.delete(`/api/checks/${id}`);
        toast.success('Check deleted successfully');
        navigate('/dashboard');
      } catch (error) {
        toast.error('Failed to delete check');
      }
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await axios.get(`/api/checks/${id}/export-csv`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bank_check_${id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV exported successfully');
    } catch (error) {
      toast.error('Failed to export CSV');
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await axios.get(`/api/checks/${id}/export-pdf`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bank_check_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF exported successfully');
    } catch (error) {
      toast.error('Failed to export PDF');
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
        <strong>📅 Extracted On:</strong> {new Date(check.created_at).toLocaleString()}
        {check.image_filename && (
          <span> | <strong>📁 Image File:</strong> {check.image_filename}</span>
        )}
      </div>

      {/* Check Image */}
      {check.image_filename && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>
            <span style={{ marginRight: '8px' }}>🖼️</span>
            Original Image
          </h3>
          <img 
            src={`http://localhost:5000/uploads/${check.image_filename}`}
            alt="Bank Check"
            style={{ 
              maxWidth: '100%', 
              maxHeight: '400px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
          />
        </div>
      )}

      {/* Extracted Information */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>
          <span style={{ marginRight: '8px' }}>📋</span>
          Extracted Information
        </h3>

        {/* Basic Details Table */}
        <h4>Basic Details</h4>
        <table className="table" style={{ width: '100%', marginBottom: '1.5rem' }}>
          <tbody>
            <tr>
              <td style={{ width: '220px' }}><strong>👤 Payee Name</strong></td>
              <td>{displayData?.basicDetails?.payee_name || 'Not available'}</td>
            </tr>
            <tr>
              <td><strong>💰 Amount</strong></td>
              <td>{displayData?.basicDetails?.amount || 'Not available'}</td>
            </tr>
            <tr>
              <td><strong>📝 Amount in Words</strong></td>
              <td>{displayData?.basicDetails?.amount_words || 'Not available'}</td>
            </tr>
            <tr>
              <td><strong>📅 Cheque Date</strong></td>
              <td>{displayData?.basicDetails?.cheque_date || 'Not available'}</td>
            </tr>
          </tbody>
        </table>

        {/* Bank Details Table */}
        <h4>Bank Details</h4>
        <table className="table" style={{ width: '100%', marginBottom: '1.5rem' }}>
          <tbody>
            <tr>
              <td style={{ width: '220px' }}><strong>🔢 MICR Code</strong></td>
              <td>{displayData?.bankDetails?.micr_code || 'Not available'}</td>
            </tr>
            <tr>
              <td><strong>🏦 Account Number</strong></td>
              <td>{displayData?.bankDetails?.account_number || 'Not available'}</td>
            </tr>
            <tr>
              <td><strong>💱 Currency</strong></td>
              <td>{displayData?.bankDetails?.currency || 'USD'}</td>
            </tr>
          </tbody>
        </table>

        {/* Security Features Table (conditional) */}
        {displayData?.securityFeatures?.anti_fraud_features && (
          <>
            <h4>Security Features</h4>
            <table className="table" style={{ width: '100%' }}>
              <tbody>
                <tr>
                  <td style={{ width: '220px' }}><strong>🔒 Anti-Fraud Features</strong></td>
                  <td>{displayData.securityFeatures.anti_fraud_features}</td>
                </tr>
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Raw Extracted Text */}
      {check.extracted_text && (
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
            {check.extracted_text}
          </div>
        </div>
      )}

      {/* Data Source Information */}
      <div style={{ 
        marginBottom: '2rem', 
        padding: '1rem', 
        backgroundColor: 'rgba(255, 193, 7, 0.1)', 
        borderRadius: '8px',
        fontSize: '14px',
        color: '#ffc107',
        border: '1px solid rgba(255, 193, 7, 0.3)'
      }}>
        <strong>🔍 Data Source:</strong> 
        {checkInfo?.jsonData ? ' JSON parsed from extracted_text' : ' Database fields only'}
        {false && checkInfo?.jsonData && (
          <span> | <strong>Fields found:</strong> {Object.keys(checkInfo.jsonData).join(', ')}</span>
        )}
      </div>

      {/* No Data Warning */}
      {(!displayData?.basicDetails?.payee_name || displayData.basicDetails.payee_name === 'Not available') && 
       (!displayData?.basicDetails?.amount || displayData.basicDetails.amount === 'Not available') && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ 
            padding: '1.5rem', 
            backgroundColor: 'rgba(255, 193, 7, 0.1)', 
            borderRadius: '12px',
            border: '1px solid rgba(255, 193, 7, 0.3)'
          }}>
            <h4 style={{ color: '#ffc107', marginBottom: '1rem' }}>
              <span style={{ marginRight: '8px' }}>⚠️</span>
              No Extracted Data Available
            </h4>
            <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
              This check doesn't have any extracted information. This could happen if:
            </p>
            <ul style={{ color: '#666', fontSize: '14px', marginTop: '0.5rem', marginBottom: 0, paddingLeft: '1.5rem' }}>
              <li>The AI extraction failed during processing</li>
              <li>The image was not clear enough for extraction</li>
              <li>The check was uploaded before AI extraction was implemented</li>
            </ul>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        flexWrap: 'wrap',
        justifyContent: 'center',
        padding: '1.5rem',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.3)'
      }}>
        <button onClick={handleExportCSV} className="btn btn-info">
          <span style={{ marginRight: '8px' }}>📊</span>
          Export CSV
        </button>
        <button onClick={handleExportPDF} className="btn btn-info">
          <span style={{ marginRight: '8px' }}>📄</span>
          Export PDF
        </button>
        <button onClick={handleDelete} className="btn btn-danger">
          <span style={{ marginRight: '8px' }}>🗑️</span>
          Delete Check
        </button>
      </div>
    </div>
  );
};

export default ViewCheck; 