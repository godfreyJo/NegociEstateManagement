import React, { useEffect, useRef } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRoutes from './routes';
import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  const hasFetchedProfile = useRef(false);
  const { isAuthenticated, fetchProfile } = useAuthStore();

  useEffect(() => {
    // Only fetch profile once when authenticated
    if (isAuthenticated && !hasFetchedProfile.current) {
      hasFetchedProfile.current = true;
      fetchProfile();
    }
  }, [isAuthenticated, fetchProfile]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;