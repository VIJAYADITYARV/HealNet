import { toggleAnonymousMode } from '../features/profile/profileSlice'
import { Eye, EyeOff, Shield } from 'lucide-react'

function AnonymousToggle() {
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const isAnonymous = user?.isAnonymous || false

    return (
        <button
            onClick={() => dispatch(toggleAnonymousMode())}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${isAnonymous
                ? 'bg-health-800 text-white shadow-md'
                : 'bg-health-50 text-health-600 border border-health-100'
                }`}
            title={isAnonymous ? "You are posting anonymously" : "You are posting publicly"}
        >
            {isAnonymous ? <Shield size={18} /> : <Eye size={18} />}
            <span className="text-sm font-semibold">
                {isAnonymous ? 'Privacy: Anonymous' : 'Privacy: Public'}
            </span>
        </button>
    )
}

export default AnonymousToggle
