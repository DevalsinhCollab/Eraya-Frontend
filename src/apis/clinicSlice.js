import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { ApiHeaderWithToken, apisHeaders } from '../common/apisHeaders.js';

export const addClinic = createAsyncThunk('addClinic', async (data, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_BACKEND_API}/clinic/createClinic`,
      data,
      apisHeaders,
    );

    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

export const getClinics = createAsyncThunk('getClinics', async (params, { rejectWithValue }) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_BACKEND_API}/clinic/getAllClinics`,
      { params ,...ApiHeaderWithToken()   },
    
    );
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

export const updateClinic = createAsyncThunk('updateClinic', async (data, { rejectWithValue }) => {
  const { id } = data;
  try {
    const response = await axios.put(
      `${process.env.REACT_APP_BACKEND_API}/clinic/updateClinic/${id}`,
      data,
      apisHeaders,
    );
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

export const deleteClinic = createAsyncThunk('deleteClinic', async (id, { rejectWithValue }) => {
  try {
    const response = await axios.put(
      `${process.env.REACT_APP_BACKEND_API}/clinic/deleteClinic/${id}`,
      apisHeaders,
    );
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

const clinicSlice = createSlice({
  name: 'clinic',
  initialState: {
    clinics: [],
    totalCount: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addClinic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addClinic.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(addClinic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getClinics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getClinics.fulfilled, (state, action) => {
        state.loading = false;
        state.clinics = action.payload.data || [];
        state.totalCount = action.payload.totalCount || state.clinics.length;
        state.error = null;
      })
      .addCase(getClinics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateClinic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateClinic.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateClinic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteClinic.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteClinic.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteClinic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default clinicSlice.reducer;
