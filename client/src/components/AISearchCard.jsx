import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mic, MapPin, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react'

const CHIPS = [
    'Chest pain', 'Migraine', 'Fertility', 'Knee surgery', 'Skin allergy',
    'Diabetes', 'Back pain', 'Anxiety',
]

const URGENCY = [
    { label: 'Mild', color: '#059669' },
    { label: 'Moderate', color: '#d97706' },
    { label: 'Severe', color: '#dc2626' },
]

function AISearchCard() {
    const navigate = useNavigate()
    const [focused, setFocused] = useState(false)
    const [text, setText] = useState('')
    const [urgency, setUrgency] = useState(null)
    const [location, setLocation] = useState('')
    const textareaRef = useRef(null)

    const handleChip = (chip) => {
        setText(prev => prev ? `${prev}, ${chip}` : chip)
        textareaRef.current?.focus()
    }

    const handleSubmit = () => {
        if (text.trim()) navigate(`/ai-symptom-check?q=${encodeURIComponent(text.trim())}`)
    }

    return (
        <div className="hn-ai-card" onClick={() => textareaRef.current?.focus()}>
            {/* Header label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Sparkles size={14} color="#2563eb" />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    AI Symptom Check
                </span>
            </div>

            {/* Main input */}
            <textarea
                ref={textareaRef}
                className="hn-ai-input"
                placeholder="Describe your symptoms or health concern…"
                value={text}
                onChange={e => setText(e.target.value)}
                onFocus={() => setFocused(true)}
                rows={focused || text ? 3 : 1}
                style={{ transition: 'all 0.3s ease' }}
                onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleSubmit() }}
            />

            {/* Quick chips */}
            <div className="hn-chips">
                {CHIPS.map(chip => (
                    <button key={chip} className="hn-chip" onClick={() => handleChip(chip)}>
                        {chip}
                    </button>
                ))}
            </div>

            {/* Expanded controls — show on focus or when text exists */}
            {(focused || text) && (
                <div className="hn-ai-expanded">
                    {/* Voice */}
                    <button className="hn-ai-action-btn" title="Voice input">
                        <Mic size={13} />
                        Voice
                    </button>

                    {/* Location */}
                    <button
                        className="hn-ai-action-btn"
                        onClick={() => setLocation(prev => prev ? '' : 'Detecting…')}
                        title="My location"
                    >
                        <MapPin size={13} />
                        {location || 'Location'}
                    </button>

                    {/* Urgency */}
                    {URGENCY.map(u => (
                        <button
                            key={u.label}
                            className="hn-ai-action-btn"
                            onClick={() => setUrgency(urgency === u.label ? null : u.label)}
                            style={urgency === u.label
                                ? { borderColor: u.color, color: u.color, background: `${u.color}15` }
                                : {}
                            }
                        >
                            <AlertTriangle size={13} style={{ color: u.color }} />
                            {u.label}
                        </button>
                    ))}

                    {/* Submit */}
                    <button className="hn-ai-submit" onClick={handleSubmit}>
                        <ArrowRight size={13} />
                        Analyse
                    </button>
                </div>
            )}
        </div>
    )
}

export default AISearchCard
