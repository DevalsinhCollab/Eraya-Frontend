import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { ApiHeaderWithToken, apisHeaders } from '../common/apisHeaders.js';

// ----------------For addAppointment----------------------------\\

export const addAppointment = createAsyncThunk(
  'createAppointment',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_API}/appointment/createAppointment`,
        data,
        apisHeaders,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const getAllAppointments = createAsyncThunk(
  'getAllAppointments',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_API}/appointment/getAllAppointments`,
        { params: data, ...ApiHeaderWithToken() },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const updateAppointment = createAsyncThunk(
  'updateAppointment',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_API}/appointment/updateAppointment/${data?._id}`,
        data,
        apisHeaders,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const deleteAppointment = createAsyncThunk(
  'deleteAppointment',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_API}/appointment/deleteAppointment/${data}`,
        {},
        apisHeaders,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const getAppointmentsByPatient = createAsyncThunk(
  'getAppointmentsByPatient',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_API}/appointment/getAppointmentsByPatient`,
        { params: data, ...apisHeaders },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);
// Get appointments with both startTime and endTime set
export const getAppointmentsWithTime = createAsyncThunk(
  'getAppointmentsWithTime',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_API}/appointment/getAppointmentsWithTime`,
        { params: data ,  ...ApiHeaderWithToken()},
      
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

// Update appointment status (approve/reject)
export const updateAppointmentStatus = createAsyncThunk(
  'updateAppointmentStatus',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_API}/appointment/updateAppointmentStatus/${data.id}`,
        { docApproval: data.docApproval },
        apisHeaders,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const getAppointmentByDoctor = createAsyncThunk(
  'getAppointmentByDoctor',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_API}/appointment/getAllAppointments`,
        { params: { ...data, doctorId: data.id }, ...apisHeaders },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

// ----------------For getAppointmentsByPatient----------------------------\\
// (already defined earlier above; avoid duplicate)

// ----------------For getAvailableSlots----------------------------\\
export const getAvailableSlots = createAsyncThunk(
  'getAvailableSlots',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_API}/appointment/getAvailableSlots`,
        { params: data },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

// ----------------For createAppointmentWithSlot----------------------------\\
export const createAppointmentWithSlot = createAsyncThunk(
  'createAppointmentWithSlot',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_API}/appointment/createAppointmentWithSlot`,
        data,
        apisHeaders,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const appointmentSliceDetails = createSlice({
  name: 'appointmentSliceDetails',
  initialState: {
    appointments: [],
    apptLoading: false,
    availableSlots: [],
    slotsLoading: false,
    error: null,
  },
  reducers: {
    addPatitentAppt(state, action) {
      state.appointments.unshift(action.payload);
    },
    updatePatitentAppt(state, action) {
      state.appointments = state.appointments.map((item) => {
        return item._id === action.payload._id ? action.payload : item;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addAppointment.pending, (state) => {
        state.apptLoading = true;
        state.error = null;
      })
      .addCase(addAppointment.fulfilled, (state, action) => {
        state.apptLoading = false;
        state.appointments.push(action.payload.data);
        state.error = null;
      })
      .addCase(addAppointment.rejected, (state, action) => {
        state.apptLoading = false;
        state.error = action.payload;
      })

      .addCase(getAllAppointments.pending, (state) => {
        state.apptLoading = true;
        state.error = null;
      })
      .addCase(getAllAppointments.fulfilled, (state, action) => {
        state.apptLoading = false;
        state.appointments = action.payload.data;
        state.error = null;
      })
      .addCase(getAllAppointments.rejected, (state, action) => {
        state.apptLoading = false;
        state.error = action.payload;
      })

      .addCase(updateAppointment.pending, (state) => {
        state.apptLoading = true;
        state.error = null;
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        state.apptLoading = false;
        state.appointments = state.appointments.map((item) => {
          return item._id === action.payload.data._id ? action.payload.data : item;
        });
        state.error = null;
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.apptLoading = false;
        state.error = action.payload;
      })

      .addCase(deleteAppointment.pending, (state) => {
        state.apptLoading = true;
        state.error = null;
      })
      .addCase(deleteAppointment.fulfilled, (state, action) => {
        state.apptLoading = false;
        state.appointments = state.appointments.filter(
          (item) => item._id !== action.payload.data._id,
        );
        state.error = null;
      })
      .addCase(deleteAppointment.rejected, (state, action) => {
        state.apptLoading = false;
        state.error = action.payload;
      })

      .addCase(getAppointmentsByPatient.pending, (state) => {
        state.apptLoading = true;
        state.error = null;
      })
      .addCase(getAppointmentsByPatient.fulfilled, (state, action) => {
        state.apptLoading = false;
        state.appointments = action.payload.data;
        state.error = null;
      })
      .addCase(getAppointmentsByPatient.rejected, (state, action) => {
        state.apptLoading = false;
        state.error = action.payload;
      })

      .addCase(getAppointmentByDoctor.pending, (state) => {
        state.apptLoading = true;
        state.error = null;
      })
      .addCase(getAppointmentByDoctor.fulfilled, (state, action) => {
        state.apptLoading = false;
        state.appointments = action.payload.data;
        state.error = null;
      })
      .addCase(getAppointmentByDoctor.rejected, (state, action) => {
        state.apptLoading = false;
        state.error = action.payload;
      })

      .addCase(getAvailableSlots.pending, (state) => {
        state.slotsLoading = true;
        state.error = null;
      })
      .addCase(getAvailableSlots.fulfilled, (state, action) => {
        state.slotsLoading = false;
        state.availableSlots = action.payload.data;
        state.error = null;
      })
      .addCase(getAvailableSlots.rejected, (state, action) => {
        state.slotsLoading = false;
        state.error = action.payload;
      })

      .addCase(createAppointmentWithSlot.pending, (state) => {
        state.apptLoading = true;
        state.error = null;
      })
      .addCase(createAppointmentWithSlot.fulfilled, (state, action) => {
        state.apptLoading = false;
        state.appointments.push(action.payload.data);
        state.error = null;
      })
      .addCase(createAppointmentWithSlot.rejected, (state, action) => {
        state.apptLoading = false;
        state.error = action.payload;
      })

      .addCase(getAppointmentsWithTime.pending, (state) => {
        state.apptLoading = true;
        state.error = null;
      })
      .addCase(getAppointmentsWithTime.fulfilled, (state, action) => {
        state.apptLoading = false;
        state.appointments = action.payload.data;
        state.error = null;
      })
      .addCase(getAppointmentsWithTime.rejected, (state, action) => {
        state.apptLoading = false;
        state.error = action.payload;
      })

      .addCase(updateAppointmentStatus.pending, (state) => {
        state.apptLoading = true;
        state.error = null;
      })
      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        state.apptLoading = false;
        state.appointments = state.appointments.map((item) => {
          return item._id === action.payload.data._id ? action.payload.data : item;
        });
        state.error = null;
      })
      .addCase(updateAppointmentStatus.rejected, (state, action) => {
        state.apptLoading = false;
        state.error = action.payload;
      });
  },
});

export const { addPatitentAppt, updatePatitentAppt } = appointmentSliceDetails.actions;

export default appointmentSliceDetails.reducer;
