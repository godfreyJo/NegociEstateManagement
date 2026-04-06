import api from './api';
import { Property, Unit, ApiResponse } from '../types';

export const propertyService = {
  // Properties
  getProperties: async (params?: Record<string, any>): Promise<ApiResponse<Property>> => {
    const response = await api.get('/properties/', { params });
    return response.data;
  },

  getProperty: async (id: string): Promise<Property> => {
    const response = await api.get(`/properties/${id}/`);
    return response.data;
  },

  createProperty: async (data: Partial<Property>): Promise<Property> => {
    const response = await api.post('/properties/', data);
    return response.data;
  },

  updateProperty: async (id: string, data: Partial<Property>): Promise<Property> => {
    const response = await api.patch(`/properties/${id}/`, data);
    return response.data;
  },

  deleteProperty: async (id: string): Promise<void> => {
    await api.delete(`/properties/${id}/`);
  },

  getPropertyStats: async (id: string): Promise<any> => {
    const response = await api.get(`/properties/${id}/occupancy_stats/`);
    return response.data;
  },

  // Units
  getUnits: async (propertyId?: string): Promise<ApiResponse<Unit>> => {
    const params = propertyId ? { property: propertyId } : {};
    const response = await api.get('/properties/units/', { params });
    return response.data;
  },

  getUnit: async (id: string): Promise<Unit> => {
    const response = await api.get(`/properties/units/${id}/`);
    return response.data;
  },

  createUnit: async (propertyId: string, data: Partial<Unit>): Promise<Unit> => {
    const response = await api.post(`/properties/${propertyId}/add_unit/`, data);
    return response.data;
  },

  updateUnit: async (id: string, data: Partial<Unit>): Promise<Unit> => {
    const response = await api.patch(`/properties/units/${id}/`, data);
    return response.data;
  },

  deleteUnit: async (id: string): Promise<void> => {
    await api.delete(`/properties/units/${id}/`);
  },

  updateUnitStatus: async (id: string, status: string): Promise<Unit> => {
    const response = await api.post(`/properties/units/${id}/update_status/`, { status });
    return response.data;
  },
};
