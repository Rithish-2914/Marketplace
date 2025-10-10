import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { User, Item, LostItem, Complaint, Claim, ClaimStatus, ComplaintStatus, Message, Conversation } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../supabase';

interface DataContextType {
    users: User[];
    items: Item[];
    lostItems: LostItem[];
    complaints: Complaint[];
    claims: Claim[];
    messages: Message[];
    getUserById: (id: string) => User | undefined;
    getItemById: (id: string) => Item | undefined;
    addItem: (item: Omit<Item, 'id' | 'createdAt' | 'isSold'>) => Promise<void>;
    removeItem: (id: string) => Promise<void>;
    toggleSuspendUser: (id: string) => Promise<void>;
    addLostItem: (item: Omit<LostItem, 'id' | 'dateFound'>) => Promise<void>;
    toggleWishlist: (id: string) => void;
    isInWishlist: (id: string) => boolean;
    updateUser: (userId: string, updatedData: Partial<Pick<User, 'fullName' | 'branch' | 'year' | 'hostelBlock' | 'profilePictureUrl'>>) => Promise<void>;
    rateUser: (sellerId: string, rating: number) => Promise<void>;
    reportItem: (itemId: string, reporterId: string, reason: string) => Promise<void>;
    submitClaim: (claimData: Omit<Claim, 'id' | 'createdAt' | 'status'>) => Promise<void>;
    resolveComplaint: (complaintId: string, action: 'dismiss' | 'deleteItem') => Promise<void>;
    resolveClaim: (claimId: string, status: ClaimStatus) => Promise<void>;
    sendMessage: (receiverId: string, content: string, itemId?: string) => Promise<void>;
    getMessages: (otherUserId: string, itemId?: string) => Message[];
    getConversations: () => Conversation[];
    markMessagesAsRead: (otherUserId: string, itemId?: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, refreshUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [lostItems, setLostItems] = useState<LostItem[]>([]);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [claims, setClaims] = useState<Claim[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const { data: usersData } = await supabase.from('users').select('*');
            const { data: itemsData } = await supabase.from('items').select('*');
            const { data: lostItemsData } = await supabase.from('lost_items').select('*');
            const { data: complaintsData } = await supabase.from('complaints').select('*');
            const { data: claimsData } = await supabase.from('claims').select('*');

            if (usersData) setUsers(usersData.map(u => ({ 
                id: u.id,
                fullName: u.full_name,
                email: u.email,
                regNo: u.reg_no,
                branch: u.branch,
                year: u.year,
                hostelBlock: u.hostel_block,
                role: u.role,
                profilePictureUrl: u.profile_picture_url,
                rating: u.rating,
                ratingsCount: u.ratings_count,
                isSuspended: u.is_suspended,
                wishlist: u.wishlist,
                createdAt: new Date(u.created_at)
            })));
            
            if (itemsData) setItems(itemsData.map(i => ({ 
                id: i.id,
                sellerId: i.seller_id,
                title: i.title,
                description: i.description,
                category: i.category,
                price: i.price,
                location: i.location,
                condition: i.condition,
                imageUrl: i.image_url,
                openToExchange: i.open_to_exchange,
                isSold: i.is_sold,
                createdAt: new Date(i.created_at)
            })));
            
            if (lostItemsData) setLostItems(lostItemsData.map(l => ({ 
                id: l.id,
                name: l.name,
                description: l.description,
                locationFound: l.location_found,
                imageUrl: l.image_url,
                claimedBy: l.claimed_by,
                dateFound: new Date(l.date_found)
            })));
            
            if (complaintsData) setComplaints(complaintsData.map(c => ({ 
                id: c.id,
                itemId: c.item_id,
                reporterId: c.reporter_id,
                reason: c.reason,
                status: c.status,
                createdAt: new Date(c.created_at)
            })));
            
            if (claimsData) setClaims(claimsData.map(c => ({ 
                id: c.id,
                lostItemId: c.lost_item_id,
                claimantId: c.claimant_id,
                proofImageUrl: c.proof_image_url,
                billImageUrl: c.bill_image_url,
                comments: c.comments,
                status: c.status,
                createdAt: new Date(c.created_at)
            })));

            // Fetch messages
            if (user) {
                const { data: messagesData } = await supabase
                    .from('messages')
                    .select('*')
                    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                    .order('created_at', { ascending: true });

                if (messagesData) setMessages(messagesData.map(m => ({
                    id: m.id,
                    senderId: m.sender_id,
                    receiverId: m.receiver_id,
                    itemId: m.item_id,
                    content: m.content,
                    isRead: m.is_read,
                    createdAt: new Date(m.created_at)
                })));
            }
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

        const messagesSubscription = supabase
            .channel('messages_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => fetchData())
            .subscribe();

        return () => {
            usersSubscription.unsubscribe();
            itemsSubscription.unsubscribe();
            lostItemsSubscription.unsubscribe();
            complaintsSubscription.unsubscribe();
            claimsSubscription.unsubscribe();
            messagesSubscription.unsubscribe();
        };
    }, [user]);

    const getUserById = useCallback((id: string) => users.find(u => u.id === id), [users]);
    const getItemById = useCallback((id: string) => items.find(i => i.id === id), [items]);

    const addItem = async (itemData: Omit<Item, 'id' | 'createdAt' | 'isSold'>) => {
        // Convert camelCase to snake_case for Supabase
        const dbData = {
            seller_id: itemData.sellerId,
            title: itemData.title,
            description: itemData.description,
            category: itemData.category,
            price: itemData.price,
            location: itemData.location,
            condition: itemData.condition,
            image_url: itemData.imageUrl,
            open_to_exchange: itemData.openToExchange,
            is_sold: false,
            created_at: new Date().toISOString()
        };
        await supabase.from('items').insert([dbData]);
    };
    
    const removeItem = async (id: string) => {
        await supabase.from('items').delete().eq('id', id);
    };

    const toggleSuspendUser = async (id: string) => {
        const userToUpdate = users.find(u => u.id === id);
        if (userToUpdate) {
            await supabase.from('users').update({ is_suspended: !userToUpdate.isSuspended }).eq('id', id);
        }
    };
    
    const addLostItem = async (itemData: Omit<LostItem, 'id' | 'dateFound'>) => {
        // Convert camelCase to snake_case for Supabase
        const dbData = {
            name: itemData.name,
            description: itemData.description,
            location_found: itemData.locationFound,
            image_url: itemData.imageUrl,
            claimed_by: itemData.claimedBy,
            date_found: new Date().toISOString()
        };
        await supabase.from('lost_items').insert([dbData]);
    };
    
    const toggleWishlist = async (id: string) => {
        if (!user) return;
        const userWishlist = user.wishlist || [];
        const newWishlist = userWishlist.includes(id) 
            ? userWishlist.filter(itemId => itemId !== id)
            : [...userWishlist, id];
        
        await supabase.from('users').update({ wishlist: newWishlist }).eq('id', user.id);
        await refreshUser();
    };

    const isInWishlist = useCallback((id: string) => {
        return user?.wishlist?.includes(id) ?? false;
    }, [user]);

    const updateUser = async (userId: string, updatedData: Partial<Pick<User, 'fullName' | 'branch' | 'year' | 'hostelBlock' | 'profilePictureUrl'>>) => {
        // Convert camelCase to snake_case for Supabase
        const dbData: any = {};
        if (updatedData.fullName !== undefined) dbData.full_name = updatedData.fullName;
        if (updatedData.branch !== undefined) dbData.branch = updatedData.branch;
        if (updatedData.year !== undefined) dbData.year = updatedData.year;
        if (updatedData.hostelBlock !== undefined) dbData.hostel_block = updatedData.hostelBlock;
        if (updatedData.profilePictureUrl !== undefined) dbData.profile_picture_url = updatedData.profilePictureUrl;
        
        await supabase.from('users').update(dbData).eq('id', userId);
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
        // Convert camelCase to snake_case for Supabase
        await supabase.from('complaints').insert([{
            item_id: itemId,
            reporter_id: reporterId,
            reason,
            created_at: new Date().toISOString(),
            status: 'pending',
        }]);
    };

    const submitClaim = async (claimData: Omit<Claim, 'id' | 'createdAt' | 'status'>) => {
        // Convert camelCase to snake_case for Supabase
        await supabase.from('claims').insert([{
            lost_item_id: claimData.lostItemId,
            claimant_id: claimData.claimantId,
            proof_image_url: claimData.proofImageUrl,
            bill_image_url: claimData.billImageUrl,
            comments: claimData.comments,
            created_at: new Date().toISOString(),
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
            await supabase.from('lost_items').update({ claimed_by: claim.claimantId }).eq('id', claim.lostItemId);
        }
    };

    const sendMessage = async (receiverId: string, content: string, itemId?: string) => {
        if (!user) return;
        
        await supabase.from('messages').insert([{
            sender_id: user.id,
            receiver_id: receiverId,
            item_id: itemId,
            content,
            is_read: false,
            created_at: new Date().toISOString()
        }]);
    };

    const getMessages = useCallback((otherUserId: string, itemId?: string): Message[] => {
        if (!user) return [];
        
        return messages.filter(m => {
            const isConversationMatch = (m.senderId === user.id && m.receiverId === otherUserId) ||
                                       (m.senderId === otherUserId && m.receiverId === user.id);
            const isItemMatch = itemId ? m.itemId === itemId : true;
            return isConversationMatch && isItemMatch;
        }).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }, [user, messages]);

    const getConversations = useCallback((): Conversation[] => {
        if (!user) return [];
        
        const conversationMap = new Map<string, Conversation>();
        
        messages.forEach(message => {
            const isUserSender = message.senderId === user.id;
            const otherUserId = isUserSender ? message.receiverId : message.senderId;
            const otherUser = getUserById(otherUserId);
            
            if (!otherUser) return;
            
            const key = `${otherUserId}-${message.itemId || 'general'}`;
            const existing = conversationMap.get(key);
            
            const unreadCount = !message.isRead && message.receiverId === user.id ? 1 : 0;
            
            if (!existing || existing.lastMessageTime < message.createdAt) {
                const item = message.itemId ? getItemById(message.itemId) : undefined;
                conversationMap.set(key, {
                    userId: otherUserId,
                    userName: otherUser.fullName,
                    userAvatar: otherUser.profilePictureUrl,
                    itemId: message.itemId,
                    itemTitle: item?.title,
                    lastMessage: message.content,
                    lastMessageTime: message.createdAt,
                    unreadCount: (existing?.unreadCount || 0) + unreadCount
                });
            } else if (existing) {
                existing.unreadCount += unreadCount;
            }
        });
        
        return Array.from(conversationMap.values()).sort((a, b) => 
            b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
        );
    }, [user, messages, getUserById, getItemById]);

    const markMessagesAsRead = async (otherUserId: string, itemId?: string) => {
        if (!user) return;
        
        const unreadMessages = messages.filter(m => {
            const isFromOtherUser = m.senderId === otherUserId && m.receiverId === user.id && !m.isRead;
            const isInConversation = itemId != null ? m.itemId === itemId : m.itemId == null;
            return isFromOtherUser && isInConversation;
        });
        
        if (unreadMessages.length === 0) return;
        
        // Update in database
        for (const message of unreadMessages) {
            await supabase.from('messages').update({ is_read: true }).eq('id', message.id);
        }
        
        // Update local state immediately
        setMessages(prevMessages => 
            prevMessages.map(m => 
                unreadMessages.find(um => um.id === m.id) 
                    ? { ...m, isRead: true } 
                    : m
            )
        );
    };

    const value = {
        users,
        items,
        lostItems,
        complaints,
        claims,
        messages,
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
        sendMessage,
        getMessages,
        getConversations,
        markMessagesAsRead,
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
