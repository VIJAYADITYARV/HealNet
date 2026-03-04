import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { register, reset } from '../features/auth/authSlice'
import {
    User, Mail, Phone, Lock, Eye, EyeOff,
    Shield, CheckCircle, Activity, TrendingUp, ArrowRight, Loader2,
    AlertCircle
} from 'lucide-react'

/* ── Password strength helpers ── */
function getPasswordStrength(pw = '') {
    if (!pw) return { score: 0, label: '', color: '' }
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    const map = [
        { label: 'Too short', color: '#f43f5e', width: '10%' },
        { label: 'Weak', color: '#f97316', width: '30%' },
        { label: 'Fair', color: '#f59e0b', width: '55%' },
        { label: 'Good', color: '#10b981', width: '78%' },
        { label: 'Strong', color: '#059669', width: '100%' },
    ]
    return { score, ...map[score] }
}

/* ── Left brand panel illustration (inline SVG) ── */
function BrandIllustration() {
    return (
        <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-xs mx-auto">
            {/* Background circles */}
            <circle cx="160" cy="110" r="90" fill="rgba(255,255,255,0.06)" />
            <circle cx="160" cy="110" r="60" fill="rgba(255,255,255,0.06)" />
            {/* Medical cross */}
            <rect x="140" y="70" width="40" height="80" rx="8" fill="rgba(255,255,255,0.18)" />
            <rect x="120" y="90" width="80" height="40" rx="8" fill="rgba(255,255,255,0.18)" />
            {/* Heart beat line */}
            <path d="M60 155 L95 155 L108 130 L120 175 L132 140 L144 160 L260 160" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* AI dots */}
            {[80, 140, 200, 260].map((cx, i) => (
                <circle key={i} cx={cx} cy="55" r="4" fill={`rgba(255,255,255,${0.15 + i * 0.08})`} />
            ))}
            {[80, 140, 200, 260].map((cx, i) => (
                <line key={i} x1={cx} y1="59" x2={cx < 260 ? cx + 60 : cx} y2="59" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            ))}
        </svg>
    )
}

const BRAND_FEATURES = [
    { icon: <Activity size={16} className="text-white" />, text: 'Experience-based treatment insights' },
    { icon: <TrendingUp size={16} className="text-white" />, text: 'Smart hospital trend analysis' },
    { icon: <Shield size={16} className="text-white" />, text: '100% privacy-first platform' },
]

