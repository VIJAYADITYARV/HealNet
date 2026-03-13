import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { login, reset, verifyMFA } from '../features/auth/authSlice'
import {
    Mail, Lock, Eye, EyeOff,
    Shield, Activity, TrendingUp, ArrowRight, Loader2, AlertCircle
} from 'lucide-react'

/* ── Brand panel illustration ── */
function BrandIllustration() {
    return (
        <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-xs mx-auto">
            <circle cx="160" cy="110" r="90" fill="rgba(255,255,255,0.06)" />
            <circle cx="160" cy="110" r="60" fill="rgba(255,255,255,0.06)" />
            <rect x="140" y="70" width="40" height="80" rx="8" fill="rgba(255,255,255,0.18)" />
            <rect x="120" y="90" width="80" height="40" rx="8" fill="rgba(255,255,255,0.18)" />
            <path d="M60 155 L95 155 L108 130 L120 175 L132 140 L144 160 L260 160" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {[80, 140, 200, 260].map((cx, i) => (
                <circle key={i} cx={cx} cy="55" r="4" fill={`rgba(255,255,255,${0.15 + i * 0.08})`} />
            ))}
        </svg>
    )
}

const BRAND_FEATURES = [
    { icon: <Activity size={16} className="text-white" />, text: 'Experience-based treatment insights' },
    { icon: <TrendingUp size={16} className="text-white" />, text: 'Smart hospital trend analysis' },
    { icon: <Shield size={16} className="text-white" />, text: '100% privacy-first platform' },
]

