import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = '/api/experiences/'

// Get paginated experience feed with optional filters
export const getExperiences = createAsyncThunk('experiences/get', async ({ page = 1, condition, hospital, outcome, city } = {}, thunkAPI) => {
    try {
        const params = new URLSearchParams({ page })
        if (condition) params.set('condition', condition)
        if (hospital) params.set('hospital', hospital)
        if (outcome) params.set('outcome', outcome)
        if (city) params.set('city', city)
        const response = await axios.get(API_URL + 'feed?' + params.toString())
        return response.data
    } catch (error) {
        const message = error.response?.data?.message || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
})

// Get current user's own experiences
export const getMyExperiences = createAsyncThunk('experiences/getMe', async (_, thunkAPI) => {
    try {
        const { auth } = thunkAPI.getState()
        const config = { headers: { Authorization: `Bearer ${auth.user?.token}` } }
        const response = await axios.get(API_URL + 'me', config)
        return response.data
    } catch (error) {
        const message = error.response?.data?.message || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
})

// Get community feed (sorted by helpful count)
export const getCommunityFeed = createAsyncThunk('experiences/community', async ({ page = 1 } = {}, thunkAPI) => {
    try {
        const response = await axios.get(API_URL + `community?page=${page}`)
        return response.data
    } catch (error) {
        const message = error.response?.data?.message || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
})

// Create a new experience
export const createExperience = createAsyncThunk('experiences/create', async (experienceData, thunkAPI) => {
    try {
        const { auth } = thunkAPI.getState()
        const config = { headers: { Authorization: `Bearer ${auth.user?.token}` } }
        const response = await axios.post(API_URL, experienceData, config)
        return response.data
    } catch (error) {
        const message = error.response?.data?.message || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
})

// Toggle helpful mark on an experience
export const toggleHelpful = createAsyncThunk('experiences/helpful', async (id, thunkAPI) => {
    try {
        const { auth } = thunkAPI.getState()
        const config = { headers: { Authorization: `Bearer ${auth.user?.token}` } }
        const response = await axios.post(API_URL + `${id}/helpful`, {}, config)
        return { id, helpful: response.data.helpful }
    } catch (error) {
        const message = error.response?.data?.message || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
})

// Update an experience
export const updateExperience = createAsyncThunk('experiences/update', async ({ id, data }, thunkAPI) => {
    try {
        const { auth } = thunkAPI.getState()
        const config = { headers: { Authorization: `Bearer ${auth.user?.token}` } }
        const response = await axios.put(API_URL + id, data, config)
        return response.data
    } catch (error) {
        const message = error.response?.data?.message || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
})

// Delete an experience
export const deleteExperience = createAsyncThunk('experiences/delete', async (id, thunkAPI) => {
    try {
        const { auth } = thunkAPI.getState()
        const config = { headers: { Authorization: `Bearer ${auth.user?.token}` } }
        const response = await axios.delete(API_URL + id, config)
        return response.data
    } catch (error) {
        const message = error.response?.data?.message || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
})


const initialState = {
    experiences: [],
    myExperiences: [],
    communityExperiences: [],
    helpfulIds: [],
    page: 1,
    pages: 1,
    total: 0,
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: '',
}

export const experienceSlice = createSlice({
    name: 'experiences',
    initialState,
    reducers: {
        reset: (state) => {
            state.isError = false
            state.isSuccess = false
            state.isLoading = false
            state.message = ''
        },
        resetFeed: (state) => {
            state.experiences = []
            state.page = 1
            state.pages = 1
        }
    },
    extraReducers: (builder) => {
        builder
            // Get feed
            .addCase(getExperiences.pending, (state) => { state.isLoading = true })
            .addCase(getExperiences.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true
                const { experiences, page, pages, total } = action.payload
                if (page === 1) {
                    state.experiences = experiences
                } else {
                    // Append for load-more
                    const existingIds = new Set(state.experiences.map(e => e._id))
                    state.experiences.push(...experiences.filter(e => !existingIds.has(e._id)))
                }
                state.page = page
                state.pages = pages
                state.total = total
            })
            .addCase(getExperiences.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
            // Get my experiences
            .addCase(getMyExperiences.pending, (state) => { state.isLoading = true })
            .addCase(getMyExperiences.fulfilled, (state, action) => {
                state.isLoading = false
                state.myExperiences = action.payload
            })
            .addCase(getMyExperiences.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
            // Community feed
            .addCase(getCommunityFeed.fulfilled, (state, action) => {
                const { experiences, page } = action.payload
                if (page === 1) {
                    state.communityExperiences = experiences
                } else {
                    const existingIds = new Set(state.communityExperiences.map(e => e._id))
                    state.communityExperiences.push(...experiences.filter(e => !existingIds.has(e._id)))
                }
            })
            // Create
            .addCase(createExperience.fulfilled, (state, action) => {
                state.isSuccess = true
                state.myExperiences.unshift(action.payload)
            })
            // Helpful toggle
            .addCase(toggleHelpful.fulfilled, (state, action) => {
                const { id, helpful } = action.payload
                if (helpful) {
                    if (!state.helpfulIds.includes(id)) state.helpfulIds.push(id)
                } else {
                    state.helpfulIds = state.helpfulIds.filter(hid => hid !== id)
                }
                // Update helpfulCount in all lists
                const updateList = (list) => {
                    const exp = list.find(e => e._id === id)
                    if (exp) exp.helpfulCount = (exp.helpfulCount || 0) + (helpful ? 1 : -1)
                }
                updateList(state.experiences)
                updateList(state.myExperiences)
                updateList(state.communityExperiences)
            })
            // Update
            .addCase(updateExperience.fulfilled, (state, action) => {
                const updateExpInList = (list) => {
                    const idx = list.findIndex(e => e._id === action.payload._id)
                    if (idx !== -1) list[idx] = { ...list[idx], ...action.payload }
                }
                updateExpInList(state.experiences)
                updateExpInList(state.myExperiences)
                updateExpInList(state.communityExperiences)
            })
            // Delete
            .addCase(deleteExperience.fulfilled, (state, action) => {
                const id = action.payload.id
                state.experiences = state.experiences.filter(e => e._id !== id)
                state.myExperiences = state.myExperiences.filter(e => e._id !== id)
                state.communityExperiences = state.communityExperiences.filter(e => e._id !== id)
            })
    },
})

export const { reset, resetFeed } = experienceSlice.actions
export default experienceSlice.reducer
