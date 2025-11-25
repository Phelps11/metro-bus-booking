import React, { useState } from 'react';
import { MobileLayout } from '../../components/Layout/MobileLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Lock, Eye, EyeOff } from 'lucide-react';

export const ResetPasswordDemo: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!password || !confirmPassword) {
      setError('Please fill both fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setSuccess('Password updated successfully! You can now log in.');
      setLoading(false);
    }, 1500);
  };

  return (
    <MobileLayout showBottomNav={false}>
      <div className="bg-oxford-blue h-[80px] flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-oxford-blue to-prussian-blue" />
        <h1 className="relative text-white font-bold text-lg">Reset Password</h1>
      </div>

      <div className="min-h-[calc(100vh-80px)] bg-gray-50">
        <div className="px-4 py-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-32 h-20 mx-auto mb-4">
              <img
                src="/Metro Bus 4.jpg"
                alt="Metro Bus Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-oxford-blue">
              Create New Password
            </h1>
            <p className="text-gray-600">
              Enter your new password below
            </p>
          </div>

          {error && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <p className="text-sm text-red-800 text-center">{error}</p>
              </CardContent>
            </Card>
          )}

          {success && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <p className="text-sm text-green-800 text-center">{success}</p>
              </CardContent>
            </Card>
          )}

          <Card className="bg-white shadow-md">
            <CardContent className="p-6 space-y-4">
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password *
                  </label>
                  <div className="relative">
                    <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
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
                  <p className="text-xs text-gray-500 mt-1">
                    Must be at least 6 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !!success}
                  className="w-full bg-oxford-blue hover:bg-oxford-blue/90 text-white py-4 text-lg font-semibold disabled:bg-gray-400 mt-6"
                >
                  {loading ? 'Updating Password...' : success ? 'Success!' : 'Reset Password'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-xs text-gray-500 italic">
              Demo Mode - No actual password reset will occur
            </p>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};
