import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`/users/posts/${id}`);
      setPost(response.data.post);
    } catch (error) {
      setError('Failed to fetch post');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`/users/posts/${id}`);
        navigate('/dashboard');
      } catch (error) {
        setError('Failed to delete post');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading post...</div>;
  }

  if (error) {
    return (
      <div className="card">
        <div className="alert alert-error">
          {error}
        </div>
        <Link to="/dashboard" className="btn">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="card">
        <h2>Post not found</h2>
        <Link to="/dashboard" className="btn">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ marginBottom: '20px' }}>
        <Link to="/dashboard" className="btn btn-secondary">
          ← Back to Dashboard
        </Link>
      </div>

      <h1 style={{ marginBottom: '10px', color: '#333' }}>{post.title}</h1>
      
      <div style={{ 
        marginBottom: '20px', 
        padding: '10px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '5px',
        fontSize: '14px',
        color: '#666'
      }}>
        <strong>Created:</strong> {new Date(post.created_at).toLocaleString()}
        {post.updated_at !== post.created_at && (
          <span> | <strong>Updated:</strong> {new Date(post.updated_at).toLocaleString()}</span>
        )}
      </div>

      <div style={{ 
        lineHeight: '1.8', 
        fontSize: '16px', 
        color: '#333',
        marginBottom: '30px',
        whiteSpace: 'pre-wrap'
      }}>
        {post.content}
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <Link to={`/posts/${post.id}/edit`} className="btn">
          Edit Post
        </Link>
        <button onClick={handleDelete} className="btn btn-danger">
          Delete Post
        </button>
      </div>
    </div>
  );
};

export default PostDetail; 