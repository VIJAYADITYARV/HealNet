import { useState } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import AppLayout from '../components/layout/AppLayout'
import { Search, MapPin, Building2, Activity, ArrowRight, BarChart3, Brain, Sparkles, Loader2 } from 'lucide-react'

const ComparePage = () => {
    const { user } = useSelector((state) => state.auth)
    const [condition, setCondition] = useState('')
    const [location, setLocation] = useState('')
    const [comparisonType, setComparisonType] = useState('hospital')
    const [comparisonList, setComparisonList] = useState([])
    const [inputValue, setInputValue] = useState('')
    const [priority, setPriority] = useState('highestSuccess')
    const [budgetRange, setBudgetRange] = useState('')

    const [loading, setLoading] = useState(false)
    const [comparisonResult, setComparisonResult] = useState(null)
    const [error, setError] = useState('')

    // AI Insight States
    const [aiInsight, setAiInsight] = useState(null)
    const [aiLoading, setAiLoading] = useState(false)

    const handleAddToList = (e) => {
        if (e.key === 'Enter' && inputValue.trim() !== '') {
            e.preventDefault()
            if (comparisonList.length >= 3) {
                setError('You can compare up to 3 options maximum.')
                return
            }
            if (!comparisonList.includes(inputValue.trim())) {
                setComparisonList([...comparisonList, inputValue.trim()])
                setError('')
            }
            setInputValue('')
        }
    }

    const handleRemoveFromList = (item) => {
        setComparisonList(comparisonList.filter(i => i !== item))
    }

    const handleCompare = async (e) => {
        e.preventDefault();
        if (comparisonList.length < 2) {
            setError('Please add at least 2 items to compare.');
            return;
        }
        setError('');
        setLoading(true);
        setAiInsight(null);

        try {
            const payload = {
                condition,
                location,
                comparisonType,
                comparisonList,
                filters: { priority, budgetRange }
            }
            const res = await axios.post('/api/analytics/compare', payload, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            setComparisonResult(res.data.rankedResults);
        } catch (err) {
            setError(err.response?.data?.message || 'Comparison failed.');
        } finally {
            setLoading(false);
        }
    }

    const fetchAiInsight = async () => {
        if (!comparisonResult || comparisonResult.length < 2) return;
        setAiLoading(true);
        try {
            const res = await axios.post('/api/ai/hospital-compare', {
                hospitalA: comparisonResult[0],
                hospitalB: comparisonResult[1],
                condition: condition
            }, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            setAiInsight(res.data.insight);
        } catch (err) {
            console.error("AI Insight Error:", err);
            setAiInsight("Unable to generate expert recommendation at this time.");
        } finally {
            setAiLoading(false);
        }
    }

    return (
        <AppLayout>
            <div className="hn-section-title">
                <BarChart3 size={16} />
                Treatment & Hospital Compare
            </div>

            <div style={{
                background: 'white', borderRadius: 14, padding: 24,
                boxShadow: '0 2px 15px -3px rgba(37,99,235,0.07)',
                border: '1px solid #e2e8f0', marginBottom: 20
            }}>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 20 }}>
                    Decision intelligence engine powered by thousands of patient outcomes.
                </p>

                <form onSubmit={handleCompare}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
                        {/* Condition */}
                        <div>
                            <label style={labelStyle}>Condition *</label>
                            <div style={{ position: 'relative' }}>
                                <Activity size={15} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
                                <input
                                    type="text"
                                    placeholder="e.g. Migraine"
                                    style={{ ...inputStyle, paddingLeft: 36 }}
                                    value={condition}
                                    onChange={(e) => setCondition(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <label style={labelStyle}>Location (Optional)</label>
                            <div style={{ position: 'relative' }}>
                                <MapPin size={15} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
                                <input
                                    type="text"
                                    placeholder="City"
                                    style={{ ...inputStyle, paddingLeft: 36 }}
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Compare Type */}
                        <div>
                            <label style={labelStyle}>Compare *</label>
                            <select
                                style={inputStyle}
                                value={comparisonType}
                                onChange={(e) => {
                                    setComparisonType(e.target.value);
                                    setComparisonList([]);
                                }}
                            >
                                <option value="hospital">Hospitals</option>
                                <option value="treatment">Treatments</option>
                            </select>
                        </div>

                        {/* Priority */}
                        <div>
                            <label style={labelStyle}>Priority Metric *</label>
                            <select
                                style={inputStyle}
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                            >
                                <option value="highestSuccess">Highest Success Rate</option>
                                <option value="lowestRisk">Lowest Complication Risk</option>
                                <option value="fastestRecovery">Fastest Recovery Time</option>
                            </select>
                        </div>
                    </div>

                    {/* Add Items */}
                    <div style={{ marginBottom: 20 }}>
                        <label style={labelStyle}>
                            {comparisonType === 'hospital' ? 'Add Hospitals to Compare (2-3)' : 'Add Treatments to Compare (2-3)'}
                        </label>
                        <div style={{ position: 'relative', marginBottom: 12 }}>
                            <Building2 size={15} style={{ position: 'absolute', left: 12, top: 11, color: '#94a3b8' }} />
                            <input
                                type="text"
                                placeholder="Type and press Enter..."
                                style={{ ...inputStyle, paddingLeft: 36 }}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleAddToList}
                            />
                        </div>

                        {comparisonList.length > 0 && (
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {comparisonList.map((item, idx) => (
                                    <div key={idx} style={{
                                        background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8',
                                        padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600,
                                        display: 'flex', alignItems: 'center', gap: 6
                                    }}>
                                        {item}
                                        <div
                                            onClick={() => handleRemoveFromList(item)}
                                            style={{ cursor: 'pointer', color: '#60a5fa', fontWeight: 'bold' }}
                                        >
                                            ✕
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {error && (
                        <div style={{ color: '#dc2626', fontSize: '0.82rem', fontWeight: 600, marginBottom: 16 }}>
                            ⚠ {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" disabled={loading} style={{
                            padding: '10px 24px', borderRadius: 8, border: 'none',
                            background: loading ? '#94a3b8' : '#2563eb', color: 'white',
                            fontSize: '0.9rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s'
                        }}>
                            {loading ? 'Analyzing...' : 'Compare Options'}
                            {!loading && <ArrowRight size={16} />}
                        </button>
                    </div>
                </form>
            </div>

            {/* RESULTS */}
            {comparisonResult && (
                <div style={{
                    background: 'white', borderRadius: 14, overflow: 'hidden',
                    boxShadow: '0 2px 15px -3px rgba(37,99,235,0.07)',
                    border: '1px solid #e2e8f0',
                }}>
                    <div style={{ padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <BarChart3 size={18} color="#2563eb" />
                            Comparison Results
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', background: 'white', padding: '4px 10px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                            Ranked by: {priority === 'highestSuccess' ? 'Highest Success' : priority === 'lowestRisk' ? 'Lowest Risk' : 'Fastest Recovery'}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', borderBottom: '1px solid #e2e8f0' }}>
                        {comparisonResult.map((res, index) => (
                            <div key={index} style={{
                                padding: 24, position: 'relative',
                                background: index === 0 ? '#f0f9ff' : 'white',
                                borderRight: index !== comparisonResult.length - 1 ? '1px solid #e2e8f0' : 'none'
                            }}>
                                {index === 0 && (
                                    <div style={{
                                        position: 'absolute', top: 0, right: 0, background: '#f59e0b', color: '#fffbeb',
                                        fontSize: '0.65rem', fontWeight: 800, padding: '4px 8px', borderBottomLeftRadius: 8
                                    }}>
                                        TOP PICK
                                    </div>
                                )}
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: '#0f172a' }}>{res.entity}</h3>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 20 }}>{res.totalCases} cases analyzed</div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {/* Success Rate */}
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                                            <span style={{ color: '#475569', fontWeight: 600 }}>Success Rate</span>
                                            <span style={{ color: '#16a34a', fontWeight: 800 }}>{res.successRate}%</span>
                                        </div>
                                        <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', background: '#22c55e', width: `${res.successRate}%` }} />
                                        </div>
                                    </div>

                                    {/* Risk */}
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                                            <span style={{ color: '#475569', fontWeight: 600 }}>Complication Risk</span>
                                            <span style={{ color: '#ef4444', fontWeight: 800 }}>{res.complicationRate}%</span>
                                        </div>
                                        <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', background: '#ef4444', width: `${res.complicationRate}%` }} />
                                        </div>
                                    </div>

                                    {/* Recovery Time */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '12px 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                                        <span style={{ color: '#475569', fontWeight: 600 }}>Avg. Recovery Time</span>
                                        <span style={{ color: '#3b82f6', fontWeight: 800 }}>{res.avgRecoveryDays || 'N/A'} days</span>
                                    </div>

                                    {/* Costs */}
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600, marginBottom: 8 }}>Cost Distribution</div>
                                        <div style={{ display: 'flex', height: 20, borderRadius: 4, overflow: 'hidden', fontSize: '0.65rem', fontWeight: 700, color: 'white', textAlign: 'center', lineHeight: '20px' }}>
                                            {res.costDistribution.low > 0 && <div style={{ background: '#22c55e', width: `${res.costDistribution.low}%` }}>Low</div>}
                                            {res.costDistribution.medium > 0 && <div style={{ background: '#eab308', width: `${res.costDistribution.medium}%` }}>Med</div>}
                                            {res.costDistribution.high > 0 && <div style={{ background: '#ef4444', width: `${res.costDistribution.high}%` }}>High</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* AI COMPARISON ADVISOR SECTION */}
                    <div style={{ padding: 24, background: '#f8fafc' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                            <div style={{ background: '#2563eb', color: 'white', padding: 6, borderRadius: 8 }}>
                                <Brain size={18} />
                            </div>
                            <span style={{ fontWeight: 900, color: '#1e3a8a', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>HealNet AI Advisor</span>
                        </div>
                        {aiLoading ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#2563eb' }}>
                                <Loader2 size={16} className="animate-spin" />
                                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Consulting clinical data...</span>
                            </div>
                        ) : aiInsight ? (
                            <p style={{ margin: 0, fontSize: '0.95rem', color: '#1e3a8a', lineHeight: 1.6, fontWeight: 700 }}>
                                {aiInsight}
                            </p>
                        ) : (
                            <button
                                onClick={fetchAiInsight}
                                style={{ background: 'white', border: '1.5px solid #2563eb', color: '#2563eb', padding: '10px 16px', borderRadius: 10, fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
                            >
                                <Sparkles size={14} /> Get Expert AI Recommendation
                            </button>
                        )}
                    </div>
                </div>
            )}
            <style>{`
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
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

export default ComparePage
