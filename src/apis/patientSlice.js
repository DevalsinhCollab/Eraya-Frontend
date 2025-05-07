import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { apisHeaders } from '../common/apisHeaders.js';

// ----------------For addPatient----------------------------\\

export const addPatient = createAsyncThunk('addPatient', async (data, { rejectWithValue }) => {
    try {
        const response = await axios.post(
            `${process.env.REACT_APP_BACKEND_API}/patient/addpatient`,
            data,
            apisHeaders,
        );

        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const getPatients = createAsyncThunk('getPatients', async (data, { rejectWithValue }) => {
    try {
        const response = await axios.get(
            `${process.env.REACT_APP_BACKEND_API}/patient/getpatients`, { params: data },
            apisHeaders,
        );

        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const updatePatient = createAsyncThunk(
    'updatePatient',
    async (data, { rejectWithValue }) => {
        const { id } = data;

        try {
            const response = await axios.put(
                `${process.env.REACT_APP_BACKEND_API}/patient/updatepatient/${id}`,
                data,
                apisHeaders,
            );

            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    },
);

export const deletePatient = createAsyncThunk(
    'deletePatient',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.delete(
                `${process.env.REACT_APP_BACKEND_API}/patient/deletepatient/${id}`,
                apisHeaders,
            );

            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    },
);

export const searchPatients = createAsyncThunk('searchPatients', async (data, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_API}/patient/searchpatients`,
        { params: data },
        apisHeaders,
      );
  
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  });

export const patientSliceDetails = createSlice({
    name: 'patientSliceDetails',
    initialState: {
        patients: [],
        totalCount: 0,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(addPatient.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addPatient.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(addPatient.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(getPatients.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getPatients.fulfilled, (state, action) => {
                state.loading = false;
                state.patients = action.payload.data;
                state.totalCount = action.payload.totalCount;
                state.error = null;
            })
            .addCase(getPatients.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(updatePatient.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updatePatient.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(updatePatient.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(deletePatient.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deletePatient.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(deletePatient.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(searchPatients.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchPatients.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(searchPatients.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
    },
});

export default patientSliceDetails.reducer;