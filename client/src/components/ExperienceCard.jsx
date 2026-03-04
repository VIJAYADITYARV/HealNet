import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { toggleHelpful } from '../features/experiences/experienceSlice'
import { toggleSaveInsight } from '../features/insights/insightsSlice'
import { addLike, removeLike } from '../features/likes/likesSlice'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, Heart, Bookmark, Users, ChevronRight, ThumbsUp, MessageSquare, Send, Trash2 } from 'lucide-react'

/* Outcome badge styling */
const OUTCOME_MAP = {
    success: { label: '✓ Success', cls: 'success' },
    improvement: { label: '✓ Improved', cls: 'success' },
    ongoing: { label: '⏳ Ongoing', cls: 'ongoing' },
    'no improvement': { label: '⚠ No Change', cls: 'complication' },
    complication: { label: '⚠ Complication', cls: 'complication' },
}

function getOutcome(raw) {
    const key = (raw || '').toLowerCase()
    return OUTCOME_MAP[key] || { label: raw || 'Unknown', cls: 'ongoing' }
}

/* Avatar colour by condition initial */
const AVATAR_COLORS = [
    ['#2563eb', '#60a5fa'], ['#059669', '#34d399'], ['#7c3aed', '#a78bfa'],
    ['#d97706', '#fbbf24'], ['#dc2626', '#f87171'],
]
function avatarColor(str = '') {
    const i = str.charCodeAt(0) % AVATAR_COLORS.length
    return AVATAR_COLORS[i]
}

