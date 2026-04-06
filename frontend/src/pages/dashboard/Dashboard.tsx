import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Building2, 
  Users, 
  CreditCard, 
  TrendingUp, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { analyticsService } from '../../services/analyticsService';

const StatCard: React.FC<{
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down';
  icon: React.ElementType;
  color: string;
}> = ({ title, value, change, trend, icon: Icon, color }) => (
  <div className="card card-hover p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
        {change && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{change}</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { user, currentOrganization } = useAuthStore();

  // Fetch dashboard metrics
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => analyticsService.getMetrics(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Quick actions based on user type
  const quickActions = [
    { name: 'Add Property', href: '/properties/new', icon: Building2 },
    { name: 'Add Tenant', href: '/tenants/new', icon: Users },
    { name: 'Record Payment', href: '/payments/new', icon: CreditCard },
    { name: 'View Reports', href: '/analytics', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-gray-600 mt-1">
          {currentOrganization?.name || 'Here is what is happening with your properties today.'}
        </p>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Units"
            value={metrics?.total_units || 0}
            change="+2 this month"
            trend="up"
            icon={Building2}
            color="bg-blue-500"
          />
          <StatCard
            title="Occupancy Rate"
            value={`${metrics?.occupancy_rate || 0}%`}
            change="5% vs last month"
            trend="up"
            icon={Users}
            color="bg-green-500"
          />
          <StatCard
            title="Monthly Revenue"
            value={`KES ${(metrics?.collected_rent || 0).toLocaleString()}`}
            change="12% vs last month"
            trend="up"
            icon={CreditCard}
            color="bg-nagocis-accent"
          />
          <StatCard
            title="Outstanding Rent"
            value={`KES ${(metrics?.outstanding_rent || 0).toLocaleString()}`}
            change="3 tenants overdue"
            trend="down"
            icon={AlertCircle}
            color="bg-red-500"
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <a
              key={action.name}
              href={action.href}
              className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-nagocis-primary hover:bg-blue-50 transition-all group"
            >
              <action.icon className="w-8 h-8 text-gray-400 group-hover:text-nagocis-primary mb-3" />
              <span className="text-sm font-medium text-gray-700 group-hover:text-nagocis-primary">
                {action.name}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="card">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Recent Payments</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">Unit 12A - John Doe</p>
                  <p className="text-sm text-gray-500">Today, 10:23 AM</p>
                </div>
                <span className="badge badge-green">KES 25,000</span>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance Alerts */}
        <div className="card">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Pending Maintenance</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-red-500' : 'bg-yellow-500'}`} />
                  <div>
                    <p className="font-medium text-gray-900">Plumbing Issue - Unit 5B</p>
                    <p className="text-sm text-gray-500">Reported 2 days ago</p>
                  </div>
                </div>
                <span className={`badge ${i === 0 ? 'badge-red' : 'badge-yellow'}`}>
                  {i === 0 ? 'Urgent' : 'Medium'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;