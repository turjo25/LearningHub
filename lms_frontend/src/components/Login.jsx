import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider.jsx';
import { useState } from 'react';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const values = {
      phone: e.target.phone.value.trim(),
      password: e.target.password.value,
    };

    // Validation
    if (!values.phone || !values.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      await login(values);
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.detail || 'Login failed. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-[80vh] flex flex-col justify-center items-center bg-linear-to-br from-blue-50 to-indigo-100 px-4'>
      {/* Left Side - Branding (hidden on mobile)
      <div className="absolute left-0 top-0 w-1/2 h-full bg-linear-to-r from-blue-600 to-indigo-600 hidden lg:flex items-center justify-center text-white">
        <div className="text-center max-w-md">
          <h1 className="text-5xl font-bold mb-4">Welcome Back</h1>
          <p className="text-xl text-blue-100">Continue your learning journey with us</p>
        </div>
      </div> */}

      {/* Right Side - Form */}
      <div className='w-full max-w-md mt-5'>
        <div className='bg-white rounded-2xl shadow-2xl p-8 md:p-10'>
          {/* Header */}
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>Login</h1>
            <p className='text-gray-600'>Enter your credentials to access your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3'>
              <span className='text-red-600 text-xl shrink-0'>⚠️</span>
              <p className='text-red-700 text-sm font-medium'>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-5'>
            {/* Phone Input */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>Phone Number</label>
              <input
                name="phone"
                type="tel"
                placeholder="Enter your phone number"
                required
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200 bg-gray-50 hover:bg-white'
              />
            </div>

            {/* Password Input */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>Password</label>
              <input
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200 bg-gray-50 hover:bg-white'
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className='w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-lg transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
            >
              {loading ? (
                <>
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                  <span>Logging in...</span>
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className='my-6 flex items-center gap-4'>
            <div className='flex-1 h-px bg-gray-300'></div>
            <span className='text-sm text-gray-500'>Don't have an account?</span>
            <div className='flex-1 h-px bg-gray-300'></div>
          </div>

          {/* Register Link */}
          <a
            href="/register"
            className='block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg transition duration-200'
          >
            Create New Account
          </a>
        </div>

        {/* Footer Note */}
        <p className='m-3 text-center text-sm text-gray-600 mt-6'>
          By logging in, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}

export default Login;
