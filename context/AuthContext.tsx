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

    // DELETE your current useEffect block and REPLACE it with this one.

useEffect(() => {
    // This part listens for changes in Firebase's login state
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
            // --- START: THE CRITICAL FIX ---
            // Get the unique token from the logged-in Firebase user
            const token = await firebaseUser.getIdToken();
            
            // Securely pass the token to Supabase to establish the user's identity
            await supabase.auth.setSession({
                access_token: token,
                refresh_token: token,
            });
            // --- END: THE CRITICAL FIX ---

            // Now that Supabase knows who the user is, fetch their profile
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', firebaseUser.uid)
                .single();

            if (data && !error) {
                // ... (the rest of your code to set the user state is correct and remains the same)
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
                // ... (the code to create a new user also remains the same)
                console.warn("User exists in Auth but not in Supabase database. Creating user record...");
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
                const { error: insertError } = await supabase.from('users').insert([newUserData]);
                if (!insertError) {
                    // Refetch the new user to set the state
                    const { data: newUserRecord } = await supabase.from('users').select('*').eq('id', firebaseUser.uid).single();
                    if (newUserRecord) {
                         const newUser: User = {
                            id: newUserRecord.id,
                            fullName: newUserRecord.full_name,
                            email: newUserRecord.email,
                            regNo: newUserRecord.reg_no,
                            branch: newUserRecord.branch,
                            year: newUserRecord.year,
                            hostelBlock: newUserRecord.hostel_block,
                            role: newUserRecord.role,
                            profilePictureUrl: newUserRecord.profile_picture_url,
                            rating: newUserRecord.rating,
                            ratingsCount: newUserRecord.ratings_count,
                            wishlist: newUserRecord.wishlist,
                            isSuspended: newUserRecord.is_suspended,
                        };
                        setUser(newUser);
                    }
                } else {
                    console.error("Failed to create user record:", insertError);
                }
            }
        } else {
            // If the user logs out from Firebase, also sign them out from Supabase
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
