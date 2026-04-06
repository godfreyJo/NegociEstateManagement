import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Building2, MapPin, Home, MoreVertical, Trash2, Edit } from 'lucide-react';
import { propertyService } from '../../services/propertyService';
import { useAuthStore } from '../../store/authStore';
import { Property } from '../../types';
import AddPropertyModal from '../../components/properties/AddPropertyModal';

const PropertyCard: React.FC<{ 
  property: Property; 
  onDelete: (id: string) => void;
  onEdit: (property: Property) => void;
}> = ({ property, onDelete, onEdit }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  
  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.menu-button')) return;
    navigate(`/properties/${property.id}`);
  };
  
  const vacancyRate = property.vacancy_rate ?? 0;
  const occupancyColor = vacancyRate > 20 ? 'text-red-600' : vacancyRate > 10 ? 'text-yellow-600' : 'text-green-600';
  
  return (
    <div 
      className="card card-hover cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <Building2 className="w-20 h-20 text-white/30" />
        </div>
        <div className="absolute top-4 right-4 menu-button">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
              <button 
                onClick={() => { onEdit(property); setShowMenu(false); }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" /> Edit
              </button>
              <button 
                onClick={() => { onDelete(property.id); setShowMenu(false); }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <span className="px-3 py-1 bg-white/90 rounded-full text-xs font-medium text-gray-800 capitalize">
            {property.property_type?.replace('_', ' ')}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{property.name}</h3>
        <div className="flex items-center text-gray-500 text-sm mb-4">
          <MapPin className="w-4 h-4 mr-1" />
          {property.address}, {property.city}
        </div>
        
        <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-4">
          <div className="text-center">
            <div className="flex items-center justify-center text-gray-400 mb-1">
              <Home className="w-4 h-4 mr-1" />
              <span className="text-xs">Units</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">{property.units_count ?? 0}</p>
          </div>
          <div className="text-center border-l border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Occupied</p>
            <p className="text-lg font-semibold text-gray-900">{property.occupied_units ?? 0}</p>
          </div>
          <div className="text-center border-l border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Vacancy</p>
            <p className={`text-lg font-semibold ${occupancyColor}`}>{vacancyRate}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const PropertyList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { currentOrganization } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertyService.getProperties(),
  });

  const deleteMutation = useMutation({
    mutationFn: propertyService.deleteProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setDeleteConfirm(null);
    },
  });

  const filteredProperties = properties?.results?.filter((p: Property) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.city.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteMutation.mutate(deleteConfirm);
    }
  };

  const handleEdit = (property: Property) => {
    // TODO: Implement edit functionality
    console.log('Edit property:', property);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600 mt-1">
            Manage your properties and units
            {currentOrganization && ` • ${currentOrganization.name}`}
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Property
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total Properties</p>
          <p className="text-2xl font-bold text-gray-900">{properties?.count ?? 0}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total Units</p>
          <p className="text-2xl font-bold text-gray-900">
            {properties?.results?.reduce((sum: number, p: Property) => sum + (p.units_count ?? 0), 0) ?? 0}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Occupied</p>
          <p className="text-2xl font-bold text-green-600">
            {properties?.results?.reduce((sum: number, p: Property) => sum + (p.occupied_units ?? 0), 0) ?? 0}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Vacant</p>
          <p className="text-2xl font-bold text-blue-600">
            {(properties?.results?.reduce((sum: number, p: Property) => sum + (p.units_count ?? 0), 0) ?? 0) -
             (properties?.results?.reduce((sum: number, p: Property) => sum + (p.occupied_units ?? 0), 0) ?? 0)}
          </p>
        </div>
      </div>

      {/* Properties Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="card p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try a different search term' : 'Get started by adding your first property'}
          </p>
          {!searchTerm && (
            <button onClick={() => setShowAddModal(true)} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property: Property) => (
            <PropertyCard 
              key={property.id} 
              property={property}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* Add Property Modal */}
      <AddPropertyModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-red-600">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this property? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteConfirm(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyList;