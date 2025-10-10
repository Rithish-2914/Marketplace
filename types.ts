export enum Role {
    STUDENT = 'STUDENT',
    ADMIN = 'ADMIN',
}

export interface User {
    id: string;
    fullName: string;
    email: string;
    regNo: string;
    branch: string;
    year: number;
    hostelBlock: string;
    role: Role;
    profilePictureUrl: string;
    rating: number;
    ratingsCount: number;
    isSuspended?: boolean;
    wishlist?: string[];
}

export enum ItemCategory {
    TEXTBOOKS = 'Textbooks',
    ELECTRONICS = 'Electronics',
    NOTES = 'Notes',
    HOSTEL_ESSENTIALS = 'Hostel Essentials',
    OTHER = 'Other',
}

export enum ItemCondition {
    NEW = 'New',
    LIKE_NEW = 'Like New',
    GOOD = 'Good',
    USED = 'Used',
}

export interface Item {
    id: string;
    sellerId: string;
    title: string;
    description: string;
    category: ItemCategory;
    price: number;
    location: string;
    condition: ItemCondition;
    imageUrl: string;
    openToExchange: boolean;
    isSold: boolean;
    createdAt: Date;
}

export interface LostItem {
    id: string;
    name: string;
    description: string;
    locationFound: string;
    imageUrl: string;
    claimedBy?: string;
    dateFound: Date;
}

export type ComplaintStatus = 'pending' | 'resolved';

export interface Complaint {
    id: string;
    itemId: string;
    reporterId: string;
    reason: string;
    createdAt: Date;
    status: ComplaintStatus;
}

export type ClaimStatus = 'pending' | 'approved' | 'rejected';

export interface Claim {
    id: string;
    lostItemId: string;
    claimantId: string;
    proofImageUrl: string; // Mock URL
    billImageUrl?: string; // Mock URL
    comments: string;
    createdAt: Date;
    status: ClaimStatus;
}

export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    itemId?: string;
    content: string;
    isRead: boolean;
    createdAt: Date;
}

export interface Conversation {
    userId: string;
    userName: string;
    userAvatar: string;
    itemId?: string;
    itemTitle?: string;
    lastMessage: string;
    lastMessageTime: Date;
    unreadCount: number;
}