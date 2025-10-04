import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon } from '../assets/icons';
import { Role } from '../types';

interface HeaderProps {
    onNavigate: (page: string) => void;
    onSearch: (query: string) => void;
    activePage: string;
}

const NavLink: React.FC<{
    onClick: () => void;
    isActive: boolean;
    children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
    <button
        onClick={onClick}
        className={`px-3 sm:px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
            isActive
                ? 'bg-primary-500 text-white shadow'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
    >
        {children}
    </button>
);


const Header: React.FC<HeaderProps> = ({ onNavigate, onSearch, activePage }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const studentNavLinks = [
        { page: 'dashboard', label: 'Dashboard' },
        { page: 'browse', label: 'Browse' },
        { page: 'sell', label: 'Sell Item' },
        { page: 'wishlist', label: 'Wishlist' },
        { page: 'lostfound', label: 'Lost & Found'},
        { page: 'profile', label: 'Profile' },
    ];

    const adminNavLinks = [
        { page: 'dashboard', label: 'Dashboard' },
        { page: 'users', label: 'Users' },
        { page: 'listings', label: 'Listings' },
        { page: 'complaints', label: 'Complaints' },
        { page: 'lostfound', label: 'Lost & Found' },
    ];

    const navLinks = user?.role === Role.ADMIN ? adminNavLinks : studentNavLinks;

    return (
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm animate-fade-in-down">
            <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                       <h1 className="text-2xl font-black text-primary-500">SwapHands</h1>
                    </div>

                    <div className="hidden md:flex items-center justify-center flex-1">
                        <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-xl flex space-x-1">
                          {navLinks.map(link => (
                            <NavLink key={link.page} onClick={() => onNavigate(link.page)} isActive={activePage === link.page}>
                                {link.label}
                            </NavLink>
                          ))}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-3">
                         <div className="relative hidden sm:block">
                            <input
                                type="text"
                                placeholder="Search..."
                                onChange={(e) => onSearch(e.target.value)}
                                className="pl-10 pr-4 py-2 w-32 md:w-48 bg-gray-100 dark:bg-gray-700 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                        </div>
                        <button onClick={toggleTheme} aria-label="Toggle theme" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            {theme === 'light' ? <MoonIcon className="w-5 h-5 text-gray-700" /> : <SunIcon className="w-5 h-5 text-accent-500" />}
                        </button>
                        <button onClick={logout} aria-label="Logout" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-500">
                             <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                           </svg>
                        </button>
                    </div>
                </div>
                 <div className="md:hidden mt-4">
                    <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded-xl flex space-x-1 overflow-x-auto">
                      {navLinks.map(link => (
                        <NavLink key={link.page} onClick={() => onNavigate(link.page)} isActive={activePage === link.page}>
                            {link.label}
                        </NavLink>
                      ))}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;