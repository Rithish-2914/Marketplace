import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, Role } from '../types';
import { auth, db } from '../firebase';
import { 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// --- CONTEXT TYPE ---
interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password?: string) => Promise<boolean>;
    signup: (userData: Pick<User, 'fullName' | 'email' | 'regNo' | 'branch' | 'year' | 'hostelBlock'> & {password: string}) => Promise<boolean>;
    logout: () => void;
    googleLogin: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setUser({ 
                        id: userDoc.id,
                        ...userData,
                        wishlist: userData.wishlist || []
                    } as User);
                } else {
                    console.warn("User exists in Auth but not in Firestore. This may happen during Google Sign-Up.");
                    // The user will be created in googleLogin if they are new.
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
            
            const newUser: Omit<User, 'id'> = {
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
            
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
            return true;
       } catch (error) {
           console.error("Firebase signup failed:", error);
           return false;
       }
    };
    
    const googleLogin = async (): Promise<boolean> => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const firebaseUser = result.user;

            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);

            // If user doesn't exist in Firestore, create a new profile.
            if (!userDoc.exists()) {
                 const newUser: Omit<User, 'id'> = {
                    fullName: firebaseUser.displayName || 'VIT Student',
                    email: firebaseUser.email || '',
                    // These fields would need to be collected in a post-signup step
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
                await setDoc(userDocRef, newUser);
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

// --- HOOK ---
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};