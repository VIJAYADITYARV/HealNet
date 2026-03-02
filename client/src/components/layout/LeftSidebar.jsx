import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { getUserProfile } from '../../features/profile/profileSlice'
import request from 'axios'
import {
    Home, Brain, BookOpen, Bookmark, Building2,
    TrendingUp, Users, ShieldCheck, Settings, Scale, UserCircle
} from 'lucide-react'

const NAV_ITEMS = [
    { icon: Home, label: 'Home', route: '/' },
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

    const badge = profile?.badge || 'new'
    const trustLabel = badge === 'verified' ? 'Verified Patient' : badge === 'contributor' ? 'Contributor' : 'New Member'

    const stats = profile?.stats || { experiencesShared: 0, insightsExplored: 0, communityImpact: 0 }

    return (
        <aside className="hn-left">
            {/* User identity card */}
            <div className="hn-user-card">
                <div className="hn-user-card-top">
                    <div className="hn-avatar-lg">{initials}</div>
                    <div>
                        <div className="hn-user-name">{user?.name}</div>
                        <span className={`hn-trust-badge ${badge}`}>{trustLabel}</span>
                    </div>
                </div>
                <div className="hn-user-stats">
                    <div className="hn-stat-item">
                        <div className="hn-stat-val">{stats.experiencesShared}</div>
                        <div className="hn-stat-lbl">Experiences<br />Shared</div>
                    </div>
                    <div className="hn-stat-item">
                        <div className="hn-stat-val">{stats.insightsExplored}</div>
                        <div className="hn-stat-lbl">Insights<br />Explored</div>
                    </div>
                    <div className="hn-stat-item">
                        <div className="hn-stat-val">{stats.communityImpact}</div>
                        <div className="hn-stat-lbl">Community<br />Impact</div>
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
                        className="hn-sidenav-item"
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
