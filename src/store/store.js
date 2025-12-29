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
import expenseSliceDetails from '../apis/expenseSlice';
import medicineSliceDetails from '../apis/medicineSlice';
import clinicSliceDetails from '../apis/clinicSlice';

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
    expenseData: expenseSliceDetails,
    medicineData: medicineSliceDetails,
    clinicData: clinicSliceDetails,
  },
});
