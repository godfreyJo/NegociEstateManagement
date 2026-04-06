import api from './api';
import { LoginCredentials, RegisterData, User, Organization } from '../types';

interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login/', credentials);
    const { access, refresh, user } = response.data;
    
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    return { access, refresh, user };
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register/', data);
    const { access, refresh, user } = response.data;
    
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    return { access, refresh, user };
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile/');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.patch('/auth/profile/', data);
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  getOrganizations: async (): Promise<Organization[]> => {
    const response = await api.get('/auth/organizations/');
    return response.data.results || response.data;
  },

  createOrganization: async (name: string): Promise<Organization> => {
    const response = await api.post('/auth/organizations/', { name });
    return response.data;
  },
};