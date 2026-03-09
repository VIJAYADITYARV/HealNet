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

    return (
        <AppLayout>
            <div className="hn-messages-container" style={{ border: 'none', background: 'transparent', boxShadow: 'none', height: 'auto', gridTemplateColumns: '1fr' }}>
                <div style={{ maxWidth: 800, margin: '0 auto', width: '100%' }}>

                    {/* PROGRESS BAR */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 30, position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 20, left: '10%', right: '10%', height: 2, background: '#e2e8f0', zIndex: 0 }} />
                        <div style={{ position: 'absolute', top: 20, left: '10%', width: currentStep === 1 ? '0%' : currentStep === 2 ? '40%' : '80%', height: 2, background: '#2563eb', zIndex: 0, transition: 'width 0.3s' }} />

                        {STEPS.map(s => (
                            <div key={s.id} style={{ zIndex: 1, textAlign: 'center' }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: '50%', background: currentStep >= s.id ? '#2563eb' : 'white',
                                    color: currentStep >= s.id ? 'white' : '#94a3b8', border: `2px solid ${currentStep >= s.id ? '#2563eb' : '#e2e8f0'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px',
                                    fontWeight: 700, fontSize: '0.9rem', transition: 'all 0.3s'
                                }}>
                                    {currentStep > s.id ? <Check size={18} /> : s.id}
                                </div>
                                <div style={{ fontWeight: 800, fontSize: '0.75rem', color: currentStep >= s.id ? '#1e293b' : '#94a3b8' }}>{s.title}</div>
                                <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{s.subtitle}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ background: 'white', borderRadius: 20, border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', overflow: 'hidden' }}>

                        {/* HEADER */}
                        <div style={{ padding: '24px 32px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{STEPS[currentStep - 1].title}</h2>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>Help others by sharing real medical details.</p>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 12px', background: isAnonymous ? '#f1f5f9' : '#eff6ff', borderRadius: 20, cursor: 'pointer', border: '1px solid transparent', borderColor: isAnonymous ? '#e2e8f0' : '#bfdbfe' }} onClick={() => setIsAnonymous(!isAnonymous)}>
                                {isAnonymous ? <Shield size={14} color="#64748b" /> : <Eye size={14} color="#2563eb" />}
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isAnonymous ? '#64748b' : '#2563eb' }}>{isAnonymous ? 'Anonymous' : 'Public'}</span>
                            </div>
                        </div>

                        <div style={{ padding: 32 }}>

                            {/* STEP 1: MEDICAL CASE */}
                            {currentStep === 1 && (
                                <div style={{ animation: 'slideIn 0.3s ease' }}>
                                    <div style={{ marginBottom: 24, position: 'relative' }} ref={suggestionRef}>
                                        <label style={labelStyle}>Hospital / Clinic Name *</label>
                                        <div style={{ position: 'relative' }}>
                                            <Search size={16} style={{ position: 'absolute', left: 14, top: 12, color: '#94a3b8' }} />
                                            <input
                                                name="hospital" value={formData.hospital} onChange={onChange}
                                                onFocus={() => setShowSuggestions(true)}
                                                placeholder="Where did you receive treatment?"
                                                style={{ ...inputStyle, paddingLeft: 42 }}
                                                autoComplete="off"
                                            />
                                        </div>
                                        {showSuggestions && searchResults?.length > 0 && (
                                            <div style={{ position: 'absolute', zIndex: 10, width: '100%', marginTop: 8, background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', maxHeight: 200, overflowY: 'auto' }}>
                                                {searchResults.map(h => (
                                                    <div key={h._id} onClick={() => { setFormData({ ...formData, hospital: h.name, city: h.city }); setShowSuggestions(false); }} style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>
                                                        <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{h.name}</div>
                                                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{h.city}, {h.state}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, marginBottom: 24 }}>
                                        <div>
                                            <label style={labelStyle}>Diagnosis / Condition *</label>
                                            <div style={{ position: 'relative' }}>
                                                <Stethoscope size={16} style={{ position: 'absolute', left: 14, top: 12, color: '#94a3b8' }} />
                                                <input name="condition" value={formData.condition} onChange={onChange} placeholder="e.g., Kidney Stones" style={{ ...inputStyle, paddingLeft: 42 }} />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>City</label>
                                            <div style={{ position: 'relative' }}>
                                                <MapPin size={16} style={{ position: 'absolute', left: 14, top: 12, color: '#94a3b8' }} />
                                                <input name="city" value={formData.city} onChange={onChange} placeholder="e.g., Chennai" style={{ ...inputStyle, paddingLeft: 42 }} />
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: 0 }}>
                                        <label style={labelStyle}>Notable Symptoms (Type & Press Enter)</label>
                                        <div style={{ ...inputStyle, display: 'flex', flexWrap: 'wrap', gap: 8, minHeight: 46 }}>
                                            {formData.symptoms.map(s => (
                                                <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: '#eff6ff', color: '#2563eb', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700 }}>
                                                    {s} <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeSymptom(s)} />
                                                </span>
                                            ))}
                                            <input
                                                value={symptomInput}
                                                onChange={e => setSymptomInput(e.target.value)}
                                                onKeyDown={addSymptom}
                                                placeholder={formData.symptoms.length === 0 ? "e.g. Sharp pain, nausea..." : ""}
                                                style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontSize: '0.85rem' }}
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
                                        <textarea name="treatment" value={formData.treatment} onChange={onChange} placeholder="What was the procedure, medication, or therapy plan?" style={{ ...inputStyle, height: 100, resize: 'none' }} />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                                        <div>
                                            <label style={labelStyle}>Recovery Duration</label>
                                            <div style={{ position: 'relative' }}>
                                                <Calendar size={16} style={{ position: 'absolute', left: 14, top: 12, color: '#94a3b8' }} />
                                                <input name="recoveryTime" value={formData.recoveryTime} onChange={onChange} placeholder="e.g., 10 Days" style={{ ...inputStyle, paddingLeft: 42 }} />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Approximate Cost</label>
                                            <div style={{ position: 'relative' }}>
                                                <IndianRupee size={16} style={{ position: 'absolute', left: 14, top: 12, color: '#94a3b8' }} />
                                                <input name="costRange" value={formData.costRange} onChange={onChange} placeholder="e.g., ₹25,000" style={{ ...inputStyle, paddingLeft: 42 }} />
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: 8 }}>
                                        <label style={labelStyle}>Treatment Outcome</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                                            {OUTCOMES.map(o => (
                                                <div
                                                    key={o.value}
                                                    onClick={() => setFormData({ ...formData, outcome: o.value })}
                                                    style={{
                                                        padding: '12px', borderRadius: 12, border: '2px solid', cursor: 'pointer',
                                                        borderColor: formData.outcome === o.value ? o.color : '#f1f5f9',
                                                        background: formData.outcome === o.value ? '#fff' : '#f8fafc',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <div style={{ fontWeight: 800, fontSize: '0.75rem', color: formData.outcome === o.value ? o.color : '#475569' }}>{o.label}</div>
                                                    <div style={{ fontSize: '0.62rem', color: '#94a3b8', marginTop: 2 }}>{o.desc}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: REVIEW */}
                            {currentStep === 3 && (
                                <div style={{ animation: 'slideIn 0.3s ease' }}>
                                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 16, padding: 20, marginBottom: 24 }}>
                                        <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <CheckCircle size={18} /> Review Your Narrative
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 16 }}>
                                            <div>
                                                <label style={{ fontSize: '0.65rem', color: '#16a34a', fontWeight: 800, textTransform: 'uppercase' }}>Subject</label>
                                                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{formData.condition || '—'}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{formData.hospital}</div>
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.65rem', color: '#16a34a', fontWeight: 800, textTransform: 'uppercase' }}>Status</label>
                                                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{OUTCOMES.find(o => o.value === formData.outcome)?.label}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Post Visibility: {isAnonymous ? 'Anonymous' : 'Public'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: 24 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                            <label style={{ ...labelStyle, marginBottom: 0 }}>Detailed Narrative (Optional)</label>
                                            <button
                                                onClick={handleAiDraft}
                                                disabled={aiDraftLoading}
                                                style={{
                                                    background: 'transparent', border: 'none', color: '#2563eb',
                                                    fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: 5
                                                }}
                                            >
                                                {aiDraftLoading ? <Loader2 size={12} className="animate-spin" /> : <Brain size={12} />}
                                                {aiDraftLoading ? 'AI Drafting...' : '✨ AI Smart Narrative'}
                                            </button>
                                        </div>
                                        <textarea name="description" value={formData.description} onChange={onChange} placeholder="Any specific advice or emotional context you wish to share?" style={{ ...inputStyle, height: 120, resize: 'none' }} />
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 12 }}>
                                        <AlertCircle size={20} color="#d97706" />
                                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#92400e', fontWeight: 600 }}>By clicking submit, you confirm that this information is accurate and helpful for other patients.</p>
                                    </div>
                                </div>
                            )}

                            {/* FOOTER NAV */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40, paddingTop: 30, borderTop: '1px solid #f1f5f9' }}>
                                <button
                                    onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate('/')}
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: 'white', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
                                >
                                    <ChevronLeft size={18} /> {currentStep === 1 ? 'Cancel Entry' : 'Previous Step'}
                                </button>

                                {currentStep < 3 ? (
                                    <button
                                        onClick={() => setCurrentStep(currentStep + 1)}
                                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 12, border: 'none', background: '#2563eb', fontWeight: 700, color: 'white', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
                                    >
                                        Next Perspective <ChevronRight size={18} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={onSubmit}
                                        disabled={isLoading}
                                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 32px', borderRadius: 12, border: 'none', background: '#2563eb', fontWeight: 700, color: 'white', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.4)' }}
                                    >
                                        {isLoading ? 'Processing...' : '✨ Publish Experience'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </AppLayout>
    )
}

const labelStyle = { display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.02em' }
const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e2e8f0',
    fontSize: '0.9rem', fontFamily: 'inherit', color: '#0f172a', outline: 'none',
    transition: 'all 0.2s', background: '#f8fafc', boxSizing: 'border-box'
}

export default ExperiencePage
