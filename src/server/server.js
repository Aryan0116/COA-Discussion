import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import User from './models/User.js';
import Post from './models/Post.js';
import Comment from './models/Comment.js';
// Import models


// Initialize Express app
const app = express();

// Setup middleware
app.use(cors());
app.use(express.json());

// Setup Cloudinary for image uploads
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'coa-hub',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif']
  }
});

const upload = multer({ storage: storage });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.json({
      user: user.toJSON(),
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      return res.status(400).json({ message: 'Username already taken' });
    }
    
    // Create default avatar URL
    const avatar = `https://ui-avatars.com/api/?name=${username}&background=random`;
    
    // Create new user
    const user = new User({
      username,
      email,
      password,
      role,
      avatar
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.status(201).json({
      user: user.toJSON(),
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const { username, email, avatar } = req.body;
    const userId = req.user.id;
    
    // Check if username already exists
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, email, avatar },
      { new: true }
    );
    
    res.json(updatedUser.toJSON());
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Post routes
app.get('/api/posts', async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'username email role avatar createdAt');
    
    res.json(posts);
  } catch (error) {
    console.error('Fetch posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/posts', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const userId = req.user.id;
    
    let image;
    if (req.file) {
      image = req.file.path;
    }
    
    const post = new Post({
      title,
      content,
      category,
      image,
      user: userId
    });
    
    await post.save();
    
    // Populate user data before returning
    const populatedPost = await Post.findById(post._id).populate('user', 'username email role avatar createdAt');
    
    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/posts/:id', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    
    // Find post
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    // Check if user is the post author
    if (post.user.toString() !== userId && req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Delete all comments for the post
    await Comment.deleteMany({ postId });
    
    // Delete post
    await post.remove();
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/posts/:id/like', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    // Check if post is already liked by the user
    if (post.likes.includes(userId)) {
      return res.status(400).json({ message: 'Post already liked' });
    }
    
    post.likes.push(userId);
    await post.save();
    
    res.json(post);
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/posts/:id/unlike', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    // Check if post is liked by the user
    if (!post.likes.includes(userId)) {
      return res.status(400).json({ message: 'Post not liked' });
    }
    
    post.likes = post.likes.filter(id => id.toString() !== userId);
    await post.save();
    
    res.json(post);
  } catch (error) {
    console.error('Unlike post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Comment routes
app.get('/api/posts/:id/comments', async (req, res) => {
  try {
    const postId = req.params.id;
    
    const comments = await Comment.find({ postId })
      .sort({ createdAt: 1 })
      .populate('user', 'username email role avatar createdAt');
    
    res.json(comments);
  } catch (error) {
    console.error('Fetch comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/posts/:id/comments', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;
    const userId = req.user.id;
    
    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    const comment = new Comment({
      content,
      user: userId,
      postId
    });
    
    await comment.save();
    
    // Populate user data before returning
    const populatedComment = await Comment.findById(comment._id).populate('user', 'username email role avatar createdAt');
    
    res.status(201).json(populatedComment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/comments/:id', authenticateToken, async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.id;
    
    // Find comment
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    
    // Check if user is the comment author
    if (comment.user.toString() !== userId && req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await comment.remove();
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('build'));

  app.get('*', (req, res) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    res.sendFile(path.resolve(__dirname, '../../', 'index.html'));
  });
}

// Set port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
