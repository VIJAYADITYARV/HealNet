import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import AppLayout from '../components/layout/AppLayout'
import AISearchCard from '../components/AISearchCard'
import ExperienceFeed from '../components/ExperienceFeed'
import AIHealthGuardian from '../components/AIHealthGuardian'

function Dashboard() {
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth)

    useEffect(() => {
        if (!user) navigate('/login')
    }, [user, navigate])

    if (!user) return null

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto px-4 py-8">
                <AIHealthGuardian />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-12">
                        <AISearchCard />
                    </div>
                    <div className="lg:col-span-12">
                        <ExperienceFeed />
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}

export default Dashboard