function Register() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { user, isLoading, isError, isSuccess, message } = useSelector(s => s.auth)

    const { register: rf, handleSubmit, watch, formState: { errors } } = useForm()
    const [showPw, setShowPw] = useState(false)
    const [showCPw, setShowCPw] = useState(false)
    const [registered, setRegistered] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    const pwValue = watch('password', '')
    const strength = getPasswordStrength(pwValue)

    useEffect(() => {
        if (isSuccess) {
            setRegistered(true)
            dispatch(reset())
        }
    }, [isSuccess, dispatch])

    useEffect(() => {
        if (isError) {
            setErrorMsg(message)
            dispatch(reset())
        }
    }, [isError, message, dispatch])

    useEffect(() => {
        if (user) navigate('/')
    }, [user, navigate])

    const onSubmit = data => {
        const { confirmPassword, ...rest } = data
        setErrorMsg('')
        dispatch(register(rest))
    }

    /* ── Success Screen ── */
    if (registered) {
        return (
            <div className="auth-screen">
                <div className="auth-brand-panel">
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
                <div className="auth-right-panel">
                    <div className="auth-card">
                        <div className="auth-success">
                            <div className="auth-success-icon">
                                <CheckCircle size={40} className="text-health-600" />
                            </div>
                            <h2 className="auth-success-title">Welcome to HealNet</h2>
                            <p className="auth-success-subtitle">Your AI health companion is ready.</p>
                            <button onClick={() => navigate('/')} className="auth-btn">
                                Continue to dashboard <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    /* ── Register Form ── */
    return (
        <div className="auth-screen">
            {/* Left brand panel */}
            <div className="auth-brand-panel">
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
                            <span className="text-brand-700 font-bold text-lg">HealNet</span>
                        </div>
                        <p className="text-xs text-slate-400">Private. Anonymous. Insightful.</p>
                    </div>

                    {/* Logo */}
                    <div className="auth-card-logo">
                        <div className="auth-card-logo-badge"><Activity size={14} className="text-white" /></div>
                        <span className="auth-card-logo-name">HealNet</span>
                    </div>

                    <h1 className="auth-card-title">Create your account</h1>
                    <p className="auth-card-subtitle">Start your AI-assisted health journey</p>

                    {/* Global error from Redux */}
                    {errorMsg && (
                        <div className="flex items-center gap-2 mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs">
                            <AlertCircle size={14} className="flex-shrink-0" />
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} noValidate>

                        {/* Full Name */}
                        <div className="auth-field">
                            <label className="auth-input-label">Full Name</label>
                            <div className={`auth-input-wrap ${errors.name ? 'error' : ''}`}>
                                <User size={16} className="auth-input-icon" />
                                <input
                                    {...rf('name', { required: 'Full name is required' })}
                                    placeholder="Jane Doe"
                                    className="auth-input"
                                    autoComplete="name"
                                />
                            </div>
                            {errors.name && <p className="auth-input-error"><AlertCircle size={12} />{errors.name.message}</p>}
                        </div>

                        {/* Username */}
                        <div className="auth-field">
                            <label className="auth-input-label">Username</label>
                            <div className={`auth-input-wrap ${errors.username ? 'error' : ''}`}>
                                <User size={16} className="auth-input-icon" />
                                <input
                                    {...rf('username', {
                                        required: 'Username is required',
                                        pattern: { value: /^[a-zA-Z0-9_.-]+$/, message: 'Only letters, numbers, _, ., - allowed' }
                                    })}
                                    placeholder="janedoe"
                                    className="auth-input"
                                    autoComplete="username"
                                />
                            </div>
                            {errors.username && <p className="auth-input-error"><AlertCircle size={12} />{errors.username.message}</p>}
                        </div>

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

                        {/* Phone */}
                        <div className="auth-field">
                            <label className="auth-input-label">Phone Number</label>
                            <div className={`auth-input-wrap ${errors.phone ? 'error' : ''}`}>
                                <Phone size={16} className="auth-input-icon" />
                                <input
                                    {...rf('phone', {
                                        required: 'Phone number is required',
                                        pattern: { value: /^[0-9+\- ]{7,15}$/, message: 'Enter a valid phone number' }
                                    })}
                                    type="tel"
                                    placeholder="+91 98765 43210"
                                    className="auth-input"
                                    autoComplete="tel"
                                />
                            </div>
                            {errors.phone && <p className="auth-input-error"><AlertCircle size={12} />{errors.phone.message}</p>}
                        </div>

                        {/* Password */}
                        <div className="auth-field">
                            <label className="auth-input-label">Password</label>
                            <div className={`auth-input-wrap ${errors.password ? 'error' : ''}`}>
                                <Lock size={16} className="auth-input-icon" />
                                <input
                                    {...rf('password', {
                                        required: 'Password is required',
                                        minLength: { value: 8, message: 'At least 8 characters required' }
                                    })}
                                    type={showPw ? 'text' : 'password'}
                                    placeholder="Create a strong password"
                                    className="auth-input"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className="auth-input-right text-slate-400 hover:text-slate-600 transition-colors"
                                    onClick={() => setShowPw(v => !v)}
                                    tabIndex={-1}
                                    aria-label={showPw ? 'Hide password' : 'Show password'}
                                >
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {/* Strength bar */}
                            {pwValue && (
                                <>
                                    <div className="pw-strength-bar mt-2">
                                        <div className="pw-strength-fill" style={{ width: strength.width, background: strength.color }} />
                                    </div>
                                    <p className="pw-strength-label" style={{ color: strength.color }}>{strength.label}</p>
                                </>
                            )}
                            {errors.password && <p className="auth-input-error"><AlertCircle size={12} />{errors.password.message}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div className="auth-field">
                            <label className="auth-input-label">Confirm Password</label>
                            <div className={`auth-input-wrap ${errors.confirmPassword ? 'error' : ''}`}>
                                <Lock size={16} className="auth-input-icon" />
                                <input
                                    {...rf('confirmPassword', {
                                        required: 'Please confirm your password',
                                        validate: v => v === pwValue || 'Passwords do not match'
                                    })}
                                    type={showCPw ? 'text' : 'password'}
                                    placeholder="Repeat your password"
                                    className="auth-input"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className="auth-input-right text-slate-400 hover:text-slate-600 transition-colors"
                                    onClick={() => setShowCPw(v => !v)}
                                    tabIndex={-1}
                                    aria-label={showCPw ? 'Hide password' : 'Show password'}
                                >
                                    {showCPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="auth-input-error"><AlertCircle size={12} />{errors.confirmPassword.message}</p>}
                        </div>

                        {/* Privacy reassurance */}
                        <div className="auth-privacy">
                            <Shield size={16} className="auth-privacy-icon" />
                            <p className="auth-privacy-text">
                                Your health data remains <strong>private and anonymous</strong>. Always.
                            </p>
                        </div>

                        {/* Submit */}
                        <button type="submit" className="auth-btn" disabled={isLoading}>
                            {isLoading
                                ? <><Loader2 size={16} className="animate-spin" /> Creating your account…</>
                                : <>Create Account <ArrowRight size={16} /></>
                            }
                        </button>
                    </form>

                    <p className="auth-secondary">
                        Already have an account?{' '}
                        <Link to="/login" className="auth-link">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Register
