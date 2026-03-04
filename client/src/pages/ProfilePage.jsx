import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getPublicProfile } from '../features/profile/profileSlice';
import AppLayout from '../components/layout/AppLayout';
import { MapPin, Mail, Phone, Calendar, Shield, MessageSquare, Verified, Award, Share2, Heart, Star, CheckCircle } from 'lucide-react';
import { ExperienceCard } from '../components/ExperienceCard';

function ProfilePage() {
    const { username } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { publicProfile, isLoading, isError, message: profileError } = useSelector((state) => state.profile);
    const { user: currentUser } = useSelector((state) => state.auth);

    useEffect(() => {
        if (username) {
            dispatch(getPublicProfile(username));
        }
    }, [dispatch, username]);

    if (isLoading) {
        return (
            <AppLayout>
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    <div className="hn-loader" style={{ margin: '0 auto 16px' }}></div>
                    <p style={{ fontWeight: 600 }}>Analyzing Profile Data...</p>
                </div>
            </AppLayout>
        );
    }

    if (isError || !publicProfile) {
        return (
            <AppLayout>
                <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                    <div style={{
                        width: '64px', height: '64px', background: '#fee2e2', color: '#dc2626',
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px'
                    }}>
                        <Shield size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Profile Not Found</h2>
                    <p style={{ color: '#64748b', marginBottom: '24px' }}>{profileError || "The profile you're looking for doesn't exist or is private."}</p>
                    <button
                        onClick={() => navigate('/')}
                        style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '9px', fontWeight: 700, cursor: 'pointer' }}
                    >
                        Return to Feed
                    </button>
                </div>
            </AppLayout>
        );
    }

    const { user, experiences } = publicProfile;
    const isMe = currentUser?._id === user._id;
    const isAnon = user.isAnonymous && !isMe;

    const handleMessage = () => {
        if (!currentUser) { navigate('/login'); return; }
        navigate(`/messages?user=${user._id}`);
    };

    const stats = [
        { label: 'Experiences', value: experiences?.length || 0, icon: <Star size={18} />, color: '#2563eb' },
        { label: 'Helpful Marks', value: experiences?.reduce((acc, curr) => acc + (curr.helpfulCount || 0), 0) || 0, icon: <Heart size={18} />, color: '#ec4899' },
        { label: 'Trust Points', value: user.credentialPoints || 0, icon: <Award size={18} />, color: '#8b5cf6' },
    ];

    return (
        <AppLayout>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* ── Premium Profile Header ── */}
                <div style={{
                    background: 'white', borderRadius: '20px', overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0'
                }}>
                    {/* Banner */}
                    <div style={{
                        height: '160px',
                        background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                        position: 'relative'
                    }}>
                        <div style={{ position: 'absolute', bottom: '12px', right: '20px', display: 'flex', gap: '8px' }}>
                            <button style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', padding: '6px 12px', color: 'white', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', backdropFilter: 'blur(4px)', cursor: 'pointer' }}>
                                <Share2 size={14} /> Share Profile
                            </button>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div style={{ padding: '0 32px 32px', position: 'relative' }}>
                        {/* Avatar */}
                        <div style={{
                            width: '120px', height: '120px', borderRadius: '50%', background: 'white',
                            padding: '5px', position: 'absolute', top: '-60px', left: '32px',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{
                                width: '100%', height: '100%', borderRadius: '50%',
                                background: isAnon ? '#f1f5f9' : 'linear-gradient(135deg, #2563eb, #10b981)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontSize: '2.5rem', fontWeight: 'bold', overflow: 'hidden'
                            }}>
                                {isAnon ? (
                                    <Shield size={50} className="text-slate-400" />
                                ) : user.profilePicture ? (
                                    <img src={user.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    user.name?.charAt(0) || 'U'
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', gap: '12px' }}>
                            {isMe ? (
                                <button
                                    onClick={() => navigate('/settings')}
                                    style={{ border: '1.5px solid #e2e8f0', background: 'white', padding: '8px 20px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
                                >
                                    Edit Profile
                                </button>
                            ) : (
                                <>
                                    {user.allowMessages !== false && (
                                        <button
                                            onClick={handleMessage}
                                            style={{ background: '#2563eb', color: 'white', border: 'none', padding: '8px 24px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}
                                        >
                                            <MessageSquare size={18} /> Message
                                        </button>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Name & Identity */}
                        <div style={{ marginTop: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                <h1 style={{ fontSize: '1.8rem', fontWeight: 850, color: '#1e293b', margin: 0 }}>
                                    {isAnon ? 'Anonymous Patient' : user.name}
                                </h1>
                                {user.contributorBadge === 'verified' && !isAnon && (
                                    <CheckCircle size={22} fill="#2563eb" color="white" />
                                )}
                            </div>
                            <p style={{ color: '#64748b', fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {isAnon ? '@anonymous' : `@${user.username}`}
                                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#cbd5e1' }}></span>
                                <span style={{ fontSize: '0.85rem' }}>Joined {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
                            </p>

                            {/* Bio */}
                            {user.bio && !isAnon && (
                                <p style={{ marginTop: '16px', color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', maxWidth: '700px' }}>
                                    {user.bio}
                                </p>
                            )}

                            {/* Meta Info Tabs */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '20px', color: '#64748b', fontSize: '0.85rem' }}>
                                {user.location && !isAnon && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={16} /> {user.location}</div>
                                )}
                                {user.role === 'admin' && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontWeight: 700 }}>
                                        <Award size={16} /> HealNet Admin
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Trust & Stats Section ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {stats.map((stat, i) => (
                        <div key={i} style={{
                            background: 'white', padding: '20px', borderRadius: '16px',
                            border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px'
                        }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: '12px', background: `${stat.color}15`,
                                color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {stat.icon}
                            </div>
                            <div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>{stat.value}</div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                            </div>
                        </div>
                    ))}
                    <div style={{
                        background: 'white', padding: '20px', borderRadius: '16px',
                        border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px'
                    }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '12px', background: '#f59e0b15',
                            color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Award size={18} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', textTransform: 'capitalize' }}>{user.contributorBadge || 'New Member'}</div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reliability Tier</div>
                        </div>
                    </div>
                </div>

                {/* ── Main Activity Feed ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px', alignItems: 'start' }}>
                    {/* Sidebar: Health Profile (Private unless public) */}
                    <div style={{
                        background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0',
                        padding: '20px', position: 'sticky', top: '20px'
                    }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Shield size={16} color="#64748b" /> Health Profile
                        </h3>
                        {isAnon ? (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <Shield size={32} color="#cbd5e1" style={{ marginBottom: '8px' }} />
                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: '1.4' }}>This profile is protected under HealNet Anonymity Shield.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Age Group</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>{user.healthProfile?.ageGroup || 'Not shared'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Biological Sex</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>{user.healthProfile?.biologicalSex || 'Not shared'}</div>
                                </div>
                                {user.healthProfile?.chronicConditions?.length > 0 && (
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Conditions</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                                            {user.healthProfile.chronicConditions.map((c, i) => (
                                                <span key={i} style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: '4px' }}>{c}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', fontSize: '0.75rem', color: '#94a3b8' }}>
                                    Shared data helps the AI personalize your medical insights.
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right column: Journeys */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 850, color: '#1e293b' }}>Shared Patient Journeys</h2>
                            {isMe && (
                                <button
                                    onClick={() => navigate('/share-experience')}
                                    style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                                >
                                    + Post New
                                </button>
                            )}
                        </div>

                        {experiences?.length === 0 ? (
                            <div style={{
                                background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1',
                                padding: '40px', textAlign: 'center', color: '#94a3b8'
                            }}>
                                <Calendar size={32} style={{ marginBottom: '12px' }} />
                                <p>No journeys shared permanently yet.</p>
                            </div>
                        ) : (
                            experiences.map(exp => (
                                <ExperienceCard key={exp._id} exp={exp} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

export default ProfilePage;
