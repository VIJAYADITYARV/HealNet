import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { getConversationsList, getConversation, sendMessage, resetMessages } from '../features/messages/messagesSlice';
import AppLayout from '../components/layout/AppLayout';
import { Send, User as UserIcon, Search, MessageSquare, Shield, CheckCheck, MoreVertical, Paperclip, Smile, Brain, Sparkles, Loader2, Info } from 'lucide-react';
import axios from 'axios';

const MOCK_USERS = [
    { _id: 'mock-ai', name: 'Dr. HealNet AI', username: 'medical_assistant', isAI: true, bio: 'Advanced Medical Diagnosis Core', profilePicture: null },
    { _id: 'mock-sarah', name: 'Sarah Miller', username: 'sarah_m', bio: 'Recovering from ACL Surgery', profilePicture: null },
    { _id: 'mock-james', name: 'James Wilson', username: 'james_w', bio: 'Chronic Migraine Patient', profilePicture: null },
];

const MOCK_CONVERSATIONS = [
    {
        _id: 'conv-1', senderId: MOCK_USERS[0], receiverId: null,
        content: "Hello! I noticed your recent recovery update. Would you like a clinical analysis of your progress?",
        createdAt: new Date(Date.now() - 3600000).toISOString(), isMock: true
    },
    {
        _id: 'conv-2', senderId: MOCK_USERS[1], receiverId: null,
        content: "Hi there, I saw your post about physiotherapy. Which clinic did you visit in Chennai?",
        createdAt: new Date(Date.now() - 7200000).toISOString(), isMock: true
    },
    {
        _id: 'conv-3', senderId: MOCK_USERS[2], receiverId: null,
        content: "Your journey with migraines really resonated with me. Stay strong!",
        createdAt: new Date(Date.now() - 86400000).toISOString(), isMock: true
    }
];

function MessagesPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const initialUserId = searchParams.get('user');
    const passedUser = location.state?.initialUser;

    const { conversations, currentConversation, isLoading } = useSelector((state) => state.messages);
    const { user: currentUser } = useSelector((state) => state.auth);

    const [activeUser, setActiveUser] = useState(null);
    const [msgText, setMsgText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef(null);

    // Simulated Real-time State
    const [mockMessages, setMockMessages] = useState({}); // { userId: [messages] }
    const [isTyping, setIsTyping] = useState(false);

    // AI Messaging Assistant State
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);

    // Global User Search State
    const [globalUsers, setGlobalUsers] = useState([]);
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        dispatch(getConversationsList());

        // Fetch suggested users (Guru, Sabari, etc)
        const fetchSuggested = async () => {
            try {
                const res = await axios.get('/api/messages/suggested', {
                    headers: { Authorization: `Bearer ${currentUser?.token}` }
                });
                setSuggestedUsers(res.data);
            } catch (err) {
                console.error("Failed to fetch suggested users", err);
            }
        }
        fetchSuggested();

        return () => {
            dispatch(resetMessages());
        };
    }, [dispatch, currentUser, navigate]);

    // Merge Real and Mock Conversations
    let displayConversations = [...conversations];

    // Inject active user into sidebar if no conversation exists yet
    if (activeUser && !activeUser._id.startsWith('mock-')) {
        const hasConv = conversations.some(c =>
            (c.senderId?._id === activeUser._id) || (c.receiverId?._id === activeUser._id) ||
            (c.senderId === activeUser._id) || (c.receiverId === activeUser._id)
        );
        if (!hasConv) {
            displayConversations = [{
                _id: 'temp-' + activeUser._id,
                senderId: activeUser,
                receiverId: currentUser,
                content: 'Start a new conversation...',
                createdAt: new Date().toISOString(),
                isTemp: true
            }, ...displayConversations];
        }
    }

    // Always show mock conversations for demo purposes
    displayConversations = [...displayConversations, ...MOCK_CONVERSATIONS];

    useEffect(() => {
        const searchTimer = setTimeout(async () => {
            if (searchTerm.length >= 2) {
                setIsSearching(true);
                try {
                    const res = await axios.get(`/api/users/search?q=${searchTerm}`, {
                        headers: { Authorization: `Bearer ${currentUser?.token}` }
                    });

                    // Filter out users we already see in the sidebar (real or temp)
                    const existingUserIds = displayConversations.map(c => {
                        const other = (c.senderId?._id || c.senderId) === currentUser?._id ? (c.receiverId?._id || c.receiverId) : (c.senderId?._id || c.senderId);
                        return other?._id || other;
                    });

                    setGlobalUsers(res.data.filter(u => !existingUserIds.includes(u._id)));
                } catch (err) {
                    console.error("User search failed", err);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setGlobalUsers([]);
            }
        }, 400);

        return () => clearTimeout(searchTimer);
    }, [searchTerm, currentUser?.token, displayConversations]);

    useEffect(() => {
        if (initialUserId) {
            handleSelectConversation(initialUserId);
        }
    }, [initialUserId, conversations.length]);

    const handleSelectConversation = async (userId, userObj = null) => {
        if (userId !== initialUserId) {
            navigate(`/messages?user=${userId}`);
        }

        const isMock = userId.startsWith('mock-');
        if (isMock) {
            const user = MOCK_USERS.find(u => u._id === userId);
            setActiveUser(user);
        } else {
            // Check if we already have the user details
            if (userObj) {
                setActiveUser(userObj);
            } else if (passedUser && passedUser._id === userId) {
                setActiveUser(passedUser);
            } else {
                // Try to find in existing conversations, suggestions or global search
                const existingConv = displayConversations.find(c =>
                    (c.senderId?._id === userId) || (c.receiverId?._id === userId) ||
                    (c.senderId === userId) || (c.receiverId === userId)
                );
                const other = existingConv ? ((existingConv.senderId?._id || existingConv.senderId) === currentUser?._id ? (existingConv.receiverId?._id ? existingConv.receiverId : existingConv.receiverId) : (existingConv.senderId?._id ? existingConv.senderId : existingConv.senderId)) : null;
                const suggestion = suggestedUsers.find(u => u._id === userId);
                const global = globalUsers.find(u => u._id === userId);

                if (other && typeof other === 'object') {
                    setActiveUser(other);
                } else if (suggestion) {
                    setActiveUser(suggestion);
                } else if (global) {
                    setActiveUser(global);
                } else {
                    setActiveUser({ _id: userId, name: 'Patient', username: 'user', profilePicture: null });
                }
            }
            dispatch(getConversation(userId));
        }
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!msgText.trim() || !activeUser) return;

        const isMock = activeUser._id.startsWith('mock-');

        if (isMock) {
            const newMsg = {
                _id: Date.now().toString(),
                senderId: currentUser?._id,
                content: msgText,
                createdAt: new Date().toISOString()
            };
            setMockMessages(prev => ({
                ...prev,
                [activeUser._id]: [...(prev[activeUser._id] || []), newMsg]
            }));
            const currentMsg = msgText;
            setMsgText('');

            // Simulate "Real-time" Reply
            setTimeout(() => {
                setIsTyping(true);
                setTimeout(() => {
                    const reply = {
                        _id: (Date.now() + 1).toString(),
                        senderId: activeUser._id,
                        content: getMockReply(activeUser.name, currentMsg),
                        createdAt: new Date().toISOString()
                    };
                    setMockMessages(prev => ({
                        ...prev,
                        [activeUser._id]: [...(prev[activeUser._id] || []), reply]
                    }));
                    setIsTyping(false);
                }, 2500);
            }, 800);

        } else {
            dispatch(sendMessage({ receiverId: activeUser._id, content: msgText }))
                .then(() => dispatch(getConversationsList()));
            setMsgText('');
        }
        setAiAnalysis(null);
    };

    const getMockReply = (name, text) => {
        const t = text.toLowerCase();
        if (name.includes('AI')) {
            if (t.includes('hello') || t.includes('hi')) return "Hello! I am your HealNet Medical Assistant. How can I help you understand your records today?";
            if (t.includes('help')) return "I can analyze your medical journey, suggest questions for your doctor, or explain complex terminology.";
            return "That's an interesting perspective. Based on the community data I've processed, many patients with similar conditions find this type of sharing very therapeutic.";
        }
        return `Thanks for reaching out! I've been following your updates. It's really helpful to see how others are managing. Let's stay in touch!`;
    };

    const handleAiAnalysis = async () => {
        if (!currentConversation || currentConversation.length === 0) return;
        setAiLoading(true);
        try {
            const res = await axios.post('/api/ai/chat-context', {
                messages: currentConversation,
                otherUserName: activeUser?.name
            }, {
                headers: { Authorization: `Bearer ${currentUser?.token}` }
            });

            const raw = res.data.analysis;
            const summaryPart = raw.split('Suggestions:')[0].replace('Summary:', '').trim();
            const suggestionsPart = raw.split('Suggestions:')[1]?.trim().split(',').map(s => s.trim()) || [];

            setAiAnalysis({ summary: summaryPart, suggestions: suggestionsPart });
        } catch (err) {
            console.error("AI Chat Analysis Error:", err);
        } finally { setAiLoading(false); }
    }

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentConversation, mockMessages, isTyping]);


    const filteredConversations = displayConversations.filter(c => {
        const other = c.senderId?._id === currentUser?._id ? c.receiverId : c.senderId;
        const otherName = other?.name || c.senderId?.name || '';
        return otherName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const getChatMessages = () => {
        if (!activeUser) return [];
        if (activeUser._id.startsWith('mock-')) {
            const initialMock = MOCK_CONVERSATIONS.find(c => c.senderId._id === activeUser._id);
            return [initialMock, ...(mockMessages[activeUser._id] || [])];
        }
        return currentConversation;
    };

    const chatMessages = getChatMessages();

    return (
        <AppLayout>
            <div className="hn-messages-container">
                {/* Sidebar: Conv List */}
                <div className="hn-messages-sidebar">
                    <div className="hn-messages-sidebar-header">
                        <h2 className="hn-messages-title">Direct Messages</h2>
                        <div className="hn-messages-search">
                            <Search size={16} className="hn-messages-search-icon" />
                            <input
                                type="text"
                                placeholder="Search people..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="hn-messages-list">
                        {isLoading && conversations.length === 0 ? (
                            <div style={{ padding: 40, textAlign: 'center' }}><Loader2 className="animate-spin" color="var(--blue-trust)" /></div>
                        ) : (filteredConversations.length === 0 && globalUsers.length === 0) ? (
                            <div style={{ padding: 40, textAlign: 'center', opacity: 0.5 }}>
                                <MessageSquare size={32} style={{ margin: '0 auto 10px' }} />
                                <div style={{ fontSize: '0.8rem' }}>No users or chats found</div>
                            </div>
                        ) : (
                            <>
                                {filteredConversations.map((msg) => {
                                    const otherUser = msg.senderId?._id === currentUser?._id ? msg.receiverId : msg.senderId;
                                    if (!otherUser) return null;
                                    const isActive = activeUser?._id === otherUser?._id;

                                    return (
                                        <button
                                            key={msg._id}
                                            onClick={() => handleSelectConversation(otherUser._id)}
                                            className={`hn-messages-item ${isActive ? 'active' : ''}`}
                                        >
                                            <div className="hn-messages-item-avatar" style={{ background: otherUser.isAI ? 'linear-gradient(135deg, #6366f1, #a855f7)' : undefined }}>
                                                {otherUser.isAI ? <Brain size={20} color="white" /> : (otherUser.name?.charAt(0) || 'P')}
                                                <div className="hn-messages-online-dot" />
                                            </div>
                                            <div className="hn-messages-item-info">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div className="hn-messages-item-name">{otherUser.name}</div>
                                                    <div className="hn-messages-item-time">
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                                <div className="hn-messages-item-last">{msg.content}</div>
                                            </div>
                                        </button>
                                    );
                                })}

                                {suggestedUsers.length > 0 && searchTerm.length < 2 && (
                                    <div className="hn-messages-section" style={{ marginTop: 24 }}>
                                        <div className="hn-messages-section-title">SUGGESTED PEOPLE</div>
                                        {suggestedUsers.map(u => (
                                            <button
                                                key={u._id}
                                                onClick={() => handleSelectConversation(u._id, u)}
                                                className={`hn-messages-item ${activeUser?._id === u._id ? 'active' : ''}`}
                                            >
                                                <div className="hn-messages-item-avatar">
                                                    {u.name?.charAt(0) || 'U'}
                                                </div>
                                                <div className="hn-messages-item-info">
                                                    <div className="hn-messages-item-name">{u.name}</div>
                                                    <div className="hn-messages-item-last">@{u.username || 'user'}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {globalUsers.length > 0 && (
                                    <div className="hn-messages-section" style={{ marginTop: 24 }}>
                                        <div className="hn-messages-section-title">PEOPLE IN HEALNET</div>
                                        {globalUsers.map(u => (
                                            <button
                                                key={u._id}
                                                onClick={() => handleSelectConversation(u._id, u)}
                                                className={`hn-messages-item ${activeUser?._id === u._id ? 'active' : ''}`}
                                            >
                                                <div className="hn-messages-item-avatar">
                                                    {u.name?.charAt(0) || 'U'}
                                                </div>
                                                <div className="hn-messages-item-info">
                                                    <div className="hn-messages-item-name">{u.name}</div>
                                                    <div className="hn-messages-item-last">@{u.username || 'user'}</div>
                                                </div>
                                                {isSearching && <Loader2 size={12} className="animate-spin" style={{ opacity: 0.5 }} />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Main: Chat Window */}
                <div className="hn-messages-main">
                    {activeUser ? (
                        <>
                            {/* Chat Header */}
                            <div className="hn-chat-header">
                                <div className="hn-chat-header-user">
                                    <div className="hn-chat-header-avatar" style={{ background: activeUser.isAI ? 'var(--blue-light)' : undefined }}>
                                        {activeUser.isAI ? <Sparkles size={18} color="var(--blue-trust)" /> : (activeUser.name?.charAt(0) || 'P')}
                                    </div>
                                    <div className="hn-chat-header-info">
                                        <div className="hn-chat-header-name">{activeUser.name}</div>
                                        <div className="hn-chat-header-status">
                                            <span style={{ width: 8, height: 8, background: 'var(--green-success)', borderRadius: '50%' }} />
                                            {activeUser.isAI ? 'Neural Core Active' : 'Available Now'}
                                        </div>
                                    </div>
                                </div>
                                <div className="hn-chat-header-actions">
                                    {!activeUser.isAI && (
                                        <button
                                            className={`hn-chat-icon-btn ${aiLoading ? 'loading' : ''}`}
                                            onClick={handleAiAnalysis}
                                            title="Analyze Medical Context"
                                            disabled={aiLoading}
                                        >
                                            {aiLoading ? <Loader2 size={18} className="animate-spin" /> : <Brain size={18} color="var(--blue-trust)" />}
                                        </button>
                                    )}
                                    <button className="hn-chat-icon-btn"><Shield size={18} /></button>
                                    <button className="hn-chat-icon-btn"><MoreVertical size={18} /></button>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="hn-chat-messages">
                                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'var(--surface)', borderRadius: 10, fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                                        <Shield size={10} /> END-TO-END ENCRYPTED
                                    </div>
                                </div>

                                {chatMessages.map((msg, index) => {
                                    const isMe = (msg.senderId?._id || msg.senderId) === currentUser?._id;
                                    return (
                                        <div key={index} className={`hn-chat-bubble-wrap ${isMe ? 'mine' : 'theirs'}`}>
                                            <div className="hn-chat-bubble">
                                                {msg.content}
                                                <div style={{ fontSize: '0.62rem', marginTop: 4, opacity: 0.7, textAlign: isMe ? 'right' : 'left' }}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {isMe && <CheckCheck size={10} style={{ marginLeft: 4 }} />}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {isTyping && (
                                    <div className="hn-chat-bubble-wrap theirs">
                                        <div className="hn-typing-indicator">
                                            <div className="hn-typing-dot" style={{ animationDelay: '0s' }} />
                                            <div className="hn-typing-dot" style={{ animationDelay: '0.2s' }} />
                                            <div className="hn-typing-dot" style={{ animationDelay: '0.4s' }} />
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* AI SUGGESTIONS BAR */}
                            {aiAnalysis && (
                                <div className="hn-chat-ai-suggestions" style={{ animation: 'slideIn 0.3s ease' }}>
                                    <div className="hn-chat-ai-banner">
                                        <Sparkles size={12} />
                                        <span>AI CONTEXT: {aiAnalysis.summary}</span>
                                    </div>
                                    <div className="hn-chat-ai-replies">
                                        {aiAnalysis.suggestions.map((s, i) => (
                                            <button key={i} onClick={() => setMsgText(s)} className="hn-chat-ai-reply-btn">
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Input Area */}
                            <div className="hn-chat-input-area">
                                <form onSubmit={handleSend} className="hn-chat-form">
                                    <button type="button" className="hn-chat-input-btn"><Paperclip size={20} /></button>
                                    <input
                                        type="text"
                                        value={msgText}
                                        onChange={(e) => setMsgText(e.target.value)}
                                        placeholder={`Message ${activeUser.name}...`}
                                        className="hn-chat-input"
                                    />
                                    <button type="button" className="hn-chat-input-btn"><Smile size={20} /></button>
                                    <button
                                        type="submit"
                                        disabled={!msgText.trim()}
                                        className="hn-chat-send-btn"
                                    >
                                        <Send size={18} />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="hn-chat-placeholder">
                            <div className="hn-chat-placeholder-content">
                                <div className="hn-chat-placeholder-icon">
                                    <MessageSquare size={40} />
                                </div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Select a Perspective</h2>
                                <p>Choose a medical discussion from the sidebar to view history or start a new consultation.</p>
                                <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
                                    <div style={{ padding: '8px 16px', background: 'var(--blue-light)', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700, color: 'var(--blue-trust)' }}>
                                        3 New Requests
                                    </div>
                                    <div style={{ padding: '8px 16px', background: 'var(--surface)', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                                        12 Active Chats
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </AppLayout>
    );
}

export default MessagesPage;
