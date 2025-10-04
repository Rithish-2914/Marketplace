import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, Role } from '../types';
import { auth } from '../firebase';
import { supabase } from '../supabase';
import { 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    User as FirebaseUser
} from 'firebase/auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password?: string) => Promise<boolean>;
    signup: (userData: Pick<User, 'fullName' | 'email' | 'regNo' | 'branch' | 'year' | 'hostelBlock'> & {password: string}) => Promise<boolean>;
    logout: () => void;
    googleLogin: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', firebaseUser.uid)
                    .single();

                if (data && !error) {
                    setUser(data as User);
                } else {
                    console.warn("User exists in Auth but not in Supabase database. Creating user record...");
                    
                    const newUser: User = {
                        id: firebaseUser.uid,
                        fullName: firebaseUser.displayName || 'VIT Student',
                        email: firebaseUser.email || '',
                        regNo: 'UPDATE_ME',
                        branch: 'UPDATE_ME',
                        year: 1,
                        hostelBlock: 'UPDATE_ME',
                        role: firebaseUser.email?.endsWith('@vit.ac.in') ? Role.ADMIN : Role.STUDENT,
                        profilePictureUrl: firebaseUser.photoURL || `https://i.pravatar.cc/150?u=${firebaseUser.uid}`,
                        rating: 0,
                        ratingsCount: 0,
                        wishlist: [],
                        isSuspended: false,
                    };
                    
                    const { error: insertError } = await supabase.from('users').insert([newUser]);
                    if (!insertError) {
                        setUser(newUser);
                        console.log("User record created successfully!");
                    } else {
                        console.error("Failed to create user record:", insertError);
                    }
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);
    
    const login = async (email: string, password?: string): Promise<boolean> => {
        try {
            await signInWithEmailAndPassword(auth, email, password || '');
            return true;
        } catch (error) {
            console.error("Firebase login failed:", error);
            return false;
        }
    };

    const signup = async (userData: Pick<User, 'fullName' | 'email' | 'regNo' | 'branch' | 'year' | 'hostelBlock'> & {password: string}): Promise<boolean> => {
       try {
            const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
            const firebaseUser = userCredential.user;
            
            const newUser: User = {
                id: firebaseUser.uid,
                fullName: userData.fullName,
                email: userData.email,
                regNo: userData.regNo,
                branch: userData.branch,
                year: userData.year,
                hostelBlock: userData.hostelBlock,
                role: userData.email.endsWith('@vit.ac.in') ? Role.ADMIN : Role.STUDENT,
                profilePictureUrl: firebaseUser.photoURL || `https://i.pravatar.cc/150?u=${firebaseUser.uid}`,
                rating: 0,
                ratingsCount: 0,
                wishlist: [],
                isSuspended: false,
            };
            
            const { error } = await supabase.from('users').insert([newUser]);
            if (error) throw error;
            return true;
       } catch (error) {
           console.error("Signup failed:", error);
           return false;
       }
    };
    
    const googleLogin = async (): Promise<boolean> => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const firebaseUser = result.user;

            const { data: existingUser } = await supabase
                .from('users')
                .select('*')
                .eq('id', firebaseUser.uid)
                .single();

            if (!existingUser) {
                const newUser: User = {
                    id: firebaseUser.uid,
                    fullName: firebaseUser.displayName || 'VIT Student',
                    email: firebaseUser.email || '',
                    regNo: 'TBD',
                    branch: 'TBD',
                    year: 1,
                    hostelBlock: 'TBD',
                    role: firebaseUser.email?.endsWith('@vit.ac.in') ? Role.ADMIN : Role.STUDENT,
                    profilePictureUrl: firebaseUser.photoURL || `https://i.pravatar.cc/150?u=${firebaseUser.uid}`,
                    rating: 0,
                    ratingsCount: 0,
                    wishlist: [],
                    isSuspended: false,
                };
                await supabase.from('users').insert([newUser]);
            }
            return true;
        } catch (error) {
            console.error("Google login failed:", error);
            return false;
        }
    };

    const logout = () => {
        signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, googleLogin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
