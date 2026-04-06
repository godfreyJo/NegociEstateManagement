import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Building2, MapPin, Home, DollarSign, 
  Edit, Trash2, Plus, ChevronLeft, 
  Wifi, Car, Dumbbell, Shield,
  Users, TrendingUp
} from 'lucide-react';
import { propertyService } from '../../services/propertyService';
import AddUnitModal from '../../components/units/AddUnitModal';
import { Unit, Property } from '../../types';

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // Keep for future use

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyService.getProperty(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: propertyService.deleteProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      navigate('/properties');
    },
  });

  const getAmenityIcon = (amenity: string) => {
    const icons: Record<string, any> = {
      parking: Car,
      gym: Dumbbell,
      pool: Wifi,
      security: Shield,
    };
    const Icon = icons[amenity.toLowerCase()] || Building2;
    return <Icon className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
        <button onClick={() => navigate('/properties')} className="btn-primary">
          Back to Properties
        </button>
      </div>
    );
  }

  // Cast property to include units (they come from PropertyDetailSerializer)
  const propertyWithUnits = property as Property & { units?: Unit[] };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/properties')}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{property.name}</h1>
            <div className="flex items-center gap-2 text-gray-600 mt-1">
              <MapPin className="w-4 h-4" />
              <span>{property.address}, {property.city}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowEditModal(true)}
            className="btn-secondary"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </button>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this property?')) {
                deleteMutation.mutate(property.id);
              }
            }}
            className="btn-danger"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Units</p>
            <Home className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{property.units_count || 0}</p>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Occupied Units</p>
            <Users className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{property.occupied_units || 0}</p>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Vacancy Rate</p>
            <TrendingUp className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{property.vacancy_rate || 0}%</p>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Monthly Revenue</p>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">--</p>
        </div>
      </div>

      {/* Property Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
            <p className="text-gray-600">
              {property.description || 'No description provided.'}
            </p>
          </div>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                  >
                    {getAmenityIcon(amenity)}
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Property Details Card */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium capitalize">{property.property_type?.replace('_', ' ')}</span>
              </div>
              {property.year_built && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Year Built:</span>
                  <span className="font-medium">{property.year_built}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Total Units:</span>
                <span className="font-medium">{property.total_units}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">
                  {new Date(property.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <button
            onClick={() => setShowAddUnit(true)}
            className="btn-primary w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Unit
          </button>
        </div>
      </div>

      {/* Units Section */}
      <div className="card">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Units</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {propertyWithUnits.units && propertyWithUnits.units.length > 0 ? (
            propertyWithUnits.units.map((unit: Unit) => (
              <div key={unit.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Unit {unit.unit_number}</p>
                    <p className="text-sm text-gray-600">
                      {unit.unit_type?.replace('_', ' ')} • KES {unit.monthly_rent}/month
                    </p>
                  </div>
                  <span className={`badge ${
                    unit.status === 'occupied' ? 'badge-green' :
                    unit.status === 'vacant' ? 'badge-blue' :
                    'badge-yellow'
                  }`}>
                    {unit.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No units added yet</p>
              <button
                onClick={() => setShowAddUnit(true)}
                className="mt-4 btn-primary"
              >
                Add First Unit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddUnit && (
        <AddUnitModal
          propertyId={property.id}
          isOpen={showAddUnit}
          onClose={() => setShowAddUnit(false)}
        />
      )}
    </div>
  );
};

export default PropertyDetail;