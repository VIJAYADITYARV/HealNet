import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getAnalytics } from '../../features/analytics/analyticsSlice'
import { Building2, TrendingUp, Flame, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import axios from 'axios'

function RightSidebar() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { data } = useSelector((s) => s.analytics)
    const [trending, setTrending] = useState([])
    const [treatmentSuccess, setTreatmentSuccess] = useState([])
    const [trustScores, setTrustScores] = useState([])

    useEffect(() => {
        dispatch(getAnalytics())
        // Load trending conditions
        axios.get('/api/analytics/trending-conditions').then(r => setTrending(r.data)).catch(() => { })
        // Load treatment success
        axios.get('/api/analytics/treatment-success?condition=Migraine').then(r => setTreatmentSuccess(r.data)).catch(() => { })
        // Load hospital trust scores
        axios.get('/api/analytics/hospital-trust?limit=4').then(r => setTrustScores(r.data)).catch(() => { })
    }, [dispatch])

    const hospitals = trustScores.length > 0
        ? trustScores.map((h, i) => ({
            name: h.name || h._id,
            rate: `${Math.round(h.trustScore || 85)}%`,
            cases: h.totalCases || 0,
            trend: i % 2 === 0 ? 'up' : 'down',
        }))
        : (data?.hospitalStats?.slice(0, 4).map((h, i) => ({
            name: h._id || h.name || `Hospital ${i + 1}`,
            rate: `${Math.round((h.successRate || h.avgSuccess || 85) * 100)}%`,
            cases: h.total || h.count || 0,
            trend: i % 2 === 0 ? 'up' : 'down',
        })) || [
                { name: 'Apollo Hospitals', rate: '94%', cases: 1240, trend: 'up' },
                { name: 'AIIMS Delhi', rate: '91%', cases: 980, trend: 'up' },
                { name: 'Fortis Healthcare', rate: '88%', cases: 760, trend: 'down' },
                { name: 'Max Super Spec.', rate: '85%', cases: 620, trend: 'up' },
            ])

    const trendingList = trending.length > 0
        ? trending.slice(0, 5).map(t => ({ tag: t.condition, count: `${t.count} cases` }))
        : [
            { tag: 'Migraine', count: '847 cases' },
            { tag: 'Chest Pain', count: '612 cases' },
            { tag: 'Knee Surgery', count: '543 cases' },
            { tag: 'Skin Allergy', count: '489 cases' },
            { tag: 'Fertility', count: '298 cases' },
        ]

    const treatmentList = treatmentSuccess.length > 0
        ? treatmentSuccess.slice(0, 3).map(t => ({ label: t.treatment, pct: Math.round(t.successRate) }))
        : [
            { label: 'Sumatriptan', pct: 82 },
            { label: 'Propranolol', pct: 74 },
            { label: 'Topiramate', pct: 67 },
        ]

    return (
        <aside className="hn-right">

            {/* Hospital Trust Scores */}
            <div className="hn-panel">
                <div className="hn-panel-title">
                    <div className="hn-panel-title-dot" />
                    <Building2 size={13} />
                    Hospital Trust Scores
                </div>
                {hospitals.map((h, i) => (
                    <div key={i} className="hn-hospital-row">
                        <div className="hn-hospital-rank">#{i + 1}</div>
                        <div className="hn-hospital-info">
                            <div className="hn-hospital-name">{h.name}</div>
                            <div className="hn-hospital-sub">{h.cases.toLocaleString()} cases analyzed</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                            <span className="hn-hospital-score">{h.rate}</span>
                            {h.trend === 'up'
                                ? <ArrowUpRight size={11} color="#059669" />
                                : <ArrowDownRight size={11} color="#dc2626" />
                            }
                        </div>
                    </div>
                ))}
                <button
                    onClick={() => navigate('/hospitals')}
                    style={{
                        marginTop: 10, width: '100%', background: 'none', border: '1px solid #bfdbfe',
                        borderRadius: 8, padding: '6px 0', fontSize: '0.75rem', fontWeight: 600,
                        color: '#2563eb', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = '#eff6ff' }}
                    onMouseOut={e => { e.currentTarget.style.background = 'none' }}
                >
                    View all hospitals →
                </button>
            </div>

            {/* Trending Today */}
            <div className="hn-panel">
                <div className="hn-panel-title">
                    <div className="hn-panel-title-dot" style={{ background: '#d97706' }} />
                    <Flame size={13} />
                    Trending Today
                </div>
                {trendingList.map((t, i) => (
                    <div
                        key={i}
                        className="hn-trend-item"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/?condition=${encodeURIComponent(t.tag)}`)}
                    >
                        <span className="hn-trend-tag">{t.tag}</span>
                        <span className="hn-trend-count">{t.count}</span>
                    </div>
                ))}
            </div>

            {/* Treatment Analytics */}
            <div className="hn-panel">
                <div className="hn-panel-title">
                    <div className="hn-panel-title-dot" style={{ background: '#059669' }} />
                    <TrendingUp size={13} />
                    Treatment Success
                </div>
                <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: 10 }}>
                    Most successful for <strong>Migraine</strong>:
                </div>
                {treatmentList.map((t, i) => (
                    <div key={i} style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 3 }}>
                            <span style={{ fontWeight: 600, color: '#0f172a' }}>{t.label}</span>
                            <span style={{ color: '#059669', fontWeight: 700 }}>{t.pct}%</span>
                        </div>
                        <div style={{ height: 5, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${t.pct}%`, background: 'linear-gradient(90deg,#059669,#34d399)', borderRadius: 999, transition: 'width 0.8s' }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Gamified Contribution Nudge */}
            <div className="hn-nudge" style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderColor: '#334155', color: 'white', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -10, left: -15, opacity: 0.08 }}>
                    <Flame size={60} color="#f59e0b" />
                </div>
                <div className="hn-nudge-title" style={{ color: '#bae6fd', fontSize: '0.82rem', marginBottom: '5px' }}>
                    🌟 Become a Community MVP
                </div>
                <div className="hn-nudge-sub" style={{ color: '#94a3b8', fontSize: '0.7rem', marginBottom: '10px', position: 'relative', zIndex: 1, lineHeight: 1.4 }}>
                    Share your health journey to unlock AI insights and help others make safer decisions.
                </div>
                <button
                    className="hn-nudge-btn"
                    onClick={() => navigate('/share-experience')}
                    style={{ background: 'linear-gradient(90deg, #38bdf8, #0284c7)', color: 'white', width: '100%', boxShadow: '0 4px 15px rgba(2,132,199,0.4)', padding: '6px 12px', fontSize: '0.75rem' }}
                >
                    Publish My Journey 🚀
                </button>
            </div>

        </aside>
    )
}

export default RightSidebar
