import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { getUserProfile } from '../../features/profile/profileSlice'
import {
    Home, Brain, BookOpen, Bookmark, Building2,
    TrendingUp, Users, ShieldCheck, Settings, Scale, UserCircle, Award, HeartHandshake, Sparkles
} from 'lucide-react'

const NAV_ITEMS = [
    { icon: Home, label: 'Home', route: '/' },
    { icon: BookOpen, label: 'My Journey', route: '/my-journey' },
    { icon: Brain, label: 'AI Symptom Check', route: '/ai-symptom-check' },
    { icon: Scale, label: 'Compare Options', route: '/compare' },
    { icon: Bookmark, label: 'Saved Insights', route: '/saved' },
    { icon: Building2, label: 'Hospitals', route: '/hospitals' },
    { icon: TrendingUp, label: 'Health Trends', route: '/analytics' },
    { icon: Users, label: 'Community', route: '/community' },
]

const SECONDARY = [
    { icon: UserCircle, label: 'Health Profile', route: '/health-profile' },
    { icon: ShieldCheck, label: 'Privacy Center', route: '/privacy' },
    { icon: Settings, label: 'Settings', route: '/settings' },
]

function LeftSidebar() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useSelector((s) => s.auth)
    const { profile } = useSelector((s) => s.profile)

    useEffect(() => {
        if (user) dispatch(getUserProfile())
    }, [dispatch, user])

    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : 'U'

    const badge = profile?.badge || 'verified'
    const trustLabel = badge === 'verified' ? 'Verified Patient' : badge === 'contributor' ? 'Community Hero' : 'New Member'

    const stats = profile?.stats || { experiencesShared: 1, insightsExplored: 12, communityImpact: 45 }

    return (
        <aside className="hn-left">
            {/* User Gamification & Identity Card */}
            <div className="hn-user-card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -15, right: -15, opacity: 0.06, color: '#3b82f6' }}>
                    <ShieldCheck size={80} />
                </div>

                <div className="hn-user-card-top" style={{ position: 'relative', zIndex: 1 }}>
                    <div className="hn-avatar-lg" style={{ boxShadow: '0 3px 10px rgba(37,99,235,0.3)', border: '2px solid rgba(255,255,255,0.8)' }}>
                        {initials}
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div className="hn-user-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                            <span className={`hn-trust-badge ${badge}`} style={{ background: 'linear-gradient(90deg, #10b981, #34d399)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 2px 5px rgba(16,185,129,0.3)', width: 'fit-content' }}>
                                <ShieldCheck size={10} style={{ marginRight: 2 }} /> {trustLabel}
                            </span>

                            {/* Gamification Badges Section - Now aligned with name */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'rgba(56, 189, 248, 0.12)', color: '#0284c7', padding: '2px 8px', borderRadius: 6, fontSize: '0.6rem', fontWeight: 800, border: '1px solid rgba(56, 189, 248, 0.2)', whiteSpace: 'nowrap' }}>
                                    <HeartHandshake size={10} /> Empathy Hero
                                </div>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'rgba(168, 85, 247, 0.12)', color: '#9333ea', padding: '2px 8px', borderRadius: 6, fontSize: '0.6rem', fontWeight: 800, border: '1px solid rgba(168, 85, 247, 0.2)', whiteSpace: 'nowrap' }}>
                                    <Sparkles size={10} /> Top 5%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trust Score & Stats */}
                <div className="hn-user-stats" style={{ position: 'relative', zIndex: 1, paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    <div className="hn-stat-item">
                        <div className="hn-stat-val" style={{ color: '#0f172a' }}>{stats.experiencesShared}</div>
                        <div className="hn-stat-lbl">Journeys<br />Shared</div>
                    </div>
                    <div className="hn-stat-item">
                        <div className="hn-stat-val" style={{ color: '#0f172a' }}>{stats.insightsExplored}</div>
                        <div className="hn-stat-lbl">Insights<br />Saved</div>
                    </div>
                    <div className="hn-stat-item">
                        <div className="hn-stat-val" style={{ color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                            {stats.communityImpact} <Award size={14} color="#10b981" />
                        </div>
                        <div className="hn-stat-lbl">Trust<br />Score</div>
                    </div>
                </div>
            </div>

            {/* Main nav */}
            <nav className="hn-sidenav">
                {NAV_ITEMS.map(({ icon: Icon, label, route }) => (
                    <button
                        key={route}
                        className={`hn-sidenav-item ${location.pathname === route ? 'active' : ''}`}
                        onClick={() => navigate(route)}
                    >
                        <Icon size={16} strokeWidth={1.8} />
                        {label}
                    </button>
                ))}
                <div className="hn-sidenav-divider" />
                {SECONDARY.map(({ icon: Icon, label, route }) => (
                    <button
                        key={route}
                        className={`hn-sidenav-item ${location.pathname === route ? 'active' : ''}`}
                        onClick={() => navigate(route)}
                    >
                        <Icon size={16} strokeWidth={1.8} />
                        {label}
                    </button>
                ))}
            </nav>
        </aside>
    )
}

export default LeftSidebar
