
import React from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import AuthPage from './pages/AuthPage';
import StudentApp from './pages/StudentApp';
import AdminApp from './pages/AdminApp';
import { Role } from './types';

const AppContent: React.FC = () => {
    const { user } = useAuth();

    if (!user) {
        return <AuthPage />;
    }

    if (user.role === Role.ADMIN) {
        return <AdminApp />;
    }

    return <StudentApp />;
};

const LoadingSpinner: React.FC = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-primary-500 border-dashed rounded-full animate-spin"></div>
    </div>
);

const AppContentWrapper: React.FC = () => {
    const { theme } = useTheme();
    const { loading } = useAuth();
    
    React.useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    if (loading) {
        return <LoadingSpinner />;
    }

    return <AppContent />;
}

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <AuthProvider>
                <DataProvider>
                    <AppContentWrapper />
                </DataProvider>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;
