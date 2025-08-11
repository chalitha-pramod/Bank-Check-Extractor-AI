import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const ExtractCheck = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/checks/extract', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Show success message
      toast.success(response.data.message);
      
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error processing image';
      const errorDetails = error.response?.data?.details || '';
      
      // Show detailed error message
      if (errorDetails) {
        toast.error(`${errorMessage}. ${errorDetails}`);
      } else {
        toast.error(errorMessage);
      }
      
      // Show specific help for common errors
      if (errorMessage.includes('API configuration')) {
        toast.info('Please check your Google Gemini API key configuration in the backend.');
      } else if (errorMessage.includes('Network error')) {
        toast.info('Please check your internet connection and try again.');
      } else if (errorMessage.includes('timeout')) {
        toast.info('The request took too long. Please try again with a smaller image or check your connection.');
      } else if (errorMessage.includes('quota')) {
        toast.info('API quota exceeded. Please try again later or check your usage limits.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: '#333', marginBottom: '0.5rem' }}>
          Extract Bank Check Information
        </h2>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Upload a bank check image and let AI extract the information
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="file">Upload Bank Check Image</label>
          <input
            type="file"
            id="file"
            accept="image/*"
            onChange={handleFileChange}
            required
            disabled={loading}
            style={{ 
              padding: '12px', 
              border: '2px dashed #667eea', 
              borderRadius: '8px',
              backgroundColor: 'rgba(102, 126, 234, 0.05)',
              transition: 'all 0.3s ease'
            }}
          />
          <small style={{ color: '#666', marginTop: '8px', display: 'block' }}>
            Supported formats: JPEG, PNG, GIF, BMP (Max size: 16MB)
          </small>
        </div>

        {preview && (
          <div className="image-preview">
            <h4>Image Preview:</h4>
            <img 
              src={preview} 
              alt="Preview" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '300px', 
                border: '1px solid #ddd',
                borderRadius: '8px',
                marginTop: '10px'
              }} 
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
          <button 
            type="submit" 
            className="btn btn-success" 
            disabled={loading || !file}
            style={{ flex: 1 }}
          >
            {loading ? (
              <>
                <div className="loading-spinner" style={{ width: '16px', height: '16px', margin: '0' }}></div>
                Processing with AI...
              </>
            ) : (
              <>
                <span style={{ marginRight: '8px' }}></span>
                Extract Information
              </>
            )}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/dashboard')}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>

      <div style={{ 
        marginTop: '2rem', 
        padding: '1.5rem', 
        backgroundColor: 'rgba(102, 126, 234, 0.1)', 
        borderRadius: '12px',
        border: '1px solid rgba(102, 126, 234, 0.2)'
      }}>
        <h4 style={{ color: '#667eea', marginBottom: '1rem' }}>
          <span style={{ marginRight: '8px' }}>📋</span>
          What will be extracted?
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#667eea' }}>🔢</span>
            <span>MICR Code (bottom line)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#667eea' }}>📅</span>
            <span>Cheque Date</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#667eea' }}>💰</span>
            <span>Amount in numbers</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#667eea' }}>📝</span>
            <span>Amount in words</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#667eea' }}>👤</span>
            <span>Payee name</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#667eea' }}>🏦</span>
            <span>Account number</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#667eea' }}>🔒</span>
            <span>Anti-fraud features</span>
          </div>
        </div>
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          backgroundColor: 'rgba(255, 255, 255, 0.7)', 
          borderRadius: '8px',
          borderLeft: '4px solid #667eea'
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
            <strong>💡 Tip:</strong> For best results, ensure the image is clear, well-lit, and shows all text clearly.
          </p>
        </div>
      </div>

      {/* Troubleshooting Section */}
      <div style={{ 
        marginTop: '2rem', 
        padding: '1.5rem', 
        backgroundColor: 'rgba(255, 193, 7, 0.1)', 
        borderRadius: '12px',
        border: '1px solid rgba(255, 193, 7, 0.3)'
      }}>
        <h4 style={{ color: '#ffc107', marginBottom: '1rem' }}>
          <span style={{ marginRight: '8px' }}>🔧</span>
          Having Issues?
        </h4>
        <div style={{ fontSize: '14px', color: '#666' }}>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>Common problems and solutions:</strong>
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            <li>If AI extraction fails, the image will still be saved</li>
            <li>Check your internet connection</li>
            <li>Ensure the image is clear and readable</li>
            <li>Try with a smaller image file</li>
            <li>Contact support if issues persist</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExtractCheck; 