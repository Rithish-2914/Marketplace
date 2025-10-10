import React, { useState, useMemo, useRef } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Item, ItemCategory, ItemCondition, LostItem } from '../types';
import ItemCard from '../components/ItemCard';
import AnimatedButton from '../components/AnimatedButton';
import { CameraIcon, PlusIcon, StarIcon, RatingStarIcon } from '../assets/icons';
import { uploadImageToSupabase } from '../utils/storage';


// Main Student Application Component
const StudentApp: React.FC = () => {
    const [activePage, setActivePage] = useState('dashboard');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [claimingItem, setClaimingItem] = useState<LostItem | null>(null);
    const [reportingItem, setReportingItem] = useState<Item | null>(null);

    const handleNavigate = (page: string) => {
        setSelectedItem(null); // Close item detail view on navigation
        setActivePage(page);
    };
    
    const renderPage = () => {
        if (selectedItem) {
            return <ItemDetailPage item={selectedItem} onBack={() => setSelectedItem(null)} onReport={() => setReportingItem(selectedItem)} />;
        }
        
        switch (activePage) {
            case 'dashboard':
                return <DashboardPage searchQuery={searchQuery} onSelectItem={setSelectedItem} />;
            case 'browse':
                return <BrowsePage searchQuery={searchQuery} onSelectItem={setSelectedItem} />;
            case 'sell':
                return <SellItemPage onPostSuccess={() => setActivePage('dashboard')} />;
            case 'wishlist':
                return <WishlistPage searchQuery={searchQuery} onSelectItem={setSelectedItem} />;
            case 'lostfound':
                return <LostAndFoundPage onClaimItem={setClaimingItem} />;
            case 'profile':
                return <ProfilePage />;
            default:
                return <DashboardPage searchQuery={searchQuery} onSelectItem={setSelectedItem} />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-cream-100 via-white to-cream-200 text-black">
            <Header onNavigate={handleNavigate} onSearch={setSearchQuery} activePage={activePage} />
            <main className="container mx-auto p-6 sm:p-8 md:p-12">
                {renderPage()}
            </main>
            {claimingItem && <ClaimItemModal item={claimingItem} onClose={() => setClaimingItem(null)} />}
            {reportingItem && <ReportItemModal item={reportingItem} onClose={() => setReportingItem(null)} />}
        </div>
    );
};

// Sub-component: Item Carousel for Mobile Dashboard
const ItemCarousel: React.FC<{ items: Item[]; onSelectItem: (item: Item) => void }> = ({ items, onSelectItem }) => {
    const { users } = useData();

    if (items.length === 0) {
        return <p className="text-center text-gray-500 dark:text-gray-400 mt-12 py-12">No items available right now.</p>;
    }

    return (
        <div 
          className="flex overflow-x-auto space-x-4 p-4 -mx-4 scroll-smooth snap-x snap-mandatory" 
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
            {items.map((item) => {
                const seller = users.find(u => u.id === item.sellerId);
                return (
                    <div key={item.id} className="flex-shrink-0 w-[85%] sm:w-80 snap-center">
                         <ItemCard
                            item={item}
                            seller={seller}
                            onMessage={(s) => alert(`Messaging ${s.fullName}`)}
                            onCardClick={onSelectItem}
                        />
                    </div>
                );
            })}
        </div>
    );
};

// Sub-component: Dashboard Page
const DashboardPage: React.FC<{ searchQuery: string; onSelectItem: (item: Item) => void }> = ({ searchQuery, onSelectItem }) => {
    const { items, users } = useData();

    const filteredItems = useMemo(() => {
        return items.filter(item => 
            !item.isSold &&
            (item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [items, searchQuery]);

    return (
        <div>
            <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white">Dashboard</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1 md:hidden">Swipe to discover new items</p>
                <p className="text-gray-500 dark:text-gray-400 mt-1 hidden md:block">Recently listed items</p>
            </div>
            
            <div className="md:hidden">
                <ItemCarousel items={filteredItems} onSelectItem={onSelectItem} />
            </div>

            <div className="hidden md:block">
                {filteredItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredItems.slice(0, 8).map(item => {
                            const seller = users.find(u => u.id === item.sellerId);
                            return <ItemCard key={item.id} item={item} seller={seller} onMessage={(s) => alert(`Messaging ${s.fullName}`)} onCardClick={onSelectItem} />;
                        })}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 mt-12">No items found.</p>
                )}
            </div>
        </div>
    );
};

// Sub-component: Browse Page
const BrowsePage: React.FC<{ searchQuery: string; onSelectItem: (item: Item) => void }> = ({ searchQuery, onSelectItem }) => {
    const { items, users } = useData();
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('newest');

    const filteredAndSortedItems = useMemo(() => {
        let processedItems = items.filter(item => !item.isSold);

        if (searchQuery) {
            processedItems = processedItems.filter(item => 
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        if (categoryFilter !== 'all') {
            processedItems = processedItems.filter(item => item.category === categoryFilter);
        }
        switch (sortBy) {
            case 'price_asc':
                processedItems.sort((a, b) => a.price - b.price);
                break;
            case 'price_desc':
                processedItems.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
            default:
                if (processedItems[0]?.createdAt) {
                    processedItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                }
                break;
        }
        return processedItems;
    }, [items, searchQuery, categoryFilter, sortBy]);

    return (
        <div>
            <h2 className="text-3xl font-extrabold mb-6 text-gray-800 dark:text-white">Browse All Items</h2>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md mb-6 flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-grow w-full sm:w-auto">
                    <label htmlFor="category" className="sr-only">Category</label>
                    <select id="category" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="all">All Categories</option>
                        {Object.values(ItemCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <div className="flex-grow w-full sm:w-auto">
                    <label htmlFor="sort" className="sr-only">Sort By</label>
                    <select id="sort" value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="newest">Newest</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                    </select>
                </div>
            </div>
            {filteredAndSortedItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredAndSortedItems.map(item => {
                        const seller = users.find(u => u.id === item.sellerId);
                        return <ItemCard key={item.id} item={item} seller={seller} onMessage={(s) => alert(`Messaging ${s.fullName}`)} onCardClick={onSelectItem} />;
                    })}
                </div>
            ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 mt-12">No items found. Try adjusting your filters!</p>
            )}
        </div>
    );
};


// Sub-component: Wishlist Page
const WishlistPage: React.FC<{ searchQuery: string; onSelectItem: (item: Item) => void }> = ({ searchQuery, onSelectItem }) => {
    const { items, users } = useData();
    const { user } = useAuth();
    const wishlist = user?.wishlist || [];

    const wishlistedItems = useMemo(() => {
        return items.filter(item => 
            wishlist.includes(item.id) &&
            (item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [items, wishlist, searchQuery]);

    return (
        <div>
            <h2 className="text-3xl font-extrabold mb-6 text-gray-800 dark:text-white">My Wishlist</h2>
            {wishlistedItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {wishlistedItems.map(item => {
                        const seller = users.find(u => u.id === item.sellerId);
                        return <ItemCard key={item.id} item={item} seller={seller} onMessage={(s) => alert(`Messaging ${s.fullName}`)} onCardClick={onSelectItem} />;
                    })}
                </div>
            ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 mt-12">Your wishlist is empty. Add items by clicking the heart icon!</p>
            )}
        </div>
    );
};


// Sub-component: Sell Item Page
const SellItemPage: React.FC<{ onPostSuccess: () => void }> = ({ onPostSuccess }) => {
    const { addItem } = useData();
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<ItemCategory>(ItemCategory.OTHER);
    const [price, setPrice] = useState('');
    const [condition, setCondition] = useState<ItemCondition>(ItemCondition.GOOD);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [isGenerating, setIsGenerating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleGenerateDescription = async () => {
        if (!title || !category) {
            alert("Please enter a title and select a category first.");
            return;
        }
        setIsGenerating(true);
        try {
            // In a real app, you would call a Firebase Cloud Function here.
            // This function would securely call the Gemini API on the server.
            // For demonstration, we'll return a placeholder.
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network latency
            const placeholderDesc = `This is a high-quality "${title}" from the ${category} category, perfect for any student's needs. Well-maintained and ready for a new owner.`;
            setDescription(placeholderDesc);

            alert("AI description generated! Note: This is a placeholder. For real AI generation, a backend function is required to protect the API key.");

        } catch (error) {
            console.error("Failed to call generation function:", error);
            alert("Could not generate description. Please write one manually.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!imageFile) {
            alert("Please upload an image for your item.");
            return;
        }
        setIsUploading(true);

        try {
            const imageUrl = await uploadImageToSupabase(imageFile, 'items', 'listings');

            const newItem: Omit<Item, 'id' | 'createdAt' | 'isSold'> = {
                sellerId: user.id,
                title,
                description,
                category,
                price: parseFloat(price),
                location: user.hostelBlock,
                condition,
                imageUrl,
                openToExchange: false,
            };
            await addItem(newItem);
            alert('Your item has been listed!');
            onPostSuccess();
        } catch (error) {
            console.error("Error listing item:", error);
            alert("Failed to list your item. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold mb-6 text-gray-800 dark:text-white">Sell a New Item</h2>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg space-y-6">
                
                <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center hover:border-primary-500 transition-colors">
                        {imagePreview ? (
                             <img src={imagePreview} alt="Item preview" className="w-32 h-32 object-cover rounded-lg" />
                        ) : (
                            <>
                                <CameraIcon className="w-12 h-12 text-gray-400 mb-2"/>
                                <p className="font-semibold text-gray-700 dark:text-gray-300">Upload Photos</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload</p>
                            </>
                        )}
                    </div>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                </label>
                
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                    <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                </div>
                
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                        <button type="button" onClick={handleGenerateDescription} disabled={isGenerating} className="text-xs font-semibold text-primary-500 hover:underline disabled:opacity-50 disabled:cursor-wait flex items-center">
                           <StarIcon className="w-4 h-4 mr-1" />
                           {isGenerating ? 'Generating...' : 'Generate with AI'}
                        </button>
                    </div>
                    <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} required rows={4} className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                        <select id="category" value={category} onChange={e => setCategory(e.target.value as ItemCategory)} required className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                            {Object.values(ItemCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="condition" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Condition</label>
                        <select id="condition" value={condition} onChange={e => setCondition(e.target.value as ItemCondition)} required className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                            {Object.values(ItemCondition).map(con => <option key={con} value={con}>{con}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹)</label>
                        <input type="number" id="price" value={price} onChange={e => setPrice(e.target.value)} required className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="e.g., 500"/>
                    </div>
                </div>

                <AnimatedButton type="submit" className="w-full" disabled={isUploading}>
                    {isUploading ? 'Listing Item...' : 'List Item Now'}
                </AnimatedButton>
            </form>
        </div>
    );
};

// Sub-component: Lost and Found Page
const LostAndFoundPage: React.FC<{ onClaimItem: (item: LostItem) => void }> = ({ onClaimItem }) => {
    const { lostItems } = useData();
    return (
        <div>
            <div className="mb-6">
                <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white">Lost & Found</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Found something? Please report it to the admin. See an item you lost? You can claim it here.</p>
            </div>
            <div className="space-y-4">
                 {lostItems.map(item => (
                     <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-start sm:items-center space-x-4 flex-col sm:flex-row">
                         <img src={item.imageUrl} alt={item.name} className="w-full sm:w-32 h-32 object-cover rounded-md mb-4 sm:mb-0" />
                         <div className="flex-grow">
                             <h4 className="font-bold text-lg">{item.name}</h4>
                             <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{item.description}</p>
                             <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Found at: <span className="font-medium">{item.locationFound}</span> on {item.dateFound?.toLocaleDateString()}</p>
                         </div>
                         <button onClick={() => onClaimItem(item)} disabled={!!item.claimedBy} className="mt-4 sm:mt-0 w-full sm:w-auto text-sm py-2 px-4 font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed">
                           {item.claimedBy ? 'Claimed' : 'Claim'}
                         </button>
                     </div>
                 ))}
             </div>
        </div>
    );
};

// Sub-component: Claim Item Modal
const ClaimItemModal: React.FC<{ item: LostItem, onClose: () => void }> = ({ item, onClose }) => {
    const { submitClaim } = useData();
    const { user } = useAuth();
    const [proofImage, setProofImage] = useState<File | null>(null);
    const [billImage, setBillImage] = useState<File | null>(null);
    const [comments, setComments] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const uploadFile = async (file: File, folder: string): Promise<string> => {
        return await uploadImageToSupabase(file, 'claims', folder);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!proofImage) {
            alert('Please upload a picture of the item as proof.');
            return;
        }
        if (!user) return;
        setIsSubmitting(true);
        
        try {
            const proofImageUrl = await uploadFile(proofImage, `claims/${user.id}/${Date.now()}_proof`);
            let billImageUrl: string | undefined = undefined;
            if (billImage) {
                billImageUrl = await uploadFile(billImage, `claims/${user.id}/${Date.now()}_bill`);
            }

            await submitClaim({
                lostItemId: item.id,
                claimantId: user.id,
                comments,
                proofImageUrl, 
                billImageUrl
            });

            alert('Your claim has been submitted for review. The admin will contact you shortly.');
            onClose();
        } catch (error) {
            console.error("Failed to submit claim:", error);
            alert("There was an error submitting your claim. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: React.Dispatch<React.SetStateAction<File | null>>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 animate-fade-in-down" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Claiming: {item.name}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Picture with the item <span className="text-red-500">*</span>
                        </label>
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setProofImage)} required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 dark:file:bg-primary-900/50 file:text-primary-700 dark:file:text-primary-200 hover:file:bg-primary-100 dark:hover:file:bg-primary-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Bill or Proof of Ownership (Optional)
                        </label>
                        <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, setBillImage)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 dark:file:bg-primary-900/50 file:text-primary-700 dark:file:text-primary-200 hover:file:bg-primary-100 dark:hover:file:bg-primary-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Additional Comments</label>
                        <textarea value={comments} onChange={e => setComments(e.target.value)} rows={3} className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="e.g., mention any unique identifying marks."></textarea>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-gray-800 dark:text-gray-200">Cancel</button>
                        <AnimatedButton type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit Claim'}</AnimatedButton>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Sub-component: Report Item Modal
const ReportItemModal: React.FC<{ item: Item, onClose: () => void }> = ({ item, onClose }) => {
    const { reportItem } = useData();
    const { user } = useAuth();
    const [reason, setReason] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason) {
            alert('Please provide a reason for reporting this item.');
            return;
        }
        if (!user) return;
        
        reportItem(item.id, user.id, reason);

        alert('Thank you for your report. Our admin team will review it shortly.');
        onClose();
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 animate-fade-in-down" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Report: {item.title}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason for reporting</label>
                        <textarea id="reason" value={reason} onChange={e => setReason(e.target.value)} required rows={4} className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="e.g., This is a scam, the item is prohibited, seller is unresponsive..."></textarea>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-gray-800 dark:text-gray-200">Cancel</button>
                        <AnimatedButton type="submit">Submit Report</AnimatedButton>
                    </div>
                </form>
            </div>
        </div>
    );
};


// Sub-component: Rate Seller
const RateSeller: React.FC<{ sellerId: string }> = ({ sellerId }) => {
    const { rateUser } = useData();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmitRating = () => {
        if (rating > 0) {
            rateUser(sellerId, rating);
            setSubmitted(true);
        }
    };

    if (submitted) {
        return <p className="text-green-500 font-semibold text-center mt-4">Thank you for your feedback!</p>;
    }

    return (
        <div className="mt-6 text-center">
            <h4 className="font-bold text-md mb-2">Rate this seller</h4>
            <div className="flex justify-center items-center space-x-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        aria-label={`Rate ${star} stars`}
                    >
                        <RatingStarIcon
                            className="w-8 h-8 cursor-pointer text-accent-500 transition-transform duration-200 hover:scale-125"
                            filled={(hoverRating || rating) >= star}
                        />
                    </button>
                ))}
            </div>
            {rating > 0 && (
                 <AnimatedButton onClick={handleSubmitRating}>Submit {rating}-Star Rating</AnimatedButton>
            )}
        </div>
    );
};

// Sub-component: Profile Page
const ProfilePage: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const { updateUser } = useData();
    const [isEditing, setIsEditing] = useState(false);
    const [isUploadingPicture, setIsUploadingPicture] = useState(false);
    
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [branch, setBranch] = useState(user?.branch || '');
    const [year, setYear] = useState(user?.year || 1);
    const [hostelBlock, setHostelBlock] = useState(user?.hostelBlock || '');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    if (!user) return null;

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size must be less than 5MB');
                return;
            }
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadProfilePicture = async () => {
        if (!selectedImage) return;
        
        setIsUploadingPicture(true);
        try {
            const imageUrl = await uploadImageToSupabase(selectedImage, 'items', `profile_${user.id}`);
            await updateUser(user.id, { profilePictureUrl: imageUrl });
            await refreshUser();
            setSelectedImage(null);
            setImagePreview(null);
            alert('Profile picture updated successfully!');
        } catch (error: any) {
            console.error('Failed to upload profile picture:', error);
            const errorMessage = error?.message || 'Unknown error occurred';
            alert(`Failed to upload profile picture: ${errorMessage}\n\nPlease make sure you've set up Supabase storage buckets correctly.`);
        } finally {
            setIsUploadingPicture(false);
        }
    };

    const handleSave = async () => {
        await updateUser(user.id, { fullName, branch, year, hostelBlock });
        await refreshUser();
        setIsEditing(false);
        alert('Profile updated successfully!');
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white">My Profile</h2>
                <AnimatedButton onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                </AnimatedButton>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg max-w-2xl mx-auto">
                <div className="text-center">
                    <div className="relative inline-block">
                        <img 
                            src={imagePreview || user.profilePictureUrl} 
                            alt={user.fullName} 
                            className="w-32 h-32 rounded-full mx-auto ring-4 ring-primary-500/50 p-1 object-cover" 
                        />
                        <label 
                            htmlFor="profile-picture-upload" 
                            className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full cursor-pointer hover:bg-primary-600 transition-all shadow-lg"
                            title="Change profile picture"
                        >
                            <CameraIcon className="w-5 h-5" />
                            <input 
                                id="profile-picture-upload" 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageSelect} 
                                className="hidden" 
                            />
                        </label>
                    </div>
                    {selectedImage && (
                        <div className="mt-4">
                            <AnimatedButton 
                                onClick={handleUploadProfilePicture} 
                                disabled={isUploadingPicture}
                                className="text-sm"
                            >
                                {isUploadingPicture ? 'Uploading...' : 'Save Profile Picture'}
                            </AnimatedButton>
                            <button 
                                onClick={() => {
                                    setSelectedImage(null);
                                    setImagePreview(null);
                                }}
                                className="ml-2 text-sm text-gray-600 hover:underline"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                    {!isEditing ? (
                        <>
                            <h3 className="text-2xl font-bold mt-4">{user.fullName}</h3>
                            <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                            <div className="mt-4 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                <p><span className="font-semibold">Reg No:</span> {user.regNo}</p>
                                <p><span className="font-semibold">Branch:</span> {user.branch} ({user.year}{['st', 'nd', 'rd', 'th'][user.year - 1] || 'th'} Year)</p>
                                <p><span className="font-semibold">Hostel:</span> {user.hostelBlock}</p>
                            </div>
                        </>
                    ) : (
                        <div className="mt-6 text-left space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Branch</label>
                                <input type="text" value={branch} onChange={e => setBranch(e.target.value)} className="mt-1 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Year</label>
                                     <select value={year} onChange={e => setYear(parseInt(e.target.value))} required className="mt-1 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                                        <option value={1}>1st Year</option>
                                        <option value={2}>2nd Year</option>
                                        <option value={3}>3rd Year</option>
                                        <option value={4}>4th Year</option>
                                        <option value={5}>5th Year</option>
                                     </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hostel Block</label>
                                    <input type="text" value={hostelBlock} onChange={e => setHostelBlock(e.target.value)} className="mt-1 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                </div>
                            </div>
                            <AnimatedButton onClick={handleSave} className="w-full mt-4">Save Changes</AnimatedButton>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Sub-component: Item Detail Page
const ItemDetailPage: React.FC<{ item: Item; onBack: () => void; onReport: () => void; }> = ({ item, onBack, onReport }) => {
    const { getUserById } = useData();
    const seller = getUserById(item.sellerId);

    return (
        <div>
            <button onClick={onBack} className="mb-4 text-primary-500 font-semibold hover:underline">
                &larr; Back to Marketplace
            </button>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden lg:grid lg:grid-cols-2 lg:gap-x-8">
                <div className="aspect-w-16 aspect-h-9 lg:aspect-none">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover"/>
                </div>
                <div className="p-6">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{item.title}</h1>
                    <p className="text-3xl font-black text-primary-500 dark:text-primary-400 my-4">₹{item.price}</p>
                    <div className="flex items-center space-x-4 mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                            {item.category}
                        </span>
                         <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                            Condition: {item.condition}
                        </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mt-4">{item.description}</p>
                    
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="font-bold text-lg mb-4">Seller Information</h3>
                        {seller ? (
                             <div className="flex items-center">
                                <img src={seller.profilePictureUrl} alt={seller.fullName} className="w-12 h-12 rounded-full mr-4"/>
                                <div>
                                    <p className="font-semibold">{seller.fullName}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{seller.hostelBlock}</p>
                                </div>
                            </div>
                        ) : <p>Loading seller...</p>}
                        {seller && <RateSeller sellerId={seller.id} />}
                    </div>

                    <AnimatedButton className="w-full mt-8">Message Seller</AnimatedButton>
                     <div className="text-center mt-4">
                        <button onClick={onReport} className="text-sm text-red-500 hover:underline">
                            Report this item
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentApp;