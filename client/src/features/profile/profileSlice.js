import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = '/api/users/';
const PUBLIC_PROFILE_API_URL = '/api/profile/';

// Fetch user profile with stats
export const getUserProfile = createAsyncThunk('profile/get', async (_, thunkAPI) => {
    try {
        const { auth } = thunkAPI.getState()
        const config = { headers: { Authorization: `Bearer ${auth.user?.token}` } }
        const response = await axios.get(API_URL + 'profile', config)
        return response.data
    } catch (error) {
        const message = error.response?.data?.message || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
})

// Toggle anonymous mode
export const toggleAnonymousMode = createAsyncThunk('profile/toggleAnon', async (_, thunkAPI) => {
    try {
        const { auth } = thunkAPI.getState()
        const config = { headers: { Authorization: `Bearer ${auth.user?.token}` } }
        const response = await axios.patch(API_URL + 'anonymous-mode', {}, config)
        return response.data
    } catch (error) {
        const message = error.response?.data?.message || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
})

// Get public profile by username
export const getPublicProfile = createAsyncThunk('profile/getPublic', async (username, thunkAPI) => {
    try {
        const response = await axios.get(PUBLIC_PROFILE_API_URL + username)
        return response.data
    } catch (error) {
        const message = error.response?.data?.message || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
})

// Update user profile
export const updateUserProfile = createAsyncThunk('profile/update', async (profileData, thunkAPI) => {
    try {
        const { auth } = thunkAPI.getState()
        const config = { headers: { Authorization: `Bearer ${auth.user?.token}` } }
        const response = await axios.put(PUBLIC_PROFILE_API_URL, profileData, config)
        return response.data
    } catch (error) {
        const message = error.response?.data?.message || error.message || error.toString()
        return thunkAPI.rejectWithValue(message)
    }
})

const initialState = {
    profile: null,
    publicProfile: null, // { user, experiences }
    isLoading: false,
    isError: false,
    message: '',
}

export const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        reset: (state) => {
            state.isError = false
            state.isLoading = false
            state.message = ''
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getUserProfile.pending, (state) => { state.isLoading = true })
            .addCase(getUserProfile.fulfilled, (state, action) => {
                state.isLoading = false
                state.profile = action.payload
            })
            .addCase(getUserProfile.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
            .addCase(toggleAnonymousMode.fulfilled, (state, action) => {
                if (state.profile) {
                    state.profile.isAnonymous = action.payload.isAnonymous
                } else {
                    state.profile = { isAnonymous: action.payload.isAnonymous }
                }
            })
            // Public Profile
            .addCase(getPublicProfile.pending, (state) => { state.isLoading = true })
            .addCase(getPublicProfile.fulfilled, (state, action) => {
                state.isLoading = false
                state.publicProfile = action.payload
            })
            .addCase(getPublicProfile.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
            // Update Profile
            .addCase(updateUserProfile.pending, (state) => { state.isLoading = true })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.isLoading = false
                if (state.profile) {
                    state.profile = { ...state.profile, ...action.payload }
                }
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.isLoading = false
                state.isError = true
                state.message = action.payload
            })
    },
})

export const { reset } = profileSlice.actions
export default profileSlice.reducer
