import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
    Brain, FileText, Activity, Compass,
    ArrowRight, Upload, Sparkles, AlertCircle,
    CheckCircle2, Loader2, Microscope
} from 'lucide-react'

const AIIntelligenceLab = () => {
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth)
    const [isHovered, setIsHovered] = useState(null)
    const [isScanning, setIsScanning] = useState(false)
    const [liveTrends, setLiveTrends] = useState([
        "Trend: Physiotherapy success rate up 12% in the community.",
        "Alert: Seasonal allergies rising, check wellness protocols."
    ])

    useEffect(() => {
        const fetchTrends = async () => {
            try {
                const res = await axios.get('/api/ai/trends', {
                    headers: { Authorization: `Bearer ${user?.token}` }
                })
                if (res.data.trends) setLiveTrends(res.data.trends)
            } catch (err) {
                console.log("Trend fetch failed, using fallbacks")
            }
        }
        if (user?.token) fetchTrends()
    }, [user])

    const handleReportAnalysis = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        setIsScanning(true)
        const formData = new FormData()
        formData.append('report', file)

        try {
            // First we scan it to get the data
            const res = await axios.post('/api/ai/scan-report', formData, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            })

            // Now we trigger a "Decipher" request to explain it
            const decipherPrompt = `
                I have a medical report with these details: 
                Type: ${res.data.recordType}, Value: ${res.data.value} ${res.data.unit || ''}, Notes: ${res.data.notes}.
                Task: Explain what this means in very simple, non-medical terms for a patient. 
                Keep it under 2 sentences. Be supportive but professional.
            `

            // For now, we'll store the scanned info and navigate to the profile to save it
            // but we'll show a quick "IQ Result" popup or something later
            navigate('/health-profile', { state: { autoShowOCR: true, lastScan: res.data } })
        } catch (err) {
            console.error("Analysis failed", err)
        } finally {
            setIsScanning(false)
        }
    }

    return (
        <div style={containerStyle}>
            {/* Header Area */}
            <div style={headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={iconBoxStyle}>
                        <Brain size={20} color="#60a5fa" />
                    </div>
                    <div>
                        <h3 style={titleStyle}>AI Intelligence Lab</h3>
                        <p style={subtitleStyle}>Deep Medical Analysis & Community Trends</p>
                    </div>
                </div>
                <div style={badgeStyle}>
                    <Sparkles size={12} color="#fbbf24" style={{ marginRight: 4 }} />
                    Level 2 Intelligence
                </div>
            </div>

            {/* Main Action Grid */}
            <div style={gridStyle}>
                {/* Action 1: Report Decoder */}
                <div
                    style={{
                        ...cardStyle,
                        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                        transform: isHovered === 'report' ? 'translateY(-4px)' : 'none'
                    }}
                    onMouseEnter={() => setIsHovered('report')}
                    onMouseLeave={() => setIsHovered(null)}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                        <div style={{ ...toolIconStyle, background: 'rgba(255,255,255,0.1)' }}>
                            <Microscope size={22} color="#818cf8" />
                        </div>
                        <input
                            type="file"
                            id="lab-report-upload"
                            hidden
                            onChange={handleReportAnalysis}
                            accept="image/*,application/pdf"
                        />
                        <label
                            htmlFor="lab-report-upload"
                            style={actionButtonStyle}
                        >
                            {isScanning ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                            {isScanning ? 'Analyzing...' : 'Decipher Report'}
                        </label>
                    </div>
                    <h4 style={cardTitleStyle}>Report Intelligence</h4>
                    <p style={cardDescStyle}>Upload a medical scan or lab report to decode medical jargon into plain English.</p>
                </div>

                {/* Action 2: Outcome Radar */}
                <div
                    style={{
                        ...cardStyle,
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        transform: isHovered === 'radar' ? 'translateY(-4px)' : 'none'
                    }}
                    onMouseEnter={() => setIsHovered('radar')}
                    onMouseLeave={() => setIsHovered(null)}
                    onClick={() => navigate('/analytics')}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                        <div style={{ ...toolIconStyle, background: 'rgba(52,211,153,0.1)' }}>
                            <Compass size={22} color="#34d399" />
                        </div>
                        <div style={trendBadgeStyle}>+12.4% Match</div>
                    </div>
                    <h4 style={cardTitleStyle}>Outcome Radar</h4>
                    <p style={cardDescStyle}>See treatment success probabilities based on 10,000+ similar patient journeys.</p>
                    <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: '0.7rem', fontWeight: 600 }}>
                        <Activity size={12} /> Live community feed active
                    </div>
                </div>
            </div>

            {/* Bottom Insight Feed */}
            <div style={footerStyle}>
                <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '10px 0' }}>
                    {liveTrends.map((trend, idx) => (
                        <div key={idx} style={tickerItemStyle}>
                            {trend.startsWith('Alert') ? <AlertCircle size={14} color="#fbbf24" /> : <CheckCircle2 size={14} color="#34d399" />}
                            <span>{trend}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

const containerStyle = {
    background: '#ffffff',
    borderRadius: '24px',
    padding: '24px',
    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)',
    border: '1px solid #f1f5f9',
    marginBottom: '24px',
    fontFamily: "'Inter', system-ui, sans-serif"
}

const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
}

const iconBoxStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
}

const titleStyle = {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: 800,
    color: '#0f172a',
    letterSpacing: '-0.02em'
}

const subtitleStyle = {
    margin: 0,
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: 500
}

const badgeStyle = {
    background: '#fef3c7',
    color: '#92400e',
    fontSize: '0.65rem',
    fontWeight: 800,
    padding: '6px 12px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
}

const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
    marginBottom: '20px'
}

const cardStyle = {
    borderRadius: '20px',
    padding: '20px',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    position: 'relative',
    overflow: 'hidden'
}

const toolIconStyle = {
    width: '44px',
    height: '44px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
}

const actionButtonStyle = {
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '10px',
    padding: '8px 14px',
    color: 'white',
    fontSize: '0.75rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
    transition: 'background 0.2s'
}

const cardTitleStyle = {
    margin: '0 0 8px 0',
    fontSize: '1rem',
    fontWeight: 800,
    letterSpacing: '-0.01em'
}

const cardDescStyle = {
    margin: 0,
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 1.5,
    maxWidth: '90%'
}

const trendBadgeStyle = {
    background: 'rgba(52,211,153,0.15)',
    color: '#6ee7b7',
    padding: '4px 8px',
    borderRadius: '8px',
    fontSize: '0.65rem',
    fontWeight: 800
}

const footerStyle = {
    borderTop: '1px solid #f1f5f9',
    paddingTop: '16px'
}

const tickerItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    whiteSpace: 'nowrap',
    background: '#f8fafc',
    padding: '8px 12px',
    borderRadius: '10px',
    fontSize: '0.75rem',
    color: '#475569',
    flexShrink: 0,
    border: '1px solid #f1f5f9'
}

export default AIIntelligenceLab
