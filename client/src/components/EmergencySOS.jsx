import { useState } from 'react'
import { Phone, X, AlertTriangle, Heart, Stethoscope, Brain } from 'lucide-react'

const EMERGENCY_CONTACTS = [
    { label: 'Emergency (India)', number: '112', icon: AlertTriangle, color: '#ef4444', desc: 'National Emergency' },
    { label: 'Ambulance', number: '108', icon: Heart, color: '#f97316', desc: 'Medical Emergency' },
    { label: 'Health Helpline', number: '104', icon: Stethoscope, color: '#2563eb', desc: 'Health Advisory' },
    { label: 'Mental Health', number: '08046110007', icon: Brain, color: '#8b5cf6', desc: 'iCall Helpline' },
]

export default function EmergencySOS() {
    const [open, setOpen] = useState(false)

    return (
        <>
            {/* Floating SOS Button */}
            <button
                onClick={() => setOpen(!open)}
                style={{
                    position: 'fixed', bottom: 28, right: 28, zIndex: 999,
                    width: 56, height: 56, borderRadius: '50%',
                    background: open ? '#1e293b' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                    border: open ? '2px solid #334155' : '3px solid rgba(239,68,68,0.3)',
                    boxShadow: open ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 25px rgba(239,68,68,0.4), 0 0 0 6px rgba(239,68,68,0.1)',
                    color: 'white', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    animation: open ? 'none' : 'sosPulse 2s infinite'
                }}
            >
                {open ? <X size={24} /> : <Phone size={22} />}
            </button>

            <style>{`
                @keyframes sosPulse {
                    0%, 100% { box-shadow: 0 4px 25px rgba(239,68,68,0.4), 0 0 0 6px rgba(239,68,68,0.1); }
                    50% { box-shadow: 0 4px 25px rgba(239,68,68,0.6), 0 0 0 12px rgba(239,68,68,0.05); }
                }
            `}</style>

            {/* SOS Panel */}
            {open && (
                <div style={{
                    position: 'fixed', bottom: 96, right: 28, zIndex: 998,
                    width: 320, background: '#0f172a', borderRadius: 20,
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    padding: 20, animation: 'sosSlideUp 0.3s ease'
                }}>
                    <style>{`
                        @keyframes sosSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                    `}</style>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <div style={{
                            width: 10, height: 10, borderRadius: '50%', background: '#ef4444',
                            animation: 'pulse 1.5s infinite'
                        }} />
                        <span style={{ color: '#ef4444', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                            Emergency Contacts
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {EMERGENCY_CONTACTS.map((c, i) => (
                            <a key={i} href={`tel:${c.number}`} style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '12px 14px', borderRadius: 14,
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                textDecoration: 'none', transition: 'all 0.2s', cursor: 'pointer'
                            }}
                                onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = c.color }}
                                onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}
                            >
                                <div style={{
                                    width: 40, height: 40, borderRadius: 12,
                                    background: `${c.color}15`, border: `1px solid ${c.color}30`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <c.icon size={18} color={c.color} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'white' }}>{c.label}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{c.desc}</div>
                                </div>
                                <div style={{ color: c.color, fontWeight: 800, fontSize: '0.9rem' }}>{c.number}</div>
                            </a>
                        ))}
                    </div>

                    <p style={{ margin: '14px 0 0', fontSize: '0.68rem', color: '#475569', textAlign: 'center', lineHeight: 1.5 }}>
                        If you're experiencing a medical emergency, please call immediately. HealNet connects you but does not replace professional medical care.
                    </p>
                </div>
            )}
        </>
    )
}
