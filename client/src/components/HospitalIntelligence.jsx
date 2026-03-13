import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    PieChart, Pie
} from 'recharts'
import {
    TrendingUp, Activity, Users, Award,
    Calendar, CheckCircle2, MessageSquare, ExternalLink,
    Loader2, AlertCircle
} from 'lucide-react'

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

const HospitalIntelligence = ({ hospitalId }) => {
    const { user } = useSelector((state) => state.auth)
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                setLoading(true)
                const config = user?.token ? {
                    headers: { Authorization: `Bearer ${user.token}` }
                } : {}
                const res = await axios.get(`/api/hospitals/${hospitalId}/insights`, config)
                setData(res.data)
                setError(null)
            } catch (err) {
                console.error("Error fetching hospital insights:", err)
                setError("Failed to load clinical insights.")
            } finally {
                setLoading(false)
            }
        }

        if (hospitalId) fetchInsights()
    }, [hospitalId, user])

    if (loading) return (
        <div style={{ padding: '60px', textAlign: 'center', background: 'white', borderRadius: 24, border: '1px solid #e2e8f0' }}>
            <Loader2 className="animate-spin" size={32} color="#2563eb" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontWeight: 700, color: '#64748b' }}>Generating Clinical Quality Report...</p>
        </div>
    )

    if (error || !data) return (
        <div style={{ padding: '40px', textAlign: 'center', background: '#fef2f2', borderRadius: 24, border: '1px solid #fee2e2' }}>
            <AlertCircle size={32} color="#dc2626" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontWeight: 700, color: '#991b1b' }}>{error || "Hospital insights currently unavailable."}</p>
        </div>
    )

    const { insights, hospital } = data

    return (
        <div style={{ animation: 'authFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 32 }}>

                {/* HIGH LEVEL STATS */}
                <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: 24, padding: 24, color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 12 }}>
                            <TrendingUp size={20} color="#38bdf8" />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>Success Score</h3>
                    </div>
                    <div style={{ fontSize: '3rem', fontWeight: 900, marginBottom: 4 }}>{insights.successRate}%</div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>
                        Based on {insights.totalExperiences} verified patient journeys.
                    </p>
                </div>

                {/* OUTCOME DISTRIBUTION */}
                <div style={{ background: 'white', borderRadius: 24, padding: 24, border: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>Outcome Distribution</h3>
                    <div style={{ height: 180 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={insights.outcomeBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {insights.outcomeBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* CLINICAL VOLUME */}
                <div style={{ background: 'white', borderRadius: 24, padding: 24, border: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>Top Conditions Treated</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {insights.topConditions.map((c, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>{c.name}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 80, height: 6, background: '#f1f5f9', borderRadius: 10 }}>
                                        <div style={{
                                            width: `${(c.count / insights.totalExperiences) * 100}%`,
                                            height: '100%',
                                            background: '#2563eb',
                                            borderRadius: 10
                                        }} />
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e293b' }}>{c.count}</span>
                                </div>
                            </div>
                        ))}
                        {insights.topConditions.length === 0 && (
                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', margin: '20px 0' }}>Insufficient data for condition mapping.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* RECENT REVIEWS BOARD */}
            <div style={{ background: 'white', borderRadius: 24, padding: 32, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>Public Reputation Board</h2>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb', background: '#eff6ff', padding: '6px 12px', borderRadius: 10 }}>
                        Real-time verified feedback
                    </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {insights.recentExperiences.map((exp, i) => (
                        <div key={i} style={{ paddingBottom: 20, borderBottom: i !== insights.recentExperiences.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#64748b', fontSize: '0.75rem' }}>
                                        {exp.userId?.name?.[0] || 'U'}
                                    </div>
                                    <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{exp.userId?.name || 'Anonymous User'}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>• Treated for {exp.condition}</span>
                                </div>
                                <div style={{
                                    padding: '4px 10px',
                                    borderRadius: 20,
                                    fontSize: '0.65rem',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    background: exp.outcome === 'success' ? '#d1fae5' : '#fee2e2',
                                    color: exp.outcome === 'success' ? '#065f46' : '#991b1b'
                                }}>
                                    {exp.outcome}
                                </div>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, lineHeight: 1.6 }}>"{exp.description}"</p>
                        </div>
                    ))}
                    {insights.recentExperiences.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No public experiences shared yet for {hospital.name}.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default HospitalIntelligence
