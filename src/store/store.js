import { configureStore } from '@reduxjs/toolkit';
import appointmentSliceDetails from '../apis/appointmentSlice';
import authSliceDetails from '../apis/authSlice';
import doctorSliceDetails from '../apis/doctorSlice';
import notificationSliceDetails from '../apis/notificationSlice';
import problemSliceDetails from '../apis/problemSlice';
import patientSliceDetails from '../apis/patientSlice';
import patientFormSliceDetails from '../apis/patientFormSlice';
import dashboardSliceDetails from '../apis/dashboardSlice';

export const store = configureStore({
  reducer: {
    authData: authSliceDetails,
    doctorData: doctorSliceDetails,
    problemData: problemSliceDetails,
    appointmentData: appointmentSliceDetails,
    notificationData: notificationSliceDetails,
    patientData: patientSliceDetails,
    patientFormData: patientFormSliceDetails,
    dashboardData: dashboardSliceDetails
  },
});
