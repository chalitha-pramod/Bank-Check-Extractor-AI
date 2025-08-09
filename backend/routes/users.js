const express = require('express');
const db = require('../database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Get all posts for the authenticated user
router.get('/posts', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id],
    (err, posts) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }
      res.json({ posts });
    }
  );
});

// Get a single post by ID
router.get('/posts/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  db.get(
    'SELECT * FROM posts WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    (err, post) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }
      
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      res.json({ post });
    }
  );
});

// Create a new post
router.post('/posts', authenticateToken, (req, res) => {
  const { title, content } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }
  
  db.run(
    'INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)',
    [title, content, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error creating post' });
      }
      
      // Get the created post
      db.get('SELECT * FROM posts WHERE id = ?', [this.lastID], (err, post) => {
        if (err) {
          return res.status(500).json({ message: 'Error retrieving created post' });
        }
        
        res.status(201).json({
          message: 'Post created successfully',
          post
        });
      });
    }
  );
});

// Update a post
router.put('/posts/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }
  
  // First check if the post exists and belongs to the user
  db.get(
    'SELECT * FROM posts WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    (err, post) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }
      
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      // Update the post
      db.run(
        'UPDATE posts SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
        [title, content, id, req.user.id],
        function(err) {
          if (err) {
            return res.status(500).json({ message: 'Error updating post' });
          }
          
          // Get the updated post
          db.get('SELECT * FROM posts WHERE id = ?', [id], (err, updatedPost) => {
            if (err) {
              return res.status(500).json({ message: 'Error retrieving updated post' });
            }
            
            res.json({
              message: 'Post updated successfully',
              post: updatedPost
            });
          });
        }
      );
    }
  );
});

// Delete a post
router.delete('/posts/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  // First check if the post exists and belongs to the user
  db.get(
    'SELECT * FROM posts WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    (err, post) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }
      
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      // Delete the post
      db.run(
        'DELETE FROM posts WHERE id = ? AND user_id = ?',
        [id, req.user.id],
        function(err) {
          if (err) {
            return res.status(500).json({ message: 'Error deleting post' });
          }
          
          res.json({ message: 'Post deleted successfully' });
        }
      );
    }
  );
});

module.exports = router; 