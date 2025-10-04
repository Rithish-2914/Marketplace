import React from 'react';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
    variant?: 'primary' | 'secondary' | 'outline';
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ children, className = '', variant = 'primary', ...props }) => {
    const baseClasses = 'px-8 py-4 font-black rounded-2xl transform transition-all duration-300 ease-out focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide text-sm shadow-xl';
    
    const variantClasses = {
        primary: 'bg-black text-white hover:bg-gray-800 hover:scale-105 active:scale-95 focus:ring-gray-400',
        secondary: 'bg-cream-200 text-black hover:bg-cream-300 hover:scale-105 active:scale-95 focus:ring-cream-400',
        outline: 'bg-transparent text-black border-2 border-black hover:bg-black hover:text-white hover:scale-105 active:scale-95 focus:ring-gray-400',
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default AnimatedButton;
