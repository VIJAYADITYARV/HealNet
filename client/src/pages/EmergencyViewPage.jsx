import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import {
    Shield, Heart, AlertTriangle, Phone,
    MapPin, User, Info, Activity
} from 'lucide-react'

const EmergencyViewPage = () => {
    const { id } = useParams()
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchEmergencyData = async () => {
            try {
                // Public endpoint to get minimal emergency info
                const res = await axios.get(`/api/users/emergency-info/${id}`);
                setUserData(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchEmergencyData();
    }, [id]);

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fef2f2' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ border: '4px solid #fecaca', borderTop: '4px solid #dc2626', borderRadius: '50%', width: 40, height: 40, animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                <p style={{ fontWeight: 700, color: '#dc2626' }}>Loading Life-Saving Data...</p>
            </div>
        </div>
    )

    if (!userData) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 20 }}>
            <div style={{ textAlign: 'center', maxWidth: 400 }}>
                <Shield size={64} color="#94a3b8" style={{ marginBottom: 20 }} />
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Medical ID Not Found</h1>
                <p style={{ color: '#64748b', marginTop: 8 }}>The scanned QR code is invalid or the profile has been set to private.</p>
            </div>
        </div>
    )

    const hp = userData.healthProfile || {}

    return (
        <div style={{ minHeight: '100vh', background: '#fef2f2', padding: '20px' }}>
            <div style={{ maxWidth: 500, margin: '0 auto' }}>
                {/* EMERGENCY HEADER */}
                <div style={{ background: '#dc2626', borderRadius: '24px 24px 0 0', padding: '32px 24px', textAlign: 'center', color: 'white', border: '1px solid #b91c1c' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(255,255,255,0.2)', borderRadius: 20, marginBottom: 16 }}>
                        <AlertTriangle size={16} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Emergency Medical ID</span>
                    </div>
                    <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 900 }}>{userData.name}</h1>
                    <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '0.9rem' }}>Critical Medical Information for First Responders</p>
                </div>

                {/* CONTENT CARDS */}
                <div style={{ background: 'white', borderRadius: '0 0 24px 24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: 20, boxShadow: '0 10px 25px rgba(220,38,38,0.1)', border: '1px solid #fee2e2', borderTop: 'none' }}>

                    {/* CRITICAL ALERTS */}
                    <div style={{ background: '#fff1f2', border: '1.5px solid #fecaca', borderRadius: 20, padding: 20 }}>
                        <h3 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: '#991b1b', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Shield size={16} /> Key Medical Alerts
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: '#b91c1c', fontWeight: 700, textTransform: 'uppercase' }}>Allergies</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#dc2626' }}>{hp.allergies?.join(', ') || 'No known allergies'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.7rem', color: '#b91c1c', fontWeight: 700, textTransform: 'uppercase' }}>Chronic Conditions</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#dc2626' }}>{hp.chronicConditions?.join(', ') || 'None reported'}</div>
                            </div>
                        </div>
                    </div>

                    {/* VITAL INFO GRID */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div style={{ padding: 16, background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <Activity size={14} color="#64748b" />
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Biological Sex</span>
                            </div>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>{hp.biologicalSex || 'Not Specified'}</div>
                        </div>
                        <div style={{ padding: 16, background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <User size={14} color="#64748b" />
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Age Group</span>
                            </div>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>{hp.ageGroup || 'Not Specified'}</div>
                        </div>
                    </div>

                    {/* EMERGENCY CONTACTS */}
                    <div style={{ padding: 20, background: '#f8fafc', borderRadius: 20, border: '1px solid #e2e8f0' }}>
                        <h3 style={{ margin: '0 0 16px', fontSize: '0.8rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Phone size={16} /> Emergency Contact
                        </h3>
                        <div style={{ border: 'none', background: 'white', borderRadius: 12, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{userData.emergencyContactName || 'Family Member'}</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{userData.emergencyContactPhone || userData.phone || 'Contact not listed'}</div>
                            </div>
                            <a href={`tel:${userData.emergencyContactPhone || userData.phone}`} style={{ width: 44, height: 44, borderRadius: '50%', background: '#dc2626', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', boxShadow: '0 4px 12px rgba(220,38,38,0.3)' }}>
                                <Phone size={20} />
                            </a>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: 10 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: '0.75rem' }}>
                            <Shield size={14} /> Encrypted by HealNet Security Protocols
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    )
}

export default EmergencyViewPage
