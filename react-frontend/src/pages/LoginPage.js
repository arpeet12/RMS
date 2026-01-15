import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaCheckCircle, FaGoogle, FaFacebook } from 'react-icons/fa';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);
    
    if (result.success && result.user) {
      // Redirect based on user role
      const role = result.user.role;
      if (role === 'CANDIDATE') {
        navigate('/candidate/dashboard');
      } else if (role === 'AGENT') {
        navigate('/agent/dashboard');
      } else if (role === 'ADMIN' || role === 'OFFICER') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } else {
      setError(result.error || 'Invalid username or password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full bg-white flex flex-col md:flex-row shadow-none overflow-hidden rounded-xl">
            
            {/* Left Side - New to Manpower? */}
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center border-r border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">New to Manpower?</h2>
                
                <ul className="space-y-4 mb-8">
                    <li className="flex items-start">
                        <FaCheckCircle className="text-blue-600 mt-1 mr-3 flex-shrink-0" />
                        <span className="text-gray-600 text-lg">One click apply using Manpower profile.</span>
                    </li>
                    <li className="flex items-start">
                        <FaCheckCircle className="text-blue-600 mt-1 mr-3 flex-shrink-0" />
                        <span className="text-gray-600 text-lg">Get relevant job recommendations.</span>
                    </li>
                    <li className="flex items-start">
                        <FaCheckCircle className="text-blue-600 mt-1 mr-3 flex-shrink-0" />
                        <span className="text-gray-600 text-lg">Showcase profile to top companies and consultants.</span>
                    </li>
                    <li className="flex items-start">
                        <FaCheckCircle className="text-blue-600 mt-1 mr-3 flex-shrink-0" />
                        <span className="text-gray-600 text-lg">Know application status on applied jobs.</span>
                    </li>
                </ul>

                <div>
                    <Link 
                        to="/register" 
                        className="inline-block px-8 py-3 border border-blue-600 text-blue-600 font-semibold rounded hover:bg-blue-50 transition-colors"
                    >
                        Register for free
                    </Link>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="md:w-1/2 p-8 md:p-12">
                <div className="max-w-md mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h2>
                    <p className="text-gray-600 mb-8">Login to your account</p>

                    <div className="space-y-4 mb-8">
                         <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                            <FaGoogle className="text-red-500 mr-2" />
                            Continue with Google
                         </button>
                         <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-900 transition-colors">
                            <FaFacebook className="text-white mr-2" />
                            Continue with Facebook
                         </button>
                    </div>

                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">or</span>
                        </div>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}
                        
                        <div>
                            <label htmlFor="username" className="sr-only">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Email or Username"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Password"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                                    Forgot password?
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                            >
                                {loading ? 'Logging in...' : 'LOGIN'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default LoginPage;
