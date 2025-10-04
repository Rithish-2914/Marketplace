import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { User, Item, LostItem, Complaint, Claim, ClaimStatus, ComplaintStatus } from '../types';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import {
    collection,
    onSnapshot,
    doc,
    addDoc,
    deleteDoc,
    updateDoc,
    arrayUnion,
    arrayRemove,
    serverTimestamp,
    query,
    writeBatch,
    where,
    getDocs,
    Timestamp
} from 'firebase/firestore';

// --- HELPER FUNCTION ---
// Generic function to convert Firestore docs with Timestamps to app types with Dates
const mapDocToData = <T extends { id: string, createdAt?: any, dateFound?: any }>(doc: any): T => {
    const data = doc.data();
    return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        dateFound: data.dateFound instanceof Timestamp ? data.dateFound.toDate() : data.dateFound,
    } as T;
};

// --- CONTEXT TYPE ---
interface DataContextType {
    users: User[];
    items: Item[];
    lostItems: LostItem[];
    complaints: Complaint[];
    claims: Claim[];
    getUserById: (id: string) => User | undefined;
    getItemById: (id: string) => Item | undefined;
    addItem: (item: Omit<Item, 'id' | 'createdAt' | 'isSold'>) => Promise<void>;
    removeItem: (id: string) => Promise<void>;
    toggleSuspendUser: (id: string) => Promise<void>;
    addLostItem: (item: Omit<LostItem, 'id' | 'dateFound'>) => Promise<void>;
    toggleWishlist: (id: string) => void;
    isInWishlist: (id: string) => boolean;
    updateUser: (userId: string, updatedData: Partial<Pick<User, 'fullName' | 'branch' | 'year' | 'hostelBlock'>>) => Promise<void>;
    rateUser: (sellerId: string, rating: number) => Promise<void>;
    reportItem: (itemId: string, reporterId: string, reason: string) => Promise<void>;
    submitClaim: (claimData: Omit<Claim, 'id' | 'createdAt' | 'status'>) => Promise<void>;
    resolveComplaint: (complaintId: string, action: 'dismiss' | 'deleteItem') => Promise<void>;
    resolveClaim: (claimId: string, status: ClaimStatus) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [lostItems, setLostItems] = useState<LostItem[]>([]);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [claims, setClaims] = useState<Claim[]>([]);

    useEffect(() => {
        const collections = {
            users: setUsers,
            items: setItems,
            lostItems: setLostItems,
            complaints: setComplaints,
            claims: setClaims,
        };

        const unsubscribers = Object.entries(collections).map(([collectionName, setter]) => {
            const q = query(collection(db, collectionName));
            return onSnapshot(q, (snapshot) => {
                const data = snapshot.docs.map(doc => mapDocToData(doc));
                setter(data as any);
            });
        });

        return () => unsubscribers.forEach(unsub => unsub());
    }, []);


    const getUserById = useCallback((id: string) => users.find(u => u.id === id), [users]);
    const getItemById = useCallback((id: string) => items.find(i => i.id === id), [items]);

    const addItem = async (itemData: Omit<Item, 'id' | 'createdAt' | 'isSold'>) => {
        await addDoc(collection(db, 'items'), { ...itemData, createdAt: serverTimestamp() });
    };
    
    const removeItem = async (id: string) => {
        await deleteDoc(doc(db, 'items', id));
    };

    const toggleSuspendUser = async (id: string) => {
        const userToUpdate = users.find(u => u.id === id);
        if (userToUpdate) {
            await updateDoc(doc(db, 'users', id), { isSuspended: !userToUpdate.isSuspended });
        }
    };
    
    const addLostItem = async (itemData: Omit<LostItem, 'id' | 'dateFound'>) => {
        await addDoc(collection(db, 'lostItems'), { ...itemData, dateFound: serverTimestamp() });
    };
    
    const toggleWishlist = async (id: string) => {
        if (!user) return;
        const userRef = doc(db, 'users', user.id);
        const userWishlist = user.wishlist || [];
        await updateDoc(userRef, {
            wishlist: userWishlist.includes(id) ? arrayRemove(id) : arrayUnion(id)
        });
    };

    const isInWishlist = useCallback((id: string) => {
        return user?.wishlist?.includes(id) ?? false;
    }, [user]);

    const updateUser = async (userId: string, updatedData: Partial<Pick<User, 'fullName' | 'branch' | 'year' | 'hostelBlock'>>) => {
        await updateDoc(doc(db, 'users', userId), updatedData);
    };

    const rateUser = async (sellerId: string, rating: number) => {
        const seller = users.find(u => u.id === sellerId);
        if (!seller) return;
        const currentTotalRating = seller.rating * seller.ratingsCount;
        const newRatingsCount = seller.ratingsCount + 1;
        const newAverageRating = (currentTotalRating + rating) / newRatingsCount;
        await updateDoc(doc(db, 'users', sellerId), {
            rating: parseFloat(newAverageRating.toFixed(1)),
            ratingsCount: newRatingsCount,
        });
    };

    const reportItem = async (itemId: string, reporterId: string, reason: string) => {
        await addDoc(collection(db, 'complaints'), {
            itemId,
            reporterId,
            reason,
            createdAt: serverTimestamp(),
            status: 'pending',
        });
    };

    const submitClaim = async (claimData: Omit<Claim, 'id' | 'createdAt' | 'status'>) => {
        await addDoc(collection(db, 'claims'), {
            ...claimData,
            createdAt: serverTimestamp(),
            status: 'pending',
        });
    };

    const resolveComplaint = async (complaintId: string, action: 'dismiss' | 'deleteItem') => {
        const complaint = complaints.find(c => c.id === complaintId);
        const batch = writeBatch(db);
        
        const complaintRef = doc(db, 'complaints', complaintId);
        batch.update(complaintRef, { status: 'resolved' });

        if (action === 'deleteItem' && complaint) {
            const itemRef = doc(db, 'items', complaint.itemId);
            batch.delete(itemRef);
        }
        await batch.commit();
    };

    const resolveClaim = async (claimId: string, status: ClaimStatus) => {
        const claim = claims.find(c => c.id === claimId);
        const batch = writeBatch(db);

        const claimRef = doc(db, 'claims', claimId);
        batch.update(claimRef, { status });

        if (status === 'approved' && claim) {
            const lostItemRef = doc(db, 'lostItems', claim.lostItemId);
            batch.update(lostItemRef, { claimedBy: claim.claimantId });
        }
        await batch.commit();
    };

    const value = {
        users,
        items,
        lostItems,
        complaints,
        claims,
        getUserById,
        getItemById,
        addItem,
        removeItem,
        toggleSuspendUser,
        addLostItem,
        toggleWishlist,
        isInWishlist,
        updateUser,
        rateUser,
        reportItem,
        submitClaim,
        resolveComplaint,
        resolveClaim,
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};


// --- HOOK ---
export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};