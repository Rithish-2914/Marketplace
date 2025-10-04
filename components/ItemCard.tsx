import React from 'react';
import { Item, User } from '../types';
import { useData } from '../context/DataContext';

interface ItemCardProps {
    item: Item;
    seller?: User;
    onMessage: (seller: User) => void;
    onCardClick: (item: Item) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, seller, onMessage, onCardClick }) => {
    const { toggleWishlist, isInWishlist } = useData();
    const isWishlisted = isInWishlist(item.id);

    const handleWishlistToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleWishlist(item.id);
    };
    
    const handleMessageClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if(seller) {
            onMessage(seller);
        }
    }

    return (
        <div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-1.5 transition-transform duration-300 ease-in-out flex flex-col cursor-pointer"
            onClick={() => onCardClick(item)}
            aria-label={`View details for ${item.title}`}
        >
            <div className="relative">
                <img className="w-full h-48 object-cover" src={item.imageUrl} alt={item.title} loading="lazy"/>
                <div className="absolute top-3 left-3 bg-primary-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
                    {item.condition}
                </div>
                 <button onClick={handleWishlistToggle} aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'} className="absolute top-2 right-2 bg-white/70 dark:bg-gray-800/70 p-2 rounded-full backdrop-blur-sm transition-colors duration-200 hover:bg-red-100 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-all duration-200 ${isWishlisted ? 'text-red-500' : 'text-gray-500 dark:text-gray-300'}`} fill={isWishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 20.25l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                    </svg>
                </button>
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate mt-1">{item.title}</h3>
                <p className="text-2xl font-black text-primary-500 dark:text-primary-400 my-2">₹{item.price}</p>
                
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
                    <img src={seller?.profilePictureUrl} alt={seller?.fullName} className="w-6 h-6 rounded-full mr-2"/>
                    <div className="flex-grow">
                        <p className="font-semibold text-gray-700 dark:text-gray-300">{seller?.fullName || '...'}</p>
                        <div className="flex items-center">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-accent-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                             <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                           </svg>
                           <span>{seller?.rating} ({seller?.ratingsCount} ratings)</span>
                        </div>
                    </div>
                </div>
                
                <div className="mt-4">
                   <button onClick={handleMessageClick} className="w-full text-sm py-2.5 px-4 font-bold text-white bg-primary-500 rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-300 transition-all duration-200">
                       Message Seller
                   </button>
                </div>
            </div>
        </div>
    );
};

export default ItemCard;