import React, { useState } from 'react';
import { MobileLayout } from '../../components/Layout/MobileLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { supabase } from '../../lib/supabase';
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';

interface SignUpProps {
  onSignUpSuccess: () => void;
  onLoginClick: () => void;
}

export const SignUp: React.FC<SignUpProps> = ({ onSignUpSuccess, onLoginClick }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone_number: formData.phoneNumber,
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (authData.user) {
        if (authData.session) {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              id: authData.user.id,
              full_name: formData.fullName,
              email: formData.email,
              phone_number: formData.phoneNumber,
              emergency_contact: '',
              wallet_balance: 0
            });

          if (profileError) {
            console.error('Error creating profile:', profileError);
          }

          onSignUpSuccess();
        } else {
          setError('Account created! Please check your email to confirm your account, then sign in.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <MobileLayout showBottomNav={false}>
      {/* Header */}
      <div className="bg-oxford-blue h-[80px] flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-oxford-blue to-prussian-blue" />
        <h1 className="relative text-white font-bold text-lg">Create Account</h1>
      </div>

      <div className="min-h-[calc(100vh-80px)] bg-gray-50">
        <div className="px-4 py-6 space-y-6">
          {/* Welcome Message */}
          <div className="text-center space-y-2">
            <div className="w-32 h-20 mx-auto mb-4">
              <img
                src="/Metro Bus 4.jpg"
                alt="Metro Bus Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-oxford-blue">
              Join Metro Bus
            </h1>
            <p className="text-gray-600">
              Start your journey with us today
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <Card className={error.includes('Account created') ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}>
              <CardContent className="p-4">
                <p className={`text-sm text-center ${error.includes('Account created') ? 'text-blue-800' : 'text-red-800'}`}>
                  {error}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Sign Up Form */}
          <Card className="bg-white shadow-md">
            <CardContent className="p-6 space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      placeholder="Enter your full name"
                      required
                      className="pl-10"
                    />
                  </div>
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
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="pl-10"
                    />
                  </div>
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
                      onChange={(e) => handleChange('phoneNumber', e.target.value)}
                      placeholder="+234 801 234 5678"
                      required
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="Create a password (min. 6 characters)"
                      required
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      placeholder="Confirm your password"
                      required
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Create Account Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold disabled:bg-gray-400 mt-6"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Sign In Link */}
          <Card className="bg-white shadow-md">
            <CardContent className="p-4">
              <p className="text-center text-gray-600 text-sm mb-3">
                Already have an account?
              </p>
              <Button
                onClick={onLoginClick}
                variant="outline"
                className="w-full py-3"
              >
                Sign In Instead
              </Button>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <p className="text-xs text-gray-500 text-center leading-relaxed px-4">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </MobileLayout>
  );
};
