import React from 'react';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
    variant?: 'primary';
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ children, className = '', variant = 'primary', ...props }) => {
    const baseClasses = 'px-6 py-3 font-bold text-white rounded-lg transform transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
        primary: 'bg-primary-500 border-b-4 border-primary-700 hover:bg-primary-600 hover:border-primary-800 active:bg-primary-700 active:border-primary-700 active:translate-y-1 focus:ring-primary-300 dark:focus:ring-primary-800',
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