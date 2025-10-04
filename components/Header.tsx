import React from 'react';
import { useAuth } from '../context/AuthContext';
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
        className={`px-4 py-2.5 text-sm font-black rounded-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-black/10 transform hover:scale-105 ${
            isActive
                ? 'bg-black text-white shadow-lg'
                : 'text-black hover:bg-cream-200'
        }`}
    >
        {children}
    </button>
);


const Header: React.FC<HeaderProps> = ({ onNavigate, onSearch, activePage }) => {
    const { user, logout } = useAuth();

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
        <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-xl border-b-2 border-cream-300 animate-fade-in-down">
            <div className="container mx-auto px-6 py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                       <h1 className="text-3xl font-black text-black tracking-tighter">SwapHands</h1>
                    </div>

                    <div className="hidden md:flex items-center justify-center flex-1">
                        <div className="bg-cream-100 p-2 rounded-3xl flex space-x-2 shadow-inner">
                          {navLinks.map(link => (
                            <NavLink key={link.page} onClick={() => onNavigate(link.page)} isActive={activePage === link.page}>
                                {link.label}
                            </NavLink>
                          ))}
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                         <div className="relative hidden sm:block">
                            <input
                                type="text"
                                placeholder="Search..."
                                onChange={(e) => onSearch(e.target.value)}
                                className="pl-12 pr-4 py-3 w-36 md:w-56 bg-cream-100 border-2 border-cream-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/10 focus:border-black transition-all duration-300 font-semibold placeholder-gray-500"
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                        </div>
                        <button onClick={logout} aria-label="Logout" className="p-3 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all duration-300 transform hover:scale-110 shadow-lg">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                             <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                           </svg>
                        </button>
                    </div>
                </div>
                 <div className="md:hidden mt-4">
                    <div className="bg-cream-100 p-2 rounded-3xl flex space-x-1 overflow-x-auto shadow-inner">
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
