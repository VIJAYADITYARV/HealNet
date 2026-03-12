import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import { createExperience, reset } from '../features/experiences/experienceSlice'
import { searchHospitals, reset as resetHospitals } from '../features/hospitals/hospitalSlice'
import {
    PenSquare, Search, MapPin, CheckCircle, Shield,
    Eye, ChevronRight, ChevronLeft, Star,
    Stethoscope, Info, Activity, AlertCircle, X,
    Calendar, IndianRupee, Brain, Sparkles, Loader2
} from 'lucide-react'

// Using the Lucide Check icon directly as the Progress component wants it
const Check = ({ size, color }) => <CheckCircle size={size} color={color} />

const OUTCOMES = [
    { value: 'success', label: '✓ Full Recovery', color: '#059669', desc: 'Resolved completely' },
    { value: 'improvement', label: '↗ Improvement', color: '#2563eb', desc: 'Condition got better' },
    { value: 'ongoing', label: '⏳ Ongoing', color: '#d97706', desc: 'Still in treatment' },
    { value: 'no improvement', label: '— No Change', color: '#94a3b8', desc: 'No noticeable difference' },
    { value: 'complication', label: '⚠ Complication', color: '#dc2626', desc: 'Experienced side effects' },
]

const STEPS = [
    { id: 1, title: 'Medical Case', subtitle: 'Hospital & Diagnosis' },
    { id: 2, title: 'The Journey', subtitle: 'Treatment & Recovery' },
    { id: 3, title: 'Final Review', subtitle: 'Confirmation' }
]

