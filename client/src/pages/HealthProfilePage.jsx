import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import AppLayout from '../components/layout/AppLayout'
import {
    UserCircle, Shield, Activity, Plus, Search,
    Trash2, Edit2, Check, X, Calendar,
    ChevronRight, Filter, Download, Info, AlertTriangle,
    Thermometer, Heart, Weight, Zap, LineChart as ChartIcon,
    Camera, FileText, Upload, Brain, Loader2
} from 'lucide-react'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts'

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
    const [healthLogs, setHealthLogs] = useState([])
    const [loading, setLoading] = useState(false)
    const [savedStatus, setSavedStatus] = useState(null)
    const [ocrLoading, setOcrLoading] = useState(false)
    const [ocrFile, setOcrFile] = useState(null)

    // Feature state
    const [activeTab, setActiveTab] = useState('list') // 'list' or 'trends'

    // CRUD state for logs
    const [showLogModal, setShowLogModal] = useState(false)
    const [showOCRModal, setShowOCRModal] = useState(false)
    const [editingLog, setEditingLog] = useState(null)
    const [logSearchText, setLogSearchText] = useState('')
    const [logFormData, setLogFormData] = useState({
        recordType: 'Vitals',
        value: '',
        unit: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
    })

    useEffect(() => {
        const fetchHealthData = async () => {
            try {
                const res = await axios.get('/api/users/health-profile', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                const { profile, logs } = res.data;
                setProfileData({
                    ageGroup: profile.ageGroup || '',
                    biologicalSex: profile.biologicalSex || '',
                    chronicConditions: (profile.chronicConditions || []).join(', '),
                    allergies: (profile.allergies || []).join(', '),
                    pastSurgeries: (profile.pastSurgeries || []).join(', '),
                    lifestyleIndicators: (profile.lifestyleIndicators || []).join(', '),
                    aiPersonalizationEnabled: profile.aiPersonalizationEnabled || false
                });
                setHealthLogs(logs || []);
            } catch (err) {
                console.error(err);
            }
        };
        if (user) fetchHealthData();
    }, [user]);

    const handleProfileSubmit = async (e) => {
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
        } finally {
            setLoading(false);
        }
    };

    const handleLogSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            if (editingLog) {
                const res = await axios.patch(`/api/users/health-logs/${editingLog._id}`, logFormData, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setHealthLogs(healthLogs.map(l => l._id === editingLog._id ? res.data : l));
            } else {
                const res = await axios.post('/api/users/health-logs', logFormData, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setHealthLogs([res.data, ...healthLogs]);
            }
            setShowLogModal(false);
            setEditingLog(null);
            setLogFormData({ recordType: 'Vitals', value: '', unit: '', date: new Date().toISOString().split('T')[0], notes: '' });
        } catch (err) {
            alert('Failed to save record');
        } finally {
            setLoading(false);
        }
    };

    const handleOCRScan = async () => {
        if (!ocrFile) return alert('Please select a file first.');
        setOcrLoading(true);
        const formData = new FormData();
        formData.append('report', ocrFile);

        try {
            const res = await axios.post('/api/ai/scan-report', formData, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            // Auto-populate Log form with AI results
            setLogFormData({
                recordType: res.data.recordType || 'Lab',
                value: res.data.value || '',
                unit: res.data.unit || '',
                date: res.data.date || new Date().toISOString().split('T')[0],
                notes: `[AI AUTO-EXTRACTED] ${res.data.notes || ''}`
            });
            setShowOCRModal(false);
            setShowLogModal(true);
            setOcrFile(null);
        } catch (err) {
            alert(err.response?.data?.message || 'AI failed to analyze the report.');
        } finally {
            setOcrLoading(false);
        }
    };

    const deleteLog = async (id) => {
        if (!window.confirm('Are you sure you want to delete this medical record? This cannot be undone.')) return;
        try {
            await axios.delete(`/api/users/health-logs/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setHealthLogs(healthLogs.filter(l => l._id !== id));
        } catch (err) {
            alert('Failed to delete');
        }
    };

    const filteredLogs = healthLogs.filter(l =>
        l.recordType.toLowerCase().includes(logSearchText.toLowerCase()) ||
        l.notes?.toLowerCase().includes(logSearchText.toLowerCase()) ||
        (l.value && String(l.value).toLowerCase().includes(logSearchText.toLowerCase()))
    );

    // Prepare Chart Data
    const chartData = [...healthLogs]
        .filter(l => !isNaN(parseFloat(l.value)))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(l => ({
            date: new Date(l.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
            value: parseFloat(l.value),
            type: l.recordType
        }));

    return (
        <AppLayout>
            <div className="hn-messages-container" style={{ border: 'none', background: 'transparent', boxShadow: 'none', height: 'auto', gridTemplateColumns: '1fr' }}>
                <div style={{ display: 'flex', gap: 24, flexDirection: 'column' }}>

                    {/* TOP SECTION: HEADING */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.03em' }}>Health Record Vault</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: 4, fontWeight: 500 }}>Global CRUD Intelligence for your Personal Medical Records</p>
                        </div>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button onClick={() => setShowOCRModal(true)} className="hn-share-btn" style={{ background: 'rgba(37,99,235,0.1)', color: 'var(--blue-trust)', border: '1px solid rgba(37,99,235,0.2)' }}>
                                <Brain size={18} /> AI Scan Report
                            </button>
                            <button onClick={() => { setEditingLog(null); setShowLogModal(true); }} className="hn-share-btn" style={{ background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>
                                <Plus size={18} /> New Record
                            </button>
                        </div>
                    </div>

                    {/* TWO COLUMN CONTENT */}
                    <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'start' }}>

                        {/* LEFT: STATIC CONTEXT FORM */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                                <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 12, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <UserCircle size={22} color="#2563eb" />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Baseline Context</h3>
                                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Static Profile Information</span>
                                    </div>
                                </div>

                                <form onSubmit={handleProfileSubmit} style={{ padding: 20 }}>
                                    {savedStatus && (
                                        <div style={{ padding: '10px', borderRadius: 8, background: '#dcfce7', border: '1px solid #bbf7d0', color: '#166534', fontSize: '0.8rem', fontWeight: 700, marginBottom: 16 }}>
                                            {savedStatus}
                                        </div>
                                    )}

                                    <div style={{ marginBottom: 16 }}>
                                        <label style={labelStyle}>Age Group</label>
                                        <select style={inputStyle} value={profileData.ageGroup} onChange={(e) => setProfileData({ ...profileData, ageGroup: e.target.value })}>
                                            <option value="">Select...</option>
                                            <option value="child">Child (0-12)</option>
                                            <option value="teen">Teen (13-19)</option>
                                            <option value="adult">Adult (20-59)</option>
                                            <option value="senior">Senior (60+)</option>
                                        </select>
                                    </div>

                                    <div style={{ marginBottom: 16 }}>
                                        <label style={labelStyle}>Chronic Conditions</label>
                                        <textarea
                                            style={{ ...inputStyle, height: 60, resize: 'none' }}
                                            placeholder="Comma separated..."
                                            value={profileData.chronicConditions}
                                            onChange={(e) => setProfileData({ ...profileData, chronicConditions: e.target.value })}
                                        />
                                    </div>

                                    <div style={{ marginBottom: 20 }}>
                                        <label style={labelStyle}>Allergies</label>
                                        <input
                                            type="text"
                                            style={inputStyle}
                                            value={profileData.allergies}
                                            onChange={(e) => setProfileData({ ...profileData, allergies: e.target.value })}
                                        />
                                    </div>

                                    <button type="submit" className="hn-share-btn" style={{ width: '100%' }} disabled={loading}>
                                        {loading ? 'Processing...' : 'Sync Profile Data'}
                                    </button>
                                </form>
                            </div>

                            {/* EMERGENCY QR PREVIEW */}
                            <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', borderRadius: 'var(--radius-card)', padding: '28px', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 15px 35px -10px rgba(30, 27, 75, 0.4)' }}>
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, border: '1px solid rgba(255,255,255,0.2)' }}>
                                        <AlertTriangle size={24} color="#fbbf24" />
                                    </div>
                                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.01em' }}>Emergency Medical ID</h4>
                                    <p style={{ margin: '6px 0 20px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>Generate a unique encryption-backed QR code for critical care responders.</p>
                                    <button
                                        onClick={() => window.open(`/profile/${user.username}`, '_blank')}
                                        style={{ background: 'white', color: '#1e1b4b', border: 'none', padding: '12px 20px', borderRadius: 12, fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'transform 0.2s', width: '100%', justifyContent: 'center' }}
                                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        <Shield size={16} /> View Public ID Card
                                    </button>
                                </div>
                                <Shield size={160} style={{ position: 'absolute', right: -40, bottom: -40, opacity: 0.05, color: 'white' }} />
                            </div>
                        </div>

                        {/* RIGHT: DYNAMIC RECORDS DATA GRID & CHARTS */}
                        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                            <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', background: '#f1f5f9', padding: 4, borderRadius: 10 }}>
                                    <button
                                        onClick={() => setActiveTab('list')}
                                        style={{ padding: '6px 16px', borderRadius: 8, border: 'none', background: activeTab === 'list' ? 'white' : 'transparent', fontSize: '0.75rem', fontWeight: activeTab === 'list' ? 800 : 600, color: activeTab === 'list' ? '#0f172a' : '#64748b', cursor: 'pointer', boxShadow: activeTab === 'list' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
                                    >
                                        Data Grid
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('trends')}
                                        style={{ padding: '6px 16px', borderRadius: 8, border: 'none', background: activeTab === 'trends' ? 'white' : 'transparent', fontSize: '0.75rem', fontWeight: activeTab === 'trends' ? 800 : 600, color: activeTab === 'trends' ? '#0f172a' : '#64748b', cursor: 'pointer', boxShadow: activeTab === 'trends' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
                                    >
                                        Trends View
                                    </button>
                                </div>
                                {activeTab === 'list' && (
                                    <div style={{ position: 'relative', width: 220 }}>
                                        <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
                                        <input
                                            type="text"
                                            placeholder="Search records..."
                                            value={logSearchText}
                                            onChange={(e) => setLogSearchText(e.target.value)}
                                            style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.75rem', outline: 'none' }}
                                        />
                                    </div>
                                )}
                            </div>

                            {activeTab === 'list' ? (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                                                <th style={thStyle}>Date</th>
                                                <th style={thStyle}>Record Type</th>
                                                <th style={thStyle}>Measured Value</th>
                                                <th style={thStyle}>Notes / Context</th>
                                                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredLogs.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                                                        <Info size={24} style={{ marginBottom: 10, opacity: 0.5 }} /><br />
                                                        No health records found in this vault.
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredLogs.map((log) => (
                                                    <tr key={log._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} className="hover:bg-gray-50">
                                                        <td style={tdStyle}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                <Calendar size={13} color="#94a3b8" />
                                                                {new Date(log.date).toLocaleDateString()}
                                                            </div>
                                                        </td>
                                                        <td style={tdStyle}>
                                                            <span style={{ padding: '4px 10px', borderRadius: 20, background: '#f1f5f9', fontSize: '0.7rem', fontWeight: 700, color: '#475569' }}>
                                                                {log.recordType}
                                                            </span>
                                                        </td>
                                                        <td style={tdStyle}>
                                                            <span style={{ fontWeight: 800, color: '#0f172a' }}>{log.value}</span>
                                                            <span style={{ marginLeft: 4, color: '#64748b', fontSize: '0.75rem' }}>{log.unit}</span>
                                                        </td>
                                                        <td style={tdStyle}>
                                                            <div style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.8rem', color: '#64748b' }}>
                                                                {log.notes || '—'}
                                                            </div>
                                                        </td>
                                                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                                                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                                                <button
                                                                    onClick={() => { setEditingLog(log); setLogFormData(log); setShowLogModal(true); }}
                                                                    style={{ padding: 6, borderRadius: 6, border: 'none', background: '#eff6ff', color: '#2563eb', cursor: 'pointer' }}
                                                                >
                                                                    <Edit2 size={13} />
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteLog(log._id)}
                                                                    style={{ padding: 6, borderRadius: 6, border: 'none', background: '#fef2f2', color: '#dc2626', cursor: 'pointer' }}
                                                                >
                                                                    <Trash2 size={13} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div style={{ padding: 32 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Physical Indicators Over Time</h4>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Visualizing numeric trends from your health logs</p>
                                        </div>
                                    </div>

                                    <div style={{ width: '100%', height: 350 }}>
                                        <ResponsiveContainer>
                                            <AreaChart data={chartData}>
                                                <defs>
                                                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                                <Tooltip
                                                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 12, padding: '10px 14px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                                    itemStyle={{ color: 'white', fontSize: '0.8rem', fontWeight: 700 }}
                                                    labelStyle={{ color: '#94a3b8', fontSize: '0.7rem', marginBottom: 4 }}
                                                />
                                                <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 32 }}>
                                        <div style={{ padding: 16, background: '#f8fafc', borderRadius: 12 }}>
                                            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Total data points</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{chartData.length}</div>
                                        </div>
                                        <div style={{ padding: 16, background: '#f8fafc', borderRadius: 12 }}>
                                            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Last Recorded</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{chartData[chartData.length - 1]?.value || '—'}</div>
                                        </div>
                                        <div style={{ padding: 16, background: '#f8fafc', borderRadius: 12 }}>
                                            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Activity Index</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a' }}>Stable</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* AI OCR MODEL */}
            {showOCRModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div style={{ background: 'white', borderRadius: 24, width: '100%', maxWidth: 550, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'modalScale 0.2s ease' }}>
                        <div style={{ padding: '32px', textAlign: 'center', background: 'linear-gradient(to bottom, #eff6ff, white)' }}>
                            <div style={{ width: 64, height: 64, background: '#2563eb', color: 'white', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 10px 20px rgba(37,99,235,0.3)' }}>
                                {ocrLoading ? <Loader2 size={32} className="animate-spin" /> : <Brain size={32} />}
                            </div>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 850, color: '#0f172a' }}>Scan Medical Report</h2>
                            <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Upload your pathology or imaging report.<br />Our AI will automatically extract and log the data points.</p>
                        </div>

                        <div style={{ padding: '0 32px 32px' }}>
                            <div style={{ border: '2px dashed #e2e8f0', borderRadius: 20, padding: '40px 20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', background: ocrFile ? '#f0fdf4' : 'transparent' }} onMouseOver={e => e.currentTarget.style.borderColor = '#2563eb'} onMouseOut={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
                                <input
                                    type="file"
                                    style={{ display: 'none' }}
                                    id="reportUpload"
                                    onChange={(e) => setOcrFile(e.target.files[0])}
                                    accept="image/*"
                                />
                                <label htmlFor="reportUpload" style={{ cursor: 'pointer' }}>
                                    <Upload size={32} color={ocrFile ? '#16a34a' : "#94a3b8"} style={{ marginBottom: 12 }} />
                                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>
                                        {ocrFile ? ocrFile.name : 'Drop report file here'}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>Supports JPG, PNG (Max 5MB)</div>
                                </label>
                            </div>

                            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                                <button onClick={() => { setShowOCRModal(false); setOcrFile(null); }} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: 'white', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                                <button
                                    onClick={handleOCRScan}
                                    className="hn-share-btn"
                                    style={{ flex: 2, padding: '12px' }}
                                    disabled={ocrLoading || !ocrFile}
                                >
                                    {ocrLoading ? 'Analyzing Report...' : 'Extract with HealNet AI'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* THE RICH MODAL FORM (Multi-Type Input) */}
            {showLogModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 500, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', animation: 'modalScale 0.2s ease' }}>
                        <div style={{ padding: '24px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>{editingLog ? 'Edit Record' : 'Add New Record'}</h2>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Fill in all medical details accurately</p>
                            </div>
                            <button onClick={() => setShowLogModal(false)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                <X size={18} color="#64748b" />
                            </button>
                        </div>

                        <form onSubmit={handleLogSubmit} style={{ padding: 24 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                                <div>
                                    <label style={labelStyle}>Record Category</label>
                                    <select
                                        style={inputStyle}
                                        value={logFormData.recordType}
                                        onChange={e => setLogFormData({ ...logFormData, recordType: e.target.value })}
                                    >
                                        <option value="Vitals">Vitals (BP/HR)</option>
                                        <option value="Lab">Lab Results</option>
                                        <option value="Physiology">Physiology (Temp/Weight)</option>
                                        <option value="Imaging">Imaging Report</option>
                                        <option value="Medication">Medication Log</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Record Date</label>
                                    <input
                                        type="date"
                                        style={inputStyle}
                                        value={logFormData.date.split('T')[0]}
                                        onChange={e => setLogFormData({ ...logFormData, date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
                                <div>
                                    <label style={labelStyle}>Recorded Value</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 120/80"
                                        style={inputStyle}
                                        value={logFormData.value}
                                        onChange={e => setLogFormData({ ...logFormData, value: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Unit</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. mmHg"
                                        style={inputStyle}
                                        value={logFormData.unit}
                                        onChange={e => setLogFormData({ ...logFormData, unit: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: 24 }}>
                                <label style={labelStyle}>Notes & Observation</label>
                                <textarea
                                    style={{ ...inputStyle, height: 100, resize: 'none' }}
                                    placeholder="Add any additional context or symptoms observed..."
                                    value={logFormData.notes}
                                    onChange={e => setLogFormData({ ...logFormData, notes: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button
                                    type="button"
                                    onClick={() => setShowLogModal(false)}
                                    style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: 'white', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="hn-share-btn"
                                    style={{ flex: 2, padding: '12px' }}
                                    disabled={loading}
                                >
                                    {loading ? 'Submitting...' : 'Confirm & Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes modalScale {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
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

const thStyle = { padding: '12px 20px', fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }
const tdStyle = { padding: '16px 20px', fontSize: '0.82rem', color: '#1e293b' }
const labelStyle = { display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: 5 }
const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0',
    fontSize: '0.85rem', fontFamily: 'inherit', color: '#0f172a', outline: 'none',
    transition: 'all 0.2s', background: '#f8fafc', boxSizing: 'border-box'
}

export default HealthProfilePage
