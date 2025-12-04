import { configureStore } from '@reduxjs/toolkit';
import appointmentSliceDetails from '../apis/appointmentSlice';
import authSliceDetails from '../apis/authSlice';
import doctorSliceDetails from '../apis/doctorSlice';
import doctorSpecialitySliceDetails from '../apis/doctorSpecialitySlice';
import notificationSliceDetails from '../apis/notificationSlice';
import problemSliceDetails from '../apis/problemSlice';
import patientSliceDetails from '../apis/patientSlice';
import patientFormSliceDetails from '../apis/patientFormSlice';
import dashboardSliceDetails from '../apis/dashboardSlice';
import doctorUnavailabilitySliceDetails from '../apis/doctorUnavailabilitySlice';

export const store = configureStore({
  reducer: {
    authData: authSliceDetails,
    doctorData: doctorSliceDetails,
    doctorSpecialityData: doctorSpecialitySliceDetails,
    problemData: problemSliceDetails,
    appointmentData: appointmentSliceDetails,
    notificationData: notificationSliceDetails,
    patientData: patientSliceDetails,
    patientFormData: patientFormSliceDetails,
    dashboardData: dashboardSliceDetails,
    unavailabilityData: doctorUnavailabilitySliceDetails,
  },
});
