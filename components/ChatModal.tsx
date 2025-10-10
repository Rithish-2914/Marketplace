import React, { useState, useEffect, useRef } from 'react';
import { User, Item } from '../types';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

interface ChatModalProps {
    otherUser: User;
    item?: Item;
    onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ otherUser, item, onClose }) => {
    const { user } = useAuth();
    const { sendMessage, getMessages, markMessagesAsRead } = useData();
    const [messageText, setMessageText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const messages = getMessages(otherUser.id, item?.id);

    useEffect(() => {
        markMessagesAsRead(otherUser.id, item?.id);
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, otherUser.id, item?.id, markMessagesAsRead]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageText.trim() || !user) return;

        setIsSending(true);
        try {
            await sendMessage(otherUser.id, messageText.trim(), item?.id);
            setMessageText('');
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl h-[600px] flex flex-col animate-fade-in-down" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <img src={otherUser.profilePictureUrl} alt={otherUser.fullName} className="w-12 h-12 rounded-full" />
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{otherUser.fullName}</h3>
                            {item && <p className="text-sm text-gray-500 dark:text-gray-400">About: {item.title}</p>}
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Item Info (if applicable) */}
                {item && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
                        <img src={item.imageUrl} alt={item.title} className="w-16 h-16 object-cover rounded-md" />
                        <div className="flex-1">
                            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{item.title}</h4>
                            <p className="text-lg font-bold text-primary-500">₹{item.price}</p>
                        </div>
                    </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                            <p>No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                        messages.map(message => {
                            const isSender = message.senderId === user?.id;
                            return (
                                <div key={message.id} className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                        isSender 
                                            ? 'bg-primary-500 text-white' 
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                                    }`}>
                                        <p className="text-sm">{message.content}</p>
                                        <p className={`text-xs mt-1 ${isSender ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'}`}>
                                            {message.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={messageText}
                            onChange={e => setMessageText(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                            disabled={isSending}
                        />
                        <button
                            type="submit"
                            disabled={!messageText.trim() || isSending}
                            className="px-6 py-2 bg-primary-500 text-white rounded-full font-semibold hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                        >
                            {isSending ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChatModal;
