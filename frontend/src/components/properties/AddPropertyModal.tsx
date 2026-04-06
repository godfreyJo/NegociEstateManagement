import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Building2, MapPin, Home } from 'lucide-react';
import { propertyService } from '../../services/propertyService';
import { useAuthStore } from '../../store/authStore';
import { PropertyType } from '../../types';

// ============================================
// 1. DEFINE THE FORM TYPE EXPLICITLY (No z.infer)
// ============================================
interface PropertyFormData {
  name: string;
  property_type: string;
  address: string;
  city: string;
  county: string;
  country: string;
  total_units: number;
  year_built?: number;
  description?: string;
  amenities?: string;
}

// ============================================
// 2. CREATE SCHEMA THAT MATCHES THE TYPE
// Use preprocess for numbers, avoid .default() in schema
// ============================================
const propertySchema = z.object({
  name: z.string().min(2, 'Property name is required'),
  property_type: z.string().min(1, 'Property type is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  county: z.string().min(2, 'County is required'),
  // NO .default() here - handle defaults in useForm defaultValues
  country: z.string().min(1, 'Country is required'),
  total_units: z.preprocess(
    (val) => (val === '' || val === undefined ? 0 : Number(val)),
    z.number().min(0)
  ),
  year_built: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : Number(val)),
    z.number().optional()
  ),
  description: z.string().optional(),
  amenities: z.string().optional(),
});

// ============================================
// 3. API PAYLOAD TYPE
// ============================================
interface PropertyPayload {
  name: string;
  property_type: PropertyType;
  address: string;
  city: string;
  county: string;
  country: string;
  total_units: number;
  year_built?: number;
  description?: string;
  amenities: string[];
  organization?: string;
}

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddPropertyModal: React.FC<AddPropertyModalProps> = ({ isOpen, onClose }) => {
  const { currentOrganization } = useAuthStore();
  const queryClient = useQueryClient();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema) as any, // Type assertion to bypass resolver mismatch
    defaultValues: {
      name: '',
      property_type: 'apartment_block',
      address: '',
      city: '',
      county: '',
      country: 'Kenya',
      total_units: 0,
      year_built: undefined,
      description: '',
      amenities: '',
    },
  });

  const mutation = useMutation({
    mutationFn: propertyService.createProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      reset();
      onClose();
    },
  });

  // ============================================
  // 4. TYPED SUBMIT HANDLER
  // ============================================
  const onSubmit: SubmitHandler<PropertyFormData> = (data) => {
    const payload: PropertyPayload = {
      name: data.name,
      property_type: data.property_type as PropertyType,
      address: data.address,
      city: data.city,
      county: data.county,
      country: data.country,
      total_units: data.total_units,
      year_built: data.year_built,
      description: data.description,
      // organization: currentOrganization?.id,
      amenities: data.amenities 
        ? data.amenities.split(',').map(s => s.trim()).filter(Boolean)
        : [],
    };
    console.log('Sending payload:', payload);
    mutation.mutate(payload as any);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Add New Property</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Basic Information</h3>
            
            <div>
              <label className="label">Property Name *</label>
              <input {...register('name')} className="input" placeholder="e.g., Sunset Apartments" />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Property Type *</label>
                <select {...register('property_type')} className="input">
                  <option value="apartment_block">Apartment Block</option>
                  <option value="estate">Residential Estate</option>
                  <option value="commercial">Commercial Building</option>
                  <option value="mixed_use">Mixed Use</option>
                  <option value="single_unit">Single Unit</option>
                  <option value="townhouse">Townhouse Complex</option>
                </select>
                {errors.property_type && (
                  <p className="text-red-500 text-sm mt-1">{errors.property_type.message}</p>
                )}
              </div>
              <div>
                <label className="label">Total Units</label>
                <input 
                  type="number" 
                  {...register('total_units')} 
                  className="input" 
                  placeholder="0" 
                />
                {errors.total_units && <p className="text-red-500 text-sm mt-1">{errors.total_units.message}</p>}
              </div>
            </div>

            <div>
              <label className="label">Description</label>
              <textarea {...register('description')} className="input min-h-[100px]" placeholder="Brief description..." />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Location
            </h3>
            
            <div>
              <label className="label">Address *</label>
              <input {...register('address')} className="input" placeholder="Street address" />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">City *</label>
                <input {...register('city')} className="input" placeholder="e.g., Nairobi" />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
              </div>
              <div>
                <label className="label">County *</label>
                <input {...register('county')} className="input" placeholder="e.g., Nairobi" />
                {errors.county && <p className="text-red-500 text-sm mt-1">{errors.county.message}</p>}
              </div>
              <div>
                <label className="label">Country</label>
                <input {...register('country')} className="input" readOnly />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide flex items-center gap-2">
              <Home className="w-4 h-4" /> Details
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Year Built</label>
                <input 
                  type="number" 
                  {...register('year_built')} 
                  className="input" 
                  placeholder="e.g., 2020" 
                />
              </div>
              <div>
                <label className="label">Amenities</label>
                <input {...register('amenities')} className="input" placeholder="parking, gym, pool (comma-separated)" />
              </div>
            </div>
          </div>

          {mutation.isError && (
             <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
             <p className="font-medium">Failed to create property</p>
             <pre className="text-xs mt-2 overflow-auto whitespace-pre-wrap max-h-40">
               {JSON.stringify((mutation.error as any)?.response?.data || mutation.error, null, 2)}
             </pre>
           </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary">
              {mutation.isPending ? 'Creating...' : 'Create Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPropertyModal;