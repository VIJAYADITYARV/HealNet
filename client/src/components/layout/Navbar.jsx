import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout, reset } from '../../features/auth/authSlice'
import { toggleAnonymousMode } from '../../features/profile/profileSlice'
import axios from 'axios'
import {
    Activity, Search, PenSquare, LogOut, Shield, Eye, MessageSquare, Bell, X, CheckCheck
} from 'lucide-react'

function Navbar() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { user } = useSelector((s) => s.auth)
    const { profile } = useSelector((s) => s.profile)
    const [query, setQuery] = useState('')
    const [showNotifs, setShowNotifs] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const notifRef = useRef(null)

    const isAnon = profile?.isAnonymous ?? user?.isAnonymous ?? false

    // Fetch notifications
    useEffect(() => {
        if (!user?.token) return
        const fetchNotifs = async () => {
            try {
                const { data } = await axios.get('/api/notifications', {
                    headers: { Authorization: `Bearer ${user.token}` }
                })
                setNotifications(data)
                setUnreadCount(data.filter(n => !n.read).length)
            } catch (err) {
                // Silently handle — notifications might not exist yet
                setNotifications([])
            }
        }
        fetchNotifs()
        const interval = setInterval(fetchNotifs, 30000) // Poll every 30s
        return () => clearInterval(interval)
    }, [user])

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const markAllRead = async () => {
        try {
            await axios.patch('/api/notifications/read-all', {}, {
                headers: { Authorization: `Bearer ${user.token}` }
            })
            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
            setUnreadCount(0)
        } catch (err) { }
    }

    const onLogout = () => {
        dispatch(logout())
        dispatch(reset())
        navigate('/welcome')
    }

    const handleSearch = (e) => {
        e.preventDefault()
        if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }

    const handleAnonToggle = () => {
        if (!user) { navigate('/login'); return }
        dispatch(toggleAnonymousMode())
    }

    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : 'U'

    const timeAgo = (date) => {
        const mins = Math.floor((Date.now() - new Date(date)) / 60000)
        if (mins < 1) return 'Just now'
        if (mins < 60) return `${mins}m ago`
        if (mins < 1440) return `${Math.floor(mins / 60)}h ago`
        return `${Math.floor(mins / 1440)}d ago`
    }

    return (
        <header className="hn-navbar">
            {/* Logo */}
            <button
                className="hn-navbar-logo"
                onClick={() => navigate('/')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 8 }}
            >
                <div className="hn-navbar-logo-badge">
                    <Activity size={16} color="white" />
                </div>
                <span className="hn-navbar-logo-name">HealNet</span>
            </button>

            {/* Search */}
            <form className="hn-navbar-search" onSubmit={handleSearch}>
                <Search size={15} className="hn-navbar-search-icon" />
                <input
                    className="hn-navbar-search-input"
                    placeholder="Search symptoms, conditions, hospitals, treatments…"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                />
            </form>

            {/* Right actions */}
            <div className="hn-navbar-right">
                {/* Anonymous toggle */}
                <button
                    className={`hn-anon-toggle ${isAnon ? 'active' : ''}`}
                    onClick={handleAnonToggle}
                    title={isAnon ? 'Anonymous mode ON — click to disable' : 'Anonymous mode OFF — click to enable'}
                >
                    {isAnon ? <Shield size={13} /> : <Eye size={13} />}
                </button>

                {/* Share Experience */}
                <button
                    className="hn-share-btn"
                    onClick={() => navigate('/share-experience')}
                >
                    <PenSquare size={13} />
                    <span>Share Experience</span>
                </button>

                {/* Messages */}
                {user && (
                    <button
                        className="hn-anon-toggle"
                        onClick={() => navigate('/messages')}
                        title="Messages"
                    >
                        <MessageSquare size={13} />
                    </button>
                )}

                {/* Notifications */}
                {user && (
                    <div ref={notifRef} style={{ position: 'relative' }}>
                        <button
                            className="hn-anon-toggle"
                            title="Notifications"
                            style={{ position: 'relative' }}
                            onClick={() => setShowNotifs(!showNotifs)}
                        >
                            <Bell size={13} />
                            {unreadCount > 0 && (
                                <span style={{
                                    position: 'absolute', top: 1, right: 3,
                                    minWidth: 14, height: 14, borderRadius: '50%',
                                    background: '#ef4444', border: '2px solid #0f172a',
                                    fontSize: '0.55rem', fontWeight: 800, color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        {showNotifs && (
                            <div style={{
                                position: 'absolute', top: '110%', right: 0,
                                width: 340, maxHeight: 420, overflowY: 'auto',
                                background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 16, boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
                                zIndex: 200, animation: 'sosSlideUp 0.2s ease'
                            }}>
                                <style>{`
                                    @keyframes sosSlideUp { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
                                `}</style>
                                <div style={{
                                    padding: '14px 16px', display: 'flex', alignItems: 'center',
                                    justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)'
                                }}>
                                    <span style={{ color: 'white', fontWeight: 700, fontSize: '0.88rem' }}>Notifications</span>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        {unreadCount > 0 && (
                                            <button onClick={markAllRead} style={{
                                                background: 'none', border: 'none', color: '#38bdf8',
                                                fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: 4
                                            }}>
                                                <CheckCheck size={12} /> Mark all read
                                            </button>
                                        )}
                                        <button onClick={() => setShowNotifs(false)} style={{
                                            background: 'none', border: 'none', color: '#64748b', cursor: 'pointer'
                                        }}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div style={{ padding: '6px' }}>
                                    {notifications.length === 0 ? (
                                        <div style={{ padding: '30px 16px', textAlign: 'center' }}>
                                            <Bell size={28} color="#334155" style={{ margin: '0 auto 10px' }} />
                                            <p style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 600, margin: '0 0 4px' }}>No notifications yet</p>
                                            <p style={{ color: '#475569', fontSize: '0.72rem', margin: 0 }}>When someone interacts with your health journeys, you'll see it here.</p>
                                        </div>
                                    ) : (
                                        notifications.slice(0, 10).map((n, i) => (
                                            <div key={n._id || i} style={{
                                                padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                                                background: n.read ? 'transparent' : 'rgba(56,189,248,0.06)',
                                                borderLeft: n.read ? 'none' : '3px solid #38bdf8',
                                                transition: 'background 0.15s', marginBottom: 2
                                            }}
                                                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                                                onMouseOut={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(56,189,248,0.06)'}
                                            >
                                                <div style={{ fontSize: '0.8rem', color: 'white', fontWeight: n.read ? 500 : 600, lineHeight: 1.4, marginBottom: 4 }}>
                                                    {n.message || n.content || 'New activity on your health journey'}
                                                </div>
                                                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{timeAgo(n.createdAt)}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* User avatar + name */}
                {user && (
                    <div
                        style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}
                        onClick={() => navigate(`/profile/${user.username || user._id}`)}
                        title="My Profile"
                    >
                        <div className="hn-avatar-sm">{initials}</div>
                    </div>
                )}

                {/* Logout */}
                <button className="hn-logout-btn" onClick={onLogout}>
                    <LogOut size={12} />
                </button>
            </div>
        </header>
    )
}

export default Navbar
