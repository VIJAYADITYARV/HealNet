import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getExperiences, resetFeed } from '../features/experiences/experienceSlice'
import { getUserLikes } from '../features/likes/likesSlice'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Users, ChevronDown, Filter } from 'lucide-react'
import { ExperienceCard } from './ExperienceCard'
import { CardSkeleton } from './Skeleton'

const OUTCOME_FILTERS = ['', 'success', 'improvement', 'ongoing', 'complication']
const OUTCOME_LABELS = { '': 'All', success: 'Success', improvement: 'Improved', ongoing: 'Ongoing', complication: 'Complication' }

function EmptyState() {
    const navigate = useNavigate()
    return (
        <div className="hn-empty-state">
            <div className="hn-empty-icon">
                <Users size={32} color="#2563eb" strokeWidth={1.5} />
            </div>
            <div className="hn-empty-title">Be the first to help others</div>
            <div className="hn-empty-sub">
                No experiences have been shared for this condition yet.<br />
                Your journey could help someone make a better decision.
            </div>
            <button
                onClick={() => navigate('/share-experience')}
                style={{
                    marginTop: 16, background: '#2563eb', color: 'white', border: 'none',
                    borderRadius: 9, padding: '9px 20px', fontSize: '0.82rem',
                    fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                }}
            >
                Share Your Experience
            </button>
        </div>
    )
}

function ExperienceFeed() {
    const [page, setPage] = useState(1)
    const [activeOutcome, setActiveOutcome] = useState('')
    const [searchParams] = useSearchParams()
    const conditionParam = searchParams.get('condition') || ''

    const dispatch = useDispatch()
    const { experiences, isLoading, isError, message, pages } = useSelector(
        (s) => s.experiences
    )
    const { user } = useSelector(s => s.auth)

    useEffect(() => {
        dispatch(resetFeed())
        setPage(1)
        if (user) {
            dispatch(getUserLikes())
        }
    }, [dispatch, activeOutcome, conditionParam, user])

    useEffect(() => {
        dispatch(getExperiences({
            page,
            condition: conditionParam || undefined,
            outcome: activeOutcome || undefined
        }))
    }, [dispatch, page, activeOutcome, conditionParam])

    if (isLoading && page === 1) {
        return (
            <div>
                <div className="hn-section-title">Patient Journeys</div>
                {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
            </div>
        )
    }

    if (isError) {
        return (
            <div className="hn-empty-state">
                <div className="hn-empty-title" style={{ color: '#dc2626' }}>Could not load experiences</div>
                <div className="hn-empty-sub">{message}</div>
            </div>
        )
    }

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div className="hn-section-title" style={{ margin: 0, fontSize: '0.82rem', letterSpacing: '0.05em', opacity: 0.8 }}>PATIENT JOURNEYS</div>
            </div>

            {/* Filter chips by outcome */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <Filter size={12} color="var(--text-muted)" />
                </div>
                {OUTCOME_FILTERS.map(f => (
                    <button
                        key={f}
                        onClick={() => { setActiveOutcome(f); setPage(1) }}
                        style={{
                            padding: '6px 14px', borderRadius: 12, fontSize: '0.73rem', fontWeight: 600,
                            border: '1px solid',
                            borderColor: activeOutcome === f ? 'var(--blue-trust)' : 'var(--border)',
                            background: activeOutcome === f ? 'var(--blue-trust)' : 'var(--card-bg)',
                            color: activeOutcome === f ? 'white' : 'var(--text-secondary)',
                            cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', fontFamily: 'inherit',
                            boxShadow: activeOutcome === f ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none',
                            backdropFilter: 'blur(10px)'
                        }}
                        onMouseOver={e => {
                            if (activeOutcome !== f) {
                                e.currentTarget.style.borderColor = 'var(--blue-trust)';
                                e.currentTarget.style.background = 'var(--blue-light)';
                            }
                        }}
                        onMouseOut={e => {
                            if (activeOutcome !== f) {
                                e.currentTarget.style.borderColor = 'var(--border)';
                                e.currentTarget.style.background = 'var(--card-bg)';
                            }
                        }}
                    >
                        {OUTCOME_LABELS[f]}
                    </button>
                ))}
            </div>

            <div className="hn-feed-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {experiences.length === 0 && !isLoading
                    ? <EmptyState />
                    : experiences.map(exp => <ExperienceCard key={exp._id} exp={exp} />)
                }
            </div>

            {/* Loading more skeleton */}
            {isLoading && page > 1 && [1, 2].map(i => <CardSkeleton key={i} />)}

            {/* Load more */}
            {page < pages && !isLoading && (
                <button className="hn-load-more" onClick={() => setPage(p => p + 1)}>
                    <ChevronDown size={16} />
                    Load more journeys
                </button>
            )}
        </div>
    )
}

export default ExperienceFeed