function ExperiencePage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user } = useSelector(s => s.auth)
    const { isLoading, isSuccess, isError, message } = useSelector(s => s.experiences)
    const { searchResults, isLoading: hospitalsLoading } = useSelector(s => s.hospitals)

    const [currentStep, setCurrentStep] = useState(1)
    const [isAnonymous, setIsAnonymous] = useState(user?.isAnonymous || false)
    const [formData, setFormData] = useState({
        hospital: '', condition: '', symptoms: [], treatment: '',
        outcome: 'success', recoveryTime: '', description: '', city: '',
        costRange: '', hospitalRating: 5
    })

    const [symptomInput, setSymptomInput] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const suggestionRef = useRef(null)

    // AI Narrative Assistant State
    const [aiDraftLoading, setAiDraftLoading] = useState(false)

    useEffect(() => {
        if (!user) navigate('/login')
    }, [user, navigate])

    useEffect(() => {
        if (isSuccess && submitted) {
            setSubmitted(false); dispatch(reset()); navigate('/my-journey')
        }
    }, [isSuccess, submitted, dispatch, navigate])

    useEffect(() => {
        if (formData.hospital.length > 2 && showSuggestions) {
            const t = setTimeout(() => dispatch(searchHospitals(formData.hospital)), 300)
            return () => clearTimeout(t)
        }
    }, [formData.hospital, dispatch, showSuggestions])

    const onChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }))

    const addSymptom = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            const val = symptomInput.trim().replace(',', '')
            if (val && !formData.symptoms.includes(val)) {
                setFormData(p => ({ ...p, symptoms: [...p.symptoms, val] }))
                setSymptomInput('')
            }
        }
    }

    const removeSymptom = (s) => setFormData(p => ({ ...p, symptoms: p.symptoms.filter(x => x !== s) }))

    const handleAiDraft = async () => {
        if (!formData.condition || !formData.treatment) {
            alert("Please provide at least a condition and treatment details first.");
            return;
        }

        setAiDraftLoading(true);
        try {
            const res = await axios.post('/api/ai/experience-draft', {
                condition: formData.condition,
                symptoms: formData.symptoms,
                treatment: formData.treatment,
                outcome: OUTCOMES.find(o => o.value === formData.outcome)?.label
            }, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });

            setFormData(prev => ({ ...prev, description: res.data.draft }));
        } catch (err) {
            console.error("AI Draft Error:", err);
            alert("AI Narrative Assistant is currently resting. Please try again later.");
        } finally {
            setAiDraftLoading(false);
        }
    }

    const onSubmit = () => {
        if (!window.confirm('Ready to share this experience with the community?')) return;
        dispatch(createExperience({ ...formData, isAnonymous }))
        setSubmitted(true)
    }

    if (!user) return null

    if (submitted) {
        return (
            <AppLayout>
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    minHeight: '60vh', textAlign: 'center', animation: 'slideIn 0.5s ease'
                }}>
                    <div style={{
                        width: 80, height: 80, background: '#dcfce7', color: '#166534',
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 24, boxShadow: '0 10px 25px rgba(22, 101, 52, 0.1)'
                    }}>
                        <Check size={40} />
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginBottom: 12 }}>Journey Published!</h1>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: 450, lineHeight: 1.6, marginBottom: 32 }}>
                        Your experience has been shared with the community. You're helping others make better health decisions!
                    </p>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <button onClick={() => navigate('/community')} className="hn-share-btn">View in Community</button>
                        <button onClick={() => { setSubmitted(false); setCurrentStep(1); setFormData({ hospital: '', condition: '', city: '', symptoms: [], treatment: '', recoveryTime: '', cost: '', outcome: 'success', description: '' }); }} style={{ padding: '12px 24px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: 'white', fontWeight: 700, cursor: 'pointer' }}>Post Another</button>
                    </div>
                </div>
            </AppLayout>
        )
    }

    return (
        <AppLayout>
            <div style={{ maxWidth: 850, margin: '20px auto', width: '100%' }}>

                {/* PROGRESS BAR */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 40, position: 'relative', padding: '0 20px' }}>
                    <div style={{ position: 'absolute', top: 20, left: '10%', right: '10%', height: 3, background: 'rgba(0,0,0,0.05)', zIndex: 0, borderRadius: 10 }} />
                    <div style={{ position: 'absolute', top: 20, left: '10%', width: currentStep === 1 ? '0%' : currentStep === 2 ? '40%' : '80%', height: 3, background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', zIndex: 0, transition: 'width 0.4s ease', borderRadius: 10 }} />

                    {STEPS.map(s => (
                        <div key={s.id} style={{ zIndex: 1, textAlign: 'center', width: 120 }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: '50%',
                                background: currentStep >= s.id ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : 'white',
                                color: currentStep >= s.id ? 'white' : '#94a3b8',
                                border: `2px solid ${currentStep >= s.id ? 'transparent' : '#e2e8f0'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px',
                                fontWeight: 800, fontSize: '1rem', transition: 'all 0.4s ease',
                                boxShadow: currentStep >= s.id ? '0 8px 20px rgba(37, 99, 235, 0.2)' : 'none'
                            }}>
                                {currentStep > s.id ? <Check size={20} /> : s.id}
                            </div>
                            <div style={{ fontWeight: 800, fontSize: '0.75rem', color: currentStep >= s.id ? '#0f172a' : '#94a3b8' }}>{s.title}</div>
                            <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{s.subtitle}</div>
                        </div>
                    ))}
                </div>

                <div style={{ background: 'var(--card-bg)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', borderRadius: 24, border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>

                    {/* HEADER */}
                    <div style={{ padding: '28px 32px', background: 'var(--blue-light)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{STEPS[currentStep - 1].title}</h2>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>Help others by sharing real medical details.</p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 16px', background: isAnonymous ? 'white' : 'var(--blue-trust)', borderRadius: 20, cursor: 'pointer', border: '1px solid', borderColor: isAnonymous ? 'var(--border)' : 'transparent', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }} onClick={() => setIsAnonymous(!isAnonymous)}>
                            {isAnonymous ? <Shield size={14} color="var(--text-muted)" /> : <Eye size={14} color="white" />}
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isAnonymous ? 'var(--text-muted)' : 'white' }}>{isAnonymous ? 'Anonymous' : 'Public Visibility'}</span>
                        </div>
                    </div>

                    <div style={{ padding: 32 }}>

                        {/* STEP 1: MEDICAL CASE */}
                        {currentStep === 1 && (
                            <div style={{ animation: 'slideIn 0.3s ease' }}>
                                <div style={{ marginBottom: 24, position: 'relative' }} ref={suggestionRef}>
                                    <label style={labelStyle}>Hospital / Clinic Name *</label>
                                    <div style={{ position: 'relative' }}>
                                        <Search size={16} style={{ position: 'absolute', left: 16, top: 14, color: 'var(--text-muted)' }} />
                                        <input
                                            name="hospital" value={formData.hospital} onChange={onChange}
                                            onFocus={() => setShowSuggestions(true)}
                                            placeholder="Where did you receive treatment?"
                                            style={{ ...inputStyle, paddingLeft: 46 }}
                                            autoComplete="off"
                                        />
                                    </div>
                                    {showSuggestions && searchResults?.length > 0 && (
                                        <div style={{ position: 'absolute', zIndex: 10, width: '100%', marginTop: 8, background: 'white', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', maxHeight: 200, overflowY: 'auto' }}>
                                            {searchResults.map(h => (
                                                <div key={h._id} onClick={() => { setFormData({ ...formData, hospital: h.name, city: h.city }); setShowSuggestions(false); }} style={{ padding: '14px 18px', cursor: 'pointer', borderBottom: '1px solid var(--surface)', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'var(--surface)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{h.name}</div>
                                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{h.city}, {h.state}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, marginBottom: 24 }}>
                                    <div>
                                        <label style={labelStyle}>Diagnosis / Condition *</label>
                                        <div style={{ position: 'relative' }}>
                                            <Stethoscope size={16} style={{ position: 'absolute', left: 16, top: 14, color: 'var(--text-muted)' }} />
                                            <input name="condition" value={formData.condition} onChange={onChange} placeholder="e.g., Kidney Stones" style={{ ...inputStyle, paddingLeft: 46 }} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>City</label>
                                        <div style={{ position: 'relative' }}>
                                            <MapPin size={16} style={{ position: 'absolute', left: 16, top: 14, color: 'var(--text-muted)' }} />
                                            <input name="city" value={formData.city} onChange={onChange} placeholder="e.g., Chennai" style={{ ...inputStyle, paddingLeft: 46 }} />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: 0 }}>
                                    <label style={labelStyle}>Notable Symptoms (Type & Press Enter)</label>
                                    <div style={{ ...inputStyle, display: 'flex', flexWrap: 'wrap', gap: 8, minHeight: 48, background: 'white' }}>
                                        {formData.symptoms.map(s => (
                                            <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'var(--blue-light)', color: 'var(--blue-trust)', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700, border: '1px solid var(--blue-mid)' }}>
                                                {s} <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeSymptom(s)} />
                                            </span>
                                        ))}
                                        <input
                                            value={symptomInput}
                                            onChange={e => setSymptomInput(e.target.value)}
                                            onKeyDown={addSymptom}
                                            placeholder={formData.symptoms.length === 0 ? "e.g. Sharp pain, nausea..." : ""}
                                            style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontSize: '0.9rem', color: 'var(--text-primary)' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: THE JOURNEY */}
                        {currentStep === 2 && (
                            <div style={{ animation: 'slideIn 0.3s ease' }}>
                                <div style={{ marginBottom: 24 }}>
                                    <label style={labelStyle}>Treatment Protocol *</label>
                                    <textarea name="treatment" value={formData.treatment} onChange={onChange} placeholder="What was the procedure, medication, or therapy plan?" style={{ ...inputStyle, height: 110, resize: 'none', background: 'white' }} />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                                    <div>
                                        <label style={labelStyle}>Recovery Duration</label>
                                        <div style={{ position: 'relative' }}>
                                            <Calendar size={16} style={{ position: 'absolute', left: 16, top: 14, color: 'var(--text-muted)' }} />
                                            <input name="recoveryTime" value={formData.recoveryTime} onChange={onChange} placeholder="e.g., 10 Days" style={{ ...inputStyle, paddingLeft: 46 }} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Approximate Cost</label>
                                        <div style={{ position: 'relative' }}>
                                            <IndianRupee size={16} style={{ position: 'absolute', left: 16, top: 14, color: 'var(--text-muted)' }} />
                                            <input name="costRange" value={formData.costRange} onChange={onChange} placeholder="e.g., 25000" style={{ ...inputStyle, paddingLeft: 46 }} />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: 8 }}>
                                    <label style={labelStyle}>Treatment Outcome</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                                        {OUTCOMES.map(o => (
                                            <div
                                                key={o.value}
                                                onClick={() => setFormData({ ...formData, outcome: o.value })}
                                                style={{
                                                    padding: '14px', borderRadius: 16, border: '2.5px solid', cursor: 'pointer',
                                                    borderColor: formData.outcome === o.value ? o.color : 'var(--surface)',
                                                    background: formData.outcome === o.value ? 'white' : 'var(--surface)',
                                                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                                    boxShadow: formData.outcome === o.value ? `0 4px 12px ${o.color}15` : 'none',
                                                    transform: formData.outcome === o.value ? 'scale(1.02)' : 'scale(1)'
                                                }}
                                            >
                                                <div style={{ fontWeight: 800, fontSize: '0.8rem', color: formData.outcome === o.value ? o.color : 'var(--text-secondary)' }}>{o.label}</div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>{o.desc}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: REVIEW */}
                        {currentStep === 3 && (
                            <div style={{ animation: 'slideIn 0.3s ease' }}>
                                <div style={{ background: 'var(--green-light)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 20, padding: 24, marginBottom: 24 }}>
                                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--green-success)', display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <CheckCircle size={20} /> Preview Record
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, marginTop: 20 }}>
                                        <div>
                                            <label style={{ fontSize: '0.65rem', color: 'var(--green-success)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Condition</label>
                                            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{formData.condition || '—'}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{formData.hospital}</div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.65rem', color: 'var(--green-success)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</label>
                                            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{OUTCOMES.find(o => o.value === formData.outcome)?.label}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>Visibility: {isAnonymous ? 'Anonymous' : 'Public'}</div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                        <label style={{ ...labelStyle, marginBottom: 0 }}>Detailed Narrative (Life-saving Journey)</label>
                                        <button
                                            onClick={handleAiDraft}
                                            disabled={aiDraftLoading}
                                            style={{
                                                background: 'var(--blue-light)', border: '1px solid var(--blue-mid)', color: 'var(--blue-trust)',
                                                fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8,
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                                            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            {aiDraftLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                                            {aiDraftLoading ? 'Synthesizing...' : '✨ AI Smart Narrative'}
                                        </button>
                                    </div>
                                    <textarea name="description" value={formData.description} onChange={onChange} placeholder="Describe your experience in detail to help others..." style={{ ...inputStyle, height: 160, resize: 'none', background: 'white' }} />
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 20, background: 'var(--amber-light)', border: '1px solid rgba(217, 119, 6, 0.2)', borderRadius: 16 }}>
                                    <AlertCircle size={22} color="var(--amber-ongoing)" />
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--amber-ongoing)', fontWeight: 600, lineHeight: 1.5 }}>By publishing, you agree to provide helpful, truthful, and respectful medical insights for the HealNet community.</p>
                                </div>
                            </div>
                        )}

                        {/* FOOTER NAV */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40, paddingTop: 32, borderTop: '1px solid var(--border)' }}>
                            <button
                                onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate('/')}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 14, border: '1.5px solid var(--border)', background: 'white', fontWeight: 800, color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.background = 'var(--surface)'}
                                onMouseOut={e => e.currentTarget.style.background = 'white'}
                            >
                                <ChevronLeft size={20} /> {currentStep === 1 ? 'Cancel Entry' : 'Back'}
                            </button>

                            {currentStep < 3 ? (
                                <button
                                    onClick={() => setCurrentStep(currentStep + 1)}
                                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 32px', borderRadius: 14, border: 'none', background: 'var(--blue-trust)', fontWeight: 800, color: 'white', cursor: 'pointer', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)', fontSize: '0.85rem', transition: 'all 0.2s' }}
                                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    Next Perspective <ChevronRight size={20} />
                                </button>
                            ) : (
                                <button
                                    onClick={onSubmit}
                                    disabled={isLoading}
                                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 40px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #2563eb, #1e40af)', fontWeight: 800, color: 'white', cursor: 'pointer', boxShadow: '0 8px 25px rgba(37, 99, 235, 0.4)', fontSize: '0.9rem', transition: 'all 0.2s' }}
                                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    {isLoading ? 'Processing...' : '✨ Publish Experience'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes slideIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </AppLayout>
    )
}

const labelStyle = { display: 'block', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }
const inputStyle = {
    width: '100%', padding: '14px 18px', borderRadius: 14, border: '1.5px solid var(--border)',
    fontSize: '0.92rem', fontFamily: 'inherit', color: 'var(--text-primary)', outline: 'none',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', background: 'var(--surface)', boxSizing: 'border-box'
}

export default ExperiencePage
