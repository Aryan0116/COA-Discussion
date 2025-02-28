import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://coa-discussion.onrender.com/api' 
  : 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if user is logged in
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('coaHubToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  signup: async (username: string, email: string, password: string, role: string) => {
    const response = await api.post('/auth/signup', { username, email, password, role });
    return response.data;
  },
  
  updateProfile: async (data: any) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  }
};

// Posts API
export const postsAPI = {
  fetchPosts: async (category?: string) => {
    const params = category ? { category } : {};
    const response = await api.get('/posts', { params });
    return response.data;
  },
  
  createPost: async (formData: FormData) => {
    const response = await api.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  deletePost: async (postId: string) => {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  },
  
  likePost: async (postId: string) => {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  },
  
  unlikePost: async (postId: string) => {
    const response = await api.post(`/posts/${postId}/unlike`);
    return response.data;
  }
};

// Comments API
export const commentsAPI = {
  fetchComments: async (postId: string) => {
    const response = await api.get(`/posts/${postId}/comments`);
    return response.data;
  },
  
  addComment: async (postId: string, content: string) => {
    const response = await api.post(`/posts/${postId}/comments`, { content });
    return response.data;
  },
  
  deleteComment: async (commentId: string) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  }
};

export default { authAPI, postsAPI, commentsAPI };
