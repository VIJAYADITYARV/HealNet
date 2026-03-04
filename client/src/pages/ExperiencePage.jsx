import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import { createExperience, reset } from '../features/experiences/experienceSlice'
import { searchHospitals, reset as resetHospitals } from '../features/hospitals/hospitalSlice'
import { PenSquare, Search, MapPin, CheckCircle, Shield, Eye } from 'lucide-react'

const OUTCOMES = [
    { value: 'success', label: '✓ Full Recovery', color: '#059669' },
    { value: 'improvement', label: '↗ Improvement', color: '#2563eb' },
    { value: 'ongoing', label: '⏳ Ongoing Treatment', color: '#d97706' },
    { value: 'no improvement', label: '— No Change', color: '#94a3b8' },
    { value: 'complication', label: '⚠ Complication', color: '#dc2626' },
]

function ExperiencePage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user } = useSelector(s => s.auth)
    const globalIsAnonymous = user?.isAnonymous || false
    const { isLoading, isSuccess, isError, message } = useSelector(s => s.experiences)
    const { searchResults, isLoading: hospitalsLoading } = useSelector(s => s.hospitals)

    const [isAnonymous, setIsAnonymous] = useState(globalIsAnonymous)
    const [formData, setFormData] = useState({
        hospital: '', condition: '', symptoms: '', treatment: '',
        outcome: 'success', recoveryTime: '', description: '', city: '', costRange: '',
    })
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const suggestionRef = useRef(null)

    useEffect(() => {
        if (!user) {
            navigate('/login')
        } else {
            setIsAnonymous(user.isAnonymous)
        }
    }, [user, navigate])

    useEffect(() => {
        if (isSuccess && submitted) {
            setSubmitted(false)
            dispatch(reset())
            navigate('/')
        }
    }, [isSuccess, submitted, dispatch, navigate])

    useEffect(() => {
        function handleClickOutside(e) {
            if (suggestionRef.current && !suggestionRef.current.contains(e.target))
                setShowSuggestions(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        if (formData.hospital.length > 2 && showSuggestions) {
            const t = setTimeout(() => dispatch(searchHospitals(formData.hospital)), 300)
            return () => clearTimeout(t)
        }
    }, [formData.hospital, dispatch, showSuggestions])

    const onChange = e => {
        setFormData(p => ({ ...p, [e.target.name]: e.target.value }))
        if (e.target.name === 'hospital') setShowSuggestions(true)
    }

    const selectHospital = name => {
        setFormData(p => ({ ...p, hospital: name }))
        setShowSuggestions(false)
        dispatch(resetHospitals())
    }

    const onSubmit = e => {
        e.preventDefault()
        dispatch(createExperience({
            ...formData,
            symptoms: formData.symptoms.split(',').map(s => s.trim()).filter(Boolean),
            isAnonymous,
        }))
        setSubmitted(true)
    }

    if (!user) return null

    return (
        <AppLayout>
            <div className="hn-section-title">
                <PenSquare size={16} />
                Share Your Experience
            </div>

            <div style={{
                background: 'white', borderRadius: 14, padding: 24,
                boxShadow: '0 2px 15px -3px rgba(37,99,235,0.07)',
                border: '1px solid #e2e8f0',
            }}>
                <div
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20,
                        padding: '8px 14px', borderRadius: 10,
                        background: isAnonymous ? '#f8fafc' : '#eff6ff',
                        border: `1px solid ${isAnonymous ? '#e2e8f0' : '#bfdbfe'}`,
                        cursor: 'pointer', transition: 'all 0.25s'
                    }}
                >
                    {isAnonymous ? <Shield size={14} color="#64748b" /> : <Eye size={14} color="#2563eb" />}
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: isAnonymous ? '#64748b' : '#2563eb' }}>
                        Posting as: {isAnonymous ? 'Anonymous' : 'Public'} (Click to switch)
                    </span>
                </div>

                {isError && (
                    <div style={{
                        padding: '10px 14px', borderRadius: 8, marginBottom: 16,
                        background: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626',
                        fontSize: '0.82rem', fontWeight: 600,
                    }}>
                        ⚠ {message}
                    </div>
                )}

                <form onSubmit={onSubmit}>
                    {/* Hospital with autocomplete */}
                    <div style={{ marginBottom: 16, position: 'relative' }} ref={suggestionRef}>
                        <label style={labelStyle}>Hospital Name *</label>
                        <div style={{ position: 'relative' }}>
                            <Search size={15} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
                            <input
                                name="hospital" value={formData.hospital} onChange={onChange}
                                onFocus={() => setShowSuggestions(true)}
                                placeholder="Start typing to search hospitals…"
                                style={{ ...inputStyle, paddingLeft: 36 }}
                                autoComplete="off" required
                            />
                        </div>
                        {showSuggestions && formData.hospital.length > 1 && (
                            <div style={{
                                position: 'absolute', zIndex: 20, width: '100%', marginTop: 4,
                                background: 'white', border: '1px solid #e2e8f0', borderRadius: 10,
                                boxShadow: '0 8px 30px -4px rgba(0,0,0,0.1)', maxHeight: 200, overflowY: 'auto',
                            }}>
                                {hospitalsLoading ? (
                                    <div style={{ padding: 12, fontSize: '0.82rem', color: '#64748b' }}>Searching…</div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map(h => (
                                        <div key={h._id} onClick={() => selectHospital(h.name)}
                                            style={{
                                                padding: '10px 14px', cursor: 'pointer',
                                                borderBottom: '1px solid #f1f5f9', transition: 'background 0.1s',
                                            }}
                                            onMouseOver={e => e.currentTarget.style.background = '#eff6ff'}
                                            onMouseOut={e => e.currentTarget.style.background = 'white'}
                                        >
                                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>{h.name}</div>
                                            <div style={{ fontSize: '0.73rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                                <MapPin size={11} /> {h.city}, {h.state}
                                            </div>
                                        </div>
                                    ))
                                ) : formData.hospital.length > 2 ? (
                                    <div style={{ padding: 12, fontSize: '0.82rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                        No hospitals found — you can type a custom name.
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>

                    {/* Row: Condition + City */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                        <div>
                            <label style={labelStyle}>Condition / Diagnosis *</label>
                            <input name="condition" value={formData.condition} onChange={onChange}
                                placeholder="e.g. Migraine" style={inputStyle} required />
                        </div>
                        <div>
                            <label style={labelStyle}>City</label>
                            <input name="city" value={formData.city} onChange={onChange}
                                placeholder="e.g. Mumbai" style={inputStyle} />
                        </div>
                    </div>

                    {/* Symptoms */}
                    <div style={{ marginBottom: 16 }}>
                        <label style={labelStyle}>Symptoms (comma-separated) *</label>
                        <input name="symptoms" value={formData.symptoms} onChange={onChange}
                            placeholder="e.g. Headache, Nausea, Sensitivity to light" style={inputStyle} required />
                    </div>

                    {/* Treatment */}
                    <div style={{ marginBottom: 16 }}>
                        <label style={labelStyle}>Treatment Received *</label>
                        <textarea name="treatment" value={formData.treatment} onChange={onChange}
                            placeholder="Details about medication, surgery, or therapy…"
                            style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} required />
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: 16 }}>
                        <label style={labelStyle}>Your Story (optional)</label>
                        <textarea name="description" value={formData.description} onChange={onChange}
                            placeholder="Share more context — how it started, how you felt, advice for others…"
                            style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} />
                    </div>

                    {/* Row: Outcome + Recovery + Cost */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
                        <div>
                            <label style={labelStyle}>Outcome *</label>
                            <select name="outcome" value={formData.outcome} onChange={onChange} style={inputStyle} required>
                                {OUTCOMES.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Recovery Time *</label>
                            <input name="recoveryTime" value={formData.recoveryTime} onChange={onChange}
                                placeholder="e.g. 2 weeks" style={inputStyle} required />
                        </div>
                        <div>
                            <label style={labelStyle}>Cost Range</label>
                            <input name="costRange" value={formData.costRange} onChange={onChange}
                                placeholder="e.g. ₹5,000–₹10,000" style={inputStyle} />
                        </div>
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={isLoading} style={{
                        width: '100%', padding: '12px 0', borderRadius: 10, border: 'none',
                        background: isLoading ? '#94a3b8' : '#2563eb', color: 'white',
                        fontSize: '0.9rem', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit', transition: 'all 0.15s',
                        boxShadow: '0 4px 14px 0 rgba(37,99,235,0.35)',
                    }}>
                        {isLoading ? 'Submitting…' : '✨ Submit Your Experience'}
                    </button>
                </form>
            </div>
        </AppLayout>
    )
}

const labelStyle = {
    display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155',
    marginBottom: 5, fontFamily: 'inherit',
}

const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: 8,
    border: '1.5px solid #e2e8f0', fontSize: '0.85rem', fontFamily: 'inherit',
    color: '#0f172a', outline: 'none', transition: 'border-color 0.15s',
    background: '#f8fafc', boxSizing: 'border-box',
}

export default ExperiencePage
