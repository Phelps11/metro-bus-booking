import React, { useState } from 'react';
import { MobileLayout } from '../../components/Layout/MobileLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
  onSignUpClick: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onSignUpClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      if (data.user) {
        onLoginSuccess();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    setLoading(true);

    try {
      const { data: users, error: queryError } = await supabase
        .from('users')
        .select('id')
        .eq('email', resetEmail)
        .maybeSingle();

      if (queryError) {
        setError('Failed to verify email. Please try again.');
        setLoading(false);
        return;
      }

      if (!users) {
        setError('This email is not attached to a user');
        setLoading(false);
        return;
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setResetMessage('Password reset link sent! Check your email.');
      setResetEmail('');
    } catch (err) {
      setError('Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout showBottomNav={false}>
      {/* Header */}
      <div className="bg-oxford-blue h-[80px] flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-oxford-blue to-prussian-blue" />
        <h1 className="relative text-white font-bold text-lg">
          {resetMode ? 'Reset Password' : 'Sign In'}
        </h1>
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
              {resetMode ? 'Reset Your Password' : 'Welcome Back'}
            </h1>
            <p className="text-gray-600">
              {resetMode
                ? 'Enter your email to receive a password reset link'
                : 'Sign in to continue your journey'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <p className="text-sm text-red-800 text-center">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Success Message */}
          {resetMessage && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <p className="text-sm text-green-800 text-center">{resetMessage}</p>
              </CardContent>
            </Card>
          )}

          {/* Login Form or Reset Form */}
          <Card className="bg-white shadow-md">
            <CardContent className="p-6 space-y-4">
              {resetMode ? (
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  {/* Reset Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Reset Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-oxford-blue hover:bg-oxford-blue/90 text-white py-4 text-lg font-semibold disabled:bg-gray-400 mt-6"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </Button>

                  {/* Back to Login */}
                  <button
                    type="button"
                    onClick={() => {
                      setResetMode(false);
                      setError('');
                      setResetMessage('');
                    }}
                    className="w-full text-center text-sm text-oxford-blue hover:underline"
                  >
                    Back to Sign In
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
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
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
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

                  {/* Forgot Password Link */}
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setResetMode(true);
                        setError('');
                      }}
                      className="text-sm text-oxford-blue hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Sign In Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-oxford-blue hover:bg-oxford-blue/90 text-white py-4 text-lg font-semibold disabled:bg-gray-400 mt-6"
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Sign Up Link */}
          {!resetMode && (
            <Card className="bg-white shadow-md">
              <CardContent className="p-4">
                <p className="text-center text-gray-600 text-sm mb-3">
                  Don't have an account?
                </p>
                <Button
                  onClick={onSignUpClick}
                  variant="outline"
                  className="w-full py-3"
                >
                  Create New Account
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Additional Info */}
          <p className="text-xs text-gray-500 text-center leading-relaxed px-4">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </MobileLayout>
  );
};
