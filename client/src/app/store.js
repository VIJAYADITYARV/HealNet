import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import preferenceReducer from '../features/preferences/preferenceSlice'
import experienceReducer from '../features/experiences/experienceSlice'
import queryReducer from '../features/query/querySlice'
import searchReducer from '../features/search/searchSlice'
import analyticsReducer from '../features/analytics/analyticsSlice'
import reportReducer from '../features/reports/reportSlice'
import hospitalReducer from '../features/hospitals/hospitalSlice'
import profileReducer from '../features/profile/profileSlice'
import insightsReducer from '../features/insights/insightsSlice'
import commentsReducer from '../features/comments/commentsSlice'
import likesReducer from '../features/likes/likesSlice'
import messagesReducer from '../features/messages/messagesSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        preference: preferenceReducer,
        experiences: experienceReducer,
        query: queryReducer,
        search: searchReducer,
        analytics: analyticsReducer,
        report: reportReducer,
        hospitals: hospitalReducer,
        profile: profileReducer,
        insights: insightsReducer,
        comments: commentsReducer,
        likes: likesReducer,
        messages: messagesReducer,
    },
})
