import mongoose from 'mongoose';
//import bcrypt from 'bcryptjs';

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Increment comment count in post when a new comment is created
commentSchema.post('save', async function() {
  const Post = mongoose.model('Post');
  await Post.findByIdAndUpdate(this.postId, { $inc: { commentsCount: 1 } });
});

// Decrement comment count in post when a comment is deleted
commentSchema.post('remove', async function() {
  const Post = mongoose.model('Post');
  await Post.findByIdAndUpdate(this.postId, { $inc: { commentsCount: -1 } });
});

const Comment = mongoose.model('Comment', commentSchema);

//module.exports = Comment;
export default Comment; // Corrected: Use export default
