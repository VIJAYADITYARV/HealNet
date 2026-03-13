import { useState, useEffect } from 'react'
import axios from 'axios'
import { Shield, Smartphone, ChevronRight, CheckCircle2, AlertCircle, Loader2, Copy } from 'lucide-react'

function MFASetup({ user, onMFAActivated, mfaEnabled }) {
    const [step, setStep] = useState(mfaEnabled ? 'active' : 'idle')
    const [setupData, setSetupData] = useState(null)
    const [token, setToken] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [backupCodes, setBackupCodes] = useState([])

    const startSetup = async () => {
        try {
            setLoading(true)
            const config = { headers: { Authorization: `Bearer ${user.token}` } }
            const res = await axios.post('/api/auth/mfa/setup', {}, config)
            setSetupData(res.data)
            setStep('scan')
        } catch (err) {
            setError('Failed to initiate MFA setup')
        } finally {
            setLoading(false)
        }
    }

    const verifyActivation = async () => {
        try {
            setLoading(true)
            const config = { headers: { Authorization: `Bearer ${user.token}` } }
            const res = await axios.post('/api/auth/mfa/verify', { token }, config)
            setBackupCodes(res.data.backupCodes)
            setStep('complete')
            if (onMFAActivated) onMFAActivated()
        } catch (err) {
            setError('Invalid code. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const disableMFA = async () => {
        if (!window.confirm('Are you sure you want to disable Multi-Factor Authentication? Your account will be less secure.')) return
        try {
            setLoading(true)
            const config = { headers: { Authorization: `Bearer ${user.token}` } }
            await axios.post('/api/auth/mfa/disable', {}, config)
            setStep('idle')
            if (onMFAActivated) onMFAActivated()
        } catch (err) {
            setError('Failed to disable MFA')
        } finally {
            setLoading(false)
        }
    }

    if (step === 'active') {
        return (
            <div style={{ padding: '20px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Shield color="#059669" size={24} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>MFA is Active</div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Your account is protected by an extra security layer.</div>
                    </div>
                </div>
                <button onClick={disableMFA} style={{ background: '#fff1f2', color: '#e11d48', border: '1px solid #fda4af', padding: '10px 16px', borderRadius: 10, fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                    Disable MFA
                </button>
            </div>
        )
    }

    if (step === 'scan') {
        return (
            <div style={{ padding: '20px 0', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 16px', color: '#0f172a' }}>Scan QR Code</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 24 }}>
                    Open your authenticator app (e.g., Google Authenticator, Authy) and scan this code.
                </p>
                <div style={{ background: 'white', padding: 20, borderRadius: 20, border: '1px solid #e2e8f0', display: 'inline-block', marginBottom: 24 }}>
                    <img src={setupData.qrCode} alt="MFA QR Code" style={{ width: 200, height: 200 }} />
                </div>
                <div style={{ maxWidth: 300, margin: '0 auto' }}>
                    <input
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={token}
                        onChange={e => setToken(e.target.value)}
                        style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1.5px solid #cbd5e1', textAlign: 'center', fontSize: '1.2rem', fontWeight: 700, letterSpacing: 4, marginBottom: 16 }}
                    />
                    {error && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginBottom: 12 }}>{error}</div>}
                    <button
                        disabled={loading || token.length < 6}
                        onClick={verifyActivation}
                        style={{ width: '100%', background: '#2563eb', color: 'white', border: 'none', padding: '14px', borderRadius: 12, fontWeight: 700, cursor: 'pointer', opacity: (loading || token.length < 6) ? 0.6 : 1 }}
                    >
                        {loading ? <Loader2 className="animate-spin" style={{ margin: '0 auto' }} /> : 'Verify and Activate'}
                    </button>
                </div>
            </div>
        )
    }

    if (step === 'complete') {
        return (
            <div style={{ padding: '20px 0', textAlign: 'center' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <CheckCircle2 color="#059669" size={32} />
                </div>
                <h3 style={{ margin: '0 0 8px', color: '#0f172a' }}>Activation Successful!</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 24 }}>
                    Multi-Factor Authentication is now enabled. Save your backup codes in a safe place.
                </p>
                <div style={{ background: '#f8fafc', padding: 20, borderRadius: 16, border: '1px solid #e2e8f0', marginBottom: 24, textAlign: 'left' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                        Backup Codes
                        <Copy size={12} style={{ cursor: 'pointer' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {backupCodes.map((c, i) => (
                            <div key={i} style={{ fontFamily: 'monospace', fontWeight: 700, color: '#475569' }}>{c}</div>
                        ))}
                    </div>
                </div>
                <button onClick={() => setStep('active')} style={{ width: '100%', background: '#0f172a', color: 'white', border: 'none', padding: '14px', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>
                    Done
                </button>
            </div>
        )
    }

    return (
        <div style={{ padding: '14px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Smartphone size={16} color="#64748b" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>Two-Factor Auth (MFA)</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>Secure your account with an Authenticator app</div>
                    </div>
                </div>
                <button
                    onClick={startSetup}
                    style={{ background: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 10, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                >
                    Setup
                </button>
            </div>
        </div>
    )
}

export default MFASetup
