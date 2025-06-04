import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { apisHeaders } from '../common/apisHeaders.js';

export const addPatientForm = createAsyncThunk('addPatientForm', async (data, { rejectWithValue }) => {
    try {
        const response = await axios.post(
            `${process.env.REACT_APP_BACKEND_API}/patientform/addpatientform`,
            data,
            apisHeaders,
        );

        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const getPatientsForm = createAsyncThunk('getPatientsForm', async (data, { rejectWithValue }) => {
    try {
        const response = await axios.get(
            `${process.env.REACT_APP_BACKEND_API}/patientform/getpatientsform`, { params: data },
            apisHeaders,
        );

        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const updatePatientForm = createAsyncThunk(
    'updatePatientForm',
    async (data, { rejectWithValue }) => {
        const { id } = data;

        try {
            const response = await axios.put(
                `${process.env.REACT_APP_BACKEND_API}/patientform/updatepatientform/${id}`,
                data,
                apisHeaders,
            );

            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    },
);

export const deletePatientForm = createAsyncThunk(
    'deletePatientForm',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.delete(
                `${process.env.REACT_APP_BACKEND_API}/patientform/deletepatientform/${id}`,
                apisHeaders,
            );

            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    },
);

export const generateReport = createAsyncThunk(
    'generateReport',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_API}/patientform/generatereport`, { params: data },
                apisHeaders,
            );

            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    },
);

export const getPatientsFormById = createAsyncThunk(
    'getPatientsFormById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_API}/patientform/getpatientsformbyid/${id}`,
                apisHeaders,
            );

            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    },
);

export const assessmentForm = createAsyncThunk(
    'assessmentForm',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_API}/patientform/assessmentform/${data.id}`,
                data,
                apisHeaders,
            );

            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    },
);

export const patientFormSliceDetails = createSlice({
    name: 'patientFormSliceDetails',
    initialState: {
        patientsForm: [],
        patientForm: {},
        totalCount: 0,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(addPatientForm.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addPatientForm.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(addPatientForm.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(getPatientsForm.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getPatientsForm.fulfilled, (state, action) => {
                state.loading = false;
                state.patientsForm = action.payload.data;
                state.totalCount = action.payload.totalCount;
                state.error = null;
            })
            .addCase(getPatientsForm.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(updatePatientForm.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updatePatientForm.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(updatePatientForm.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(deletePatientForm.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deletePatientForm.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(deletePatientForm.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(generateReport.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(generateReport.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(generateReport.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(getPatientsFormById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getPatientsFormById.fulfilled, (state, action) => {
                state.loading = false;
                state.patientForm = action.payload.data;
                state.error = null;
            })
            .addCase(getPatientsFormById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(assessmentForm.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(assessmentForm.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(assessmentForm.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
    },
});

export default patientFormSliceDetails.reducer;