function simScore(exp) {
    const seed = (exp._id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    return 62 + (seed % 35)
}

export function ExperienceCard({ exp }) {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { helpfulIds } = useSelector(s => s.experiences)
    const { savedIds } = useSelector(s => s.insights)
    const { likedExperienceIds } = useSelector(s => s.likes)
    const { user } = useSelector(s => s.auth)
    const [expanded, setExpanded] = useState(false)
    const [showComments, setShowComments] = useState(false)
    const [commentsList, setCommentsList] = useState([])
    const [commentText, setCommentText] = useState('')
    const [loadingComments, setLoadingComments] = useState(false)
    const [localCommentCount, setLocalCommentCount] = useState(exp.commentCount || 0)
    const [localLikeCount, setLocalLikeCount] = useState(exp.likeCount || 0)

    useEffect(() => {
        setLocalCommentCount(exp.commentCount || 0)
    }, [exp.commentCount])

    useEffect(() => {
        setLocalLikeCount(exp.likeCount || 0)
    }, [exp.likeCount])

    const helpful = helpfulIds.includes(exp._id)
    const saved = savedIds.includes(exp._id)
    const liked = likedExperienceIds.includes(exp._id)
    const outcome = getOutcome(exp.outcome)
    const [c1, c2] = avatarColor(exp.condition)

    const isAnon = exp.visibility === 'ANONYMOUS' || exp.isAnonymous
    const authorName = isAnon ? 'Anonymous Patient' : (exp.userId?.name || 'User')
    const authorUsername = exp.userId?.username
    const initials = isAnon
        ? '?'
        : authorName.split(' ').map(w => w[0]).join('').slice(0, 2)
    const score = simScore(exp)

    const handleHelpful = () => {
        if (!user) { navigate('/login'); return }
        dispatch(toggleHelpful(exp._id))
    }

    const handleLike = () => {
        if (!user) { navigate('/login'); return }
        if (liked) {
            dispatch(removeLike(exp._id))
            setLocalLikeCount(prev => Math.max(0, prev - 1))
        } else {
            dispatch(addLike(exp._id))
            setLocalLikeCount(prev => prev + 1)
        }
    }

    const handleSave = () => {
        if (!user) { navigate('/login'); return }
        dispatch(toggleSaveInsight(exp._id))
    }

    const toggleComments = async () => {
        if (!showComments) {
            if (!exp?._id) {
                console.warn('[Feed] Cannot fetch comments: exp._id is missing', exp);
                return;
            }
            setShowComments(true)
            setLoadingComments(true)
            try {
                const res = await axios.get(`/api/comments/${exp._id}`)
                setCommentsList(res.data)
            } catch (error) {
                console.error('[Feed] Comment fetch error:', error)
            }
            setLoadingComments(false)
        } else {
            setShowComments(false)
        }
    }

    const submitComment = async (e) => {
        e.preventDefault()
        if (!user) { navigate('/login'); return }
        if (!commentText.trim()) return

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } }
            const res = await axios.post('/api/comments', { experienceId: exp._id, content: commentText }, config)
            setCommentsList([res.data, ...commentsList])
            setCommentText('')
            setLocalCommentCount(prev => prev + 1) // optimistic update UI state
        } catch (error) {
            console.error(error)
            alert(error?.response?.data?.message || error.message || 'Failed to post comment')
        }
    }

    const deleteComment = async (commentId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } }
            await axios.delete(`/api/comments/${commentId}`, config)
            setCommentsList(commentsList.filter(c => c._id !== commentId))
            setLocalCommentCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="hn-feed-card">
            {/* Top row */}
            <div className="hn-feed-card-top">
                <div className="hn-feed-avatar" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                    {initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                        {authorUsername ? (
                            <Link to={`/profile/${authorUsername}`} className="font-bold text-gray-800 hover:text-blue-600 transition-colors mr-2">
                                {authorName}
                            </Link>
                        ) : (
                            <span className="font-bold text-gray-800 mr-2">{authorName}</span>
                        )}
                        <span className="hn-feed-condition">{exp.condition}</span>
                        <span className={`hn-outcome-badge ${outcome.cls} ml-auto`}>{outcome.label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                        {exp.hospital && (
                            <button
                                className="hn-feed-hospital"
                                onClick={() => navigate('/hospitals')}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            >
                                🏥 {exp.hospital}
                            </button>
                        )}
                        {exp.city && (
                            <span style={{ fontSize: '0.73rem', color: '#64748b' }}>📍 {exp.city}</span>
                        )}
                        {isAnon && (
                            <span className="hn-feed-anon">
                                <Shield size={11} /> Anonymous
                            </span>
                        )}
                    </div>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', flexShrink: 0, whiteSpace: 'nowrap' }}>
                    {new Date(exp.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
            </div>

            {/* Symptom chips */}
            {exp.symptoms?.length > 0 && (
                <div className="hn-feed-chips">
                    {exp.symptoms.slice(0, 5).map((s, i) => (
                        <span key={i} className="hn-feed-chip">{s}</span>
                    ))}
                    {exp.symptoms.length > 5 && (
                        <span className="hn-feed-chip" style={{ background: '#f1f5f9', color: '#64748b' }}>
                            +{exp.symptoms.length - 5} more
                        </span>
                    )}
                </div>
            )}

            {/* Structured data block */}
            <div className="hn-data-block">
                <div>
                    <div className="hn-data-item-lbl">Treatment</div>
                    <div className="hn-data-item-val">{exp.treatment || '—'}</div>
                </div>
                <div>
                    <div className="hn-data-item-lbl">Recovery</div>
                    <div className="hn-data-item-val">{exp.recoveryTime || '—'}</div>
                </div>
                {exp.costRange && (
                    <div>
                        <div className="hn-data-item-lbl">Cost Range</div>
                        <div className="hn-data-item-val">{exp.costRange}</div>
                    </div>
                )}
            </div>

            {/* Expandable description */}
            {exp.description && (
                <div style={{ marginBottom: 8 }}>
                    <p style={{
                        fontSize: '0.85rem', color: '#475569', lineHeight: 1.6, margin: 0,
                        overflow: expanded ? 'visible' : 'hidden',
                        display: '-webkit-box', WebkitLineClamp: expanded ? 'unset' : 2,
                        WebkitBoxOrient: 'vertical',
                    }}>
                        {exp.description}
                    </p>
                    <button
                        onClick={() => setExpanded(p => !p)}
                        style={{
                            background: 'none', border: 'none', color: '#2563eb',
                            fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                            padding: '2px 0', display: 'flex', alignItems: 'center', gap: 3,
                        }}
                    >
                        {expanded ? 'Show less' : 'Read full journey'}
                        <ChevronRight size={12} style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>
                </div>
            )}

            {/* Trust footer & Engagement */}
            <div className="hn-feed-footer flex-wrap gap-y-2">
                <button
                    className={`hn-footer-btn flex-1 min-w-[max-content] helpful ${helpful ? 'active' : ''}`}
                    onClick={handleHelpful}
                >
                    <Heart size={14} fill={helpful ? 'currentColor' : 'none'} />
                    {exp.helpfulCount > 0 ? `${exp.helpfulCount} ` : ''}Helpful
                </button>

                <button
                    className={`hn-footer-btn flex-1 min-w-[max-content] ${liked ? 'active text-blue-600 bg-blue-50 border-blue-200' : ''}`}
                    onClick={handleLike}
                >
                    <ThumbsUp size={14} fill={liked ? 'currentColor' : 'none'} />
                    {localLikeCount > 0 ? `${localLikeCount} ` : ''}Like
                </button>

                <button
                    className="hn-footer-btn flex-1 min-w-[max-content]"
                    onClick={toggleComments}
                >
                    <MessageSquare size={14} fill={showComments ? 'currentColor' : 'none'} className={showComments ? 'text-blue-600' : ''} />
                    {localCommentCount > 0 ? `${localCommentCount} ` : ''}Comment
                </button>

                <button
                    className={`hn-footer-btn flex-1 min-w-[max-content] ${saved ? 'active' : ''}`}
                    onClick={handleSave}
                >
                    <Bookmark size={12} fill={saved ? 'currentColor' : 'none'} />
                    {saved ? 'Saved' : 'Save'}
                </button>
                <button
                    className="hn-footer-btn"
                    onClick={() => navigate(`/search?condition=${encodeURIComponent(exp.condition)}`)}
                >
                    <Users size={12} />
                    Similar Cases
                </button>

                {/* Match score */}
                <div className="hn-match-score">
                    <span className="hn-match-label">{score}% match</span>
                    <div className="hn-match-bar">
                        <div className="hn-match-fill" style={{ width: `${score}%` }} />
                    </div>
                </div>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                    <form onSubmit={submitComment} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                        <div style={{
                            flex: 1, display: 'flex', alignItems: 'center', background: '#f8fafc',
                            borderRadius: '999px', padding: '0 16px', border: '1px solid #e2e8f0'
                        }}>
                            <input
                                type="text"
                                placeholder="Write a supportive comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                style={{
                                    flex: 1, border: 'none', background: 'none', padding: '10px 0',
                                    fontSize: '0.85rem', outline: 'none', color: '#1e293b'
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!commentText.trim()}
                            style={{
                                width: '40px', height: '40px', borderRadius: '50%', background: '#2563eb',
                                color: 'white', border: 'none', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s',
                                opacity: commentText.trim() ? 1 : 0.5
                            }}
                        >
                            <Send size={18} />
                        </button>
                    </form>

                    {loadingComments ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '0.85rem' }}>Loading comments...</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {commentsList.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic' }}>
                                    No comments yet. Be the first to share supportive advice!
                                </div>
                            ) : (
                                commentsList.map(comment => (
                                    <div key={comment._id} style={{ display: 'flex', gap: '10px' }}>
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '50%',
                                            background: comment.userId?.isAnonymous ? '#f1f5f9' : '#e2e8f0',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', flexShrink: 0
                                        }}>
                                            {comment.userId?.isAnonymous ? <Shield size={14} /> : (comment.userId?.name?.charAt(0) || 'U')}
                                        </div>
                                        <div style={{
                                            flex: 1, background: '#f1f5f9', borderRadius: '12px',
                                            padding: '8px 12px', position: 'relative'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#1e293b' }}>
                                                    {comment.userId?.isAnonymous ? 'Anonymous Patient' : (comment.userId?.name || 'User')}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                                        {new Date(comment.createdAt).toLocaleDateString()}
                                                    </div>
                                                    {comment.isAuthor && (
                                                        <button
                                                            onClick={() => deleteComment(comment._id)}
                                                            style={{
                                                                background: 'none', border: 'none', padding: '2px',
                                                                cursor: 'pointer', color: '#94a3b8', display: 'flex'
                                                            }}
                                                            title="Delete message"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.4' }}>
                                                {comment.content}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
