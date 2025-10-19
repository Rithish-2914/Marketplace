import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Role } from '../types';
import AnimatedButton from '../components/AnimatedButton';
import { GoogleIcon } from '../assets/icons';

const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const { login, signup, googleLogin, resetPassword } = useAuth();
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
    const [success, setSuccess] = useState('');
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (isLogin) {
            const success = await login(email, password);
            if (!success) {
                setError('Invalid credentials. Please check your email and password.');
            }
        } else {
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
    }

    const toggleForm = () => {
        setIsLogin(!isLogin);
        setIsForgotPassword(false);
        setError('');
        setSuccess('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFullName('');
        setRegNo('');
        setBranch('');
        setYear(1);
        setHostelBlock('');
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        if (!email) {
            setError('Please enter your email address.');
            setIsLoading(false);
            return;
        }

        const success = await resetPassword(email);
        if (success) {
            setSuccess('Password reset email sent! Check your inbox.');
            setEmail('');
        } else {
            setError('Failed to send password reset email. Please check your email address.');
        }
        setIsLoading(false);
    };

    const showForgotPassword = () => {
        setIsForgotPassword(true);
        setIsLogin(true);
        setError('');
        setSuccess('');
    };

    const backToLogin = () => {
        setIsForgotPassword(false);
        setError('');
        setSuccess('');
        setEmail('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-100 via-white to-cream-200 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-10 animate-fade-in-down">
                    <h1 className="text-6xl sm:text-7xl font-black text-black tracking-tight">SwapHands</h1>
                    <p className="text-gray-700 mt-3 text-lg font-semibold">Your trusted student marketplace.</p>
                </div>
                
                <div className="bg-white rounded-3xl shadow-2xl p-10 animate-fade-in-down border-2 border-cream-200">
                    <h2 className="text-3xl font-black text-black text-center mb-8">
                        {isForgotPassword ? 'Reset Password' : (isLogin ? 'Welcome Back!' : 'Create Account')}
                    </h2>
                    
                    {error && <p className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-sm font-semibold border border-red-200">{error}</p>}
                    {success && <p className="bg-green-50 text-green-600 p-4 rounded-2xl mb-6 text-sm font-semibold border border-green-200">{success}</p>}
                    
                    {isForgotPassword ? (
                        <form onSubmit={handleForgotPassword} className="space-y-5">
                            <p className="text-gray-600 text-sm mb-4">Enter your email address and we'll send you a link to reset your password.</p>
                            <input 
                                type="email" 
                                placeholder="Email Address" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                                required 
                                className="w-full px-5 py-4 bg-cream-50 text-black font-semibold rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/10 border border-cream-300 placeholder-gray-500" 
                            />
                            <AnimatedButton type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Sending...' : 'Send Reset Link'}
                            </AnimatedButton>
                            <button 
                                type="button" 
                                onClick={backToLogin} 
                                className="w-full text-center text-sm text-black underline font-semibold hover:no-underline"
                            >
                                Back to Login
                            </button>
                        </form>
                    ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <>
                                <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required className="w-full px-5 py-4 bg-cream-50 text-black font-semibold rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/10 border border-cream-300 placeholder-gray-500" />
                                <input type="text" placeholder="Registration No." value={regNo} onChange={e => setRegNo(e.target.value)} required className="w-full px-5 py-4 bg-cream-50 text-black font-semibold rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/10 border border-cream-300 placeholder-gray-500" />
                                <div className="grid grid-cols-2 gap-4">
                                     <input type="text" placeholder="Branch (CSE)" value={branch} onChange={e => setBranch(e.target.value)} required className="w-full px-5 py-4 bg-cream-50 text-black font-semibold rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/10 border border-cream-300 placeholder-gray-500" />
                                     <select value={year} onChange={e => setYear(parseInt(e.target.value))} required className="w-full px-5 py-4 bg-cream-50 text-black font-semibold rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/10 border border-cream-300">
                                        <option value={1}>1st Year</option>
                                        <option value={2}>2nd Year</option>
                                        <option value={3}>3rd Year</option>
                                        <option value={4}>4th Year</option>
                                        <option value={5}>5th Year</option>
                                     </select>
                                </div>
                                <input type="text" placeholder="Hostel Block" value={hostelBlock} onChange={e => setHostelBlock(e.target.value)} required className="w-full px-5 py-4 bg-cream-50 text-black font-semibold rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/10 border border-cream-300 placeholder-gray-500" />

                            </>
                        )}
                        <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-5 py-4 bg-cream-50 text-black font-semibold rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/10 border border-cream-300 placeholder-gray-500" />
                        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-5 py-4 bg-cream-50 text-black font-semibold rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/10 border border-cream-300 placeholder-gray-500" />
                        {!isLogin && (
                            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full px-5 py-4 bg-cream-50 text-black font-semibold rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/10 border border-cream-300 placeholder-gray-500" />
                        )}
                        
                        <AnimatedButton type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (isLogin ? 'Logging In...' : 'Signing Up...') : (isLogin ? 'Log In' : 'Sign Up')}
                        </AnimatedButton>

                        {isLogin && (
                            <div className="text-center">
                                <button 
                                    type="button" 
                                    onClick={showForgotPassword} 
                                    className="text-sm text-gray-600 hover:text-black underline font-semibold hover:no-underline"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        )}
                    </form>
                    )}

                    {!isForgotPassword && (
                        <>
                            <div className="my-8 flex items-center">
                                <div className="flex-grow border-t-2 border-cream-300"></div>
                                <span className="flex-shrink mx-6 text-gray-600 text-sm font-bold">OR</span>
                                <div className="flex-grow border-t-2 border-cream-300"></div>
                            </div>

                            <button onClick={handleGoogleLogin} disabled={isLoading} className="w-full flex items-center justify-center px-6 py-4 bg-white border-2 border-black rounded-2xl shadow-md hover:bg-cream-50 hover:scale-105 transition-all duration-300 disabled:opacity-50 font-bold">
                                <GoogleIcon />
                                <span className="ml-3 text-black">Continue with Google</span>
                            </button>
                            
                            <p className="text-center text-sm text-gray-700 mt-8 font-semibold">
                                {isLogin ? "Don't have an account?" : "Already have an account?"}
                                <button type="button" onClick={toggleForm} className="ml-2 text-black underline font-black hover:no-underline">{isLogin ? 'Sign Up' : 'Log In'}</button>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
