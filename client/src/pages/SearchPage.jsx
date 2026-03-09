import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { searchExperiences } from '../features/search/searchSlice'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Search, Filter, SlidersHorizontal, Flag, ChevronDown, Brain, Sparkles, Loader2 } from 'lucide-react'
import ReportModal from '../components/ReportModal'
import { CardSkeleton } from '../components/Skeleton'

function SearchPage() {
    const [searchParams] = useSearchParams()
    const urlQuery = searchParams.get('q') || ''
    const [query, setQuery] = useState(urlQuery)
    const [sort, setSort] = useState('newest')
    const [page, setPage] = useState(1)
    const [filters, setFilters] = useState({
        condition: '',
        hospital: '',
        outcome: ''
    })

    // Report Modal State
    const [reportModalOpen, setReportModalOpen] = useState(false)
    const [selectedExpId, setSelectedExpId] = useState(null)
    const [selectedExpTitle, setSelectedExpTitle] = useState('')

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { results, aiInsight, isLoading, isError, message, pages } = useSelector((state) => state.search)

    // Debounced search effect
    useEffect(() => {
        const handler = setTimeout(() => {
            dispatch(searchExperiences({
                q: query,
                sort,
                ...filters,
                page,
                aiSummary: page === 1 ? 'true' : 'false' // Only get AI summary on first page/new search
            }))
        }, 500)

        return () => clearTimeout(handler)
    }, [query, sort, filters, page, dispatch])

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value })
        setPage(1)
    }

    const handleLoadMore = () => {
        setPage(prev => prev + 1)
    }

    const handleReport = (e, exp) => {
        e.stopPropagation();
        setSelectedExpId(exp._id)
        setSelectedExpTitle(`${exp.condition} at ${exp.hospital}`)
        setReportModalOpen(true)
    }

    return (
        <div className="container mx-auto p-4 min-h-screen bg-gray-50/50">

            {/* Header */}
            <header className="flex items-center mb-8 border-b pb-6 gap-4">
                <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-900 bg-white p-2 rounded-xl shadow-sm border border-gray-100 transition-all">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Search Intelligence</h1>
                    <p className="text-sm text-gray-500 font-medium">Analyze global patient journeys with HealNet AI</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Filters Panel */}
                <aside className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit top-4 sticky">
                        <div className="flex items-center gap-2 mb-6 text-gray-900">
                            <Filter size={18} strokeWidth={2.5} />
                            <h2 className="font-extrabold text-lg uppercase tracking-wider text-xs">Search Filters</h2>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Condition</label>
                                <input
                                    type="text"
                                    name="condition"
                                    value={filters.condition}
                                    onChange={handleFilterChange}
                                    placeholder="e.g. Migraine"
                                    className="w-full border-gray-100 border-2 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50/50 font-semibold"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Hospital</label>
                                <input
                                    type="text"
                                    name="hospital"
                                    value={filters.hospital}
                                    onChange={handleFilterChange}
                                    placeholder="e.g. Apollo"
                                    className="w-full border-gray-100 border-2 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50/50 font-semibold"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Outcome</label>
                                <select
                                    name="outcome"
                                    value={filters.outcome}
                                    onChange={handleFilterChange}
                                    className="w-full border-gray-100 border-2 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50/50 font-semibold appearance-none"
                                >
                                    <option value="">All Outcomes</option>
                                    <option value="success">Successful</option>
                                    <option value="improvement">Improved</option>
                                    <option value="no improvement">No Change</option>
                                    <option value="complication">Complication</option>
                                </select>
                            </div>

                            <hr className="border-gray-50" />

                            <div>
                                <div className="flex items-center gap-2 mb-3 text-gray-900">
                                    <SlidersHorizontal size={14} />
                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">Ranking</label>
                                </div>
                                <select
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value)}
                                    className="w-full border-gray-100 border-2 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50/50 font-semibold appearance-none"
                                >
                                    <option value="newest">Most Recent</option>
                                    <option value="helpful">Most Helpful</option>
                                    <option value="oldest">Historical First</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* AI Promo Card */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-blue-200 shadow-xl text-white">
                        <Brain className="mb-4 opacity-80" size={32} />
                        <h3 className="font-extrabold text-lg mb-2">Social Health AI</h3>
                        <p className="text-xs text-blue-100 leading-relaxed font-medium">HealNet uses Gemini Pro to cross-reference your symptoms with global patient outcomes for faster clarity.</p>
                    </div>
                </aside>

                {/* Results Area */}
                <main className="lg:col-span-3">
                    {/* Search Bar */}
                    <div className="relative mb-8">
                        <Search className="absolute left-4 top-3.5 text-blue-500" size={20} strokeWidth={3} />
                        <input
                            type="text"
                            placeholder="Search by keywords (e.g. symptoms, treatment, doctor name)..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:outline-none font-bold text-gray-800 transition-all placeholder:text-gray-300"
                        />
                    </div>

                    {/* AI INSIGHT BANNER */}
                    {(isLoading && page === 1 && query) ? (
                        <div className="bg-white p-6 rounded-2xl border border-blue-50 mb-8 animate-pulse">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg" />
                                <div className="h-4 w-48 bg-blue-50 rounded" />
                            </div>
                            <div className="h-4 w-full bg-gray-50 rounded mb-2" />
                            <div className="h-4 w-2/3 bg-gray-50 rounded" />
                        </div>
                    ) : aiInsight && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 mb-8 relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-3">
                                    <Brain className="text-blue-600" size={20} />
                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Community AI Synthesis</span>
                                </div>
                                <p className="text-blue-900 font-bold leading-relaxed">{aiInsight}</p>
                            </div>
                            <Sparkles size={120} className="absolute -right-10 -bottom-10 text-blue-200/20 group-hover:scale-110 transition-transform" />
                        </div>
                    )}

                    {/* Results List */}
                    {isLoading && page === 1 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
                        </div>
                    ) : isError ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-red-50">
                            <div className="text-red-500 font-black mb-2 text-xl">Search Interrupted</div>
                            <div className="text-gray-500 font-medium">Error: {message}</div>
                        </div>
                    ) : results.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                            <Search size={48} className="mx-auto text-gray-200 mb-4" />
                            <div className="text-gray-400 font-bold">No matching journeys discovered yet.</div>
                            <div className="text-gray-300 text-sm mt-1">Try broadening your search terms.</div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {results.map((exp) => (
                                <div
                                    key={exp._id}
                                    className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100 group cursor-pointer"
                                    onClick={() => navigate(`/experience/${exp._id}`)}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">{exp.condition}</div>
                                            <h3 className="font-extrabold text-lg text-gray-900 line-clamp-1">{exp.hospital}</h3>
                                        </div>
                                        <div className={`w-3 h-3 rounded-full ${exp.outcome === 'success' ? 'bg-green-500 shadow-green-200 shadow-lg' : 'bg-red-400 shadow-red-100 shadow-lg'}`} />
                                    </div>

                                    <p className="text-gray-600 text-sm font-medium mb-6 line-clamp-3 leading-relaxed">"{exp.description}"</p>

                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {(exp.symptoms || []).slice(0, 3).map((s, idx) => (
                                            <span key={idx} className="bg-gray-50 text-gray-500 text-[10px] font-black px-3 py-1.5 rounded-lg border border-gray-100 uppercase">{s}</span>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                                                {exp.userId?.name?.[0] || 'U'}
                                            </div>
                                            <span className="text-[11px] font-bold text-gray-400">{exp.userId?.name || 'Anonymous Patient'}</span>
                                        </div>
                                        <button
                                            onClick={(e) => handleReport(e, exp)}
                                            className="text-gray-300 hover:text-red-400 transition-colors"
                                        >
                                            <Flag size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Additional Loading Skeletons */}
                            {isLoading && page > 1 && (
                                <div className="contents">
                                    {[1, 2].map(i => <CardSkeleton key={i} />)}
                                </div>
                            )}

                            {/* Load More Button */}
                            {page < pages && !isLoading && (
                                <div className="col-span-full flex justify-center mt-8 pb-10">
                                    <button
                                        onClick={handleLoadMore}
                                        className="bg-white border-2 border-gray-100 text-gray-600 px-8 py-3 rounded-2xl font-black text-sm hover:border-blue-500 hover:text-blue-500 transition-all flex items-center gap-3 shadow-sm hover:shadow-lg"
                                    >
                                        <ChevronDown size={18} strokeWidth={3} /> LOAD MORE DATA
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            <ReportModal
                isOpen={reportModalOpen}
                onClose={() => setReportModalOpen(false)}
                experienceId={selectedExpId}
                experienceTitle={selectedExpTitle}
            />
        </div>
    )
}

export default SearchPage
