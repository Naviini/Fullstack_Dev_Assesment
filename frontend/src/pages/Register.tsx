import React, { useState, useContext, FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { authAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Register: FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const login = authContext?.login ?? (() => {});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.register({ name, email, password });
      login(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(message);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse): Promise<void> => {
    try {
      setLoading(true);
      setError('');

      if (!credentialResponse.credential) {
        setError('Google authentication failed: No credential received');
        return;
      }

      const response = await authAPI.googleAuth(credentialResponse.credential);
      login(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Google sign up failed. Please ensure this domain is authorized in Google Cloud Console.';
      setError(message);
      console.error('Google sign up error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (): void => {
    const errorMsg = 'Google sign up failed. Please check:\n1. Your Google Client ID is configured\n2. This origin (http://localhost:3001) is authorized in Google Cloud Console\n3. Check browser console for more details';
    setError(errorMsg);
    console.error('Google sign up error occurred');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">ProjectHub</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mt-2">Create Account</h2>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm whitespace-pre-wrap">
            {error}
          </div>
        )}

        {/* Google Sign-Up Button */}
        <div className="mb-4 w-full">
          <div className="w-full [&>div]:w-full [&>div>div]:w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              text="signup_with"
              shape="rectangular"
            />
          </div>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={50}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-600 transition-colors"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-600 transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-600 transition-colors"
              placeholder="•••••••• (min 6 characters)"
            />
            <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-indigo-600 font-semibold hover:text-indigo-700">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
