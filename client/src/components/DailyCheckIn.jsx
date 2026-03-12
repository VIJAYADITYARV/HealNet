import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Smile, Frown, Meh, ThumbsUp, Sun, Moon, Activity, CheckCircle, X } from 'lucide-react'

const MOODS = [
    { icon: Smile, label: 'Great', color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
    { icon: ThumbsUp, label: 'Good', color: '#38bdf8', bg: 'rgba(56,189,248,0.1)' },
    { icon: Meh, label: 'Okay', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
    { icon: Frown, label: 'Not Well', color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
]

const SYMPTOMS_TODAY = [
    'Headache', 'Fatigue', 'Body Pain', 'Anxiety', 'Insomnia',
    'Nausea', 'Dizziness', 'Cough', 'None'
]

export default function DailyCheckIn() {
    const { user } = useSelector(s => s.auth)
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState(1)
    const [mood, setMood] = useState(null)
    const [symptoms, setSymptoms] = useState([])
    const [pain, setPain] = useState(3)
    const [submitted, setSubmitted] = useState(false)

    // Check if already checked in today (stored in localStorage)
    const todayKey = `healnet_checkin_${user?._id}_${new Date().toDateString()}`
    const alreadyDone = localStorage.getItem(todayKey)

    if (alreadyDone && !open) return null

    const toggleSymptom = (s) => {
        if (s === 'None') { setSymptoms(['None']); return }
        setSymptoms(prev => prev.filter(x => x !== 'None').includes(s)
            ? prev.filter(x => x !== s)
            : [...prev.filter(x => x !== 'None'), s]
        )
    }

    const handleSubmit = () => {
        localStorage.setItem(todayKey, JSON.stringify({ mood, symptoms, pain, ts: Date.now() }))
        setSubmitted(true)
        setTimeout(() => { setOpen(false); setSubmitted(false) }, 2000)
    }

    if (!open) {
        return (
            <button onClick={() => setOpen(true)} style={{
                width: '100%', padding: '14px 20px', background: 'linear-gradient(135deg, rgba(52,211,153,0.08), rgba(56,189,248,0.08))',
                border: '1px solid rgba(52,211,153,0.2)', borderRadius: 14, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
                fontFamily: 'inherit', transition: 'all 0.2s'
            }}
                onMouseOver={e => e.currentTarget.style.borderColor = '#34d399'}
                onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(52,211,153,0.2)'}
            >
                <div style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: 'linear-gradient(135deg, #34d399, #38bdf8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Activity size={20} color="white" />
                </div>
                <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        Daily Health Check-in
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Log your mood & symptoms in 30 seconds
                    </div>
                </div>
                <div style={{
                    marginLeft: 'auto', background: '#34d399', color: 'white',
                    padding: '6px 14px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700
                }}>
                    Check In
                </div>
            </button>
        )
    }

    return (
        <div style={{
            background: 'var(--card-bg)', border: '1px solid var(--card-border)',
            borderRadius: 20, padding: '24px', marginBottom: 16,
            boxShadow: 'var(--shadow-card)', backdropFilter: 'blur(20px)',
            position: 'relative'
        }}>
            <button onClick={() => { setOpen(false); setStep(1); setMood(null); setSymptoms([]); setPain(3) }}
                style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
            </button>

            {submitted ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <CheckCircle size={48} color="#34d399" style={{ marginBottom: 12 }} />
                    <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 800, margin: '0 0 6px' }}>Check-in Complete!</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Your health log has been saved. Stay healthy! 💪</p>
                </div>
            ) : (
                <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                        <Activity size={16} color="#34d399" />
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Daily Check-in — Step {step}/3
                        </span>
                        <div style={{ flex: 1, height: 3, background: 'var(--border)', borderRadius: 999, marginLeft: 8 }}>
                            <div style={{ height: '100%', width: `${(step / 3) * 100}%`, background: 'linear-gradient(90deg, #34d399, #38bdf8)', borderRadius: 999, transition: 'width 0.3s' }} />
                        </div>
                    </div>

                    {step === 1 && (
                        <div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
                                How are you feeling today?
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                                {MOODS.map(m => (
                                    <button key={m.label} onClick={() => { setMood(m.label); setStep(2) }} style={{
                                        padding: '16px 10px', borderRadius: 14, cursor: 'pointer',
                                        border: mood === m.label ? `2px solid ${m.color}` : '1px solid var(--border)',
                                        background: mood === m.label ? m.bg : 'transparent',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                                        fontFamily: 'inherit', transition: 'all 0.2s'
                                    }}>
                                        <m.icon size={28} color={m.color} />
                                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{m.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                                Any symptoms today?
                            </h3>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 14 }}>Select all that apply</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                                {SYMPTOMS_TODAY.map(s => (
                                    <button key={s} onClick={() => toggleSymptom(s)} style={{
                                        padding: '7px 16px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit',
                                        fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.15s',
                                        border: symptoms.includes(s) ? '1px solid #2563eb' : '1px solid var(--border)',
                                        background: symptoms.includes(s) ? 'rgba(37,99,235,0.08)' : 'transparent',
                                        color: symptoms.includes(s) ? '#2563eb' : 'var(--text-secondary)'
                                    }}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setStep(3)} disabled={symptoms.length === 0} style={{
                                width: '100%', padding: '10px', borderRadius: 10, background: symptoms.length > 0 ? '#2563eb' : '#e2e8f0',
                                color: symptoms.length > 0 ? 'white' : '#94a3b8', border: 'none', fontWeight: 700,
                                fontSize: '0.85rem', cursor: symptoms.length > 0 ? 'pointer' : 'default', fontFamily: 'inherit'
                            }}>
                                Continue →
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                                Pain level today?
                            </h3>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 14 }}>1 = minimal, 10 = severe</p>
                            <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                    <button key={n} onClick={() => setPain(n)} style={{
                                        width: 36, height: 36, borderRadius: 10, cursor: 'pointer',
                                        border: pain === n ? '2px solid #2563eb' : '1px solid var(--border)',
                                        background: pain === n ? 'rgba(37,99,235,0.08)' : 'transparent',
                                        color: pain === n ? '#2563eb' : 'var(--text-secondary)',
                                        fontWeight: 700, fontSize: '0.82rem', fontFamily: 'inherit', transition: 'all 0.15s'
                                    }}>
                                        {n}
                                    </button>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button onClick={() => setStep(2)} style={{
                                    flex: 1, padding: '10px', borderRadius: 10, background: 'transparent',
                                    border: '1px solid var(--border)', fontWeight: 600, fontSize: '0.85rem',
                                    cursor: 'pointer', fontFamily: 'inherit', color: 'var(--text-secondary)'
                                }}>
                                    ← Back
                                </button>
                                <button onClick={handleSubmit} style={{
                                    flex: 2, padding: '10px', borderRadius: 10,
                                    background: 'linear-gradient(135deg, #34d399, #2563eb)',
                                    color: 'white', border: 'none', fontWeight: 700, fontSize: '0.85rem',
                                    cursor: 'pointer', fontFamily: 'inherit',
                                    boxShadow: '0 4px 15px rgba(37,99,235,0.3)'
                                }}>
                                    ✓ Submit Check-in
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
