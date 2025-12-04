import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { ApiHeaderWithToken, apisHeaders } from '../common/apisHeaders.js';

// ----------------Create Unavailability----------------------------
export const createUnavailability = createAsyncThunk(
  'createUnavailability',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_API}/unavailability/create`,
        data,
        ApiHeaderWithToken(),
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

// ----------------Get Unavailability By Doctor----------------------------
export const getUnavailabilityByDoctor = createAsyncThunk(
  'getUnavailabilityByDoctor',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_API}/unavailability/getByDoctor`,
        { params: data, ...ApiHeaderWithToken() },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

// ----------------Add Full Day Unavailability----------------------------
export const addFullDayUnavailability = createAsyncThunk(
  'addFullDayUnavailability',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_API}/unavailability/addFullDay`,
        data,
        ApiHeaderWithToken(),
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

// ----------------Add Custom Slot Unavailability----------------------------
export const addCustomSlotUnavailability = createAsyncThunk(
  'addCustomSlotUnavailability',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_API}/unavailability/addCustomSlot`,
        data,
        ApiHeaderWithToken(),
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

// ----------------Add Weekly Off----------------------------
export const addWeeklyOff = createAsyncThunk(
  'addWeeklyOff',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_API}/unavailability/addWeeklyOff`,
        data,
        ApiHeaderWithToken(),
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

// ----------------Remove Full Day Unavailability----------------------------
export const removeFullDayUnavailability = createAsyncThunk(
  'removeFullDayUnavailability',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_API}/unavailability/removeFullDay`,
        data,
        ApiHeaderWithToken(),
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

// ----------------Remove Custom Slot Unavailability----------------------------
export const removeCustomSlotUnavailability = createAsyncThunk(
  'removeCustomSlotUnavailability',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_API}/unavailability/removeCustomSlot`,
        data,
        ApiHeaderWithToken(),
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

// ----------------Remove Weekly Off----------------------------
export const removeWeeklyOff = createAsyncThunk(
  'removeWeeklyOff',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_API}/unavailability/removeWeeklyOff`,
        data,
        ApiHeaderWithToken(),
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

// ----------------Delete All Unavailability----------------------------
export const deleteUnavailability = createAsyncThunk(
  'deleteUnavailability',
  async (doctorId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_BACKEND_API}/unavailability/delete/${doctorId}`,
        ApiHeaderWithToken(),
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

const initialState = {
  unavailability: null,
  unavailabilityLoading: false,
  error: null,
};

export const doctorUnavailabilitySlice = createSlice({
  name: 'doctorUnavailability',
  initialState,
  extraReducers: (builder) => {
    // Create Unavailability
    builder
      .addCase(createUnavailability.pending, (state) => {
        state.unavailabilityLoading = true;
        state.error = null;
      })
      .addCase(createUnavailability.fulfilled, (state, action) => {
        state.unavailabilityLoading = false;
        state.unavailability = action.payload.data;
        state.error = null;
      })
      .addCase(createUnavailability.rejected, (state, action) => {
        state.unavailabilityLoading = false;
        state.error = action.payload;
      });

    // Get Unavailability By Doctor
    builder
      .addCase(getUnavailabilityByDoctor.pending, (state) => {
        state.unavailabilityLoading = true;
        state.error = null;
      })
      .addCase(getUnavailabilityByDoctor.fulfilled, (state, action) => {
        state.unavailabilityLoading = false;
        state.unavailability = action.payload.data;
        state.error = null;
      })
      .addCase(getUnavailabilityByDoctor.rejected, (state, action) => {
        state.unavailabilityLoading = false;
        state.error = action.payload;
      });

    // Add Full Day Unavailability
    builder
      .addCase(addFullDayUnavailability.pending, (state) => {
        state.unavailabilityLoading = true;
        state.error = null;
      })
      .addCase(addFullDayUnavailability.fulfilled, (state, action) => {
        state.unavailabilityLoading = false;
        state.unavailability = action.payload.data;
        state.error = null;
      })
      .addCase(addFullDayUnavailability.rejected, (state, action) => {
        state.unavailabilityLoading = false;
        state.error = action.payload;
      });

    // Add Custom Slot Unavailability
    builder
      .addCase(addCustomSlotUnavailability.pending, (state) => {
        state.unavailabilityLoading = true;
        state.error = null;
      })
      .addCase(addCustomSlotUnavailability.fulfilled, (state, action) => {
        state.unavailabilityLoading = false;
        state.unavailability = action.payload.data;
        state.error = null;
      })
      .addCase(addCustomSlotUnavailability.rejected, (state, action) => {
        state.unavailabilityLoading = false;
        state.error = action.payload;
      });

    // Add Weekly Off
    builder
      .addCase(addWeeklyOff.pending, (state) => {
        state.unavailabilityLoading = true;
        state.error = null;
      })
      .addCase(addWeeklyOff.fulfilled, (state, action) => {
        state.unavailabilityLoading = false;
        state.unavailability = action.payload.data;
        state.error = null;
      })
      .addCase(addWeeklyOff.rejected, (state, action) => {
        state.unavailabilityLoading = false;
        state.error = action.payload;
      });

    // Remove Full Day Unavailability
    builder
      .addCase(removeFullDayUnavailability.pending, (state) => {
        state.unavailabilityLoading = true;
        state.error = null;
      })
      .addCase(removeFullDayUnavailability.fulfilled, (state, action) => {
        state.unavailabilityLoading = false;
        state.unavailability = action.payload.data;
        state.error = null;
      })
      .addCase(removeFullDayUnavailability.rejected, (state, action) => {
        state.unavailabilityLoading = false;
        state.error = action.payload;
      });

    // Remove Custom Slot Unavailability
    builder
      .addCase(removeCustomSlotUnavailability.pending, (state) => {
        state.unavailabilityLoading = true;
        state.error = null;
      })
      .addCase(removeCustomSlotUnavailability.fulfilled, (state, action) => {
        state.unavailabilityLoading = false;
        state.unavailability = action.payload.data;
        state.error = null;
      })
      .addCase(removeCustomSlotUnavailability.rejected, (state, action) => {
        state.unavailabilityLoading = false;
        state.error = action.payload;
      });

    // Remove Weekly Off
    builder
      .addCase(removeWeeklyOff.pending, (state) => {
        state.unavailabilityLoading = true;
        state.error = null;
      })
      .addCase(removeWeeklyOff.fulfilled, (state, action) => {
        state.unavailabilityLoading = false;
        state.unavailability = action.payload.data;
        state.error = null;
      })
      .addCase(removeWeeklyOff.rejected, (state, action) => {
        state.unavailabilityLoading = false;
        state.error = action.payload;
      });

    // Delete Unavailability
    builder
      .addCase(deleteUnavailability.pending, (state) => {
        state.unavailabilityLoading = true;
        state.error = null;
      })
      .addCase(deleteUnavailability.fulfilled, (state) => {
        state.unavailabilityLoading = false;
        state.unavailability = null;
        state.error = null;
      })
      .addCase(deleteUnavailability.rejected, (state, action) => {
        state.unavailabilityLoading = false;
        state.error = action.payload;
      });
  },
});

export default doctorUnavailabilitySlice.reducer;
