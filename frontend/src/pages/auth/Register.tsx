import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Building2, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const USER_TYPES = [
  { value: 'landlord', label: 'Landlord / Property Owner', icon: Building2 },
  { value: 'manager', label: 'Property Manager', icon: Building2 },
  { value: 'agent', label: 'Real Estate Agent', icon: Building2 },
  { value: 'tenant', label: 'Tenant', icon: User },
];

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, error, clearError, isLoading } = useAuthStore();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
    user_type: 'landlord',
    company_name: '',
    password: '',
    password_confirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    clearError();
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      setStep(2);
      return;
    }

    try {
      await register(formData);
      navigate('/');
    } catch (error) {
      // Error handled in store
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Create account</h2>
      <p className="text-gray-600 mb-6">Step {step} of 2</p>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {step === 1 ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Phone Number</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="e.g., 0712345678"
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                {USER_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                      ${formData.user_type === type.value 
                        ? 'border-nagocis-primary bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'}
                    `}
                  >
                    <input
                      type="radio"
                      name="user_type"
                      value={type.value}
                      checked={formData.user_type === type.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <type.icon className={`w-5 h-5 ${formData.user_type === type.value ? 'text-nagocis-primary' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${formData.user_type === type.value ? 'text-nagocis-primary' : 'text-gray-700'}`}>
                      {type.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {(formData.user_type === 'landlord' || formData.user_type === 'manager') && (
              <div>
                <label className="label">Company Name (Optional)</label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  className="input"
                  placeholder="Your property management company"
                />
              </div>
            )}

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input pr-10"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <input
                type="password"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
          </>
        )}

        <div className="flex gap-3">
          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn-secondary flex-1"
            >
              Back
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : step === 1 ? (
              'Continue'
            ) : (
              'Create Account'
            )}
          </button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-nagocis-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Register;
