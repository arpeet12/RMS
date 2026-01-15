import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaCheckCircle, FaUser, FaLock, FaEnvelope } from 'react-icons/fa';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('AGENT');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 3) {
      setError('Password must be at least 3 characters');
      return;
    }

    if (!role) {
      setError('Please select a role');
      return;
    }

    setLoading(true);
    const result = await register(username, password, role);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.error || 'Registration failed');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full bg-white flex flex-col md:flex-row shadow-none overflow-hidden rounded-xl">
            
            {/* Left Side - Register Form */}
            <div className="md:w-1/2 p-8 md:p-12 order-2 md:order-1">
                <div className="max-w-md mx-auto">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                    <p className="text-gray-600 mb-8">Join us to find your dream job</p>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                                Registration successful! Redirecting to login...
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
                                placeholder="Choose a username"
                            />
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                I am a
                            </label>
                            <select
                                id="role"
                                name="role"
                                required
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                                <option value="CANDIDATE">Candidate (Job Seeker)</option>
                                <option value="OFFICER">Officer</option>
                                <option value="AGENT">Agent (Recruitment Agency)</option>
                            </select>
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
                                placeholder="Create password"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Confirm password"
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading || success}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                            >
                                {loading ? 'Creating account...' : 'REGISTER'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Side - Already have an account? */}
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center border-l border-gray-100 order-1 md:order-2 bg-gray-50 md:bg-white">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Already have an account?</h2>
                
                <ul className="space-y-4 mb-8">
                    <li className="flex items-start">
                        <FaCheckCircle className="text-blue-600 mt-1 mr-3 flex-shrink-0" />
                        <span className="text-gray-600 text-lg">Login to access your dashboard.</span>
                    </li>
                    <li className="flex items-start">
                        <FaCheckCircle className="text-blue-600 mt-1 mr-3 flex-shrink-0" />
                        <span className="text-gray-600 text-lg">Update your profile and documents.</span>
                    </li>
                    <li className="flex items-start">
                        <FaCheckCircle className="text-blue-600 mt-1 mr-3 flex-shrink-0" />
                        <span className="text-gray-600 text-lg">Track your application progress.</span>
                    </li>
                </ul>

                <div>
                    <Link 
                        to="/login" 
                        className="inline-block px-8 py-3 border border-blue-600 text-blue-600 font-semibold rounded hover:bg-blue-50 transition-colors"
                    >
                        Login here
                    </Link>
                </div>
            </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default RegisterPage;
