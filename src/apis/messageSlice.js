// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import axios from "axios";
// import { apisHeaders } from "../common/apisHeaders.js";

// // ----------------For getChat----------------------------\\

// export const getChat = createAsyncThunk(
//   "getChat",
//   async (data, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(
//         `${process.env.REACT_APP_BACKEND_API}/msg/getchat/:senderId/:receiverId`,
//         data,
//         apisHeaders
//       );

//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response.data);
//     }
//   }
// );

// export const getDoctors = createAsyncThunk(
//   "getDoctors",
//   async (data, { rejectWithValue }) => {
//     try {
//       const response = await axios.post(
//         `${process.env.REACT_APP_BACKEND_API}/doc/getdoctors`,
//         data,
//         apisHeaders
//       );

//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response.data);
//     }
//   }
// );

// export const messageSliceDetails = createSlice({
//   name: "messageSliceDetails",
//   initialState: {
//     doctor: null,
//     docLoading: false,
//     error: null,
//   },
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       // .addCase(addDoctor.pending, (state) => {
//       //   state.docLoading = true;
//       //   state.error = null;
//       // })
//       // .addCase(addDoctor.fulfilled, (state, action) => {
//       //   state.docLoading = false;
//       //   state.error = null;
//       // })
//       // .addCase(addDoctor.rejected, (state, action) => {
//       //   state.docLoading = false;
//       //   state.error = action.payload;
//       // });
//   },
// });

// export default messageSliceDetails.reducer;
