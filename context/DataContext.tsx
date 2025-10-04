import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { User, Item, LostItem, Complaint, Claim, ClaimStatus, ComplaintStatus } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../supabase';

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

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [lostItems, setLostItems] = useState<LostItem[]>([]);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [claims, setClaims] = useState<Claim[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const { data: usersData } = await supabase.from('users').select('*');
            const { data: itemsData } = await supabase.from('items').select('*');
            const { data: lostItemsData } = await supabase.from('lost_items').select('*');
            const { data: complaintsData } = await supabase.from('complaints').select('*');
            const { data: claimsData } = await supabase.from('claims').select('*');

            if (usersData) setUsers(usersData.map(u => ({ ...u, createdAt: new Date(u.createdAt) })));
            if (itemsData) setItems(itemsData.map(i => ({ ...i, createdAt: new Date(i.createdAt) })));
            if (lostItemsData) setLostItems(lostItemsData.map(l => ({ ...l, dateFound: new Date(l.dateFound) })));
            if (complaintsData) setComplaints(complaintsData.map(c => ({ ...c, createdAt: new Date(c.createdAt) })));
            if (claimsData) setClaims(claimsData.map(c => ({ ...c, createdAt: new Date(c.createdAt) })));
        };

        fetchData();

        const usersSubscription = supabase
            .channel('users_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => fetchData())
            .subscribe();

        const itemsSubscription = supabase
            .channel('items_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => fetchData())
            .subscribe();

        const lostItemsSubscription = supabase
            .channel('lost_items_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'lost_items' }, () => fetchData())
            .subscribe();

        const complaintsSubscription = supabase
            .channel('complaints_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => fetchData())
            .subscribe();

        const claimsSubscription = supabase
            .channel('claims_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'claims' }, () => fetchData())
            .subscribe();

        return () => {
            usersSubscription.unsubscribe();
            itemsSubscription.unsubscribe();
            lostItemsSubscription.unsubscribe();
            complaintsSubscription.unsubscribe();
            claimsSubscription.unsubscribe();
        };
    }, []);

    const getUserById = useCallback((id: string) => users.find(u => u.id === id), [users]);
    const getItemById = useCallback((id: string) => items.find(i => i.id === id), [items]);

    const addItem = async (itemData: Omit<Item, 'id' | 'createdAt' | 'isSold'>) => {
        await supabase.from('items').insert([{ ...itemData, isSold: false, createdAt: new Date().toISOString() }]);
    };
    
    const removeItem = async (id: string) => {
        await supabase.from('items').delete().eq('id', id);
    };

    const toggleSuspendUser = async (id: string) => {
        const userToUpdate = users.find(u => u.id === id);
        if (userToUpdate) {
            await supabase.from('users').update({ isSuspended: !userToUpdate.isSuspended }).eq('id', id);
        }
    };
    
    const addLostItem = async (itemData: Omit<LostItem, 'id' | 'dateFound'>) => {
        await supabase.from('lost_items').insert([{ ...itemData, dateFound: new Date().toISOString() }]);
    };
    
    const toggleWishlist = async (id: string) => {
        if (!user) return;
        const userWishlist = user.wishlist || [];
        const newWishlist = userWishlist.includes(id) 
            ? userWishlist.filter(itemId => itemId !== id)
            : [...userWishlist, id];
        
        await supabase.from('users').update({ wishlist: newWishlist }).eq('id', user.id);
    };

    const isInWishlist = useCallback((id: string) => {
        return user?.wishlist?.includes(id) ?? false;
    }, [user]);

    const updateUser = async (userId: string, updatedData: Partial<Pick<User, 'fullName' | 'branch' | 'year' | 'hostelBlock'>>) => {
        await supabase.from('users').update(updatedData).eq('id', userId);
    };

    const rateUser = async (sellerId: string, rating: number) => {
        const seller = users.find(u => u.id === sellerId);
        if (!seller) return;
        const currentTotalRating = seller.rating * seller.ratingsCount;
        const newRatingsCount = seller.ratingsCount + 1;
        const newAverageRating = (currentTotalRating + rating) / newRatingsCount;
        await supabase.from('users').update({
            rating: parseFloat(newAverageRating.toFixed(1)),
            ratingsCount: newRatingsCount,
        }).eq('id', sellerId);
    };

    const reportItem = async (itemId: string, reporterId: string, reason: string) => {
        await supabase.from('complaints').insert([{
            itemId,
            reporterId,
            reason,
            createdAt: new Date().toISOString(),
            status: 'pending',
        }]);
    };

    const submitClaim = async (claimData: Omit<Claim, 'id' | 'createdAt' | 'status'>) => {
        await supabase.from('claims').insert([{
            ...claimData,
            createdAt: new Date().toISOString(),
            status: 'pending',
        }]);
    };

    const resolveComplaint = async (complaintId: string, action: 'dismiss' | 'deleteItem') => {
        const complaint = complaints.find(c => c.id === complaintId);
        
        await supabase.from('complaints').update({ status: 'resolved' }).eq('id', complaintId);

        if (action === 'deleteItem' && complaint) {
            await supabase.from('items').delete().eq('id', complaint.itemId);
        }
    };

    const resolveClaim = async (claimId: string, status: ClaimStatus) => {
        const claim = claims.find(c => c.id === claimId);

        await supabase.from('claims').update({ status }).eq('id', claimId);

        if (status === 'approved' && claim) {
            await supabase.from('lost_items').update({ claimedBy: claim.claimantId }).eq('id', claim.lostItemId);
        }
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

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
