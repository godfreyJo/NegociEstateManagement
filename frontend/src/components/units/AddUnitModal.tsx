import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Home, DollarSign } from 'lucide-react';
import { propertyService } from '../../services/propertyService';
import { UnitType } from '../../types';

interface AddUnitModalProps {
  propertyId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface UnitFormData {
  unit_number: string;
  unit_type: UnitType;
  floor: number;
  monthly_rent: number;
  deposit_amount: number;
  size_sqm?: number;
  description?: string;
  is_furnished: boolean;
}

const AddUnitModal: React.FC<AddUnitModalProps> = ({ propertyId, isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UnitFormData>({
    defaultValues: {
      unit_type: '1_bedroom',
      monthly_rent: 0,
      deposit_amount: 0,
      is_furnished: false,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: UnitFormData) => propertyService.createUnit(propertyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', propertyId] });
      reset();
      onClose();
    },
  });

  const onSubmit = (data: UnitFormData) => {
    mutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Home className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Add New Unit</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="label">Unit Number *</label>
            <input
              {...register('unit_number', { required: 'Unit number is required' })}
              className="input"
              placeholder="e.g., 101, A1, Ground Floor"
            />
            {errors.unit_number && (
              <p className="text-red-500 text-sm mt-1">{errors.unit_number.message}</p>
            )}
          </div>

          <div>
            <label className="label">Unit Type *</label>
            <select {...register('unit_type')} className="input">
              <option value="bedsitter">Bedsitter</option>
              <option value="1_bedroom">1 Bedroom</option>
              <option value="2_bedroom">2 Bedroom</option>
              <option value="3_bedroom">3 Bedroom</option>
              <option value="4_bedroom">4 Bedroom+</option>
              <option value="shop">Shop/Retail</option>
              <option value="office">Office Space</option>
              <option value="warehouse">Warehouse</option>
              <option value="studio">Studio Apartment</option>
              <option value="penthouse">Penthouse</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Floor</label>
              <input
                type="number"
                {...register('floor', { valueAsNumber: true })}
                className="input"
                placeholder="0"
              />
            </div>
            <div>
              <label className="label">Size (sqm)</label>
              <input
                type="number"
                {...register('size_sqm', { valueAsNumber: true })}
                className="input"
                placeholder="e.g., 50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Monthly Rent (KES) *</label>
              <input
                type="number"
                {...register('monthly_rent', { 
                  required: 'Monthly rent is required',
                  valueAsNumber: true,
                  min: 0 
                })}
                className="input"
                placeholder="0"
              />
              {errors.monthly_rent && (
                <p className="text-red-500 text-sm mt-1">{errors.monthly_rent.message}</p>
              )}
            </div>
            <div>
              <label className="label">Deposit Amount (KES)</label>
              <input
                type="number"
                {...register('deposit_amount', { valueAsNumber: true })}
                className="input"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              {...register('description')}
              className="input min-h-[80px]"
              placeholder="Unit description, special features..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('is_furnished')}
              className="rounded border-gray-300"
              id="furnished"
            />
            <label htmlFor="furnished" className="text-sm text-gray-700">
              Furnished
            </label>
          </div>

          {mutation.isError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              Failed to create unit. Please try again.
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary">
              {mutation.isPending ? 'Creating...' : 'Create Unit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUnitModal;