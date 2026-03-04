import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createExperience } from '../features/experiences/experienceSlice'
import { searchHospitals, reset as resetHospitals } from '../features/hospitals/hospitalSlice'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin } from 'lucide-react'

function ExperienceForm() {
    const [formData, setFormData] = useState({
        hospital: '',
        condition: '',
        symptoms: '',
        treatment: '',
        outcome: 'success',
        recoveryTime: '',
        visibility: 'PUBLIC'
    })

    const { hospital, condition, symptoms, treatment, outcome, recoveryTime, visibility } = formData
    const [showSuggestions, setShowSuggestions] = useState(false)
    const suggestionRef = useRef(null)

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user } = useSelector((state) => state.auth)
    const { isLoading, isError, message } = useSelector((state) => state.experiences)
    const { searchResults, isLoading: hospitalsLoading } = useSelector((state) => state.hospitals)

    // Initialize visibility based on global user setting if available
    useEffect(() => {
        if (user?.isAnonymous) {
            setFormData(prev => ({ ...prev, visibility: 'ANONYMOUS' }))
        } else {
            setFormData(prev => ({ ...prev, visibility: 'PUBLIC' }))
        }
    }, [user?.isAnonymous])

    // Handle clicking outside of suggestions
    useEffect(() => {
        function handleClickOutside(event) {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Debounced hospital search
    useEffect(() => {
        if (hospital.length > 2 && showSuggestions) {
            const delayDebounceFn = setTimeout(() => {
                dispatch(searchHospitals(hospital))
            }, 300)
            return () => clearTimeout(delayDebounceFn)
        }
    }, [hospital, dispatch, showSuggestions])

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }))
        if (e.target.name === 'hospital') {
            setShowSuggestions(true)
        }
    }

    const selectHospital = (name) => {
        setFormData((prevState) => ({
            ...prevState,
            hospital: name,
        }))
        setShowSuggestions(false)
        dispatch(resetHospitals())
    }

    const onSubmit = (e) => {
        e.preventDefault()

        const experienceData = {
            hospital,
            condition,
            symptoms: symptoms.split(',').map((s) => s.trim()),
            treatment,
            outcome,
            recoveryTime,
            visibility,
            isAnonymous: visibility === 'ANONYMOUS'
        }

        dispatch(createExperience(experienceData))
        navigate('/')
    }

    if (isLoading) {
        return <div className="text-center py-10">Loading...</div>
    }

    return (
        <section className="bg-white p-6 rounded-lg shadow-md mb-6 relative">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Share Your Experience</h2>
            <p className="mb-4 text-sm text-gray-600">
                You can choose to post this publicly or anonymously.
            </p>

            <form onSubmit={onSubmit} className="space-y-4">
                <div className="relative" ref={suggestionRef}>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Hospital Name</label>
                    <div className="relative">
                        <input
                            type="text"
                            name="hospital"
                            value={hospital}
                            onChange={onChange}
                            onFocus={() => setShowSuggestions(true)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 pl-10 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. City General Hospital"
                            autoComplete="off"
                            required
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    </div>

                    {showSuggestions && hospital.length > 1 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
                            {hospitalsLoading ? (
                                <div className="p-3 text-sm text-gray-500">Searching...</div>
                            ) : searchResults.length > 0 ? (
                                searchResults.map((h) => (
                                    <div
                                        key={h._id}
                                        onClick={() => selectHospital(h.name)}
                                        className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0"
                                    >
                                        <div className="font-bold text-gray-800 text-sm">{h.name}</div>
                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                            <MapPin size={12} /> {h.city}, {h.state}
                                        </div>
                                    </div>
                                ))
                            ) : hospital.length > 2 ? (
                                <div className="p-3 text-sm text-gray-500 italic">No hospitals found. You can continue typing.</div>
                            ) : null}
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <label className="block text-gray-700 text-sm font-bold">Condition / Diagnosis</label>
                        <VoiceRecorder onTranscription={(text) => setFormData(p => ({ ...p, condition: p.condition ? `${p.condition} ${text}` : text }))} />
                    </div>
                    <input
                        type="text"
                        name="condition"
                        value={condition}
                        onChange={onChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. Migraine"
                        required
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <label className="block text-gray-700 text-sm font-bold">Symptoms (comma separated)</label>
                        <VoiceRecorder onTranscription={(text) => setFormData(p => ({ ...p, symptoms: p.symptoms ? `${p.symptoms}, ${text}` : text }))} />
                    </div>
                    <input
                        type="text"
                        name="symptoms"
                        value={symptoms}
                        onChange={onChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. Headache, Nausea, Sensitivity to light"
                        required
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <label className="block text-gray-700 text-sm font-bold">Treatment Received</label>
                        <VoiceRecorder onTranscription={(text) => setFormData(p => ({ ...p, treatment: p.treatment ? `${p.treatment} ${text}` : text }))} />
                    </div>
                    <textarea
                        name="treatment"
                        value={treatment}
                        onChange={onChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                        placeholder="Details about medication, surgery, or therapy..."
                        required
                    />
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Outcome</label>
                        <select
                            name="outcome"
                            value={outcome}
                            onChange={onChange}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="success">Success</option>
                            <option value="failure">Failure / No Improvement</option>
                        </select>
                    </div>

                    <div className="flex-1">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Recovery Time</label>
                        <input
                            type="text"
                            name="recoveryTime"
                            value={recoveryTime}
                            onChange={onChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. 2 weeks"
                            required
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="block text-gray-700 text-sm font-bold">Visibility</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="visibility"
                                value="PUBLIC"
                                checked={visibility === 'PUBLIC'}
                                onChange={onChange}
                                className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm font-medium text-gray-700">Public (Show Profile)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="visibility"
                                value="ANONYMOUS"
                                checked={visibility === 'ANONYMOUS'}
                                onChange={onChange}
                                className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm font-medium text-gray-700">Anonymous (Hide Info)</span>
                        </label>
                    </div>
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none shadow-lg transform active:scale-95 transition duration-200 w-full mt-4"
                >
                    Submit Experience
                </button>
            </form>
        </section>
    )
}

export default ExperienceForm

