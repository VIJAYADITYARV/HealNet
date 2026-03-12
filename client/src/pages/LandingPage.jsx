import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Brain, Activity, ShieldCheck, ArrowRight, Sparkles, Heart, Users, TrendingUp, Zap, MessageSquare, Star } from 'lucide-react'

/* ── Animated counter ── */
function AnimatedCounter({ target, suffix = '' }) {
    const [count, setCount] = useState(0)
    useEffect(() => {
        let start = 0
        const duration = 2000
        const step = target / (duration / 16)
        const timer = setInterval(() => {
            start += step
            if (start >= target) { setCount(target); clearInterval(timer) }
            else setCount(Math.floor(start))
        }, 16)
        return () => clearInterval(timer)
    }, [target])
    return <>{count.toLocaleString()}{suffix}</>
}

function LandingPage() {
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        if (user) navigate('/')
    }, [user, navigate])

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <div style={{
            minHeight: '100vh',
            background: '#030712',
            color: '#e2e8f0',
            fontFamily: "'Inter', system-ui, sans-serif",
            overflowX: 'hidden',
            position: 'relative'
        }}>

            {/* ═══ Premium Atmospheric Background ═══ */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute', top: '-25%', left: '-10%', width: '60vw', height: '60vw',
                    borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)',
                    filter: 'blur(120px)', animation: 'lavaLamp 25s ease-in-out infinite alternate'
                }} />
                <div style={{
                    position: 'absolute', bottom: '-20%', right: '-10%', width: '50vw', height: '50vw',
                    borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
                    filter: 'blur(120px)', animation: 'lavaLamp 30s ease-in-out infinite alternate-reverse'
                }} />
                <div style={{
                    position: 'absolute', top: '10%', right: '10%', width: '40vw', height: '40vw',
                    borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
                    filter: 'blur(120px)', animation: 'lavaLamp 20s ease-in-out infinite alternate'
                }} />

                {/* Micro-grid Texture */}
                <div style={{
                    position: 'absolute', inset: 0, opacity: 0.05,
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }} />
            </div>

            <style>{`
                @keyframes lavaLamp { 
                    0% { transform: translate(0,0) scale(1) rotate(0deg); } 
                    33% { transform: translate(50px, 100px) scale(1.2) rotate(10deg); }
                    66% { transform: translate(-30px, 60px) scale(0.9) rotate(-5deg); }
                    100% { transform: translate(0,0) scale(1) rotate(0deg); } 
                }
                @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
                @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                .anim-up { animation: fadeUp 1.2s cubic-bezier(0.16,1,0.3,1) both; }
                .anim-up-1 { animation-delay: 0.1s; }
                .anim-up-2 { animation-delay: 0.3s; }
                .anim-up-3 { animation-delay: 0.5s; }
                .anim-up-4 { animation-delay: 0.7s; }
                .anim-up-5 { animation-delay: 0.9s; }
                .landing-btn:hover { transform: translateY(-4px) scale(1.02) !important; box-shadow: 0 25px 50px -12px rgba(37,99,235,0.5) !important; }
                .feature-card:hover { transform: translateY(-12px) !important; border-color: rgba(56,189,248,0.5) !important; background: rgba(255,255,255,0.06) !important; }
                .glass-navbar { background: rgba(3,7,18,0.7); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.08); }
            `}</style>

            {/* ═══ Glass Navbar ═══ */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 clamp(1.5rem, 6vw, 5rem)', height: 80,
                background: scrolled ? 'rgba(3,7,18,0.75)' : 'transparent',
                backdropFilter: scrolled ? 'blur(30px)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 14,
                        background: 'linear-gradient(135deg, #2563eb, #10b981)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 20px rgba(37,99,235,0.4)'
                    }}>
                        <Activity size={22} color="white" />
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', letterSpacing: '-0.03em' }}>HealNet</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <Link to="/login" style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.2s' }}
                        onMouseOver={e => e.target.style.color = 'white'} onMouseOut={e => e.target.style.color = '#94a3b8'}>
                        Sign In
                    </Link>
                    <Link to="/register" style={{
                        color: 'white', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none',
                        background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', padding: '10px 24px', borderRadius: 999,
                        border: '1px solid rgba(56,189,248,0.3)', boxShadow: '0 4px 15px rgba(37,99,235,0.3)',
                        transition: 'all 0.3s'
                    }}
                        onMouseOver={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 25px rgba(37,99,235,0.5)' }}
                        onMouseOut={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(37,99,235,0.3)' }}>
                        Join Network →
                    </Link>
                </div>
            </nav>

            {/* ═══ Hero Section ═══ */}
            <section style={{
                position: 'relative', zIndex: 1, minHeight: '100vh',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', padding: '120px clamp(1rem, 5vw, 3rem) 60px', maxWidth: 1200, margin: '0 auto'
            }}>
                {/* Badge */}
                <div className="anim-up anim-up-1" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '8px 20px', borderRadius: 999,
                    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
                    marginBottom: 32
                }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                        AI Social Health Platform • Live
                    </span>
                </div>

                {/* H1 */}
                <h1 className="anim-up anim-up-2" style={{
                    fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', fontWeight: 900,
                    color: 'white', lineHeight: 1.05, letterSpacing: '-0.04em',
                    margin: '0 0 24px 0', maxWidth: 900
                }}>
                    The Intelligence{' '}
                    <span style={{
                        background: 'linear-gradient(135deg, #38bdf8, #2563eb, #a78bfa)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        Layer
                    </span>{' '}
                    for Global Health
                </h1>

                {/* Subtitle */}
                <p className="anim-up anim-up-3" style={{
                    fontSize: 'clamp(1rem, 2.2vw, 1.35rem)', color: '#94a3b8',
                    maxWidth: 680, lineHeight: 1.7, margin: '0 0 48px 0', fontWeight: 400
                }}>
                    HealNet combines <strong style={{ color: '#e2e8f0' }}>Gemini 2.0 AI</strong> with authentic community experiences to deliver real-time, privacy-first clinical intelligence for patients worldwide.
                </p>

                {/* CTAs */}
                <div className="anim-up anim-up-4" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginBottom: 64 }}>
                    <button className="landing-btn" onClick={() => navigate('/register')} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', color: 'white',
                        padding: '16px 36px', borderRadius: 999, fontWeight: 700, fontSize: '1.05rem',
                        border: '1px solid rgba(56,189,248,0.3)', cursor: 'pointer',
                        boxShadow: '0 8px 30px -5px rgba(37,99,235,0.5)', transition: 'all 0.3s ease',
                        fontFamily: 'inherit'
                    }}>
                        Get Started Free <ArrowRight size={20} />
                    </button>
                    <button className="landing-btn" onClick={() => {
                        document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                    }} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: 'rgba(255,255,255,0.05)', color: '#cbd5e1',
                        padding: '16px 36px', borderRadius: 999, fontWeight: 600, fontSize: '1.05rem',
                        border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                        backdropFilter: 'blur(10px)', transition: 'all 0.3s ease', fontFamily: 'inherit'
                    }}>
                        <Sparkles size={18} /> Explore Features
                    </button>
                </div>

                {/* Stats Row */}
                <div className="anim-up anim-up-5" style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 1,
                    width: '100%', maxWidth: 700,
                    background: 'rgba(255,255,255,0.06)', borderRadius: 20,
                    border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden'
                }}>
                    {[
                        { val: 12500, suffix: '+', label: 'Patient Insights', icon: Heart },
                        { val: 850, suffix: '+', label: 'Hospitals Tracked', icon: Activity },
                        { val: 98, suffix: '%', label: 'Privacy Score', icon: ShieldCheck },
                        { val: 24, suffix: '/7', label: 'AI Available', icon: Brain },
                    ].map((s, i) => (
                        <div key={i} className="stat-card" style={{
                            padding: '24px 16px', textAlign: 'center', cursor: 'default',
                            background: 'rgba(255,255,255,0.02)', transition: 'all 0.3s'
                        }}>
                            <s.icon size={18} style={{ margin: '0 auto 8px', color: '#38bdf8' }} />
                            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
                                <AnimatedCounter target={s.val} suffix={s.suffix} />
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ Feature Cards Section ═══ */}
            <section id="features" style={{
                position: 'relative', zIndex: 1, padding: '80px clamp(1rem, 5vw, 3rem) 100px',
                maxWidth: 1200, margin: '0 auto'
            }}>
                <div style={{ textAlign: 'center', marginBottom: 64 }}>
                    <span style={{
                        display: 'inline-block', fontSize: '0.7rem', fontWeight: 700, color: '#38bdf8',
                        textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 16,
                        background: 'rgba(56,189,248,0.1)', padding: '6px 16px', borderRadius: 999,
                        border: '1px solid rgba(56,189,248,0.2)'
                    }}>
                        Core Intelligence
                    </span>
                    <h2 style={{
                        fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, color: 'white',
                        letterSpacing: '-0.03em', margin: '16px 0 16px'
                    }}>
                        Built for the Future of Health
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: 550, margin: '0 auto' }}>
                        Six interconnected AI modules working together to transform how patients navigate healthcare.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                    {[
                        { icon: Brain, color: '#818cf8', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.2)', title: 'AI Clinical Engine', desc: 'Gemini 2.0-powered symptom analysis. Get instant clinical overviews, differential diagnoses, and treatment comparisons.' },
                        { icon: TrendingUp, color: '#38bdf8', bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.2)', title: 'Real-time Analytics', desc: 'Track treatment success rates, hospital trust scores, and community health trends with live epidemiological dashboards.' },
                        { icon: ShieldCheck, color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)', title: 'Zero-Trust Privacy', desc: 'Total anonymity by default. Your health data is encrypted end-to-end and never shared without explicit consent.' },
                        { icon: Users, color: '#f472b6', bg: 'rgba(244,114,182,0.1)', border: 'rgba(244,114,182,0.2)', title: 'Community Intelligence', desc: 'Connect with patients who share similar conditions. Our AI matches you with the most relevant health journeys.' },
                        { icon: MessageSquare, color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)', title: 'AI Smart Messaging', desc: 'Get AI-suggested empathetic responses and medical context during peer-to-peer conversations.' },
                        { icon: Zap, color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.2)', title: 'Smart Comparisons', desc: 'Compare hospitals, treatments, and recovery timelines side-by-side with AI-generated recommendations.' },
                    ].map((f, i) => (
                        <div key={i} className="feature-card" style={{
                            background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)',
                            border: `1px solid ${f.border}`, borderRadius: 20,
                            padding: '32px 28px', cursor: 'default',
                            transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)'
                        }}>
                            <div className="feature-icon" style={{
                                width: 52, height: 52, borderRadius: 14, background: f.bg,
                                border: `1px solid ${f.border}`, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', marginBottom: 20, transition: 'transform 0.3s'
                            }}>
                                <f.icon size={24} color={f.color} />
                            </div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white', marginBottom: 10 }}>{f.title}</h3>
                            <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ Social Proof / Testimonials ═══ */}
            <section style={{
                position: 'relative', zIndex: 1, padding: '60px clamp(1rem, 5vw, 3rem) 80px',
                maxWidth: 1200, margin: '0 auto'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(16,185,129,0.1))',
                    border: '1px solid rgba(56,189,248,0.15)', borderRadius: 28,
                    padding: 'clamp(32px, 5vw, 60px)', position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: -30, right: -30, opacity: 0.05 }}>
                        <Brain size={200} color="white" />
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={18} fill="#fbbf24" color="#fbbf24" />)}
                    </div>
                    <blockquote style={{
                        fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', fontWeight: 500, color: 'white',
                        lineHeight: 1.6, margin: '0 0 24px', fontStyle: 'italic', maxWidth: 700, position: 'relative', zIndex: 1
                    }}>
                        "HealNet's AI analysis helped me understand my treatment options before my consultation.
                        The community insights from patients with similar conditions were invaluable."
                    </blockquote>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #2563eb, #10b981)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 800, fontSize: '0.9rem'
                        }}>AP</div>
                        <div>
                            <div style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>Anonymous Patient</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Verified Recovery — Migraine Treatment</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ CTA Footer ═══ */}
            <section style={{
                position: 'relative', zIndex: 1, padding: '60px clamp(1rem, 5vw, 3rem) 40px',
                maxWidth: 1200, margin: '0 auto', textAlign: 'center'
            }}>
                <h2 style={{
                    fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, color: 'white',
                    letterSpacing: '-0.03em', margin: '0 0 16px'
                }}>
                    Ready to Take Control?
                </h2>
                <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: 500, margin: '0 auto 32px' }}>
                    Join thousands of patients making smarter health decisions with AI-powered intelligence.
                </p>
                <button className="landing-btn" onClick={() => navigate('/register')} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 10,
                    background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', color: 'white',
                    padding: '18px 44px', borderRadius: 999, fontWeight: 700, fontSize: '1.1rem',
                    border: '1px solid rgba(56,189,248,0.3)', cursor: 'pointer',
                    boxShadow: '0 8px 30px -5px rgba(37,99,235,0.5)', transition: 'all 0.3s ease',
                    fontFamily: 'inherit'
                }}>
                    Create Free Account <ArrowRight size={20} />
                </button>
            </section>

            {/* ═══ Footer ═══ */}
            <footer style={{
                position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.06)',
                padding: '32px clamp(1rem, 5vw, 3rem)', maxWidth: 1200, margin: '40px auto 0',
                display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 10,
                        background: 'linear-gradient(135deg, #2563eb, #10b981)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Activity size={16} color="white" />
                    </div>
                    <span style={{ fontWeight: 700, color: '#475569', fontSize: '0.9rem' }}>HealNet</span>
                </div>
                <p style={{ color: '#334155', fontSize: '0.8rem', margin: 0 }}>
                    © 2026 HealNet · AI Social Health Platform · Privacy First
                </p>
            </footer>
        </div>
    )
}

export default LandingPage
