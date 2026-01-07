import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { ApiHeaderWithToken, apisHeaders } from '../common/apisHeaders.js';

export const createPurchaseOrder = createAsyncThunk('createPurchaseOrder', async (data, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_BACKEND_API}/purchaseOrders/createPurchaseOrder`,
      data,
      ApiHeaderWithToken(),
    );
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const getPurchaseOrders = createAsyncThunk('getPurchaseOrders', async (params, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_BACKEND_API}/purchaseOrders/getAllPurchaseOrders`, {
      params,
      ...ApiHeaderWithToken(),
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const getPurchaseOrderById = createAsyncThunk('getPurchaseOrderById', async (id, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_BACKEND_API}/purchaseOrders/getPurchaseOrderById/${id}`, ApiHeaderWithToken());
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const updatePurchaseOrder = createAsyncThunk('updatePurchaseOrder', async (data, { rejectWithValue }) => {
  const { id } = data;
  try {
    const response = await axios.put(`${process.env.REACT_APP_BACKEND_API}/purchaseOrders/updatePurchaseOrder/${id}`, data, ApiHeaderWithToken());
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const importPurchaseOrder = createAsyncThunk('importPurchaseOrder', async (id, { rejectWithValue }) => {
  try {
    const response = await axios.put(`${process.env.REACT_APP_BACKEND_API}/purchaseOrders/importPurchaseOrder/${id}`, {}, ApiHeaderWithToken());
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const cancelPurchaseOrder = createAsyncThunk('cancelPurchaseOrder', async (id, { rejectWithValue }) => {
  try {
    const response = await axios.put(`${process.env.REACT_APP_BACKEND_API}/purchaseOrders/cancelPurchaseOrder/${id}`, {}, ApiHeaderWithToken());
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

const purchaseOrderSlice = createSlice({
  name: 'purchaseOrder',
  initialState: {
    orders: [],
    totalCount: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createPurchaseOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPurchaseOrder.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(createPurchaseOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getPurchaseOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPurchaseOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data || [];
        state.totalCount = action.payload.totalCount || state.orders.length;
        state.error = null;
      })
      .addCase(getPurchaseOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getPurchaseOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPurchaseOrderById.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(getPurchaseOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updatePurchaseOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePurchaseOrder.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updatePurchaseOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(importPurchaseOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(importPurchaseOrder.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(importPurchaseOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(cancelPurchaseOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelPurchaseOrder.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(cancelPurchaseOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default purchaseOrderSlice.reducer;
