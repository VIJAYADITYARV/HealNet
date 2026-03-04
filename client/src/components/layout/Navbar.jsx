import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout, reset } from '../../features/auth/authSlice'
import { toggleAnonymousMode } from '../../features/profile/profileSlice'
import {
    Activity, Search, PenSquare, LogOut, Shield, Eye, MessageSquare
} from 'lucide-react'

function Navbar() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { user } = useSelector((s) => s.auth)
    const { profile } = useSelector((s) => s.profile)
    const [query, setQuery] = useState('')

    // Initialize anonymous state from profile (falls back to local if profile not yet loaded)
    const isAnon = profile?.isAnonymous ?? user?.isAnonymous ?? false

    const onLogout = () => {
        dispatch(logout())
        dispatch(reset())
        navigate('/login')
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
                    <span style={{ display: 'none' }} className="sm:inline">
                        {isAnon ? 'Anonymous' : 'Visible'}
                    </span>
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

                {/* User avatar + name */}
                {user && (
                    <div
                        style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}
                        onClick={() => navigate(`/profile/${user.username || user._id}`)}
                        title="My Profile"
                    >
                        <div className="hn-avatar-sm">{initials}</div>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', display: 'none' }}>
                            {user.name?.split(' ')[0]}
                        </span>
                    </div>
                )}

                {/* Logout */}
                <button className="hn-logout-btn" onClick={onLogout}>
                    <LogOut size={12} />
                    <span style={{ display: 'none' }}>Logout</span>
                </button>
            </div>
        </header>
    )
}

export default Navbar
