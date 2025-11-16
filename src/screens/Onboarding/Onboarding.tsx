import React, { useState } from 'react';
import { ArrowRight, User, Phone, Mail, Shield, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { MobileLayout } from '../../components/Layout/MobileLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Checkbox } from '../../components/ui/checkbox';
import { supabase } from '../../lib/supabase';

interface OnboardingProps {
  onComplete: (userData: any) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'register'>('welcome');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    emergencyContact: '',
    agreeToTerms: false,
    receiveUpdates: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.emergencyContact.trim()) {
      newErrors.emergencyContact = 'Emergency contact is required';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone_number: formData.phoneNumber,
            emergency_contact: formData.emergencyContact,
            receive_updates: formData.receiveUpdates
          }
        }
      });

      if (error) {
        setErrors({ general: error.message });
        setLoading(false);
        return;
      }

      onComplete(data.user);
    } catch (error: any) {
      setErrors({ general: error.message || 'An error occurred during registration' });
      setLoading(false);
    }
  };

  const renderWelcomeStep = () => (
    <div className="px-4 py-8 space-y-6">
      {/* Logo and Welcome */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-oxford-blue rounded-full flex items-center justify-center mx-auto">
          <span className="text-white font-bold text-2xl">MB</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-oxford-blue mb-2">
            Welcome to Metro Bus
          </h1>
          <p className="text-gray-600 text-lg">
            Your smart commuting companion
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-4">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle size={20} className="text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-oxford-blue">Easy Booking</h3>
            <p className="text-sm text-gray-600">Book your bus rides in seconds with our intuitive interface</p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-oxford-blue">Hybrid Booking</h3>
            <p className="text-sm text-gray-600">Perfect for flexible work schedules - book multiple days at once</p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle size={20} className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-oxford-blue">Route Subscriptions</h3>
            <p className="text-sm text-gray-600">Save money with weekly subscriptions on your favorite routes</p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle size={20} className="text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-oxford-blue">Real-time Updates</h3>
            <p className="text-sm text-gray-600">Get notified about delays, route changes, and more</p>
          </div>
        </div>
      </div>

      {/* Get Started Button */}
      <div className="pt-4">
        <Button 
          onClick={() => setCurrentStep('register')}
          className="w-full bg-oxford-blue hover:bg-oxford-blue/90 text-white py-4 text-lg font-semibold"
        >
          Get Started
          <ArrowRight size={20} className="ml-2" />
        </Button>
      </div>

      {/* Terms Notice */}
      <p className="text-xs text-gray-500 text-center leading-relaxed">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );

  const renderRegisterStep = () => (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-oxford-blue">
          Create Your Account
        </h1>
        <p className="text-gray-600">
          Join thousands of smart commuters
        </p>
      </div>

      {/* Error Message */}
      {errors.general && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <p className="text-sm text-red-800 text-center">{errors.general}</p>
          </CardContent>
        </Card>
      )}

      {/* Registration Form */}
      <Card className="bg-white shadow-md">
        <CardContent className="p-6 space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <div className="relative">
              <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Enter your full name"
                className={`pl-10 ${errors.fullName ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.fullName && (
              <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <div className="relative">
              <Phone size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="+234 801 234 5678"
                className={`pl-10 ${errors.phoneNumber ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.phoneNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Create a password"
                className={`pr-10 ${errors.password ? 'border-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <Input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="Confirm your password"
              className={errors.confirmPassword ? 'border-red-500' : ''}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Emergency Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emergency Contact *
            </label>
            <div className="relative">
              <Shield size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="tel"
                value={formData.emergencyContact}
                onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                placeholder="Emergency contact number"
                className={`pl-10 ${errors.emergencyContact ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.emergencyContact && (
              <p className="text-red-500 text-xs mt-1">{errors.emergencyContact}</p>
            )}
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 pt-4 border-t">
            <Checkbox
              checked={formData.agreeToTerms}
              onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
              label={
                <span className="text-sm">
                  I agree to the{' '}
                  <a href="#" className="text-oxford-blue underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-oxford-blue underline">Privacy Policy</a> *
                </span>
              }
            />
            {errors.agreeToTerms && (
              <p className="text-red-500 text-xs">{errors.agreeToTerms}</p>
            )}

            <Checkbox
              checked={formData.receiveUpdates}
              onChange={(e) => handleInputChange('receiveUpdates', e.target.checked)}
              label="Receive updates about new routes and promotions"
            />
          </div>
        </CardContent>
      </Card>

      {/* Register Button */}
      <Button
        onClick={handleRegister}
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold disabled:bg-gray-400"
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>

      {/* Back Button */}
      <Button 
        variant="outline"
        onClick={() => setCurrentStep('welcome')}
        className="w-full py-3"
      >
        Back to Welcome
      </Button>
    </div>
  );

  return (
    <MobileLayout showBottomNav={false}>
      <div className="bg-oxford-blue h-[80px] flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-oxford-blue to-prussian-blue" />
        <h1 className="relative text-white font-bold text-lg">
          {currentStep === 'welcome' && 'Welcome'}
          {currentStep === 'register' && 'Sign Up'}
        </h1>
      </div>

      <div className="min-h-[calc(100vh-80px)] bg-gray-50">
        {currentStep === 'welcome' && renderWelcomeStep()}
        {currentStep === 'register' && renderRegisterStep()}
      </div>
    </MobileLayout>
  );
};