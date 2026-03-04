import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getConversationsList, getConversation, sendMessage, resetMessages } from '../features/messages/messagesSlice';
import AppLayout from '../components/layout/AppLayout';
import { Send, User as UserIcon, Search, MessageSquare } from 'lucide-react';
import axios from 'axios'; // Fallback if user info missing from convo list

function MessagesPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialUserId = searchParams.get('user');

    const { conversations, currentConversation, isLoading } = useSelector((state) => state.messages);
    const { user: currentUser } = useSelector((state) => state.auth);

    const [activeUser, setActiveUser] = useState(null);
    const [msgText, setMsgText] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!currentUser) navigate('/login');
        dispatch(getConversationsList());
    }, [dispatch, currentUser, navigate]);

    useEffect(() => {
        if (initialUserId) {
            // Check if we need to load this user
            handleSelectConversation(initialUserId);
        }
    }, [initialUserId]);

    const handleSelectConversation = async (userId) => {
        dispatch(getConversation(userId));

        // Find user from conversations list
        const conv = conversations.find(c => (c.senderId?._id === userId) || (c.receiverId?._id === userId));
        if (conv) {
            const u = conv.senderId?._id === userId ? conv.senderId : conv.receiverId;
            setActiveUser(u);
        } else {
            // Fallback: manually fetch minimal user info if they aren't in convo list
            try {
                // Not ideal, but we just need name/id structure
                // Assuming `/api/users/profile` can be fetched or we just pass it
                // For now, let's just set a mock active user to allow sending first message
                setActiveUser({ _id: userId, name: 'New Conversation', username: 'user' });
            } catch (e) {
                console.error(e);
            }
        }
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!msgText.trim() || !activeUser) return;

        dispatch(sendMessage({ receiverId: activeUser._id, content: msgText }));
        setMsgText('');
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentConversation]);

    return (
        <AppLayout>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex overflow-hidden max-w-5xl mx-auto h-[600px]">
                {/* Sidebar */}
                <div className="w-1/3 border-r bg-gray-50/50 flex flex-col">
                    <div className="p-4 border-b bg-white">
                        <h2 className="text-xl font-bold text-gray-800">Messages</h2>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-1">
                        {conversations.length === 0 && !isLoading && (
                            <div className="text-center p-4 text-gray-500 text-sm">No recent conversations</div>
                        )}
                        {conversations.map((msg) => {
                            const otherUser = msg.senderId?._id === currentUser?._id ? msg.receiverId : msg.senderId;
                            if (!otherUser) return null;
                            const isActive = activeUser?._id === otherUser?._id;

                            return (
                                <button
                                    key={msg._id}
                                    onClick={() => handleSelectConversation(otherUser._id)}
                                    className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${isActive ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-gray-500 font-bold overflow-hidden">
                                        {otherUser.profilePicture ? <img src={otherUser.profilePicture} alt="" className="w-full h-full object-cover" /> : otherUser.name?.charAt(0)}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="font-semibold text-sm text-gray-900 truncate">{otherUser.name}</div>
                                        <div className="text-xs text-gray-500 truncate">{msg.content}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-white">
                    {activeUser ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b flex items-center gap-3 shadow-sm z-10">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                                    {activeUser.profilePicture ? <img src={activeUser.profilePicture} alt="" className="w-full h-full object-cover rounded-full" /> : activeUser.name?.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">{activeUser.name}</div>
                                    <div className="text-xs text-gray-500">@{activeUser.username}</div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                {currentConversation.length === 0 && (
                                    <div className="text-center text-gray-500 text-sm py-10">Send a message to start the conversation!</div>
                                )}
                                {currentConversation.map((msg, index) => {
                                    const isMe = msg.senderId === currentUser?._id;
                                    return (
                                        <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-gray-200 text-gray-800 rounded-tl-sm'}`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="p-4 border-t bg-white">
                                <form onSubmit={handleSend} className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={msgText}
                                        onChange={(e) => setMsgText(e.target.value)}
                                        placeholder="Type your message..."
                                        className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 rounded-full px-4 py-2.5 outline-none transition-all shadow-sm"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!msgText.trim()}
                                        className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition"
                                    >
                                        <Send size={18} />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <MessageSquare size={48} className="mb-4 text-gray-300" />
                            <p>Select a conversation to start messaging</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

export default MessagesPage;
