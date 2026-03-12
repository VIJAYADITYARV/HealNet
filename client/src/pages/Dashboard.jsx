import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import AppLayout from '../components/layout/AppLayout'
import AISearchCard from '../components/AISearchCard'
import ExperienceFeed from '../components/ExperienceFeed'
import AIIntelligenceLab from '../components/AIIntelligenceLab'
import HealthPulse from '../components/HealthPulse'
import DailyCheckIn from '../components/DailyCheckIn'

function Dashboard() {
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth)

    useEffect(() => {
        if (!user) navigate('/welcome')
    }, [user, navigate])

    if (!user) return null

    return (
        <AppLayout>
            <HealthPulse />
            <DailyCheckIn />
            <AIIntelligenceLab />
            <AISearchCard />
            <div style={{ marginTop: 8 }}>
                <ExperienceFeed />
            </div>
        </AppLayout>
    )
}

export default Dashboard
