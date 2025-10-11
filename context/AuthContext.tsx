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
    sendPasswordResetEmail,
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
    resetPassword: (email: string) => Promise<boolean>;
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

    // DELETE your current useEffect block and REPLACE it with this one.

useEffect(() => {

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {

            if (firebaseUser) {

                const { data, error } = await supabase

                    .from('users')

                    .select('*')

                    .eq('id', firebaseUser.uid)

                    .single();



                if (data && !error) {

                    // Convert from snake_case to camelCase

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

                    console.warn("User exists in Auth but not in Supabase database. Creating user record...");

                    

                    // Convert to snake_case for database

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

                    

                    const { error: insertError, data } = await supabase.from('users').insert([newUserData]).select().single();

                    const newUser: User = data ? {

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

                    } : null as any;

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

            

            // Convert to snake_case for database

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

            const result = await signInWithPopup(auth, provider);

            const firebaseUser = result.user;

            console.log('Firebase auth successful:', firebaseUser.email);



            console.log('Checking if user exists in Supabase...');

            const { data: existingUser, error: checkError } = await supabase

                .from('users')

                .select('*')

                .eq('id', firebaseUser.uid)

                .single();



            if (checkError && checkError.code !== 'PGRST116') {

                console.error('Error checking user:', checkError);

            }



            if (!existingUser) {

                console.log('Creating new user in Supabase...');

                // Convert camelCase to snake_case for database

                const newUserData = {

                    id: firebaseUser.uid,

                    full_name: firebaseUser.displayName || 'VIT Student',

                    email: firebaseUser.email || '',

                    reg_no: 'TBD',

                    branch: 'TBD',

                    year: 1,

                    hostel_block: 'TBD',

                    role: firebaseUser.email?.endsWith('@vit.ac.in') ? Role.ADMIN : Role.STUDENT,

                    profile_picture_url: firebaseUser.photoURL || getDefaultProfilePicture(firebaseUser.displayName || 'User'),

                    rating: 0,

                    ratings_count: 0,

                    wishlist: [],

                    is_suspended: false,

                };

                const { error: insertError } = await supabase.from('users').insert([newUserData]);

                if (insertError) {

                    console.error('Error creating user:', insertError);

                    alert(`Failed to create user: ${insertError.message}`);

                    return false;

                }

                console.log('User created successfully!');

            } else {

                console.log('User already exists in Supabase');

            }

            return true;

        } catch (error: any) {

            console.error("Google login failed:", error);

            alert(`Google login failed: ${error?.message || 'Unknown error'}`);

            return false;

        }

    };



    const logout = () => {

        signOut(auth);

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

                // Convert from snake_case to camelCase

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

    const resetPassword = async (email: string): Promise<boolean> => {
        try {
            await sendPasswordResetEmail(auth, email);
            return true;
        } catch (error) {
            console.error("Password reset failed:", error);
            return false;
        }
    };



    return (

        <AuthContext.Provider value={{ user, loading, login, signup, logout, googleLogin, refreshUser, resetPassword }}>

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


