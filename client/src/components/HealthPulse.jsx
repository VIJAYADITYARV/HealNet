import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
    Activity, Brain, ShieldCheck, TrendingUp, Heart, Zap,
    MessageSquare, BookOpen, AlertTriangle, ChevronRight
} from 'lucide-react'

/* Animated number counter */
function Counter({ end, duration = 1800 }) {
    const [val, setVal] = useState(0)
    useEffect(() => {
        let start = 0
        const step = end / (duration / 16)
        const t = setInterval(() => {
            start += step
            if (start >= end) { setVal(end); clearInterval(t) }
            else setVal(Math.floor(start))
        }, 16)
        return () => clearInterval(t)
    }, [end, duration])
    return <>{val.toLocaleString()}</>
}

export default function HealthPulse() {
    const navigate = useNavigate()
    const { user } = useSelector((s) => s.auth)
    const [time, setTime] = useState(new Date())

    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 60000)
        return () => clearInterval(t)
    }, [])

    const greeting = time.getHours() < 12 ? 'Good morning' : time.getHours() < 17 ? 'Good afternoon' : 'Good evening'
    const firstName = user?.name?.split(' ')[0] || 'there'

    const quickActions = [
        { icon: Brain, label: 'AI Symptom Check', desc: 'Analyze symptoms', route: '/ai-symptom-check', color: '#818cf8', bg: 'rgba(129,140,248,0.1)' },
        { icon: BookOpen, label: 'Share Journey', desc: 'Help the community', route: '/share-experience', color: '#38bdf8', bg: 'rgba(56,189,248,0.1)' },
        { icon: TrendingUp, label: 'Health Trends', desc: 'View analytics', route: '/analytics', color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
        { icon: MessageSquare, label: 'Messages', desc: 'Peer support', route: '/messages', color: '#f472b6', bg: 'rgba(244,114,182,0.1)' },
    ]

    return (
        <div style={{ marginBottom: 20 }}>
            {/* Greeting Banner */}
            <div style={{
                background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                borderRadius: 20, padding: '24px 28px', marginBottom: 16,
                position: 'relative', overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.06)'
            }}>
                <div style={{ position: 'absolute', top: -20, right: -10, opacity: 0.04 }}>
                    <Activity size={160} color="white" strokeWidth={1} />
                </div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <div style={{
                            width: 8, height: 8, borderRadius: '50%', background: '#34d399',
                            boxShadow: '0 0 8px rgba(52,211,153,0.5)',
                            animation: 'pulse 2s ease-in-out infinite'
                        }} />
                        <span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Live Health Network
                        </span>
                    </div>
                    <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                        {greeting}, {firstName} 👋
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
                        Your health intelligence dashboard is active. <span style={{ color: '#38bdf8' }}><Counter end={1247} /> patients</span> online now.
                    </p>
                </div>

                {/* Mini stats row */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12,
                    marginTop: 20, position: 'relative', zIndex: 1
                }}>
                    {[
                        { icon: Heart, label: 'Your Health Score', value: '92%', color: '#34d399' },
                        { icon: ShieldCheck, label: 'Privacy Level', value: 'Max', color: '#38bdf8' },
                        { icon: AlertTriangle, label: 'Risk Alerts', value: '0', color: '#fbbf24' },
                    ].map((s, i) => (
                        <div key={i} style={{
                            background: 'rgba(255,255,255,0.04)', borderRadius: 12,
                            padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex', alignItems: 'center', gap: 10
                        }}>
                            <s.icon size={18} color={s.color} />
                            <div>
                                <div style={{ color: 'white', fontSize: '1rem', fontWeight: 800 }}>{s.value}</div>
                                <div style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
                {quickActions.map((a, i) => (
                    <button key={i} onClick={() => navigate(a.route)} style={{
                        background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                        borderRadius: 14, padding: '16px 14px', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10,
                        transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)', fontFamily: 'inherit',
                        backdropFilter: 'blur(20px)', boxShadow: 'var(--shadow-card)'
                    }}
                        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = a.color }}
                        onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--card-border)' }}
                    >
                        <div style={{
                            width: 40, height: 40, borderRadius: 12, background: a.bg,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <a.icon size={20} color={a.color} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)', marginBottom: 2 }}>{a.label}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{a.desc}</div>
                        </div>
                        <ChevronRight size={14} color={a.color} style={{ marginLeft: 'auto' }} />
                    </button>
                ))}
            </div>
        </div>
    )
}
