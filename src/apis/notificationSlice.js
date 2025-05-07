import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { apisHeaders } from '../common/apisHeaders.js';

// ----------------For addAppointment----------------------------\\

export const markAsReadMsg = createAsyncThunk(
  'markAsReadMsg',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_API}/msg/markasreadmsg/${data}`,
        apisHeaders,
      );
      // console.log(response);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const getUnreadMsgs = createAsyncThunk(
  'getUnreadMsgs',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_API}/msg/getunreadmsgs/${data}`,
        apisHeaders,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const getUnreadMsgsCount = createAsyncThunk(
  'getUnreadMsgsCount',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_API}/msg/getunreadmsgscount/${data}`,
        apisHeaders,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

// export const updateAppointment = createAsyncThunk(
//   'updateAppointment',
//   async (data, { rejectWithValue }) => {
//     try {
//       const response = await axios.post(
//         `${process.env.REACT_APP_BACKEND_API}/msg/updateappointment/${data?._id}`,
//         data,
//         apisHeaders,
//       );

//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response.data);
//     }
//   },
// );

// export const deleteAppointment = createAsyncThunk(
//   'deleteAppointment',
//   async (data, { rejectWithValue }) => {
//     // console.log('slicedata', data);
//     try {
//       const response = await axios.delete(
//         `${process.env.REACT_APP_BACKEND_API}/msg/deleteappointment/${data}`,
//         apisHeaders,
//       );
//       console.log(response);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response.data);
//     }
//   },
// );

// export const getAppointmentByPatient = createAsyncThunk(
//   'getAppointmentByPatient',
//   async (data, { rejectWithValue }) => {
//     try {
//       const response = await axios.post(
//         `${process.env.REACT_APP_BACKEND_API}/msg/getappointmentbypatient/${data.id}`,
//         data,
//         apisHeaders,
//       );
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response.data);
//     }
//   },
// );

// export const getAppointmentByDoctor = createAsyncThunk(
//   'getAppointmentByDoctor',
//   async (data, { rejectWithValue }) => {
//     try {
//       const response = await axios.post(
//         `${process.env.REACT_APP_BACKEND_API}/msg/getappointmentbydoctor/${data.id}`,
//         data,
//         apisHeaders,
//       );
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response.data);
//     }
//   },
// );

export const notificationSliceDetails = createSlice({
  name: 'notificationSliceDetails',
  initialState: {
    notifications: [],
    notifLoading: false,
    unreadMsgCount: 0,
    error: null,
  },
  reducers: {
    addNotification(state, action) {
      // console.log(action.payload);
      state.notifications.unshift(action.payload);
    },
    updateUnreadMsgCount(state, action) {
      // console.log(action.payload);
      state.unreadMsgCount = state.unreadMsgCount + 1;
    },
    // updatePatitentAppt(state, action) {
    //   state.notifications = state.notifications.map((item) => {
    //     return item._id === action.payload._id ? action.payload : item;
    //   });
    // },
  },
  extraReducers: (builder) => {
    builder
      .addCase(markAsReadMsg.pending, (state) => {
        // state.notifLoading = true;
        state.error = null;
      })
      .addCase(markAsReadMsg.fulfilled, (state, action) => {
        // state.notifLoading = false;
        const { data } = action.payload;
        state.notifications = state.notifications.filter((item) => item._id !== data._id);
        state.unreadMsgCount = state.unreadMsgCount - 1;
        state.error = null;
      })
      .addCase(markAsReadMsg.rejected, (state, action) => {
        // state.notifLoading = false;
        state.error = action.payload;
      })

      .addCase(getUnreadMsgs.pending, (state) => {
        state.notifLoading = true;
        state.error = null;
      })
      .addCase(getUnreadMsgs.fulfilled, (state, action) => {
        state.notifLoading = false;
        state.notifications = action.payload.data;
        state.error = null;
      })
      .addCase(getUnreadMsgs.rejected, (state, action) => {
        state.notifLoading = false;
        state.error = action.payload;
      })

      .addCase(getUnreadMsgsCount.pending, (state) => {
        state.notifLoading = true;
        state.error = null;
      })
      .addCase(getUnreadMsgsCount.fulfilled, (state, action) => {
        state.notifLoading = false;
        state.unreadMsgCount = action.payload.data;
        state.error = null;
      })
      .addCase(getUnreadMsgsCount.rejected, (state, action) => {
        state.notifLoading = false;
        state.error = action.payload;
      });
    //   .addCase(updateAppointment.pending, (state) => {
    //     state.notifLoading = true;
    //     state.error = null;
    //   })
    //   .addCase(updateAppointment.fulfilled, (state, action) => {
    //     state.notifLoading = false;
    //     state.notifications = state.notifications.map((item) => {
    //       return item._id === action.payload.data._id ? action.payload.data : item;
    //     });
    //     state.error = null;
    //   })
    //   .addCase(updateAppointment.rejected, (state, action) => {
    //     state.notifLoading = false;
    //     state.error = action.payload;
    //   })
    //   .addCase(deleteAppointment.pending, (state) => {
    //     state.notifLoading = true;
    //     state.error = null;
    //   })
    //   .addCase(deleteAppointment.fulfilled, (state, action) => {
    //     state.notifLoading = false;
    //     state.notifications = state.notifications.filter(
    //       (item) => item._id !== action.payload.data._id,
    //     );
    //     state.error = null;
    //   })
    //   .addCase(deleteAppointment.rejected, (state, action) => {
    //     state.notifLoading = false;
    //     state.error = action.payload;
    //   })
    //   .addCase(getAppointmentByPatient.pending, (state) => {
    //     state.notifLoading = true;
    //     state.error = null;
    //   })
    //   .addCase(getAppointmentByPatient.fulfilled, (state, action) => {
    //     state.notifLoading = false;
    //     state.notifications = action.payload.data;
    //     state.error = null;
    //   })
    //   .addCase(getAppointmentByPatient.rejected, (state, action) => {
    //     state.notifLoading = false;
    //     state.error = action.payload;
    //   })
    //   .addCase(getAppointmentByDoctor.pending, (state) => {
    //     state.notifLoading = true;
    //     state.error = null;
    //   })
    //   .addCase(getAppointmentByDoctor.fulfilled, (state, action) => {
    //     state.notifLoading = false;
    //     state.notifications = action.payload.data;
    //     state.error = null;
    //   })
    //   .addCase(getAppointmentByDoctor.rejected, (state, action) => {
    //     state.notifLoading = false;
    //     state.error = action.payload;
    //   });
  },
});

export const { addNotification, updateUnreadMsgCount } = notificationSliceDetails.actions;

export default notificationSliceDetails.reducer;
