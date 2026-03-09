import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { getConversationsList, getConversation, sendMessage, resetMessages } from '../features/messages/messagesSlice';
import AppLayout from '../components/layout/AppLayout';
import { Send, User as UserIcon, Search, MessageSquare, Shield, CheckCheck, MoreVertical, Paperclip, Smile, Brain, Sparkles, Loader2, Info } from 'lucide-react';
import axios from 'axios';

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

    // AI Messaging Assistant State
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        dispatch(getConversationsList());

        return () => {
            dispatch(resetMessages());
        };
    }, [dispatch, currentUser, navigate]);

    useEffect(() => {
        if (initialUserId) {
            handleSelectConversation(initialUserId);
        }
    }, [initialUserId, conversations.length]); // Re-run if conversations load

    const handleSelectConversation = async (userId) => {
        if (userId !== initialUserId) {
            navigate(`/messages?user=${userId}`);
        }
        dispatch(getConversation(userId));

        // 1. Try to find user in existing conversations
        const conv = conversations.find(c =>
            (c.senderId?._id === userId) || (c.receiverId?._id === userId)
        );

        if (conv) {
            const u = conv.senderId?._id === userId ? conv.senderId : conv.receiverId;
            setActiveUser(u);
        } else if (passedUser && passedUser._id === userId) {
            // 2. Use user info passed via navigation state (best for new conversations)
            setActiveUser(passedUser);
        } else {
            // 3. Last resort fallback
            setActiveUser({ _id: userId, name: 'Patient', username: 'user', profilePicture: null });
        }
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!msgText.trim() || !activeUser) return;

        dispatch(sendMessage({ receiverId: activeUser._id, content: msgText }));
        setMsgText('');
        setAiAnalysis(null); // Clear analysis after sending
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

            // Parse response: "Summary: ... Suggestions: q1, q2"
            const raw = res.data.analysis;
            const summaryPart = raw.split('Suggestions:')[0].replace('Summary:', '').trim();
            const suggestionsPart = raw.split('Suggestions:')[1]?.trim().split(',').map(s => s.trim()) || [];

            setAiAnalysis({ summary: summaryPart, suggestions: suggestionsPart });
        } catch (err) {
            console.error("AI Chat Analysis Error:", err);
        } finally {
            setAiLoading(false);
        }
    }

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentConversation]);

    // Enhanced Sidebar list: Merge the current active user if they are a 'new' conversation
    const displayConversations = [...conversations];
    const isNewParticipant = activeUser && !conversations.some(c =>
        (c.senderId?._id === activeUser._id) || (c.receiverId?._id === activeUser._id) ||
        (c.receiverId === activeUser._id) || (c.senderId === activeUser._id)
    );

    if (isNewParticipant) {
        displayConversations.unshift({
            _id: 'new-' + activeUser._id,
            senderId: currentUser,
            receiverId: activeUser,
            content: 'Start a new conversation...',
            createdAt: new Date().toISOString(),
            isNew: true
        });
    }

    const filteredConversations = displayConversations.filter(c => {
        const other = c.senderId?._id === currentUser?._id ? c.receiverId : c.senderId;
        return other?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            other?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <AppLayout>
            <div className="hn-messages-container">
                {/* Sidebar: Conv List */}
                <div className="hn-messages-sidebar">
                    <div className="hn-messages-sidebar-header">
                        <h2 className="hn-messages-title">Messages</h2>
                        <div className="hn-messages-search">
                            <Search size={14} className="hn-messages-search-icon" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="hn-messages-list">
                        {isLoading && conversations.length === 0 ? (
                            <div className="hn-messages-loading">
                                <div className="hn-spinner-sm" />
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="hn-messages-empty">
                                <MessageSquare size={24} style={{ opacity: 0.3, marginBottom: 8 }} />
                                <p>No chats found</p>
                            </div>
                        ) : (
                            filteredConversations.map((msg) => {
                                const otherUser = msg.senderId?._id === currentUser?._id ? msg.receiverId : msg.senderId;
                                if (!otherUser) return null;
                                const isActive = activeUser?._id === otherUser?._id;

                                return (
                                    <button
                                        key={msg._id}
                                        onClick={() => handleSelectConversation(otherUser._id)}
                                        className={`hn-messages-item ${isActive ? 'active' : ''}`}
                                    >
                                        <div className="hn-messages-item-avatar">
                                            {otherUser.profilePicture ? (
                                                <img src={otherUser.profilePicture} alt="" />
                                            ) : (
                                                <span>{otherUser.name?.charAt(0)}</span>
                                            )}
                                            <div className="hn-messages-online-dot" />
                                        </div>
                                        <div className="hn-messages-item-info">
                                            <div className="hn-messages-item-name">{otherUser.name}</div>
                                            <div className="hn-messages-item-last">{msg.content}</div>
                                        </div>
                                        <div className="hn-messages-item-meta">
                                            <div className="hn-messages-item-time">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
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
                                    <div className="hn-chat-header-avatar">
                                        {activeUser.profilePicture ? (
                                            <img src={activeUser.profilePicture} alt="" />
                                        ) : (
                                            <span>{activeUser.name?.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div className="hn-chat-header-info">
                                        <div className="hn-chat-header-name">{activeUser.name}</div>
                                        <div className="hn-chat-header-status">
                                            <span className="online-indicator" /> Online
                                        </div>
                                    </div>
                                </div>
                                <div className="hn-chat-header-actions">
                                    <button
                                        className={`hn-chat-icon-btn ${aiLoading ? 'loading' : ''}`}
                                        onClick={handleAiAnalysis}
                                        title="Analyze Medical Context"
                                        disabled={aiLoading}
                                    >
                                        {aiLoading ? <Loader2 size={18} className="animate-spin" /> : <Brain size={18} color="#2563eb" />}
                                    </button>
                                    <button className="hn-chat-icon-btn"><Shield size={18} /></button>
                                    <button className="hn-chat-icon-btn"><MoreVertical size={18} /></button>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="hn-chat-messages">
                                {currentConversation.length === 0 && !isLoading && (
                                    <div className="hn-chat-start-prompt">
                                        <div className="hn-chat-start-icon">
                                            <MessageSquare size={32} />
                                        </div>
                                        <h3>Start a conversation with {activeUser.name}</h3>
                                        <p>Your messages are secure and kept private between you and the other user.</p>
                                    </div>
                                )}

                                {currentConversation.map((msg, index) => {
                                    const isMe = msg.senderId === currentUser?._id;
                                    const date = new Date(msg.createdAt);

                                    return (
                                        <div key={index} className={`hn-chat-bubble-wrap ${isMe ? 'mine' : 'theirs'}`}>
                                            <div className="hn-chat-bubble">
                                                {msg.content}
                                                <div className="hn-chat-bubble-time">
                                                    {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {isMe && <CheckCheck size={12} style={{ marginLeft: 4 }} />}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* AI SUGGESTIONS BAR */}
                            {aiAnalysis && (
                                <div className="hn-chat-ai-suggestions">
                                    <div className="hn-chat-ai-banner">
                                        <Sparkles size={12} />
                                        <span>AI Context: {aiAnalysis.summary}</span>
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
                                        placeholder="Type a message..."
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
                                    <MessageSquare size={48} />
                                </div>
                                <h2>Your Conversations</h2>
                                <p>Select a person from the left to view your history or start a new medical discussion.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .hn-messages-container {
                    display: grid;
                    grid-template-columns: 320px 1fr;
                    height: calc(100vh - 100px);
                    background: white;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                    overflow: hidden;
                    box-shadow: 0 4px 20px -5px rgba(0,0,0,0.05);
                }

                .hn-messages-sidebar {
                    border-right: 1px solid #f1f5f9;
                    display: flex;
                    flex-direction: column;
                    background: #fcfdfe;
                }

                .hn-messages-sidebar-header {
                    padding: 20px;
                    border-bottom: 1px solid #f1f5f9;
                }

                .hn-messages-title {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin-bottom: 15px;
                }

                .hn-messages-search {
                    position: relative;
                }

                .hn-messages-search-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                }

                .hn-messages-search input {
                    width: 100%;
                    padding: 8px 12px 8px 36px;
                    border-radius: 10px;
                    border: 1.5px solid #e2e8f0;
                    background: #f8fafc;
                    font-size: 0.82rem;
                    outline: none;
                    transition: all 0.2s;
                }

                .hn-messages-search input:focus {
                    border-color: #2563eb;
                    background: white;
                    box-shadow: 0 0 0 3px rgba(37,99,235,0.06);
                }

                .hn-messages-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 10px;
                }

                .hn-messages-item {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    border-radius: 12px;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: left;
                    margin-bottom: 4px;
                }

                .hn-messages-item:hover {
                    background: #f1f5f9;
                }

                .hn-messages-item.active {
                    background: #eff6ff;
                }

                .hn-messages-item-avatar {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #2563eb, #10b981);
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 700;
                    position: relative;
                }

                .hn-messages-item-avatar img {
                    width: 100%;
                    height: 100%;
                    border-radius: 12px;
                    object-fit: cover;
                }

                .hn-messages-online-dot {
                    position: absolute;
                    bottom: -2px;
                    right: -2px;
                    width: 12px;
                    height: 12px;
                    background: #10b981;
                    border: 2px solid white;
                    border-radius: 50%;
                }

                .hn-messages-item-info {
                    flex: 1;
                    min-width: 0;
                }

                .hn-messages-item-name {
                    font-weight: 700;
                    font-size: 0.88rem;
                    color: #0f172a;
                    margin-bottom: 2px;
                }

                .hn-messages-item-last {
                    font-size: 0.75rem;
                    color: #64748b;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .hn-messages-item-time {
                    font-size: 0.7rem;
                    color: #94a3b8;
                }

                .hn-messages-main {
                    display: flex;
                    flex-direction: column;
                    background: white;
                }

                .hn-chat-header {
                    padding: 16px 24px;
                    border-bottom: 1px solid #f1f5f9;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(255,255,255,0.8);
                    backdrop-filter: blur(8px);
                }

                .hn-chat-header-user {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .hn-chat-header-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    background: #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    color: #64748b;
                }

                .hn-chat-header-name {
                    font-weight: 800;
                    size: 0.95rem;
                    color: #0f172a;
                }

                .hn-chat-header-status {
                    font-size: 0.72rem;
                    color: #10b981;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-weight: 600;
                }

                .online-indicator {
                    width: 6px;
                    height: 6px;
                    background: #10b981;
                    border-radius: 50%;
                }

                .hn-chat-header-actions {
                    display: flex;
                    gap: 8px;
                }

                .hn-chat-icon-btn {
                    padding: 8px;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    color: #94a3b8;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .hn-chat-icon-btn:hover {
                    background: #f1f5f9;
                    color: #475569;
                }

                .hn-chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    background: #fafbfc;
                }

                .hn-chat-bubble-wrap {
                    display: flex;
                    width: 100%;
                }

                .hn-chat-bubble-wrap.mine {
                    justify-content: flex-end;
                }

                .hn-chat-bubble {
                    max-width: 75%;
                    padding: 12px 16px;
                    border-radius: 18px;
                    font-size: 0.88rem;
                    line-height: 1.5;
                    position: relative;
                }

                .mine .hn-chat-bubble {
                    background: #2563eb;
                    color: white;
                    border-bottom-right-radius: 4px;
                    box-shadow: 0 4px 12px rgba(37,99,235,0.2);
                }

                .theirs .hn-chat-bubble {
                    background: white;
                    color: #1e293b;
                    border-bottom-left-radius: 4px;
                    border: 1px solid #e2e8f0;
                }

                .hn-chat-bubble-time {
                    font-size: 0.65rem;
                    margin-top: 4px;
                    display: flex;
                    align-items: center;
                    opacity: 0.8;
                }

                .mine .hn-chat-bubble-time {
                    justify-content: flex-end;
                    color: rgba(255,255,255,0.8);
                }

                .theirs .hn-chat-bubble-time {
                    color: #94a3b8;
                }

                .hn-chat-input-area {
                    padding: 20px 24px;
                    background: white;
                    border-top: 1px solid #f1f5f9;
                }

                .hn-chat-form {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: #f8fafc;
                    padding: 6px 6px 6px 12px;
                    border-radius: 14px;
                    border: 1.5px solid #e2e8f0;
                    transition: all 0.2s;
                }

                .hn-chat-form:focus-within {
                    border-color: #2563eb;
                    background: white;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
                }

                .hn-chat-input {
                    flex: 1;
                    border: none;
                    background: transparent;
                    padding: 8px 0;
                    font-size: 0.9rem;
                    outline: none;
                    font-family: inherit;
                }

                .hn-chat-input-btn {
                    padding: 8px;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    color: #94a3b8;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .hn-chat-input-btn:hover {
                    color: #2563eb;
                    background: #eff6ff;
                }

                .hn-chat-send-btn {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    background: #2563eb;
                    color: white;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 10px rgba(37,99,235,0.3);
                }

                .hn-chat-send-btn:hover:not(:disabled) {
                    background: #1d4ed8;
                    transform: scale(1.05);
                }

                .hn-chat-send-btn:disabled {
                    background: #cbd5e1;
                    box-shadow: none;
                    cursor: not-allowed;
                }

                .hn-chat-placeholder {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #fcfdfe;
                }

                .hn-chat-placeholder-content {
                    text-align: center;
                    max-width: 320px;
                }

                .hn-chat-placeholder-icon {
                    width: 80px;
                    height: 80px;
                    border-radius: 24px;
                    background: #eff6ff;
                    color: #2563eb;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                }

                .hn-chat-placeholder h2 {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin-bottom: 8px;
                }

                .hn-chat-placeholder p {
                    font-size: 0.85rem;
                    color: #64748b;
                    line-height: 1.5;
                }

                .hn-chat-start-prompt {
                    margin: auto;
                    text-align: center;
                    max-width: 300px;
                }

                .hn-chat-start-icon {
                    width: 64px;
                    height: 64px;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 20px;
                    color: #2563eb;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 16px;
                }

                .hn-chat-start-prompt h3 {
                    font-weight: 700;
                    margin-bottom: 8px;
                }

                .hn-chat-start-prompt p {
                    font-size: 0.75rem;
                    color: #64748b;
                    line-height: 1.6;
                }

                .hn-spinner-sm {
                    width: 20px;
                    height: 20px;
                    border: 2px solid #e2e8f0;
                    border-top-color: #2563eb;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                    margin: 20px auto;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .hn-chat-ai-suggestions {
                    padding: 8px 16px;
                    background: #f8fafc;
                    border-top: 1px solid #f1f5f9;
                }

                .hn-chat-ai-banner {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.7rem;
                    color: #2563eb;
                    font-weight: 800;
                    text-transform: uppercase;
                    margin-bottom: 8px;
                    letter-spacing: 0.05em;
                }

                .hn-chat-ai-replies {
                    display: flex;
                    gap: 8px;
                    flex-wrap: nowrap;
                    overflow-x: auto;
                    padding-bottom: 4px;
                }

                .hn-chat-ai-reply-btn {
                    white-space: nowrap;
                    padding: 6px 12px;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 100px;
                    font-size: 0.75rem;
                    color: #475569;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-weight: 600;
                }

                .hn-chat-ai-reply-btn:hover {
                    border-color: #2563eb;
                    color: #2563eb;
                    background: #eff6ff;
                }

                .animate-spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </AppLayout>
    );
}

export default MessagesPage;
