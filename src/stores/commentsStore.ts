import { create } from 'zustand';
import { Comment, CommentsState } from '@/types';
import { toast } from 'sonner';
import { commentsAPI } from '@/services/api';

export const useCommentsStore = create<CommentsState>((set, get) => ({
  comments: {},
  isLoading: false,
  error: null,
  
  fetchComments: async (postId) => {
    set({ isLoading: true });
    
    try {
      // Get comments from API
      const comments = await commentsAPI.fetchComments(postId);
      
      set(state => ({
        comments: {
          ...state.comments,
          [postId]: comments
        },
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch comments', 
        isLoading: false 
      });
      toast.error('Failed to load comments');
    }
  },
  
  addComment: async (postId, content) => {
    try {
      // Add comment via API
      const newComment = await commentsAPI.addComment(postId, content);
      
      // Add the comment to the state
      set(state => {
        const postComments = state.comments[postId] || [];
        
        return {
          comments: {
            ...state.comments,
            [postId]: [...postComments, newComment]
          }
        };
      });
      
      toast.success('Comment added');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add comment');
    }
  },
  
  deleteComment: async (commentId, postId) => {
    try {
      // Delete comment via API
      await commentsAPI.deleteComment(commentId);
      
      // Remove the comment from the state
      set(state => {
        const postComments = state.comments[postId] || [];
        
        return {
          comments: {
            ...state.comments,
            [postId]: postComments.filter(c => c.id !== commentId)
          }
        };
      });
      
      toast.success('Comment deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete comment');
    }
  }
}));