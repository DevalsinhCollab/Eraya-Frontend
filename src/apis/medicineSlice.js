import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { apisHeaders } from '../common/apisHeaders.js';

export const addMedicine = createAsyncThunk('addMedicine', async (data, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_BACKEND_API}/medicine/createMedicine`,
      data,
      apisHeaders,
    );

    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

export const getMedicines = createAsyncThunk('getMedicines', async (params, { rejectWithValue }) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_BACKEND_API}/medicine/getAllMedicines`,
      { params },
      apisHeaders,
    );
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

export const updateMedicine = createAsyncThunk('updateMedicine', async (data, { rejectWithValue }) => {
  const { id } = data;
  try {
    const response = await axios.put(
      `${process.env.REACT_APP_BACKEND_API}/medicine/updateMedicine/${id}`,
      data,
      apisHeaders,
    );
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

export const deleteMedicine = createAsyncThunk('deleteMedicine', async (id, { rejectWithValue }) => {
  try {
    const response = await axios.put(
      `${process.env.REACT_APP_BACKEND_API}/medicine/deleteMedicine/${id}`,
      apisHeaders,
    );
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

const medicineSlice = createSlice({
  name: 'medicine',
  initialState: {
    medicines: [],
    totalCount: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addMedicine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMedicine.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(addMedicine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getMedicines.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMedicines.fulfilled, (state, action) => {
        state.loading = false;
        state.medicines = action.payload.data || [];
        state.totalCount = action.payload.totalCount || state.medicines.length;
        state.error = null;
      })
      .addCase(getMedicines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateMedicine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMedicine.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updateMedicine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteMedicine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMedicine.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteMedicine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default medicineSlice.reducer;
