// Replace your existing authStore.ts with this

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';
import { User, Organization } from '../types';

interface AuthState {
  user: User | null;
  organizations: Organization[];
  currentOrganization: Organization | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (phone_number: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  fetchOrganizations: () => Promise<void>;
  setCurrentOrganization: (org: Organization) => void;
  clearError: () => void;
}

// RegisterData interface
interface RegisterData {
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  user_type: string;
  company_name?: string;
  password: string;
  password_confirm: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      organizations: [],
      currentOrganization: null,
      isAuthenticated: !!localStorage.getItem('access_token'),
      isLoading: false,
      error: null,

      login: async (phone_number: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { user } = await authService.login({ phone_number, password });
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
          // Fetch organizations after login
          await get().fetchOrganizations();
        } catch (error: any) {
          set({ 
            error: error.message || 'Login failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          const { user } = await authService.register(data);
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
          // Fetch organizations after registration
          await get().fetchOrganizations();
        } catch (error: any) {
          set({ 
            error: error.message || 'Registration failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      logout: () => {
        authService.logout();
        set({ 
          user: null, 
          organizations: [],
          currentOrganization: null,
          isAuthenticated: false 
        });
      },

      fetchProfile: async () => {
        try {
          const user = await authService.getProfile();
          set({ user });
          await get().fetchOrganizations();
        } catch (error) {
          console.error('Failed to fetch profile:', error);
        }
      },

      fetchOrganizations: async () => {
        try {
          const organizations = await authService.getOrganizations();
          set({ organizations });
          
          // Set current organization if not set
          if (organizations.length > 0 && !get().currentOrganization) {
            set({ currentOrganization: organizations[0] });
          }
        } catch (error) {
          console.error('Failed to fetch organizations:', error);
        }
      },

      setCurrentOrganization: (org: Organization) => {
        set({ currentOrganization: org });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        organizations: state.organizations,
        currentOrganization: state.currentOrganization,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);