import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Brain, Sparkles, Heart, ShieldCheck, ChevronRight, Loader2 } from 'lucide-react'

const AIHealthGuardian = () => {
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth)
    const [tip, setTip] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTip = async () => {
            try {
                const res = await axios.get('/api/ai/recommendations', {
                    headers: { Authorization: `Bearer ${user?.token}` }
                })
                setTip(res.data.personalizedTips)
            } catch (err) {
                console.error("AI Guardian Error:", err)
            } finally {
                setLoading(false)
            }
        }

        if (user?.token) fetchTip()
    }, [user])

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-50 mb-6 animate-pulse">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg" />
                    <div className="h-4 w-32 bg-blue-50 rounded" />
                </div>
                <div className="h-4 w-full bg-gray-50 rounded mb-2" />
                <div className="h-4 w-2/3 bg-gray-50 rounded" />
            </div>
        )
    }

    if (!tip) return null

    return (
        <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-blue-800 p-6 rounded-3xl shadow-xl shadow-blue-200/50 mb-8 relative overflow-hidden group border border-white/10">
            {/* Background elements */}
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Brain size={120} strokeWidth={1} />
            </div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20 shadow-inner">
                        <ShieldCheck className="text-blue-200" size={20} />
                    </div>
                    <div>
                        <h3 className="text-white font-black text-sm uppercase tracking-[0.2em]">HealNet AI Guardian</h3>
                        <p className="text-blue-300 text-[10px] font-bold">Personalized Preventive Intelligence</p>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                    <div className="flex-1">
                        <p className="text-white text-lg font-extrabold leading-relaxed mb-6 italic">
                            "{tip}"
                        </p>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-blue-200">
                                <Heart size={14} className="fill-blue-400 text-blue-400" />
                                <span className="text-[10px] font-black uppercase tracking-wider">Health Profile Synced</span>
                            </div>
                            <div className="flex items-center gap-2 text-blue-200">
                                <Sparkles size={14} className="text-yellow-400" />
                                <span className="text-[10px] font-black uppercase tracking-wider">Gemini Pro engine</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/health-profile')}
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-4 rounded-2xl transition-all border border-white/10 self-center group-hover:translate-x-1"
                    >
                        <ChevronRight size={24} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AIHealthGuardian
