import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/likes';

export const addLike = createAsyncThunk('likes/add', async (experienceId, thunkAPI) => {
    try {
        const { auth } = thunkAPI.getState();
        const config = { headers: { Authorization: `Bearer ${auth.user?.token}` } };
        const response = await axios.post(API_URL, { experienceId }, config);
        return response.data; // contains the like object
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || error.toString());
    }
});

export const removeLike = createAsyncThunk('likes/remove', async (experienceId, thunkAPI) => {
    try {
        const config = { headers: { Authorization: `Bearer ${auth.user?.token}` } };
        const response = await axios.delete(`${API_URL}/${experienceId}`, config);
        return response.data; // { experienceId }
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || error.toString());
    }
});

export const getUserLikes = createAsyncThunk('likes/getUserLikes', async (_, thunkAPI) => {
    try {
        const { auth } = thunkAPI.getState();
        if (!auth.user?.token) return [];
        const config = { headers: { Authorization: `Bearer ${auth.user?.token}` } };
        const response = await axios.get(API_URL, config);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || error.toString());
    }
});

const initialState = {
    likedExperienceIds: [],
    isLoading: false,
};

export const likesSlice = createSlice({
    name: 'likes',
    initialState,
    reducers: {
        resetLikes: (state) => {
            state.likedExperienceIds = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getUserLikes.fulfilled, (state, action) => {
                state.likedExperienceIds = action.payload.map(like => like.experienceId);
            })
            .addCase(addLike.fulfilled, (state, action) => {
                state.likedExperienceIds.push(action.payload.experienceId);
            })
            .addCase(removeLike.fulfilled, (state, action) => {
                state.likedExperienceIds = state.likedExperienceIds.filter(id => id !== action.payload.experienceId);
            });
    }
});

export const { resetLikes } = likesSlice.actions;
export default likesSlice.reducer;
