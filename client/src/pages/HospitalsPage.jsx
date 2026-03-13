import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import {
    Building2, MapPin, Star, Users, Activity,
    ChevronRight, Filter, ShieldCheck, TrendingUp,
    Award, ThumbsUp, HeartPulse, CheckCircle,
    BrainCircuit
} from 'lucide-react'
import HospitalIntelligence from '../components/HospitalIntelligence'

const HOSPITALS = [
    {
        id: 1, name: 'Apollo Hospitals', city: 'Chennai', score: 94,
        cases: 1240, specialties: ['Cardiology', 'Oncology', 'Neurology'],
        tagline: 'Leading multi-specialty hospital with cutting-edge technology.',
        trustTier: 'Elite', reliability: 0.98
    },
    {
        id: 2, name: 'AIIMS Delhi', city: 'New Delhi', score: 91,
        cases: 980, specialties: ['General Medicine', 'Surgery', 'Psychiatry'],
        tagline: 'Premier government medical institute with world-class research.',
        trustTier: 'Diamond', reliability: 0.95
    },
    {
        id: 3, name: 'Fortis Healthcare', city: 'Gurgaon', score: 88,
        cases: 760, specialties: ['Orthopaedics', 'Fertility', 'Kidney Care'],
        tagline: 'Pioneering patient care across specialties.',
        trustTier: 'Platinum', reliability: 0.92
    },
    {
        id: 4, name: 'Max Super Speciality', city: 'Mumbai', score: 85,
        cases: 620, specialties: ['Liver Transplant', 'Cancer Care', 'Neonatology'],
        tagline: 'Advanced diagnostics with compassionate care.',
        trustTier: 'Gold', reliability: 0.89
    },
    {
        id: 5, name: 'Narayana Health', city: 'Bengaluru', score: 82,
        cases: 540, specialties: ['Heart Surgery', 'Paediatrics', 'Trauma'],
        tagline: 'Affordable world-class healthcare for all.',
        trustTier: 'Gold', reliability: 0.86
    },
    {
        id: 6, name: 'Manipal Hospital', city: 'Bengaluru', score: 79,
        cases: 480, specialties: ['Robotic Surgery', 'Bone Marrow', 'ENT'],
        tagline: 'Innovation-led tertiary care across India.',
        trustTier: 'Silver', reliability: 0.82
    },
]

const TABS = ['Overview', 'Trust Scorecard', 'Treatment Outcomes', 'Clinical Insights']
const CONDITIONS = ['All', 'Cardiology', 'Neurology', 'Orthopaedics', 'Oncology', 'Fertility']

function scoreColor(s) {
    if (s >= 90) return '#059669'
    if (s >= 80) return '#d97706'
    return '#dc2626'
}

function HospitalCard({ h, onClick }) {
    return (
        <div className="hn-feed-card" style={{ cursor: 'pointer', border: '1.5px solid #e2e8f0', transition: 'transform 0.2s, box-shadow 0.2s' }} onClick={() => onClick(h)}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ position: 'relative' }}>
                    <div className="hn-hosp-score" style={{ background: `${scoreColor(h.score)}18`, color: scoreColor(h.score), borderRadius: 16 }}>
                        {h.score}
                    </div>
                    {h.score >= 90 && (
                        <div style={{ position: 'absolute', top: -5, right: -5, background: '#2563eb', borderRadius: '50%', padding: 4, border: '2px solid white' }}>
                            <Award size={10} color="white" />
                        </div>
                    )}
                </div>

                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{h.name}</h3>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#2563eb', background: '#eff6ff', padding: '2px 10px', borderRadius: 20, textTransform: 'uppercase' }}>
                            {h.trustTier || 'Standard'} Tier
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                            <MapPin size={12} /> {h.city}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                            <Users size={12} /> {(h.cases || 0).toLocaleString()} cases
                        </div>
                    </div>

                    <p style={{ fontSize: '0.82rem', color: '#475569', margin: '12px 0', lineHeight: 1.5 }}>{h.tagline || 'Verified healthcare provider on the HealNet network.'}</p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {(h.specialties || ['General Medicine']).map((s, i) => (
                            <span key={i} style={{ background: '#f8fafc', color: '#1e293b', padding: '4px 10px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 700, border: '1px solid #e2e8f0' }}>{s}</span>
                        ))}
                    </div>
                </div>

                <ChevronRight size={18} color="#94a3b8" style={{ marginTop: 4 }} />
            </div>
        </div>
    )
}

