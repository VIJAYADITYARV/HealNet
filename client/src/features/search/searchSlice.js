import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = '/api/search/'

// Search experiences
export const searchExperiences = createAsyncThunk('search/searchExperiences', async (params, thunkAPI) => {
    try {
        // params is an object { q, condition, hospital, outcome, sort, aiSummary }
        const response = await axios.get(API_URL, { params })
        return response.data
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
})

const initialState = {
    results: [],
    aiInsight: null,
    page: 1,
    pages: 1,
    total: 0,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
}

export const searchSlice = createSlice({
    name: 'search',
    initialState,
    reducers: {
        reset: (state) => {
            state.results = []
            state.aiInsight = null
            state.page = 1
            state.pages = 1
            state.total = 0
            state.isError = false
            state.isSuccess = false
            state.isLoading = false
            state.message = ''
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(searchExperiences.pending, (state) => {
                state.isLoading = true
            })
            .addCase(searchExperiences.fulfilled, (state, action) => {
                state.isLoading = false
                state.isSuccess = true

                if (action.meta.arg && action.meta.arg.page > 1) {
                    state.results = [...state.results, ...action.payload.results]
                } else {
                    state.results = action.payload.results
                    state.aiInsight = action.payload.aiInsight
                }

                state.page = action.payload.page
                state.pages = action.payload.pages
                state.total = action.payload.total
            })
            .addCase(searchExperiences.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
    },
})

export const { reset } = searchSlice.actions
export default searchSlice.reducer
