import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import { toggleAnonymousMode, getUserProfile } from '../features/profile/profileSlice'
import { Settings, Shield, Eye, Bell, Moon, Globe, Lock, ChevronRight, Key } from 'lucide-react'
import MFASetup from '../components/MFASetup'

function ToggleRow({ icon: Icon, label, desc, active, onToggle }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 0', borderBottom: '1px solid #f1f5f9',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                    width: 36, height: 36, borderRadius: 10, background: '#eff6ff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Icon size={16} color="#2563eb" />
                </div>
                <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{label}</div>
                    {desc && <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>{desc}</div>}
                </div>
            </div>
            <button onClick={onToggle} style={{
                width: 44, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer',
                background: active ? '#2563eb' : '#e2e8f0', position: 'relative', transition: 'background 0.2s',
            }}>
                <div style={{
                    width: 18, height: 18, borderRadius: '50%', background: 'white',
                    position: 'absolute', top: 3,
                    left: active ? 23 : 3, transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                }} />
            </button>
        </div>
    )
}

function LinkRow({ icon: Icon, label, desc, onClick }) {
    return (
        <button onClick={onClick} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 0', borderBottom: '1px solid #f1f5f9', width: '100%',
            background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                    width: 36, height: 36, borderRadius: 10, background: '#f8fafc',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Icon size={16} color="#64748b" />
                </div>
                <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{label}</div>
                    {desc && <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>{desc}</div>}
                </div>
            </div>
            <ChevronRight size={16} color="#94a3b8" />
        </button>
    )
}

function SettingsPage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user } = useSelector(s => s.auth)
    const { profile } = useSelector(s => s.profile)
    const [darkMode, setDarkMode] = useState(false)
    const [notifications, setNotifications] = useState(true)

    const isAnon = profile?.isAnonymous ?? user?.isAnonymous ?? false

    useEffect(() => {
        if (!user) { navigate('/login'); return }
        dispatch(getUserProfile())
    }, [dispatch, user, navigate])

    if (!user) return null

    return (
        <AppLayout>
            <div className="hn-section-title">
                <Settings size={16} />
                Settings
            </div>

            {/* Privacy & Identity */}
            <div style={{
                background: 'var(--card-bg)', borderRadius: 14, padding: '4px 20px',
                boxShadow: 'var(--shadow-card)', backdropFilter: 'blur(20px)',
                border: '1px solid var(--card-border)', marginBottom: 16,
            }}>
                <div style={{ padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>
                        Privacy & Identity
                    </div>
                </div>
                <ToggleRow
                    icon={Shield} label="Anonymous Mode"
                    desc="Hide your identity when sharing experiences"
                    active={isAnon}
                    onToggle={() => dispatch(toggleAnonymousMode())}
                />
                <LinkRow icon={Lock} label="Privacy Center" desc="Data controls and privacy settings"
                    onClick={() => navigate('/privacy')} />
            </div>

            {/* Preferences */}
            <div style={{
                background: 'var(--card-bg)', borderRadius: 14, padding: '4px 20px',
                boxShadow: 'var(--shadow-card)', backdropFilter: 'blur(20px)',
                border: '1px solid var(--card-border)', marginBottom: 16,
            }}>
                <div style={{ padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>
                        Preferences
                    </div>
                </div>
                <ToggleRow
                    icon={Bell} label="Notifications"
                    desc="Email alerts for saved insights and community replies"
                    active={notifications}
                    onToggle={() => setNotifications(p => !p)}
                />
                <ToggleRow
                    icon={Moon} label="Dark Mode"
                    desc="Reduce eye strain with a darker interface"
                    active={darkMode}
                    onToggle={() => setDarkMode(p => !p)}
                />
                <LinkRow icon={Globe} label="Language & Region"
                    desc="English (India)" onClick={() => { }} />
            </div>

            {/* Security */}
            <div style={{
                background: 'var(--card-bg)', borderRadius: 14, padding: '4px 20px',
                boxShadow: 'var(--shadow-card)', backdropFilter: 'blur(20px)',
                border: '1px solid var(--card-border)', marginBottom: 16,
            }}>
                <div style={{ padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>
                        Security
                    </div>
                </div>
                <MFASetup
                    user={user}
                    mfaEnabled={profile?.mfaEnabled || user?.mfaEnabled}
                    onMFAActivated={() => dispatch(getUserProfile())}
                />
            </div>

            {/* Account */}
            <div style={{
                background: 'var(--card-bg)', borderRadius: 14, padding: '4px 20px',
                boxShadow: 'var(--shadow-card)', backdropFilter: 'blur(20px)',
                border: '1px solid var(--card-border)',
            }}>
                <div style={{ padding: '14px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>
                        Account
                    </div>
                </div>
                <div style={{ padding: '14px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: 'linear-gradient(135deg,#2563eb,#60a5fa)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '0.88rem', fontWeight: 700,
                    }}>
                        {(user.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{user.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{user.email}</div>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}

export default SettingsPage
