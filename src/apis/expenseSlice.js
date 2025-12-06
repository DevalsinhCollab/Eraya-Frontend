import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { apisHeaders } from '../common/apisHeaders.js';

const BASE = `${process.env.REACT_APP_BACKEND_API}/expense`;

export const createExpense = createAsyncThunk('createExpense', async (data, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${BASE}/createExpense`, data, apisHeaders);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

export const getAllExpenses = createAsyncThunk(
  'getAllExpenses',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE}/getAllExpenses`, {
        params,
        ...apisHeaders,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const getExpenseById = createAsyncThunk(
  'getExpenseById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE}/getExpenseById/${id}`, apisHeaders);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateExpense = createAsyncThunk(
  'updateExpense',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${BASE}/updateExpense/${id}`, data, apisHeaders);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const deleteExpense = createAsyncThunk('deleteExpense', async (id, { rejectWithValue }) => {
  try {
    const response = await axios.put(`${BASE}/deleteExpense/${id}`, {}, apisHeaders);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

export const getExpenseSummary = createAsyncThunk(
  'getExpenseSummary',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE}/getExpenseSummary`, {
        params,
        ...apisHeaders,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const getExpenseStats = createAsyncThunk(
  'getExpenseStats',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE}/getExpenseStats`, {
        params,
        ...apisHeaders,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

const initialState = {
  expenses: [],
  expenseLoading: false,
  expenseSummary: null,
  expenseStats: null,
  error: null,
  total: 0,
};

export const expenseSlice = createSlice({
  name: 'expenseData',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createExpense.pending, (state) => {
        state.expenseLoading = true;
        state.error = null;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.expenseLoading = false;
        state.expenses.unshift(action.payload.data);
        state.error = null;
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.expenseLoading = false;
        state.error = action.payload;
      })

      .addCase(getAllExpenses.pending, (state) => {
        state.expenseLoading = true;
        state.error = null;
      })
      .addCase(getAllExpenses.fulfilled, (state, action) => {
        state.expenseLoading = false;
        state.expenses = action.payload.data;
        state.total = action.payload.total;
        state.error = null;
      })
      .addCase(getAllExpenses.rejected, (state, action) => {
        state.expenseLoading = false;
        state.error = action.payload;
      })

      .addCase(updateExpense.pending, (state) => {
        state.expenseLoading = true;
        state.error = null;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.expenseLoading = false;
        state.expenses = state.expenses.map((item) =>
          item._id === action.payload.data._id ? action.payload.data : item
        );
        state.error = null;
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.expenseLoading = false;
        state.error = action.payload;
      })

      .addCase(deleteExpense.pending, (state) => {
        state.expenseLoading = true;
        state.error = null;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenseLoading = false;
        state.expenses = state.expenses.filter(
          (item) => item._id !== action.payload.data._id
        );
        state.error = null;
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.expenseLoading = false;
        state.error = action.payload;
      })

      .addCase(getExpenseSummary.pending, (state) => {
        state.expenseLoading = true;
        state.error = null;
      })
      .addCase(getExpenseSummary.fulfilled, (state, action) => {
        state.expenseLoading = false;
        state.expenseSummary = action.payload.data;
        state.error = null;
      })
      .addCase(getExpenseSummary.rejected, (state, action) => {
        state.expenseLoading = false;
        state.error = action.payload;
      })

      .addCase(getExpenseStats.pending, (state) => {
        state.expenseLoading = true;
        state.error = null;
      })
      .addCase(getExpenseStats.fulfilled, (state, action) => {
        state.expenseLoading = false;
        state.expenseStats = action.payload.data;
        state.error = null;
      })
      .addCase(getExpenseStats.rejected, (state, action) => {
        state.expenseLoading = false;
        state.error = action.payload;
      });
  },
});

export default expenseSlice.reducer;
