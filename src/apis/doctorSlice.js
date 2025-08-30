import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { apisHeaders } from '../common/apisHeaders.js';

// ----------------For addDoctor----------------------------\\

export const addDoctor = createAsyncThunk('addDoctor', async (data, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_BACKEND_API}/doc/adddoctor`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const getDoctors = createAsyncThunk('getDoctors', async (data, { rejectWithValue }) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_BACKEND_API}/doc/getdoctors`,
      { params: data },
      apisHeaders,
    );

    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const updateDoctor = createAsyncThunk(
  'updateDoctor',
  async (data, { rejectWithValue }) => {
    const { id } = data;

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_API}/doc/updatedoctor/${id}`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const deleteDoctor = createAsyncThunk(
  'deleteDoctor',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_BACKEND_API}/doc/deletedoctor/${id}`,
        apisHeaders,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const searchDoctors = createAsyncThunk('searchDoctors', async (data, { rejectWithValue }) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_BACKEND_API}/doc/searchdoctors`,
      { params: data },
      apisHeaders,
    );

    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const doctorSliceDetails = createSlice({
  name: 'doctorSliceDetails',
  initialState: {
    doctors: [],
    totalCount: 0,
    docLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addDoctor.pending, (state) => {
        state.docLoading = true;
        state.error = null;
      })
      .addCase(addDoctor.fulfilled, (state, action) => {
        state.docLoading = false;
        state.error = null;
      })
      .addCase(addDoctor.rejected, (state, action) => {
        state.docLoading = false;
        state.error = action.payload;
      })

      .addCase(getDoctors.pending, (state) => {
        state.docLoading = true;
        state.error = null;
      })
      .addCase(getDoctors.fulfilled, (state, action) => {
        state.docLoading = false;
        state.doctors = action.payload.data;
        state.totalCount = action.payload.totalCount;
        state.error = null;
      })
      .addCase(getDoctors.rejected, (state, action) => {
        state.docLoading = false;
        state.error = action.payload;
      })

      .addCase(updateDoctor.pending, (state) => {
        state.docLoading = true;
        state.error = null;
      })
      .addCase(updateDoctor.fulfilled, (state, action) => {
        state.docLoading = false;
        state.error = null;
      })
      .addCase(updateDoctor.rejected, (state, action) => {
        state.docLoading = false;
        state.error = action.payload;
      })

      .addCase(deleteDoctor.pending, (state) => {
        state.docLoading = true;
        state.error = null;
      })
      .addCase(deleteDoctor.fulfilled, (state, action) => {
        state.docLoading = false;
        state.error = null;
      })
      .addCase(deleteDoctor.rejected, (state, action) => {
        state.docLoading = false;
        state.error = action.payload;
      })

      .addCase(searchDoctors.pending, (state) => {
        state.docLoading = true;
        state.error = null;
      })
      .addCase(searchDoctors.fulfilled, (state, action) => {
        state.docLoading = false;
        state.error = null;
      })
      .addCase(searchDoctors.rejected, (state, action) => {
        state.docLoading = false;
        state.error = action.payload;
      })

  },
});

export default doctorSliceDetails.reducer;
