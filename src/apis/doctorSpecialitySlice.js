import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { apisHeaders } from '../common/apisHeaders.js';

export const addSpeciality = createAsyncThunk('addSpeciality', async (data, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_BACKEND_API}/doctorSpeciality/createSpeciality`,
      data,
      apisHeaders,
    );

    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

export const getSpecialities = createAsyncThunk('getSpecialities', async (params, { rejectWithValue }) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_BACKEND_API}/doctorSpeciality/getAllDocSpecialities`,
      { params },
      apisHeaders,
    );
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

export const updateSpeciality = createAsyncThunk('updateSpeciality', async (data, { rejectWithValue }) => {
  const { id } = data;
  try {
    const response = await axios.put(
      `${process.env.REACT_APP_BACKEND_API}/doctorSpeciality/updateSpeciality/${id}`,
      data,
      apisHeaders,
    );
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

export const deleteSpeciality = createAsyncThunk('deleteSpeciality', async (id, { rejectWithValue }) => {
  try {
    const response = await axios.put(
      `${process.env.REACT_APP_BACKEND_API}/doctorSpeciality/deleteSpeciality/${id}`,
      apisHeaders,
    );
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

const doctorSpecialitySlice = createSlice({
  name: 'doctorSpeciality',
  initialState: {
    specialities: [],
    totalCount: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addSpeciality.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSpeciality.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(addSpeciality.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getSpecialities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSpecialities.fulfilled, (state, action) => {
        state.loading = false;
        state.specialities = action.payload.data || [];
        state.totalCount = action.payload.totalCount || state.specialities.length;
        state.error = null;
      })
      .addCase(getSpecialities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateSpeciality.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSpeciality.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateSpeciality.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteSpeciality.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSpeciality.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteSpeciality.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default doctorSpecialitySlice.reducer;
