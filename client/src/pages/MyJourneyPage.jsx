import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import { getMyExperiences, deleteExperience, updateExperience } from '../features/experiences/experienceSlice'
import { BookOpen, Calendar, Building2, Clock, CheckCircle, AlertCircle, Activity, Trash2, Edit2, Search, X } from 'lucide-react'
import { CardSkeleton } from '../components/Skeleton'

const OUTCOME_CONFIG = {
    success: { icon: CheckCircle, color: '#059669', bg: '#d1fae5', label: 'Success' },
    improvement: { icon: CheckCircle, color: '#059669', bg: '#d1fae5', label: 'Improved' },
    ongoing: { icon: Activity, color: '#2563eb', bg: '#dbeafe', label: 'Ongoing' },
    'no improvement': { icon: AlertCircle, color: '#d97706', bg: '#fef3c7', label: 'No Change' },
    complication: { icon: AlertCircle, color: '#dc2626', bg: '#fee2e2', label: 'Complication' },
}

function EditModal({ exp, onClose, onSave }) {
    const [formData, setFormData] = useState({
        condition: exp.condition || '',
        hospital: exp.hospital || '',
        treatment: exp.treatment || '',
        outcome: exp.outcome || 'success',
        recoveryTime: exp.recoveryTime || '',
        description: exp.description || ''
    })

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value })

    const handleSubmit = e => {
        e.preventDefault()
        if (window.confirm('Save changes to your health record?')) {
            onSave(exp._id, formData)
        }
    }

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 20, width: '100%', maxWidth: 500, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'slideIn 0.2s ease' }}>
                <div style={{ padding: '24px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Edit Journey Entry</h3>
                        <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>Make sure your medical details are up to date.</p>
                    </div>
                    <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <X size={18} color="#64748b" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={labelStyleSmall}>Condition / Diagnosis</label>
                        <input name="condition" value={formData.condition} onChange={handleChange} required style={inputStyleSmall} />
                    </div>
                    <div>
                        <label style={labelStyleSmall}>Hospital & Facility</label>
                        <input name="hospital" value={formData.hospital} onChange={handleChange} style={inputStyleSmall} />
                    </div>
                    <div>
                        <label style={labelStyleSmall}>Treatment Protocol</label>
                        <textarea name="treatment" value={formData.treatment} onChange={handleChange} style={{ ...inputStyleSmall, height: 80, resize: 'none' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <label style={labelStyleSmall}>Recovery Outcome</label>
                            <select name="outcome" value={formData.outcome} onChange={handleChange} style={inputStyleSmall}>
                                <option value="success">Success</option>
                                <option value="improvement">Improved</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="no improvement">No Change</option>
                                <option value="complication">Complication</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyleSmall}>Recovery Duration</label>
                            <input name="recoveryTime" value={formData.recoveryTime} onChange={handleChange} style={inputStyleSmall} />
                        </div>
                    </div>
                    <div>
                        <label style={labelStyleSmall}>Personal Reflection</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} style={{ ...inputStyleSmall, height: 80, resize: 'none' }} />
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: 'white', fontWeight: 700, cursor: 'pointer' }}>
                            Discard
                        </button>
                        <button type="submit" style={{ flex: 2, padding: '12px', borderRadius: 12, border: 'none', background: '#2563eb', color: 'white', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>
                            Update Record
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

const labelStyleSmall = { display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.02em' }
const inputStyleSmall = {
    width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0',
    fontSize: '0.85rem', fontFamily: 'inherit', color: '#0f172a', outline: 'none',
    transition: 'all 0.2s', background: '#f8fafc', boxSizing: 'border-box'
}

function TimelineCard({ exp, isLast, onDelete, onEdit }) {
    const cfg = OUTCOME_CONFIG[(exp.outcome || '').toLowerCase()] || OUTCOME_CONFIG.ongoing
    const OutcomeIcon = cfg.icon

    return (
        <div style={{ display: 'flex', gap: 16, position: 'relative' }}>
            {/* Timeline line */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: cfg.bg, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', border: `2px solid ${cfg.color}`, flexShrink: 0,
                }}>
                    <OutcomeIcon size={16} color={cfg.color} />
                </div>
                {!isLast && (
                    <div style={{
                        width: 2, flex: 1, background: '#e2e8f0',
                        marginTop: 4, marginBottom: 4, minHeight: 24,
                    }} />
                )}
            </div>

            {/* Card content */}
            <div className="hn-feed-card" style={{ flex: 1, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{exp.condition}</div>
                        <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                            {exp.hospital && (
                                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Building2 size={11} /> {exp.hospital}
                                </span>
                            )}
                            {exp.city && (
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>📍 {exp.city}</span>
                            )}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{
                            display: 'inline-block', padding: '2px 10px', borderRadius: 999,
                            background: cfg.bg, color: cfg.color, fontSize: '0.72rem', fontWeight: 700,
                        }}>
                            {cfg.label}
                        </span>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                            <Calendar size={10} />
                            {new Date(exp.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                    </div>
                </div>

                <div className="hn-data-block">
                    <div>
                        <div className="hn-data-item-lbl">Treatment</div>
                        <div className="hn-data-item-val">{exp.treatment || '—'}</div>
                    </div>
                    <div>
                        <div className="hn-data-item-lbl">Recovery</div>
                        <div className="hn-data-item-val" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={11} color="#64748b" />{exp.recoveryTime || '—'}
                        </div>
                    </div>
                    {exp.costRange && (
                        <div>
                            <div className="hn-data-item-lbl">Cost</div>
                            <div className="hn-data-item-val">{exp.costRange}</div>
                        </div>
                    )}
                </div>

                {exp.description && (
                    <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.6, margin: '8px 0 0' }}>
                        {exp.description.slice(0, 200)}{exp.description.length > 200 ? '…' : ''}
                    </p>
                )}

                {exp.symptoms?.length > 0 && (
                    <div className="hn-feed-chips" style={{ marginTop: 8 }}>
                        {exp.symptoms.slice(0, 4).map((s, i) => (
                            <span key={i} className="hn-feed-chip">{s}</span>
                        ))}
                    </div>
                )}

                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        👍 {exp.helpfulCount || 0} people found this helpful
                    </span>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button
                            onClick={() => onEdit(exp)}
                            style={{
                                background: 'none', border: 'none', color: '#2563eb',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                                fontSize: '0.75rem', padding: 4
                            }}
                        >
                            <Edit2 size={12} /> Edit
                        </button>
                        <button
                            onClick={() => {
                                if (window.confirm('Are you sure you want to delete this experience?')) {
                                    onDelete(exp._id)
                                }
                            }}
                            style={{
                                background: 'none', border: 'none', color: '#ef4444',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                                fontSize: '0.75rem', padding: 4
                            }}
                        >
                            <Trash2 size={12} /> Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function MyJourneyPage() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user } = useSelector(s => s.auth)
    const { myExperiences, isLoading } = useSelector(s => s.experiences)

    const [searchTerm, setSearchTerm] = useState('')
    const [editingExp, setEditingExp] = useState(null)

    useEffect(() => {
        if (!user) { navigate('/login'); return }
        dispatch(getMyExperiences())
    }, [dispatch, user, navigate])

    const handleSaveEdit = (id, data) => {
        dispatch(updateExperience({ id, data }))
        setEditingExp(null)
    }

    if (!user) return null

    const filteredExperiences = myExperiences.filter(exp =>
        (exp.condition || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exp.hospital || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exp.treatment || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exp.symptoms || []).some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    return (
        <AppLayout>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div className="hn-section-title" style={{ margin: 0 }}>
                    <BookOpen size={16} />
                    My Medical Journey
                </div>
                <button
                    onClick={() => navigate('/share-experience')}
                    style={{
                        background: '#2563eb', color: 'white', border: 'none',
                        borderRadius: 8, padding: '7px 14px', fontSize: '0.78rem',
                        fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                    }}
                >
                    + Add Entry
                </button>
            </div>

            {isLoading
                ? [1, 2, 3].map(i => <CardSkeleton key={i} />)
                : myExperiences.length === 0
                    ? (
                        <div className="hn-empty-state">
                            <div className="hn-empty-icon"><BookOpen size={32} color="#2563eb" strokeWidth={1.5} /></div>
                            <div className="hn-empty-title">Your journey starts here</div>
                            <div className="hn-empty-sub">
                                Document your medical experiences to track your health history<br />and help others navigate similar situations.
                            </div>
                            <button onClick={() => navigate('/share-experience')} style={{
                                marginTop: 16, background: '#2563eb', color: 'white', border: 'none',
                                borderRadius: 9, padding: '9px 20px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                            }}>
                                Share First Experience
                            </button>
                        </div>
                    )
                    : (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                    {filteredExperiences.length} experience{filteredExperiences.length !== 1 ? 's' : ''} found
                                </div>
                                <div style={{ position: 'relative', width: '250px' }}>
                                    <input
                                        type="text"
                                        placeholder="Search your journeys..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{
                                            width: '100%', padding: '8px 12px 8px 32px',
                                            borderRadius: 8, border: '1px solid #e2e8f0',
                                            fontSize: '0.8rem', outline: 'none'
                                        }}
                                    />
                                    <Search size={14} color="#94a3b8" style={{ position: 'absolute', top: 10, left: 10 }} />
                                </div>
                            </div>

                            {filteredExperiences.length === 0 && searchTerm !== '' ? (
                                <div className="text-center py-10 text-gray-500">No experiences match your search '{searchTerm}'</div>
                            ) : undefined}

                            {filteredExperiences.map((exp, i) => (
                                <TimelineCard
                                    key={exp._id}
                                    exp={exp}
                                    isLast={i === filteredExperiences.length - 1}
                                    onDelete={(id) => dispatch(deleteExperience(id))}
                                    onEdit={setEditingExp}
                                />
                            ))}
                        </div>
                    )
            }
            {editingExp && <EditModal exp={editingExp} onClose={() => setEditingExp(null)} onSave={handleSaveEdit} />}
        </AppLayout>
    )
}

export default MyJourneyPage
