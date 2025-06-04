import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { apisHeaders } from '../common/apisHeaders.js';

// ----------------For addAppointment----------------------------\\

export const addAppointment = createAsyncThunk(
  'addAppointment',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_API}/appt/addappointment`,
        data,
        apisHeaders,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const getAllAppointmentsByDoc = createAsyncThunk(
  'getAllAppointmentsByDoc',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_API}/appt/getallappointmentsbydoc/${data.id}`,
        apisHeaders,
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
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_API}/appt/updateappointment/${data?._id}`,
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
      const response = await axios.delete(
        `${process.env.REACT_APP_BACKEND_API}/appt/deleteappointment/${data}`,
        apisHeaders,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const getAppointmentByPatient = createAsyncThunk(
  'getAppointmentByPatient',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_API}/appt/getappointmentbypatient/${data.id}`,
        data,
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
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_API}/appt/getappointmentbydoctor/${data.id}`,
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

      .addCase(getAllAppointmentsByDoc.pending, (state) => {
        state.apptLoading = true;
        state.error = null;
      })
      .addCase(getAllAppointmentsByDoc.fulfilled, (state, action) => {
        state.apptLoading = false;
        state.appointments = action.payload.data;
        state.error = null;
      })
      .addCase(getAllAppointmentsByDoc.rejected, (state, action) => {
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

      .addCase(getAppointmentByPatient.pending, (state) => {
        state.apptLoading = true;
        state.error = null;
      })
      .addCase(getAppointmentByPatient.fulfilled, (state, action) => {
        state.apptLoading = false;
        state.appointments = action.payload.data;
        state.error = null;
      })
      .addCase(getAppointmentByPatient.rejected, (state, action) => {
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
      });
  },
});

export const { addPatitentAppt, updatePatitentAppt } = appointmentSliceDetails.actions;

export default appointmentSliceDetails.reducer;
