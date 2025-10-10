import React, { useState } from 'react';
import Header from '../components/Header';
import { useData } from '../context/DataContext';
import { User, Item, LostItem, Claim, Complaint } from '../types';
import AnimatedButton from '../components/AnimatedButton';

// FIX: Changed JSX.Element to React.ReactNode to resolve namespace error.
const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg flex items-center space-x-4">
        <div className="bg-primary-100 dark:bg-primary-900/50 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

const AdminDashboard: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
    const { users, items, complaints, claims } = useData();
    const pendingComplaints = complaints.filter(c => c.status === 'pending').length;
    const pendingClaims = claims.filter(c => c.status === 'pending').length;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Users" value={users.length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 004.777-9.317M15 21a6 6 0 00-6.417-4.636" /></svg>} />
                <StatCard title="Active Listings" value={items.length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>} />
                <StatCard title="Pending Complaints" value={pendingComplaints} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                <StatCard title="Pending Claims" value={pendingClaims} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>} />
            </div>
            {/* Quick access buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <button onClick={() => onNavigate('complaints')} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <h3 className="font-bold text-lg">Review Complaints</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Action required on {pendingComplaints} item reports.</p>
                </button>
                 <button onClick={() => onNavigate('lostfound')} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <h3 className="font-bold text-lg">Review Claims</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{pendingClaims} lost items are waiting for claim approval.</p>
                </button>
            </div>
        </div>
    );
};

const UsersPage: React.FC = () => {
    const { users, items, toggleSuspendUser } = useData();
    return (
        <div>
             <h2 className="text-3xl font-extrabold mb-6 !text-black dark:text-white">Manage Users</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {users.map(user => {
                     const userListings = items.filter(i => i.sellerId === user.id).length;
                     return (
                        <div key={user.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-lg flex flex-col">
                             <div className="flex items-start space-x-4">
                                <img src={user.profilePictureUrl} alt={user.fullName} className="w-16 h-16 rounded-full" />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-lg">{user.fullName}</h4>
                                        {user.isSuspended && <span className="text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-2 py-1 rounded-full">Suspended</span>}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.regNo}</p>
                                    <div className="flex items-center text-sm text-yellow-500 mt-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                        <span>{user.rating} ({user.ratingsCount} ratings)</span>
                                    </div>
                                </div>
                             </div>
                             <div className="border-t border-gray-100 dark:border-gray-700 mt-4 pt-4 flex justify-between items-center">
                                 <p className="text-sm text-gray-500 dark:text-gray-400">Listings: <span className="font-bold">{userListings}</span></p>
                                 <button onClick={() => toggleSuspendUser(user.id)} className={`text-sm font-bold py-2 px-4 rounded-lg ${user.isSuspended ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.isSuspended ? 'Unsuspend' : 'Suspend'}</button>
                             </div>
                        </div>
                     )
                 })}
             </div>
        </div>
    );
};

const ListingsPage: React.FC = () => {
    const { items, removeItem, getUserById } = useData();
    return (
        <div>
             <h2 className="text-3xl font-extrabold mb-6 !text-black dark:text-white">Manage Listings</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                 {items.map(item => {
                     const seller = getUserById(item.sellerId);
                     return (
                         <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden flex flex-col">
                            <img className="w-full h-40 object-cover" src={item.imageUrl} alt={item.title}/>
                            <div className="p-4 flex flex-col flex-grow">
                                <h3 className="font-bold text-md text-gray-900 dark:text-white truncate">{item.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Sold by {seller?.fullName}</p>
                                <p className="text-lg font-black text-primary-500 mt-1">₹{item.price}</p>
                                <div className="mt-auto pt-4">
                                     <button onClick={() => removeItem(item.id)} className="w-full text-sm py-2 px-4 font-bold text-red-800 bg-red-100 dark:text-red-200 dark:bg-red-900/50 rounded-lg hover:bg-red-200 dark:hover:bg-red-900 transition-all duration-200">
                                       Remove Listing
                                   </button>
                                </div>
                            </div>
                         </div>
                     )
                 })}
             </div>
        </div>
    );
};


const ComplaintsPage: React.FC = () => {
    const { complaints, resolveComplaint, getItemById, getUserById } = useData();
    const pendingComplaints = complaints.filter(c => c.status === 'pending');

    return (
         <div>
             <h2 className="text-3xl font-extrabold mb-6 !text-black dark:text-white">Review Complaints</h2>
             {pendingComplaints.length > 0 ? (
                <div className="space-y-4">
                    {pendingComplaints.map(complaint => {
                        const item = getItemById(complaint.itemId);
                        const reporter = getUserById(complaint.reporterId);
                        if (!item) return null; // Item might have been deleted already
                        return (
                            <div key={complaint.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col md:flex-row md:items-center gap-4">
                                <img src={item.imageUrl} alt={item.title} className="w-full md:w-24 h-24 object-cover rounded-md" />
                                <div className="flex-grow">
                                    <h4 className="font-bold">{item.title}</h4>
                                    <p className="text-sm italic text-gray-600 dark:text-gray-300 mt-1">"{complaint.reason}"</p>
                                    <p className="text-xs text-gray-400 mt-2">Reported by: <span className="font-medium">{reporter?.fullName || 'N/A'}</span></p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto self-end">
                                    <button onClick={() => resolveComplaint(complaint.id, 'dismiss')} className="text-sm py-2 px-3 font-bold bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Dismiss</button>
                                    <button onClick={() => resolveComplaint(complaint.id, 'deleteItem')} className="text-sm py-2 px-3 font-bold text-white bg-red-500 rounded-lg hover:bg-red-600">Delete Item</button>
                                </div>
                            </div>
                        )
                    })}
                </div>
             ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 mt-12">No pending complaints.</p>
             )}
         </div>
    );
};

const LostAndFoundPage: React.FC = () => {
    const { lostItems, addLostItem, claims, resolveClaim, getUserById } = useData();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [locationFound, setLocationFound] = useState('');
    const [itemImage, setItemImage] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const pendingClaims = claims.filter(c => c.status === 'pending');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!itemImage) {
            alert('Please upload an image of the found item.');
            return;
        }
        
        setIsSubmitting(true);
        try {
            const { uploadImageToSupabase } = await import('../utils/storage');
            const imageUrl = await uploadImageToSupabase(itemImage, 'items', `lost-found/${Date.now()}`);
            
            await addLostItem({ name, description, locationFound, imageUrl });
            
            setName(''); 
            setDescription(''); 
            setLocationFound('');
            setItemImage(null);
            
            alert('Found item posted successfully!');
        } catch (error) {
            console.error('Failed to post found item:', error);
            alert('Failed to post item. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-12">
            <div>
                 <h2 className="text-3xl font-extrabold mb-6 !text-black dark:text-white">Review Claims</h2>
                 {pendingClaims.length > 0 ? (
                    <div className="space-y-4">
                        {pendingClaims.map(claim => {
                            const item = lostItems.find(li => li.id === claim.lostItemId);
                            const claimant = getUserById(claim.claimantId);
                            if (!item || !claimant) return null;
                            return (
                                <div key={claim.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                                        <img src={item.imageUrl} alt={item.name} className="w-full md:w-24 h-24 object-cover rounded-md"/>
                                        <div className="flex-grow">
                                            <h4 className="font-bold">Claim for: {item.name}</h4>
                                            <p className="text-sm font-semibold">Claimant: {claimant.fullName} ({claimant.regNo})</p>
                                            <p className="text-sm italic text-gray-600 dark:text-gray-300 mt-1">"{claim.comments}"</p>
                                             <div className="flex gap-4 mt-2">
                                                <a href={claim.proofImageUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-500 hover:underline font-semibold">View Proof</a>
                                                {claim.billImageUrl && <a href={claim.billImageUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-500 hover:underline font-semibold">View Bill</a>}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 w-full md:w-auto self-end">
                                            <button onClick={() => resolveClaim(claim.id, 'rejected')} className="flex-1 md:flex-none text-sm py-2 px-3 font-bold bg-red-100 text-red-800 rounded-lg hover:bg-red-200">Reject</button>
                                            <button onClick={() => resolveClaim(claim.id, 'approved')} className="flex-1 md:flex-none text-sm py-2 px-3 font-bold text-white bg-green-500 rounded-lg hover:bg-green-600">Approve</button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                 ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400">No pending claims to review.</p>
                 )}
            </div>
             <div>
                <h3 className="text-2xl font-bold mb-4 !text-black dark:text-white">Post a Found Item</h3>
                 <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-lg">
                     <input type="text" placeholder="Item Name" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                     <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required rows={3} className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"></textarea>
                     <input type="text" placeholder="Location Found" value={locationFound} onChange={e => setLocationFound(e.target.value)} required className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                     
                     <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                             Upload Image of Found Item *
                         </label>
                         <input 
                             type="file" 
                             accept="image/*" 
                             onChange={(e) => {
                                 if (e.target.files && e.target.files[0]) {
                                     setItemImage(e.target.files[0]);
                                 }
                             }} 
                             required 
                             className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" 
                         />
                         {itemImage && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Selected: {itemImage.name}</p>}
                     </div>
                     
                     <AnimatedButton type="submit" className="w-full" disabled={isSubmitting}>
                         {isSubmitting ? 'Uploading...' : 'Post Item'}
                     </AnimatedButton>
                 </form>
            </div>
        </div>
    );
};

const AdminApp: React.FC = () => {
    const [activePage, setActivePage] = useState('dashboard');

    const renderPage = () => {
        switch (activePage) {
            case 'dashboard':
                return <AdminDashboard onNavigate={setActivePage} />;
            case 'users':
                return <UsersPage />;
            case 'listings':
                return <ListingsPage />;
            case 'complaints':
                return <ComplaintsPage />;
            case 'lostfound':
                return <LostAndFoundPage />;
            default:
                return <AdminDashboard onNavigate={setActivePage} />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-cream-100 via-white to-cream-200 text-black">
            <Header onNavigate={setActivePage} onSearch={() => {}} activePage={activePage} />
            <main className="container mx-auto p-4 sm:p-6 md:p-8">
                {renderPage()}
            </main>
        </div>
    );
};

export default AdminApp;