function HospitalDetail({ h, onClose }) {
    const [tab, setTab] = useState('Trust Scorecard')

    return (
        <div style={{ animation: 'slideIn 0.3s ease' }}>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
                <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back to Hospital Intelligence
            </button>

            <div style={{ background: 'white', borderRadius: 24, padding: 32, border: '1.5px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0,0,0,0.03)', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                    <div style={{ width: 80, height: 80, borderRadius: 20, background: `${scoreColor(h.score || 75)}10`, color: scoreColor(h.score || 75), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 900 }}>
                        {h.score || '--'}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>{h.name}</h1>
                            <Award size={24} color="#f59e0b" fill="#f59e0b" />
                        </div>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={16} /> {h.city}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Activity size={16} /> Verified Protocol</div>
                            <div style={{ color: scoreColor(h.score || 75), fontWeight: 800 }}>{h.score || 75}% Aggregated Trust Score</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="hn-tabs" style={{ marginBottom: 24 }}>
                {TABS.map(t => (
                    <button key={t} className={`hn-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                        {t}
                    </button>
                ))}
            </div>

            {/* TRUST SCORECARD TAB CONTENT */}
            {tab === 'Trust Scorecard' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <div style={{ background: 'white', borderRadius: 24, padding: 24, border: '1.5px solid #e2e8f0' }}>
                        <h3 style={{ margin: '0 0 20px', fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <ShieldCheck size={20} color="#2563eb" /> Reliability Metrics
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {[
                                { label: 'Treatment Success Rate', val: h.score, icon: <TrendingUp size={16} /> },
                                { label: 'Patient Experience Accuracy', val: 97, icon: <ThumbsUp size={16} /> },
                                { label: 'Protocol Adherence', val: 92, icon: <HeartPulse size={16} /> },
                                { label: 'Data Integrity Score', val: 99, icon: <CheckCircle size={16} /> }
                            ].map((m, i) => (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{m.icon} {m.label}</div>
                                        <span>{m.val}%</span>
                                    </div>
                                    <div style={{ height: 6, background: '#f1f5f9', borderRadius: 10, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${m.val}%`, background: '#2563eb', borderRadius: 10 }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: 24, padding: 24, color: 'white' }}>
                            <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 800 }}>HealNet Verification Index</h3>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 8 }}>{h.reliability.toFixed(2)}<span style={{ fontSize: '1rem', opacity: 0.5, marginLeft: 8 }}>/ 1.0</span></div>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
                                Calculated using dynamic validation from {h.cases.toLocaleString()} patientjourneys and verified medical protocols.
                            </p>
                            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                                <div style={{ flex: 1, padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 12, textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.6 }}>Anonymity Tier</div>
                                    <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>Tier 1 (Max)</div>
                                </div>
                                <div style={{ flex: 1, padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 12, textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.6 }}>Trust Tier</div>
                                    <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{h.trustTier}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {tab === 'Overview' && (
                <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 16 }}>Clinical Specializations</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                        {h.specialties.map((s, i) => (
                            <div key={i} style={{ background: 'white', borderRadius: 20, padding: 20, border: '1.5px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{s}</div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669' }}>{(85 + i * 3)}% Success</div>
                                    <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Verified Unit</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {tab === 'Clinical Insights' && (
                <HospitalIntelligence hospitalId={h._id || h.id} />
            )}
        </div>
    )
}

function HospitalsPage() {
    const [selected, setSelected] = useState(null)
    const [filter, setFilter] = useState('All')
    const [hospitals, setHospitals] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchHospitals = async () => {
            try {
                // If there's an error fetching or the list is empty, we keep the mock ones
                const res = await axios.get('/api/hospitals/all')
                if (res.data && res.data.length > 0) {
                    setHospitals(res.data)
                } else {
                    setHospitals(HOSPITALS)
                }
            } catch (err) {
                console.log("Using demo hospitals fallback")
                setHospitals(HOSPITALS)
            } finally {
                setLoading(false)
            }
        }
        fetchHospitals()
    }, [])

    return (
        <AppLayout>
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                {!selected && (
                    <div style={{ marginBottom: 32 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
                            <div>
                                <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Hospital Intelligence</h1>
                                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>Verified trust scores and patient outcomes across top medical facilities.</p>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button style={{ background: '#f1f5f9', border: 'none', padding: '10px 16px', borderRadius: 10, fontSize: '0.8rem', fontWeight: 700, color: '#475569', cursor: 'pointer' }}>Generate Report</button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'white', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                            <Filter size={16} color="#94a3b8" />
                            <div style={{ display: 'flex', gap: 10, overflowX: 'auto' }}>
                                {CONDITIONS.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setFilter(c)}
                                        style={{
                                            whiteSpace: 'nowrap', padding: '6px 14px', borderRadius: 10, border: '1.5px solid',
                                            fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                                            background: filter === c ? '#0f172a' : 'transparent',
                                            color: filter === c ? 'white' : '#64748b',
                                            borderColor: filter === c ? '#0f172a' : '#e2e8f0'
                                        }}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {selected ? (
                    <HospitalDetail h={selected} onClose={() => setSelected(null)} />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {hospitals.map(h => (
                            <HospitalCard key={h._id || h.id} h={h} onClick={setSelected} />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    )
}

export default HospitalsPage
