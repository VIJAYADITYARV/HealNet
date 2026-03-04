import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/comments';

export const createComment = createAsyncThunk('comments/create', async (commentData, thunkAPI) => {
    try {
        const { auth } = thunkAPI.getState();
        const config = { headers: { Authorization: `Bearer ${auth.user?.token}` } };
        const response = await axios.post(API_URL, commentData, config);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || error.toString());
    }
});

export const getComments = createAsyncThunk('comments/get', async (experienceId, thunkAPI) => {
    try {
        const response = await axios.get(`${API_URL}/${experienceId}`);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || error.toString());
    }
});

export const deleteComment = createAsyncThunk('comments/delete', async (id, thunkAPI) => {
    try {
        const { auth } = thunkAPI.getState();
        const config = { headers: { Authorization: `Bearer ${auth.user?.token}` } };
        const response = await axios.delete(`${API_URL}/${id}`, config);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || error.toString());
    }
});

const initialState = {
    comments: [], // Note: it's better to store globally or per experience. Using a flat array for current view.
    isLoading: false,
    isError: false,
    message: ''
};

export const commentsSlice = createSlice({
    name: 'comments',
    initialState,
    reducers: {
        resetComments: (state) => {
            state.comments = [];
            state.isError = false;
            state.isLoading = false;
            state.message = '';
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getComments.pending, (state) => { state.isLoading = true; })
            .addCase(getComments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.comments = action.payload;
            })
            .addCase(getComments.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(createComment.fulfilled, (state, action) => {
                // Add new comment to the top
                state.comments.unshift(action.payload);
            })
            .addCase(deleteComment.fulfilled, (state, action) => {
                state.comments = state.comments.filter(c => c._id !== action.payload.id);
            });
    }
});

export const { resetComments } = commentsSlice.actions;
export default commentsSlice.reducer;
