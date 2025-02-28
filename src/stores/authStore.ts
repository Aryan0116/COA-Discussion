import { create } from 'zustand';
import { AuthState, User } from '@/types';
import { toast } from 'sonner';
import { authAPI } from '@/services/api';

export const useAuthStore = create<AuthState>((set) => {
  // Check if user is already logged in from localStorage
  const storedUser = localStorage.getItem('coaHubUser');
  const initialUser = storedUser ? JSON.parse(storedUser) : null;

  return {
    user: initialUser,
    isAuthenticated: !!initialUser,
    isLoading: false,

    login: async (email, password) => {
      set({ isLoading: true });
      
      try {
        // Call login API
        const { user, token } = await authAPI.login(email, password);
        
        // Store user and token in localStorage
        localStorage.setItem('coaHubUser', JSON.stringify(user));
        localStorage.setItem('coaHubToken', token);
        
        set({ 
          user, 
          isAuthenticated: true, 
          isLoading: false 
        });
        
        toast.success('Login successful');
      } catch (error) {
        set({ isLoading: false });
        const errorMessage = error.response?.data?.message || 'Login failed';
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
    },
    
    signup: async (username, email, password, role) => {
      set({ isLoading: true });
      
      try {
        // Call signup API
        const { user, token } = await authAPI.signup(username, email, password, role);
        
        // Store user and token in localStorage
        localStorage.setItem('coaHubUser', JSON.stringify(user));
        localStorage.setItem('coaHubToken', token);
        
        set({ 
          user, 
          isAuthenticated: true, 
          isLoading: false 
        });
        
        toast.success('Account created successfully');
      } catch (error) {
        set({ isLoading: false });
        const errorMessage = error.response?.data?.message || 'Signup failed';
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
    },
    
    updateProfile: async (updateData) => {
      set({ isLoading: true });
      
      try {
        // Call update profile API
        const updatedUser = await authAPI.updateProfile(updateData);
        
        // Update user in localStorage
        localStorage.setItem('coaHubUser', JSON.stringify(updatedUser));
        
        // Update state
        set({ 
          user: updatedUser, 
          isLoading: false 
        });
        
        toast.success('Profile updated successfully');
      } catch (error) {
        set({ isLoading: false });
        const errorMessage = error.response?.data?.message || 'Failed to update profile';
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
    },
    
    logout: () => {
      localStorage.removeItem('coaHubUser');
      localStorage.removeItem('coaHubToken');
      set({ user: null, isAuthenticated: false });
      toast.success('Logged out successfully');
    },
  };
});