function Login() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { user, isLoading, isError, isSuccess, message, mfaRequired, tempToken } = useSelector(s => s.auth)

    const { register: rf, handleSubmit, formState: { errors } } = useForm()
    const [showPw, setShowPw] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    useEffect(() => {
        if (isSuccess || user) navigate('/')
    }, [isSuccess, user, navigate])

    useEffect(() => {
        if (isError) {
            setErrorMsg(message)
            dispatch(reset())
        }
    }, [isError, message, dispatch])

    const onSubmit = data => {
        setErrorMsg('')
        dispatch(login(data))
    }

    const onVerifyMFA = data => {
        setErrorMsg('')
        dispatch(verifyMFA({ tempToken, token: data.mfaCode }))
    }

    return (
        <div className="auth-screen">
            {/* Left brand panel */}
            <div className="auth-brand-panel">
                {/* Animated orbs matching landing page */}
                <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40%', height: '40%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.3) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'orbFloat1 20s ease-in-out infinite alternate' }} />
                    <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '35%', height: '35%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'orbFloat2 25s ease-in-out infinite alternate-reverse' }} />
                </div>
                <style>{`
                    @keyframes orbFloat1 { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(30px,-40px) scale(1.1)} }
                    @keyframes orbFloat2 { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(-20px,30px) scale(1.08)} }
                `}</style>
                <div className="auth-brand-inner">
                    <div className="auth-brand-logo">
                        <div className="auth-brand-logo-icon"><Activity size={20} className="text-white" /></div>
                        <span className="auth-brand-logo-text">HealNet</span>
                    </div>
                    <div className="auth-brand-hero">
                        <h1 className="auth-brand-headline">AI-powered health decisions,<br />guided by real patient journeys</h1>
                        <p className="auth-brand-subline">Private. Anonymous. Insightful.</p>
                        <BrandIllustration />
                        <div className="auth-brand-features">
                            {BRAND_FEATURES.map((f, i) => (
                                <div key={i} className="auth-brand-feature">
                                    <div className="auth-brand-feature-icon">{f.icon}</div>
                                    <span className="auth-brand-feature-text">{f.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right auth panel */}
            <div className="auth-right-panel">
                <div className="auth-card">

                    {/* Mobile-only top logo */}
                    <div className="auth-mobile-top">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <div className="auth-card-logo-badge"><Activity size={14} className="text-white" /></div>
                            <span className="text-sky-400 font-bold text-lg">HealNet</span>
                        </div>
                        <p className="text-xs text-slate-400">Private. Anonymous. Insightful.</p>
                    </div>

                    {/* Logo */}
                    <div className="auth-card-logo">
                        <div className="auth-card-logo-badge"><Activity size={14} className="text-white" /></div>
                        <span className="auth-card-logo-name">HealNet</span>
                    </div>

                    <h1 className="auth-card-title">Welcome back</h1>
                    <p className="auth-card-subtitle">Continue your health insight journey</p>

                    {/* Global error */}
                    {errorMsg && (
                        <div className="flex items-center gap-2 mb-5 p-3 rounded-xl" style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.25)', color: '#fb7185', fontSize: '0.8rem' }}>
                            <AlertCircle size={14} className="flex-shrink-0" />
                            {errorMsg}
                        </div>
                    )}

                    {mfaRequired ? (
                        <form onSubmit={handleSubmit(onVerifyMFA)} noValidate>
                            <div className="auth-field">
                                <label className="auth-input-label">MFA Verification Code</label>
                                <div className={`auth-input-wrap ${errors.mfaCode ? 'error' : ''}`}>
                                    <Shield size={16} className="auth-input-icon" />
                                    <input
                                        {...rf('mfaCode', {
                                            required: 'Verification code is required',
                                            pattern: { value: /^[0-9A-Z]{6,8}$/, message: 'Invalid code format' }
                                        })}
                                        type="text"
                                        placeholder="000000"
                                        className="auth-input text-center tracking-[0.5em] font-mono text-xl"
                                        autoFocus
                                    />
                                </div>
                                {errors.mfaCode && <p className="auth-input-error"><AlertCircle size={12} />{errors.mfaCode.message}</p>}
                                <p className="text-[0.7rem] text-slate-500 mt-2 text-center">
                                    Enter the 6-digit code from your authenticator app or a backup code.
                                </p>
                            </div>

                            <button type="submit" className="auth-btn" disabled={isLoading}>
                                {isLoading
                                    ? <><Loader2 size={16} className="animate-spin" /> Verifying…</>
                                    : <>Verify & Sign In <ArrowRight size={16} /></>
                                }
                            </button>

                            <button
                                type="button"
                                onClick={() => dispatch(reset())}
                                className="w-full text-center text-xs text-sky-400 mt-4 hover:underline"
                            >
                                Back to login
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} noValidate>

                            {/* Email */}
                            <div className="auth-field">
                                <label className="auth-input-label">Email Address</label>
                                <div className={`auth-input-wrap ${errors.email ? 'error' : ''}`}>
                                    <Mail size={16} className="auth-input-icon" />
                                    <input
                                        {...rf('email', {
                                            required: 'Email is required',
                                            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' }
                                        })}
                                        type="email"
                                        placeholder="jane@example.com"
                                        className="auth-input"
                                        autoComplete="email"
                                    />
                                </div>
                                {errors.email && <p className="auth-input-error"><AlertCircle size={12} />{errors.email.message}</p>}
                            </div>

                            {/* Phone (backend expects phone for login) */}
                            <div className="auth-field">
                                <label className="auth-input-label">Phone Number</label>
                                <div className={`auth-input-wrap ${errors.phone ? 'error' : ''}`}>
                                    <Mail size={16} className="auth-input-icon" style={{ opacity: 0 }} />
                                    {/* reuse slot — swap for Phone icon */}
                                    <span className="absolute left-4 text-slate-400 transition-colors duration-200" style={{ lineHeight: 0 }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.14 12 19.79 19.79 0 0 1 1.09 3.38 2 2 0 0 1 3.06 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                    </span>
                                    <input
                                        {...rf('phone')}
                                        type="tel"
                                        placeholder="+91 98765 43210"
                                        className="auth-input"
                                        autoComplete="tel"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="auth-field">
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="auth-input-label !mb-0">Password</label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-xs text-sky-400 font-medium hover:text-sky-300 transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className={`auth-input-wrap ${errors.password ? 'error' : ''}`}>
                                    <Lock size={16} className="auth-input-icon" />
                                    <input
                                        {...rf('password', { required: 'Password is required' })}
                                        type={showPw ? 'text' : 'password'}
                                        placeholder="Your password"
                                        className="auth-input"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className="auth-input-right text-slate-400 hover:text-slate-300 transition-colors"
                                        onClick={() => setShowPw(v => !v)}
                                        tabIndex={-1}
                                        aria-label={showPw ? 'Hide password' : 'Show password'}
                                    >
                                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.password && <p className="auth-input-error"><AlertCircle size={12} />{errors.password.message}</p>}
                            </div>

                            {/* Privacy block */}
                            <div className="auth-privacy">
                                <Shield size={16} className="auth-privacy-icon" />
                                <p className="auth-privacy-text">
                                    Your health data remains <strong>private and anonymous</strong>. Always.
                                </p>
                            </div>

                            {/* Submit */}
                            <button type="submit" className="auth-btn" disabled={isLoading}>
                                {isLoading
                                    ? <><Loader2 size={16} className="animate-spin" /> Signing in…</>
                                    : <>Sign in <ArrowRight size={16} /></>
                                }
                            </button>
                        </form>
                    )}

                    <p className="auth-secondary" style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '1.5rem', textAlign: 'center' }}>
                        Don&apos;t have an account?{' '}
                        <Link to="/register" className="auth-link" style={{ color: '#38bdf8', fontWeight: 600 }}>Create one</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login
