import React from 'react';
import { Item, User } from '../types';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

interface ItemCardProps {
    item: Item;
    seller?: User;
    onMessage: (seller: User) => void;
    onCardClick: (item: Item) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, seller, onMessage, onCardClick }) => {
    const { toggleWishlist, isInWishlist, removeItem } = useData();
    const { user } = useAuth();
    const isWishlisted = isInWishlist(item.id);
    const isOwnItem = user?.id === item.sellerId;

    console.log('ItemCard - Image URL:', item.imageUrl);

    const handleWishlistToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await toggleWishlist(item.id);
    };
    
    const handleMessageClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if(seller) {
            onMessage(seller);
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this listing?')) {
            await removeItem(item.id);
        }
    };

    const handleMarkAsSold = async (e: React.MouseEvent) => {
        e.stopPropagation();
        // Will implement this
        alert('Mark as sold feature coming soon!');
    };

    return (
        <div 
            className="bg-white rounded-3xl shadow-xl overflow-hidden transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 ease-out flex flex-col cursor-pointer border border-cream-300 group"
            onClick={() => onCardClick(item)}
            aria-label={`View details for ${item.title}`}
        >
            <div className="relative overflow-hidden">
                <img className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700 ease-out" src={item.imageUrl} alt={item.title} loading="lazy"/>
                <div className="absolute top-4 left-4 bg-black text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wide">
                    {item.condition}
                </div>
                 <button onClick={handleWishlistToggle} aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'} className="absolute top-4 right-4 bg-white/90 p-2.5 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-all duration-300 ${isWishlisted ? 'text-red-500 scale-110' : 'text-gray-600'}`} fill={isWishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 20.25l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                    </svg>
                </button>
            </div>
            <div className="p-5 flex flex-col flex-grow bg-gradient-to-b from-white to-cream-50">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.category}</p>
                <h3 className="text-xl font-black text-black truncate mt-2">{item.title}</h3>
                <p className="text-3xl font-black text-black my-3 tracking-tight">₹{item.price}</p>
                
                <div className="flex items-center text-xs text-gray-600 mt-auto pt-3 border-t border-cream-200">
                    <img src={seller?.profilePictureUrl} alt={seller?.fullName} className="w-8 h-8 rounded-full mr-3 border-2 border-cream-300"/>
                    <div className="flex-grow">
                        <p className="font-bold text-black">{seller?.fullName || '...'}</p>
                        <div className="flex items-center mt-0.5">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-black mr-1" viewBox="0 0 20 20" fill="currentColor">
                             <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                           </svg>
                           <span className="font-semibold">{seller?.rating} ({seller?.ratingsCount})</span>
                        </div>
                    </div>
                </div>
                
                <div className="mt-4">
                   {isOwnItem ? (
                       <div className="flex gap-2">
                           <button onClick={handleMarkAsSold} className="flex-1 text-sm py-3 px-4 font-black text-white bg-green-600 rounded-2xl hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-400 transition-all duration-300 transform hover:scale-105 shadow-lg">
                               {item.isSold ? 'Sold' : 'Mark Sold'}
                           </button>
                           <button onClick={handleDelete} className="flex-1 text-sm py-3 px-4 font-black text-white bg-red-600 rounded-2xl hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-400 transition-all duration-300 transform hover:scale-105 shadow-lg">
                               Delete
                           </button>
                       </div>
                   ) : (
                       <button onClick={handleMessageClick} className="w-full text-sm py-3 px-4 font-black text-white bg-black rounded-2xl hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-400 transition-all duration-300 transform hover:scale-105 shadow-lg">
                           Message Seller
                       </button>
                   )}
                </div>
            </div>
        </div>
    );
};

export default ItemCard;
