import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import AppLayout from '../components/layout/AppLayout'
import { getCommunityFeed } from '../features/experiences/experienceSlice'
import { toggleSaveInsight } from '../features/insights/insightsSlice'
import { toggleHelpful } from '../features/experiences/experienceSlice'
import {
    Shield, Heart, Bookmark, ChevronDown, Users,
    ChevronRight, Zap, MessageCircle, Star,
    Flame, Sparkles, UserPlus, Brain, Loader2
} from 'lucide-react'
import { CardSkeleton } from '../components/Skeleton'

const CIRCLES = [
    { id: 'trending', name: 'Trending Feed', icon: <Flame size={18} />, count: '2.4k', color: '#f97316' },
    { id: 'Cardiology', name: 'Cardiac Support', icon: <Heart size={18} />, count: '840', color: '#ef4444' },
    { id: 'Oncology', name: 'Cancer Survivors', icon: <Sparkles size={18} />, count: '1.2k', color: '#8b5cf6' },
    { id: 'Neurology', name: 'Neuro Health', icon: <Zap size={18} />, count: '620', color: '#f59e0b' },
    { id: 'Mental Health', name: 'Mind Matters', icon: <MessageCircle size={18} />, count: '3.1k', color: '#06b6d4' },
    { id: 'Diabetes', name: 'Diabetes Mgmt', icon: <Star size={18} />, count: '950', color: '#10b981' },
]

function CommunityCard({ exp }) {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { helpfulIds } = useSelector(s => s.experiences)
    const { savedIds } = useSelector(s => s.insights)
    const { user } = useSelector(s => s.auth)
    const [expanded, setExpanded] = useState(false)

    const liked = helpfulIds.includes(exp._id)
    const saved = savedIds.includes(exp._id)

    const initials = exp.isAnonymous
        ? '?'
        : (exp.userId?.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2)

    const handleHelpful = () => {
        if (!user) { navigate('/login'); return }
        dispatch(toggleHelpful(exp._id))
    }

    const handleSave = () => {
        if (!user) { navigate('/login'); return }
        dispatch(toggleSaveInsight(exp._id))
    }

    return (
        <div className="hn-feed-card" style={{ border: '1.5px solid #e2e8f0', borderRadius: 20, padding: 20, background: 'white' }}>
            <div className="hn-feed-card-top" style={{ marginBottom: 16 }}>
                <div className="hn-feed-avatar" style={{ background: exp.isAnonymous ? '#f1f5f9' : 'linear-gradient(135deg, #2563eb, #7c3aed)', color: exp.isAnonymous ? '#64748b' : 'white', borderRadius: 14 }}>
                    {exp.isAnonymous ? <Shield size={18} /> : initials}
                </div>
                <div className="hn-feed-meta">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>{exp.isAnonymous ? 'Anonymous Patient' : exp.userId?.name}</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: 20 }}>{exp.condition}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                        Shared in {exp.hospital || 'Private Clinic'} • {new Date(exp.createdAt).toLocaleDateString()}
                    </div>
                </div>
            </div>

            <p style={{
                fontSize: '0.9rem', color: '#1e293b', lineHeight: 1.6, margin: '0 0 16px',
                overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: expanded ? 'unset' : 3, WebkitBoxOrient: 'vertical'
            }}>
                {exp.description}
            </p>

            {exp.description?.length > 150 && (
                <button onClick={() => setExpanded(!expanded)} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', marginBottom: 16, padding: 0 }}>
                    {expanded ? 'Read Less' : 'Read Full Journey'}
                </button>
            )}

            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 12, display: 'flex', gap: 20, marginBottom: 20 }}>
                <div>
                    <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 800, marginBottom: 2 }}>Treatment Path</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{exp.treatment || 'Multi-modal'}</div>
                </div>
                <div>
                    <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 800, marginBottom: 2 }}>Recovery Period</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{exp.recoveryTime || '—'}</div>
                </div>
            </div>

            <div className="hn-feed-footer" style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button className={`hn-footer-btn helpful ${liked ? 'active' : ''}`} onClick={handleHelpful} style={{ borderRadius: 10, padding: '8px 16px' }}>
                        <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                        <span style={{ fontWeight: 700 }}>{exp.helpfulCount || 0}</span>
                    </button>
                    <button className={`hn-footer-btn ${saved ? 'active' : ''}`} onClick={handleSave} style={{ borderRadius: 10, padding: '8px 16px' }}>
                        <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
                    </button>
                </div>
                {!exp.isAnonymous && (
                    <button onClick={() => navigate(`/messages?user=${exp.userId?._id || exp.userId}`)} style={{ background: '#f1f5f9', border: 'none', padding: '8px 16px', borderRadius: 10, fontSize: '0.8rem', fontWeight: 700, color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MessageCircle size={14} /> Send Insight
                    </button>
                )}
            </div>
        </div>
    )
}

