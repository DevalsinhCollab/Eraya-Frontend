import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { apisHeaders } from '../common/apisHeaders.js';

export const getDashboardCount = createAsyncThunk(
    'getDashboardCount',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_API}/dashboard/dashboardcount`,
                apisHeaders,
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    },
);

export const getRemainingPatients = createAsyncThunk(
    'getRemainingPatients',
    async (params, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_API}/dashboard/remainingPatients`, {
                params,
                ...apisHeaders,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    },
);

export const getReceivedByPatient = createAsyncThunk(
    'getReceivedByPatient',
    async (params, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_API}/dashboard/receivedByPatient`, {
                params,
                ...apisHeaders,
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data);
        }
    },
);

export const dashboardSliceDetails = createSlice({
    name: 'dashboardSliceDetails',
    initialState: {
        patientCount: 0,
        doctorCount: 0,
        patientFormCount: 0,
        loading: false,
        error: null,
        remainingPatients: [],
        receivedByPatient: [],
    },
    extraReducers: (builder) => {
        builder
            .addCase(getDashboardCount.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getDashboardCount.fulfilled, (state, action) => {
                state.loading = false;
                state.patientCount = action.payload.patientCount;
                state.doctorCount = action.payload.doctorCount;
                state.patientFormCount = action.payload.patientFormCount;
                state.totalIncome = action.payload.totalIncome;
                state.totalPaid = action.payload.totalPaid;
                state.remainingAmount = action.payload.remainingAmount;
                state.totalExpense = action.payload.totalExpense;
                state.error = null;
            })
            .addCase(getDashboardCount.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getRemainingPatients.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getRemainingPatients.fulfilled, (state, action) => {
                state.loading = false;
                state.remainingPatients = action.payload.data || [];
                state.error = null;
            })
            .addCase(getRemainingPatients.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getReceivedByPatient.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getReceivedByPatient.fulfilled, (state, action) => {
                state.loading = false;
                state.receivedByPatient = action.payload.data || [];
                state.error = null;
            })
            .addCase(getReceivedByPatient.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
    },
});

export default dashboardSliceDetails.reducer;