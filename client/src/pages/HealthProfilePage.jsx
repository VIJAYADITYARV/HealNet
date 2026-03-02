import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import AppLayout from '../components/layout/AppLayout'
import { UserCircle, Shield } from 'lucide-react'

const HealthProfilePage = () => {
    const { user } = useSelector((state) => state.auth)
    const [profileData, setProfileData] = useState({
        ageGroup: '',
        biologicalSex: '',
        chronicConditions: '',
        allergies: '',
        pastSurgeries: '',
        lifestyleIndicators: '',
        aiPersonalizationEnabled: false
    })
    const [loading, setLoading] = useState(false)
    const [savedStatus, setSavedStatus] = useState(null)

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('/api/users/health-profile', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });

                const data = res.data;
                setProfileData({
                    ageGroup: data.ageGroup || '',
                    biologicalSex: data.biologicalSex || '',
                    chronicConditions: (data.chronicConditions || []).join(', '),
                    allergies: (data.allergies || []).join(', '),
                    pastSurgeries: (data.pastSurgeries || []).join(', '),
                    lifestyleIndicators: (data.lifestyleIndicators || []).join(', '),
                    aiPersonalizationEnabled: data.aiPersonalizationEnabled || false
                });
            } catch (err) {
                console.error(err);
            }
        };
        if (user) fetchProfile();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updatePayload = {
                ageGroup: profileData.ageGroup,
                biologicalSex: profileData.biologicalSex,
                chronicConditions: profileData.chronicConditions.split(',').map(s => s.trim()).filter(Boolean),
                allergies: profileData.allergies.split(',').map(s => s.trim()).filter(Boolean),
                pastSurgeries: profileData.pastSurgeries.split(',').map(s => s.trim()).filter(Boolean),
                lifestyleIndicators: profileData.lifestyleIndicators.split(',').map(s => s.trim()).filter(Boolean),
                aiPersonalizationEnabled: profileData.aiPersonalizationEnabled
            };

            await axios.patch('/api/users/health-profile', updatePayload, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setSavedStatus('Profile updated successfully!');
            setTimeout(() => setSavedStatus(null), 3000);
        } catch (err) {
            setSavedStatus('Failed to update profile.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout>
            <div className="hn-section-title">
                <UserCircle size={16} />
                Personalized Health Insight Profile
            </div>

            <div style={{
                background: 'white', borderRadius: 14, padding: 24,
                boxShadow: '0 2px 15px -3px rgba(37,99,235,0.07)',
                border: '1px solid #e2e8f0',
            }}>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 20 }}>
                    Manage your health context to receive deeply personalized AI analysis and relevant community matched experiences. This data is kept strictly private.
                </p>

                {savedStatus && (
                    <div style={{
                        padding: '10px 14px', borderRadius: 8, marginBottom: 16,
                        background: savedStatus.includes('successfully') ? '#dcfce7' : '#fee2e2',
                        border: `1px solid ${savedStatus.includes('successfully') ? '#bbf7d0' : '#fecaca'}`,
                        color: savedStatus.includes('successfully') ? '#166534' : '#dc2626',
                        fontSize: '0.82rem', fontWeight: 600,
                    }}>
                        {savedStatus.includes('successfully') ? '✓ ' : '⚠ '} {savedStatus}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                        <div>
                            <label style={labelStyle}>Age Group</label>
                            <select
                                style={inputStyle}
                                value={profileData.ageGroup}
                                onChange={(e) => setProfileData({ ...profileData, ageGroup: e.target.value })}
                            >
                                <option value="">Select...</option>
                                <option value="child">Child (0-12)</option>
                                <option value="teen">Teen (13-19)</option>
                                <option value="adult">Adult (20-59)</option>
                                <option value="senior">Senior (60+)</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Biological Sex (Optional)</label>
                            <select
                                style={inputStyle}
                                value={profileData.biologicalSex}
                                onChange={(e) => setProfileData({ ...profileData, biologicalSex: e.target.value })}
                            >
                                <option value="">Select...</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other / Prefer not to say</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label style={labelStyle}>Chronic Conditions (comma separated)</label>
                        <input
                            type="text"
                            placeholder="e.g. Hypertension, Diabetes"
                            style={inputStyle}
                            value={profileData.chronicConditions}
                            onChange={(e) => setProfileData({ ...profileData, chronicConditions: e.target.value })}
                        />
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label style={labelStyle}>Allergies (comma separated)</label>
                        <input
                            type="text"
                            placeholder="e.g. Penicillin, Peanuts"
                            style={inputStyle}
                            value={profileData.allergies}
                            onChange={(e) => setProfileData({ ...profileData, allergies: e.target.value })}
                        />
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <label style={labelStyle}>Past Surgeries (comma separated)</label>
                        <input
                            type="text"
                            placeholder="e.g. Appendectomy, ACL reconstruction"
                            style={inputStyle}
                            value={profileData.pastSurgeries}
                            onChange={(e) => setProfileData({ ...profileData, pastSurgeries: e.target.value })}
                        />
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label style={labelStyle}>Lifestyle Indicators (comma separated)</label>
                        <input
                            type="text"
                            placeholder="e.g. Smoker, Athlete, Sedentary"
                            style={inputStyle}
                            value={profileData.lifestyleIndicators}
                            onChange={(e) => setProfileData({ ...profileData, lifestyleIndicators: e.target.value })}
                        />
                    </div>

                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                        background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, marginBottom: 20
                    }}>
                        <input
                            type="checkbox"
                            style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                            checked={profileData.aiPersonalizationEnabled}
                            onChange={(e) => setProfileData({ ...profileData, aiPersonalizationEnabled: e.target.checked })}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e3a8a' }}>Use for AI Personalization</span>
                            <span style={{ fontSize: '0.75rem', color: '#3b82f6' }}>Allow AI to securely use this data for better matching</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%', padding: '12px 0', borderRadius: 10, border: 'none',
                            background: loading ? '#94a3b8' : '#2563eb', color: 'white',
                            fontSize: '0.9rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                            fontFamily: 'inherit', transition: 'all 0.15s',
                            boxShadow: '0 4px 14px 0 rgba(37,99,235,0.35)',
                        }}
                    >
                        {loading ? 'Saving...' : 'Save Health Profile'}
                    </button>
                </form>
            </div>
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

export default HealthProfilePage
