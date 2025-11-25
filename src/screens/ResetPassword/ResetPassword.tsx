import React, { useState } from 'react';
import { MobileLayout } from '../../components/Layout/MobileLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { supabase } from '../../lib/supabase';
import { Lock, Eye, EyeOff, Mail } from 'lucide-react';

interface ResetPasswordProps {
  onResetSuccess: () => void;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ onResetSuccess }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<'email' | 'otp-password'>('email');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#type=recovery`,
      });

      if (resetError) {
        setError(resetError.message);
        setLoading(false);
        return;
      }

      setStep('otp-password');
      setSuccess('A 6-digit verification code has been sent to your email.');
    } catch (err) {
      setError('Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    if (!password || !confirmPassword) {
      setError('Please fill both password fields');
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

    try {
      // Verify OTP and update password
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });

      if (verifyError) {
        setError('Invalid or expired verification code');
        setLoading(false);
        return;
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setSuccess('Password updated successfully! You can now log in.');

      // Sign out the user after password reset so they can login with new password
      await supabase.auth.signOut();

      // Wait a bit to show success message before redirecting
      setTimeout(() => {
        onResetSuccess();
      }, 2000);
    } catch (err) {
      setError('Failed to reset password');
      setLoading(false);
    }
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
              {step === 'email' ? 'Reset Your Password' : 'Verify & Create New Password'}
            </h1>
            <p className="text-gray-600">
              {step === 'email'
                ? 'Enter your email to receive a verification code'
                : 'Enter the code sent to your email and create a new password'}
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
              {step === 'email' ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
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

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-oxford-blue hover:bg-oxford-blue/90 text-white py-4 text-lg font-semibold disabled:bg-gray-400 mt-6"
                  >
                    {loading ? 'Sending...' : 'Send Verification Code'}
                  </Button>

                  <button
                    type="button"
                    onClick={onResetSuccess}
                    className="w-full text-center text-sm text-oxford-blue hover:underline"
                  >
                    Back to Sign In
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verification Code *
                    </label>
                    <Input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit code"
                      required
                      maxLength={6}
                      className="text-center text-2xl tracking-widest"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter the 6-digit code sent to {email}
                    </p>
                  </div>

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
                    {loading ? 'Updating Password...' : success ? 'Redirecting...' : 'Reset Password'}
                  </Button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setOtp('');
                      setPassword('');
                      setConfirmPassword('');
                      setError('');
                      setSuccess('');
                    }}
                    className="w-full text-center text-sm text-oxford-blue hover:underline"
                  >
                    Use a different email
                  </button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileLayout>
  );
};
