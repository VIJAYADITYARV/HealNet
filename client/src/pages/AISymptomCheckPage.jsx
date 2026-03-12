import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import AppLayout from '../components/layout/AppLayout'
import { Search, Brain, Activity, Clock, MapPin, Loader2, Building2 } from 'lucide-react'

const AISymptomCheckPage = () => {
    const { user } = useSelector((state) => state.auth)
    const [searchParams] = useSearchParams()
    const urlSymptom = searchParams.get('q') || ''

    const [formData, setFormData] = useState({
        symptomText: urlSymptom,
        duration: '',
        severity: 3,
        bodyArea: '',
        location: ''
    })

    const [loading, setLoading] = useState(false)
    const [aiResult, setAiResult] = useState(null)
    const [error, setError] = useState('')

    // Auto-trigger analysis when URL changes (e.g., from Dashboard)
    useEffect(() => {
        if (urlSymptom && urlSymptom !== formData.symptomText) {
            setFormData(prev => ({ ...prev, symptomText: urlSymptom }));
            // We manually call with the new value because state update is async
            const updatedData = { ...formData, symptomText: urlSymptom };
            triggerSearch(updatedData);
        }
    }, [urlSymptom]);

    const triggerSearch = async (data = formData) => {
        if (!data.symptomText.trim()) return;

        setLoading(true);
        setError('');
        setAiResult(null);

        try {
            const res = await axios.post('/api/ai/query', data, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            setAiResult(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to process AI query');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        triggerSearch();
    };

    return (
        <AppLayout>
            <div className="hn-section-title">
                <Brain size={16} />
                AI Symptom Analysis
            </div>

            <div style={{
                background: 'white', borderRadius: 14, padding: 24,
                boxShadow: '0 2px 15px -3px rgba(37,99,235,0.07)',
                border: '1px solid #e2e8f0', marginBottom: 20
            }}>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 20 }}>
                    Describe your symptoms to discover matched conditions, similar experiences, and treatments.
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={labelStyle}>Describe Your Symptoms *</label>
                        <textarea
                            rows="4"
                            placeholder="e.g., I've been experiencing throbbing pain on one side of my head, along with light sensitivity and nausea..."
                            style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                            value={formData.symptomText}
                            onChange={(e) => setFormData({ ...formData, symptomText: e.target.value })}
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
                        <div>
                            <label style={labelStyle}>Duration</label>
                            <div style={{ position: 'relative' }}>
                                <Clock size={15} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
                                <select
                                    style={{ ...inputStyle, paddingLeft: 36 }}
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                >
                                    <option value="">Select duration...</option>
                                    <option value="days">Few days</option>
                                    <option value="weeks">Few weeks</option>
                                    <option value="months">Several months</option>
                                    <option value="years">Over a year</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Body Area</label>
                            <div style={{ position: 'relative' }}>
                                <Activity size={15} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
                                <select
                                    style={{ ...inputStyle, paddingLeft: 36 }}
                                    value={formData.bodyArea}
                                    onChange={(e) => setFormData({ ...formData, bodyArea: e.target.value })}
                                >
                                    <option value="">Select general area</option>
                                    <option value="head">Head & Neck</option>
                                    <option value="chest">Chest & Back</option>
                                    <option value="abdomen">Abdomen</option>
                                    <option value="limbs">Arms & Legs</option>
                                    <option value="full">Full Body</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Severity (1-5)</label>
                            <input
                                type="range"
                                min="1" max="5"
                                style={{ width: '100%', cursor: 'pointer', marginTop: 10 }}
                                value={formData.severity}
                                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', marginTop: 8, fontWeight: 600 }}>
                                <span>Mild</span>
                                <span>Moderate</span>
                                <span>Severe</span>
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Location (Optional)</label>
                            <div style={{ position: 'relative' }}>
                                <MapPin size={15} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
                                <input
                                    type="text"
                                    placeholder="City"
                                    style={{ ...inputStyle, paddingLeft: 36 }}
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                            Personalized matching uses your Health Profile context automatically.
                        </span>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '12px 24px', borderRadius: 10, border: 'none',
                                background: loading ? '#94a3b8' : '#2563eb', color: 'white',
                                fontSize: '0.9rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s',
                                boxShadow: '0 4px 14px 0 rgba(37,99,235,0.35)',
                            }}
                        >
                            {loading ? (
                                <><Loader2 size={18} /> Analyzing Symptoms...</>
                            ) : (
                                <><Search size={18} /> Analyze Database</>
                            )}
                        </button>
                    </div>
                </form>

                {error && <div style={{ color: '#dc2626', fontSize: '0.82rem', fontWeight: 600, marginTop: 16, padding: '10px', background: '#fee2e2', borderRadius: 8 }}>⚠ {error}</div>}
            </div>

            {/* AI RESULT REPORT VIEW */}
            {aiResult && (
                <div style={{
                    background: 'white', borderRadius: 14, overflow: 'hidden',
                    boxShadow: '0 4px 20px -5px rgba(37,99,235,0.15)', border: '1px solid #bfdbfe',
                }}>
                    <div style={{
                        padding: '24px', background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                        color: 'white', borderBottom: '1px solid #e2e8f0'
                    }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 8px 0' }}>Healthcare AI Analysis Report</h2>
                        <p style={{ fontSize: '0.9rem', opacity: 0.9, lineHeight: 1.5 }}>{aiResult.summary}</p>
                    </div>

                    <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                        {/* Matches */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Activity size={18} color="#2563eb" /> Top Matched Conditions
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {aiResult.matchedConditions.length > 0 ? aiResult.matchedConditions.map((cond, i) => (
                                        <div key={i} style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '12px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0'
                                        }}>
                                            <span style={{ fontWeight: 700, color: '#334155', fontSize: '0.9rem' }}>{cond.condition}</span>
                                            <span style={{ fontSize: '0.75rem', background: '#dbeafe', color: '#1d4ed8', padding: '4px 10px', borderRadius: 20, fontWeight: 800 }}>
                                                {cond.confidence}% confidence
                                            </span>
                                        </div>
                                    )) : <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No strong matches found.</p>}
                                </div>
                            </div>

                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Search size={18} color="#2563eb" /> Treatment Insights
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {aiResult.treatmentInsights.map((t, i) => (
                                        <div key={i} style={{ padding: '12px 16px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                                <span style={{ fontWeight: 800, color: '#166534', fontSize: '0.9rem' }}>{t.treatment}</span>
                                                <span style={{ fontWeight: 800, color: '#15803d', fontSize: '0.85rem' }}>{t.successRate}% Success</span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>Based on {t.casesAnalyzed} similar patient cases</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recommendations */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Building2 size={18} color="#2563eb" /> Hospital Recommendations
                                </h3>
                                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                                    {aiResult.hospitalRecommendations.map((h, i) => (
                                        <div key={i} style={{
                                            padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            borderBottom: i !== aiResult.hospitalRecommendations.length - 1 ? '1px solid #e2e8f0' : 'none',
                                        }}>
                                            <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>{h.name}</span>
                                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>{h.matchCount} cases</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ background: '#fefce8', border: '1px solid #fef08a', padding: 20, borderRadius: 8 }}>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '0.85rem', fontWeight: 800, color: '#854d0e' }}>Estimated Recovery Time</h3>
                                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#a16207' }}>{aiResult.recoveryEstimate}</p>
                                <p style={{ margin: '8px 0 0 0', fontSize: '0.7rem', color: '#ca8a04', fontWeight: 600 }}>*Based on aggregate data from patients with similar symptoms and outcomes.</p>
                            </div>
                        </div>
                    </div>

                    {/* Similar Experiences */}
                    <div style={{ background: '#f8fafc', padding: 24, borderTop: '1px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0' }}>Patient Experiences Like Yours</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {aiResult.similarExperiences.map((exp, i) => (
                                <div key={i} style={{ background: 'white', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
                                            {exp.condition} <span style={{ fontWeight: 400, color: '#64748b', fontSize: '0.8rem' }}>at {exp.hospital}</span>
                                        </div>
                                        <span style={{
                                            fontSize: '0.7rem', fontWeight: 800, padding: '4px 10px', borderRadius: 20,
                                            background: (exp.outcome === 'success' || exp.outcome === 'improvement') ? '#dcfce7' : '#f1f5f9',
                                            color: (exp.outcome === 'success' || exp.outcome === 'improvement') ? '#166534' : '#475569'
                                        }}>
                                            {exp.outcome}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: '#475569', fontStyle: 'italic', margin: '0 0 12px 0', lineHeight: 1.5 }}>"{exp.description}"</p>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                                        Treatment: <span style={{ color: '#334155' }}>{exp.treatment}</span> • Recovery: <span style={{ color: '#334155' }}>{exp.recoveryTime}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
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

export default AISymptomCheckPage