function CommunityPage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user } = useSelector(s => s.auth)
    const { communityExperiences, isLoading } = useSelector(s => s.experiences)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [activeCircle, setActiveCircle] = useState('trending')
    const [aiSummary, setAiSummary] = useState('')
    const [aiLoading, setAiLoading] = useState(false)

    useEffect(() => {
        if (!user) { navigate('/login'); return }
        dispatch(getCommunityFeed({ page, condition: activeCircle === 'trending' ? undefined : activeCircle })).then(res => {
            if (res.payload?.pages && page >= res.payload.pages) setHasMore(false)
        })
    }, [dispatch, page, user, navigate, activeCircle])

    // Generate AI Summary for the active circle
    useEffect(() => {
        const fetchAiInsight = async () => {
            if (communityExperiences.length < 2) return;
            setAiLoading(true);
            try {
                // Using the new search AI insight endpoint for community summary
                const res = await axios.get(`/api/search?condition=${activeCircle === 'trending' ? '' : activeCircle}&aiSummary=true`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setAiSummary(res.data.aiInsight);
            } catch (err) {
                console.error("AI Insight Error:", err);
            } finally {
                setAiLoading(false);
            }
        };
        fetchAiInsight();
    }, [activeCircle, communityExperiences.length > 0]);

    if (!user) return null

    return (
        <AppLayout>
            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 32, alignItems: 'start' }}>

                {/* SIDEBAR: SUPPORT CIRCLES */}
                <div style={{ position: 'sticky', top: 20 }}>
                    <div style={{ marginBottom: 24 }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0 0 8px' }}>Support Circles</h2>
                        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Join condition-specific groups to find relevant experiences.</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {CIRCLES.map(circle => (
                            <button
                                key={circle.id}
                                onClick={() => { setActiveCircle(circle.id); setPage(1); setAiSummary(''); }}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '12px 16px', borderRadius: 12, border: 'none',
                                    background: activeCircle === circle.id ? '#0f172a' : 'white',
                                    color: activeCircle === circle.id ? 'white' : '#475569',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                    boxShadow: activeCircle === circle.id ? '0 10px 15px -3px rgba(0,0,0,0.1)' : 'none'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ color: activeCircle === circle.id ? 'white' : circle.color }}>{circle.icon}</div>
                                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{circle.name}</span>
                                </div>
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.6 }}>{circle.count}</span>
                            </button>
                        ))}
                    </div>

                    <div style={{ marginTop: 32, padding: 20, background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: 20, color: 'white' }}>
                        <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                            <UserPlus size={20} />
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: 4 }}>Need more help?</div>
                        <p style={{ fontSize: '0.75rem', opacity: 0.8, lineHeight: 1.5, margin: 0 }}>Create a private circle for your rare condition and invite others.</p>
                        <button style={{ width: '100%', marginTop: 16, padding: '8px', borderRadius: 10, border: 'none', background: 'white', color: '#2563eb', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer' }}>Create Circle</button>
                    </div>
                </div>

                {/* MAIN FEED */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 850 }}>{CIRCLES.find(c => c.id === activeCircle)?.name}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{communityExperiences.length} Active Journeys Verified</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={() => navigate('/share-experience')} className="hn-share-btn">Post Journey</button>
                        </div>
                    </div>

                    {/* AI SMART INSIGHT BANNER */}
                    {(aiLoading || aiSummary) && (
                        <div style={{
                            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                            border: '1px solid #bae6fd',
                            borderRadius: 20,
                            padding: '24px',
                            marginBottom: 32,
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                    <div style={{ background: '#2563eb', color: 'white', padding: 6, borderRadius: 8 }}>
                                        <Brain size={18} />
                                    </div>
                                    <span style={{ fontWeight: 900, color: '#0369a1', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>HealNet AI Feed Analysis</span>
                                </div>
                                {aiLoading ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#0369a1' }}>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Analyzing community experiences...</span>
                                    </div>
                                ) : (
                                    <p style={{ margin: 0, fontSize: '1rem', color: '#0c4a6e', lineHeight: 1.6, fontWeight: 700 }}>
                                        {aiSummary}
                                    </p>
                                )}
                            </div>
                            <Sparkles size={80} color="#3b82f6" style={{ position: 'absolute', right: -20, top: -20, opacity: 0.1 }} />
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {isLoading && page === 1
                            ? [1, 2, 3].map(i => <CardSkeleton key={i} />)
                            : communityExperiences.length === 0 && !isLoading
                                ? (
                                    <div className="hn-empty-state" style={{ background: 'white', borderRadius: 20, border: '1.5px dashed #e2e8f0', padding: 60 }}>
                                        <div className="hn-empty-icon" style={{ background: '#f8fafc' }}><Users size={32} color="#94a3b8" /></div>
                                        <div className="hn-empty-title">Empty Support Circle</div>
                                        <div className="hn-empty-sub">Be the first to share your journey in this circle and illuminate the path for others.</div>
                                        <button onClick={() => navigate('/share-experience')} style={{ marginTop: 20, background: '#2563eb', color: 'white', border: 'none', borderRadius: 12, padding: '12px 24px', fontWeight: 800, cursor: 'pointer' }}>Share Your Experience</button>
                                    </div>
                                )
                                : communityExperiences.map(exp => <CommunityCard key={exp._id} exp={exp} />)
                        }

                        {isLoading && page > 1 && [1, 2].map(i => <CardSkeleton key={i} />)}

                        {hasMore && !isLoading && communityExperiences.length > 0 && (
                            <button className="hn-load-more" onClick={() => setPage(p => p + 1)} style={{ background: 'white', borderRadius: 15, border: '1.5px solid #e2e8f0' }}>
                                <ChevronDown size={16} />
                                View More Journeys
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <style>{`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </AppLayout>
    )
}

export default CommunityPage
