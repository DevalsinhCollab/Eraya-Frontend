import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { ApiHeaderWithToken, apisHeaders } from '../common/apisHeaders.js';

export const addPharmacyShop = createAsyncThunk('addPharmacyShop', async (data, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_BACKEND_API}/pharmacyShop/createPharmacyShop`,
      data,
      apisHeaders,
    );

    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const getPharmacyShops = createAsyncThunk('getPharmacyShops', async (data, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_BACKEND_API}/pharmacyShop/getAllPharmacyShops`, {
      params: data,
      ...ApiHeaderWithToken(),
    });

    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const updatePharmacyShop = createAsyncThunk('updatePharmacyShop', async (data, { rejectWithValue }) => {
  const { id } = data;
  try {
    const response = await axios.put(
      `${process.env.REACT_APP_BACKEND_API}/pharmacyShop/updatePharmacyShop/${id}`,
      data,
      apisHeaders,
    );

    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const deletePharmacyShop = createAsyncThunk('deletePharmacyShop', async (id, { rejectWithValue }) => {
  try {
    const response = await axios.put(`${process.env.REACT_APP_BACKEND_API}/pharmacyShop/deletePharmacyShop/${id}`, apisHeaders);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

const pharmacySlice = createSlice({
  name: 'pharmacySlice',
  initialState: {
    shops: [],
    totalCount: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addPharmacyShop.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPharmacyShop.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(addPharmacyShop.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getPharmacyShops.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPharmacyShops.fulfilled, (state, action) => {
        state.loading = false;
        state.shops = action.payload.data;
        state.totalCount = action.payload.totalCount || 0;
        state.error = null;
      })
      .addCase(getPharmacyShops.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updatePharmacyShop.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePharmacyShop.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updatePharmacyShop.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deletePharmacyShop.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePharmacyShop.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(deletePharmacyShop.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default pharmacySlice.reducer;
