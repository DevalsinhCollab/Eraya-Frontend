import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { apisHeaders } from '../common/apisHeaders.js';

// ----------------For addProblem----------------------------\\

export const addProblem = createAsyncThunk('addProblem', async (data, { rejectWithValue }) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_BACKEND_API}/prb/addproblem`,
      data,
      apisHeaders,
    );

    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const getProblemsByPatient = createAsyncThunk(
  'getProblemsByPatient',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_API}/prb/getproblemsbypatient/${data.id}`,
        data,
        apisHeaders,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const getProblemsByDoc = createAsyncThunk(
  'getProblemsByDoc',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_API}/prb/getproblemsbydoc/${data.id}`,
        data,
        apisHeaders,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const getProblemsByDocForDashboard = createAsyncThunk(
  'getProblemsByDocForDashboard',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_API}/prb/getproblemsbydocfordashboard/${data}`,
        apisHeaders,
      );
      // console.log(response);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const getAllProblemsByDoc = createAsyncThunk(
  'getAllProblemsByDoc',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_API}/prb/getallproblemsbydoc/${data.id}`,
        data,
        apisHeaders,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

// export const addAppointment = createAsyncThunk(
//   'addAppointment',
//   async (data, { rejectWithValue }) => {
//     console.log('slicedata', data);
//     try {
//       const response = await axios.post(
//         `${process.env.REACT_APP_BACKEND_API}/prb/addappointment/${data?.id}`,
//         data?.appointment,
//         apisHeaders,
//       );

//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response.data);
//     }
//   },
// );

export const problemSliceDetails = createSlice({
  name: 'problemSliceDetails',
  initialState: {
    problems: [],
    allProblems: [],
    dashProblems: [],
    prbLoading: false,
    error: null,
  },
  reducers: {
    addPatitentPrb(state, action) {
      // console.log(action.payload);
      state.problems.unshift(action.payload);
    },
    updatePatitentPrb(state, action) {
      // console.log(action.payload);
      state.problems = state.problems.map((item) => {
        return item?._id === action?.payload?._id ? action?.payload : item;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addProblem.pending, (state) => {
        state.prbLoading = true;
        state.error = null;
      })
      .addCase(addProblem.fulfilled, (state, action) => {
        state.prbLoading = false;
        state.problems.unshift(action.payload.data);
        state.error = null;
      })
      .addCase(addProblem.rejected, (state, action) => {
        state.prbLoading = false;
        state.error = action.payload;
      })

      .addCase(getProblemsByPatient.pending, (state) => {
        state.prbLoading = true;
        state.error = null;
      })
      .addCase(getProblemsByPatient.fulfilled, (state, action) => {
        state.prbLoading = false;
        state.problems = action.payload.data;
        state.error = null;
      })
      .addCase(getProblemsByPatient.rejected, (state, action) => {
        state.prbLoading = false;
        state.error = action.payload;
      })

      .addCase(getProblemsByDoc.pending, (state) => {
        state.prbLoading = true;
        state.error = null;
      })
      .addCase(getProblemsByDoc.fulfilled, (state, action) => {
        state.prbLoading = false;
        state.problems = action.payload.data;
        state.error = null;
      })
      .addCase(getProblemsByDoc.rejected, (state, action) => {
        state.prbLoading = false;
        state.error = action.payload;
      })

      .addCase(getAllProblemsByDoc.pending, (state) => {
        state.prbLoading = true;
        state.error = null;
      })
      .addCase(getAllProblemsByDoc.fulfilled, (state, action) => {
        state.prbLoading = false;
        state.allProblems = action.payload.data;
        state.error = null;
      })
      .addCase(getAllProblemsByDoc.rejected, (state, action) => {
        state.prbLoading = false;
        state.error = action.payload;
      })

      .addCase(getProblemsByDocForDashboard.pending, (state) => {
        state.prbLoading = true;
        state.error = null;
      })
      .addCase(getProblemsByDocForDashboard.fulfilled, (state, action) => {
        state.prbLoading = false;
        state.dashProblems = action.payload.data;
        state.error = null;
      })
      .addCase(getProblemsByDocForDashboard.rejected, (state, action) => {
        state.prbLoading = false;
        state.error = action.payload;
      });

    // .addCase(addAppointment.pending, (state) => {
    //   state.prbLoading = true;
    //   state.error = null;
    // })
    // .addCase(addAppointment.fulfilled, (state, action) => {
    //   state.prbLoading = false;
    //   state.error = null;
    // })
    // .addCase(addAppointment.rejected, (state, action) => {
    //   state.prbLoading = false;
    //   state.error = action.payload;
    // });
  },
});

export const { addPatitentPrb, updatePatitentPrb } = problemSliceDetails.actions;

export default problemSliceDetails.reducer;
