import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { apisHeaders } from '../common/apisHeaders.js';
import { getAuthToken } from '../common/common.js';

// ----------------For Signup----------------------------\\

export const signupUser = createAsyncThunk('signupUser', async (data, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_BACKEND_API}/auth/signup`,
      data,
      apisHeaders,
    );

    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// ----------------For Verify OPT----------------------------\\

export const verifyOtp = createAsyncThunk('verifyOtp', async (data, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_BACKEND_API}/auth/verifyotp`,
      data,
      apisHeaders,
    );
    localStorage.setItem('token', response.data.token);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// ----------------For Login------------------------------//

export const loginUser = createAsyncThunk('loginUser', async (data, { rejectWithValue }) => {
  try {
    // console.log(data)
    const response = await axios.post(
      `${process.env.REACT_APP_BACKEND_API}/auth/login`,
      data,
      apisHeaders,
    );
    // console.log(response)
    // localStorage.setItem("token", response.data.token);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// ----------------For Forgot Password------------------------------//

// export const forgotPass = createAsyncThunk(
//   "forgotPass",
//   async (data, { rejectWithValue }) => {
//     try {
//       const response = await axios.post(
//         `${process.env.REACT_APP_BACKEND_API}/auth/forgotpassword`,
//         data,
//         apisHeaders
//       );

//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response.data);
//     }
//   }
// );

// // ----------------For Reset Password------------------------------//

// export const resetPass = createAsyncThunk(
//   "resetPass",
//   async (data, { rejectWithValue }) => {
//     try {
//       const response = await axios.post(
//         `${process.env.REACT_APP_BACKEND_API}/auth/resetpassword`,
//         data,
//         apisHeaders
//       );
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response.data);
//     }
//   }
// );

export const getUserByToken = createAsyncThunk(
  'getUserByToken',
  async (data, { rejectWithValue }) => {
    try {
      const authToken = getAuthToken();
      if (authToken) {
        const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_API}/auth/getuserbytoken`,
          { token: authToken },
          apisHeaders,
        );
        // console.log(response);
        return response.data;
      } else {
        return {};
      }
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const authSliceDetails = createSlice({
  name: 'authSliceDetails',
  initialState: {
    loggedIn: null,
    authLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(signupUser.pending, (state) => {
        state.authLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.authLoading = false;
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.authLoading = false;
        state.error = action.payload;
      })

      .addCase(verifyOtp.pending, (state) => {
        state.authLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.authLoading = false;
        state.loggedIn = action.payload.data;
        state.error = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.authLoading = false;
        state.error = action.payload;
      })

      // loginUser reducers
      .addCase(loginUser.pending, (state) => {
        state.authLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.authLoading = false;
        state.loggedIn = action.payload.data;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.authLoading = false;
        state.error = action.payload;
      })

      // forgotPass reducers
      // .addCase(forgotPass.pending, (state) => {
      //   state.authLoading = true;
      //   state.error = null;
      // })
      // .addCase(forgotPass.fulfilled, (state, action) => {
      //   state.authLoading = false;
      //   state.loggedIn = action.payload.message;
      //   state.error = null;
      // })
      // .addCase(forgotPass.rejected, (state, action) => {
      //   state.authLoading = false;
      //   state.error = action.payload;
      // })

      // // resetPass reducers
      // .addCase(resetPass.pending, (state) => {
      //   state.authLoading = true;
      //   state.error = null;
      // })
      // .addCase(resetPass.fulfilled, (state, action) => {
      //   state.authLoading = false;
      //   state.error = null;
      // })
      // .addCase(resetPass.rejected, (state, action) => {
      //   state.authLoading = false;
      //   state.error = action.payload.data;
      // })

      // getUserByToken reducers
      .addCase(getUserByToken.pending, (state) => {
        state.authLoading = true;
        state.error = null;
      })
      .addCase(getUserByToken.fulfilled, (state, action) => {
        // console.log(action.payload)
        state.loggedIn = action.payload.data;
        state.authLoading = false;
        state.error = null;
      })
      .addCase(getUserByToken.rejected, (state, action) => {
        state.authLoading = false;
        state.error = action.payload;
      });
  },
});

export default authSliceDetails.reducer;
