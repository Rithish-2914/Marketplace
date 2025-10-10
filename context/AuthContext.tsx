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
    sendEmailVerification,
    User as FirebaseUser
} from 'firebase/auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password?: string) => Promise<boolean>;
    signup: (userData: Pick<User, 'fullName' | 'email' | 'regNo' | 'branch' | 'year' | 'hostelBlock'> & {password: string}) => Promise<boolean>;
    logout: () => void;
    googleLogin: () => Promise<boolean>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to generate default profile picture with first letter
const getDefaultProfilePicture = (name: string): string => {
    const firstLetter = name.trim().charAt(0).toUpperCase() || 'U';
    return `https://ui-avatars.com/api/?name=${firstLetter}&background=1a1a1a&color=ffffff&size=200&bold=true`;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // This is the listener that watches for Firebase login/logout events
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                // --- START: THE CRITICAL FIX ---
                // Get the unique authentication token from the logged-in Firebase user
                const token = await firebaseUser.getIdToken();
                
                // Securely pass the token to Supabase. This tells Supabase who the user is.
                const { error: sessionError } = await supabase.auth.setSession({
                    access_token: token,
                    refresh_token: token,
                });

                if (sessionError) {
                    console.error("CRITICAL: Could not set Supabase session!", sessionError);
                    setLoading(false);
                    return; // Stop execution if we can't authenticate with Supabase
                }
                // --- END: THE CRITICAL FIX ---

                // Now that Supabase is authenticated, we can fetch the user's profile
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', firebaseUser.uid)
                    .single();

                if (data && !error) {
                    // User exists, convert snake_case from DB to camelCase for the app
                    const user: User = {
                        id: data.id,
                        fullName: data.full_name,
                        email: data.email,
                        regNo: data.reg_no,
                        branch: data.branch,
                        year: data.year,
                        hostelBlock: data.hostel_block,
                        role: data.role,
                        profilePictureUrl: data.profile_picture_url,
                        rating: data.rating,
                        ratingsCount: data.ratings_count,
                        wishlist: data.wishlist,
                        isSuspended: data.is_suspended,
                    };
                    setUser(user);
                } else {
                    // User is new (exists in Firebase but not in our 'users' table)
                    console.warn("User exists in Firebase Auth but not in Supabase database. Creating user record...");

                    const newUserData = {
                        id: firebaseUser.uid,
                        full_name: firebaseUser.displayName || 'VIT Student',
                        email: firebaseUser.email || '',
                        reg_no: 'UPDATE_ME',
                        branch: 'UPDATE_ME',
                        year: 1,
                        hostel_block: 'UPDATE_ME',
                        role: firebaseUser.email?.endsWith('@vit.ac.in') ? Role.ADMIN : Role.STUDENT,
                        profile_picture_url: firebaseUser.photoURL || getDefaultProfilePicture(firebaseUser.displayName || 'User'),
                        rating: 0,
                        ratings_count: 0,
                        wishlist: [],
                        is_suspended: false,
                    };

                    const { error: insertError, data: insertedData } = await supabase.from('users').insert([newUserData]).select().single();
                    if (!insertError && insertedData) {
                        const newUser: User = {
                            id: insertedData.id,
                            fullName: insertedData.full_name,
                            email: insertedData.email,
                            regNo: insertedData.reg_no,
                            branch: insertedData.branch,
                            year: insertedData.year,
                            hostelBlock: insertedData.hostel_block,
                            role: insertedData.role,
                            profilePictureUrl: insertedData.profile_picture_url,
                            rating: insertedData.rating,
                            ratingsCount: insertedData.ratings_count,
                            wishlist: insertedData.wishlist,
                            isSuspended: insertedData.is_suspended,
                        };
                        setUser(newUser);
                        console.log("New user record created successfully in Supabase!");
                    } else {
                        console.error("Failed to create new user record in Supabase:", insertError);
                    }
                }
            } else {
                // User logged out from Firebase, so sign them out from Supabase too
                await supabase.auth.signOut();
                setUser(null);
            }
            setLoading(false);
        });

        return () => {
            // Cleanup the listener when the component unmounts
            unsubscribe();
        };
    }, []);

    const login = async (email: string, password?: string): Promise<boolean> => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password || '');

            if (!userCredential.user.emailVerified) {
                alert('Please verify your email before logging in. Check your inbox for the verification link.');
                await signOut(auth);
                return false;
            }

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

            await sendEmailVerification(firebaseUser);

            const newUserData = {
                id: firebaseUser.uid,
                full_name: userData.fullName,
                email: userData.email,
                reg_no: userData.regNo,
                branch: userData.branch,
                year: userData.year,
                hostel_block: userData.hostelBlock,
                role: userData.email.endsWith('@vit.ac.in') ? Role.ADMIN : Role.STUDENT,
                profile_picture_url: firebaseUser.photoURL || getDefaultProfilePicture(userData.fullName),
                rating: 0,
                ratings_count: 0,
                wishlist: [],
                is_suspended: false,
            };

            const { error } = await supabase.from('users').insert([newUserData]);
            if (error) throw error;

            alert('Account created! Please check your email to verify your account before logging in.');
            await signOut(auth);
            return true;
       } catch (error) {
           console.error("Signup failed:", error);
           return false;
       }
    };

    const googleLogin = async (): Promise<boolean> => {
        try {
            console.log('Starting Google login...');
            const provider = new GoogleAuthProvider();
            // Just sign in. The onAuthStateChanged listener will handle everything else.
            await signInWithPopup(auth, provider);
            return true;
        } catch (error: any) {
            console.error("Google login failed:", error);
            alert(`Google login failed: ${error?.message || 'Unknown error'}`);
            return false;
        }
    };

    const logout = () => {
        signOut(auth); // This will trigger the onAuthStateChanged listener to sign out of Supabase
    };

    const refreshUser = async () => {
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', firebaseUser.uid)
                .single();

            if (data && !error) {
                const user: User = {
                    id: data.id,
                    fullName: data.full_name,
                    email: data.email,
                    regNo: data.reg_no,
                    branch: data.branch,
                    year: data.year,
                    hostelBlock: data.hostel_block,
                    role: data.role,
                    profilePictureUrl: data.profile_picture_url,
                    rating: data.rating,
                    ratingsCount: data.ratings_count,
                    wishlist: data.wishlist,
                    isSuspended: data.is_suspended,
                };
                setUser(user);
            }
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, googleLogin, refreshUser }}>
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
