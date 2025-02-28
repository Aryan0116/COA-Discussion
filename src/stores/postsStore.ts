import { create } from 'zustand';
import { Post, PostCategory, PostsState } from '@/types';
import { toast } from 'sonner';
import { postsAPI } from '@/services/api';

export const usePostsStore = create<PostsState>((set, get) => ({
  posts: [],
  filteredPosts: [],
  activeFilter: null,
  isLoading: false,
  error: null,
  
  fetchPosts: async () => {
    set({ isLoading: true });
    
    try {
      // Get posts from API
      const posts = await postsAPI.fetchPosts(get().activeFilter || undefined);
      
      set({ 
        posts, 
        filteredPosts: posts,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch posts', 
        isLoading: false 
      });
      toast.error('Failed to load posts');
    }
  },
  
  createPost: async (postData) => {
    set({ isLoading: true });
    
    try {
      // Create FormData for image upload
      const formData = new FormData();
      formData.append('title', postData.title);
      formData.append('content', postData.content);
      formData.append('category', postData.category);
      
      if (postData.image) {
        formData.append('image', postData.image);
      }
      
      // Create post via API
      const newPost = await postsAPI.createPost(formData);
      
      // Add new post to the beginning of the posts array
      set(state => {
        const updatedPosts = [newPost, ...state.posts];
        const newFilteredPosts = state.activeFilter 
          ? updatedPosts.filter(post => post.category === state.activeFilter)
          : updatedPosts;
        
        return { 
          posts: updatedPosts,
          filteredPosts: newFilteredPosts,
          isLoading: false 
        };
      });
      
      toast.success('Post created successfully');
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create post', 
        isLoading: false 
      });
      toast.error(error.response?.data?.message || 'Failed to create post');
    }
  },
  
  deletePost: async (postId) => {
    try {
      // Delete post via API
      await postsAPI.deletePost(postId);
      
      // Remove the post from the state
      set(state => {
        const updatedPosts = state.posts.filter(p => p.id !== postId);
        const newFilteredPosts = state.activeFilter 
          ? updatedPosts.filter(post => post.category === state.activeFilter)
          : updatedPosts;
        
        return {
          posts: updatedPosts,
          filteredPosts: newFilteredPosts
        };
      });
      
      toast.success('Post deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete post');
    }
  },
  
  likePost: async (postId) => {
    try {
      // Like post via API
      const updatedPost = await postsAPI.likePost(postId);
      
      // Update the post in the state
      set(state => {
        const updatedPosts = state.posts.map(post => 
          post.id === postId ? updatedPost : post
        );
        
        const newFilteredPosts = state.activeFilter 
          ? updatedPosts.filter(post => post.category === state.activeFilter)
          : updatedPosts;
        
        return {
          posts: updatedPosts,
          filteredPosts: newFilteredPosts
        };
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to like post');
    }
  },
  
  unlikePost: async (postId) => {
    try {
      // Unlike post via API
      const updatedPost = await postsAPI.unlikePost(postId);
      
      // Update the post in the state
      set(state => {
        const updatedPosts = state.posts.map(post => 
          post.id === postId ? updatedPost : post
        );
        
        const newFilteredPosts = state.activeFilter 
          ? updatedPosts.filter(post => post.category === state.activeFilter)
          : updatedPosts;
        
        return {
          posts: updatedPosts,
          filteredPosts: newFilteredPosts
        };
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to unlike post');
    }
  },
  
  filterByCategory: (category) => {
    set({
      activeFilter: category,
      isLoading: true
    });
    
    // Fetch posts with the category filter
    get().fetchPosts();
  }
}));