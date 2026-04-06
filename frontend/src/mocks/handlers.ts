import { http, HttpResponse } from 'msw';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const handlers = [
  // Auth handlers
  http.post(`${API_URL}/auth/login/`, () => {
    return HttpResponse.json({
      access: 'mock-access-token',
      refresh: 'mock-refresh-token',
      user: {
        id: '1',
        phone_number: '0712345678',
        first_name: 'John',
        last_name: 'Doe',
        user_type: 'landlord',
      },
    });
  }),

  http.post(`${API_URL}/auth/register/`, () => {
    return HttpResponse.json({
      access: 'mock-access-token',
      refresh: 'mock-refresh-token',
      user: {
        id: '1',
        phone_number: '0712345678',
        first_name: 'John',
        last_name: 'Doe',
        user_type: 'landlord',
      },
    }, { status: 201 });
  }),

  http.get(`${API_URL}/auth/profile/`, () => {
    return HttpResponse.json({
      id: '1',
      phone_number: '0712345678',
      first_name: 'John',
      last_name: 'Doe',
      user_type: 'landlord',
    });
  }),

  // Properties handlers
  http.get(`${API_URL}/properties/`, () => {
    return HttpResponse.json({
      count: 2,
      results: [
        {
          id: '1',
          name: 'Sunset Apartments',
          address: '123 Test St',
          city: 'Nairobi',
          total_units: 10,
        },
        {
          id: '2',
          name: 'Ocean View',
          address: '456 Beach Rd',
          city: 'Mombasa',
          total_units: 20,
        },
      ],
    });
  }),
];