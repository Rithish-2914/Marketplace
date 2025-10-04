import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Role } from '../types';
import AnimatedButton from '../components/AnimatedButton';
import { GoogleIcon } from '../assets/icons';

const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const { login, signup, googleLogin } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [regNo, setRegNo] = useState('');
    const [branch, setBranch] = useState('');
    const [year, setYear] = useState(1);
    const [hostelBlock, setHostelBlock] = useState('');
    const [error, setError] = useState('');
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (isLogin) {
            const success = await login(email, password);
            if (!success) {
                setError('Invalid credentials or not a valid VIT email.');
            }
        } else {
            if (!email.endsWith('@vitstudent.ac.in') && !email.endsWith('@vit.ac.in')) {
                setError('Sign up requires a valid VIT email (@vitstudent.ac.in or @vit.ac.in).');
                setIsLoading(false);
                return;
            }
            if (password !== confirmPassword) {
                setError('Passwords do not match.');
                setIsLoading(false);
                return;
            }
            const success = await signup({ fullName, email, regNo, branch, year, hostelBlock, password });
            if (!success) {
                setError('Could not create account. The email may already be in use.');
            }
        }
        setIsLoading(false);
    };
    
    const handleGoogleLogin = async () => {
        setIsLoading(true);
        await googleLogin();
        // No need to set loading to false, as onAuthStateChanged will trigger a re-render
    }

    const toggleForm = () => {
        setIsLogin(!isLogin);
        setError('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFullName('');
        setRegNo('');
        setBranch('');
        setYear(1);
        setHostelBlock('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4 transition-colors duration-300">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-black text-primary-500">SwapHands</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">The official marketplace for VIT students.</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 animate-fade-in-down">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">{isLogin ? 'Welcome Back!' : 'Create Your Account'}</h2>
                    
                    {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</p>}
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <>
                                <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                <input type="text" placeholder="Registration No." value={regNo} onChange={e => setRegNo(e.target.value)} required className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                <div className="grid grid-cols-2 gap-4">
                                     <input type="text" placeholder="Branch (e.g., CSE)" value={branch} onChange={e => setBranch(e.target.value)} required className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                     <select value={year} onChange={e => setYear(parseInt(e.target.value))} required className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                                        <option value={1}>1st Year</option>
                                        <option value={2}>2nd Year</option>
                                        <option value={3}>3rd Year</option>
                                        <option value={4}>4th Year</option>
                                        <option value={5}>5th Year</option>
                                     </select>
                                </div>
                                <input type="text" placeholder="Hostel Block" value={hostelBlock} onChange={e => setHostelBlock(e.target.value)} required className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />

                            </>
                        )}
                        <input type="email" placeholder="VIT Email Address" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        {!isLogin && (
                            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        )}
                        
                        <AnimatedButton type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (isLogin ? 'Logging In...' : 'Signing Up...') : (isLogin ? 'Log In' : 'Sign Up')}
                        </AnimatedButton>
                    </form>

                    <div className="my-6 flex items-center">
                        <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                        <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-sm">OR</span>
                        <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                    </div>

                    <button onClick={handleGoogleLogin} disabled={isLoading} className="w-full flex items-center justify-center px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50">
                        <GoogleIcon />
                        <span className="ml-3 font-medium text-gray-800 dark:text-gray-200">Continue with Google</span>
                    </button>
                    
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button onClick={toggleForm} className="font-medium text-primary-500 hover:underline ml-1">
                            {isLogin ? 'Sign Up' : 'Log In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;