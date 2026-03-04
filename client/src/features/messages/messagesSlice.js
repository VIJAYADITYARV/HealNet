import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/messages/';

export const getConversationsList = createAsyncThunk('messages/getList', async (_, thunkAPI) => {
    try {
        const { auth } = thunkAPI.getState();
        const config = { headers: { Authorization: `Bearer ${auth.user?.token}` } };
        const response = await axios.get(API_URL + 'conversations/list', config);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || error.toString());
    }
});

export const getConversation = createAsyncThunk('messages/getConv', async (userId, thunkAPI) => {
    try {
        const { auth } = thunkAPI.getState();
        const config = { headers: { Authorization: `Bearer ${auth.user?.token}` } };
        const response = await axios.get(API_URL + userId, config);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || error.toString());
    }
});

export const sendMessage = createAsyncThunk('messages/send', async ({ receiverId, content }, thunkAPI) => {
    try {
        const { auth } = thunkAPI.getState();
        const config = { headers: { Authorization: `Bearer ${auth.user?.token}` } };
        const response = await axios.post(API_URL, { receiverId, content }, config);
        return response.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || error.toString());
    }
});

const initialState = {
    conversations: [],
    currentConversation: [], // array of messages
    isLoading: false,
    isError: false,
    message: ''
};

export const messagesSlice = createSlice({
    name: 'messages',
    initialState,
    reducers: {
        resetMessages: (state) => {
            state.isError = false;
            state.isLoading = false;
            state.message = '';
        },
        clearCurrentConversation: (state) => {
            state.currentConversation = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getConversationsList.pending, (state) => { state.isLoading = true; })
            .addCase(getConversationsList.fulfilled, (state, action) => {
                state.isLoading = false;
                state.conversations = action.payload;
            })
            .addCase(getConversationsList.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(getConversation.pending, (state) => { state.isLoading = true; })
            .addCase(getConversation.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentConversation = action.payload;
            })
            .addCase(getConversation.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.currentConversation.push(action.payload);
            });
    }
});

export const { resetMessages, clearCurrentConversation } = messagesSlice.actions;
export default messagesSlice.reducer;
