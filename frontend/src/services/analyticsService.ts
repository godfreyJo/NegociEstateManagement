import { DashboardMetrics } from '../types';

export const analyticsService = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    return {
      total_units: 24,
      occupied_units: 20,
      occupancy_rate: 83.33,
      expected_rent: 450000,
      collected_rent: 375000,
      collection_rate: 83.33,
      outstanding_rent: 75000,
      open_tickets: 5,
      active_bookings: 3,
    };
  },
};
