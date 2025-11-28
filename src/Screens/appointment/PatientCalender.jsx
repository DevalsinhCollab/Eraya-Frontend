import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useDispatch, useSelector } from 'react-redux';
import { getDoctors } from '../../apis/doctorSlice';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Grid,
  Chip,
  Typography,
  CircularProgress,
  TextField,
  formControlClasses,
} from '@mui/material';
import {
  createAppointmentWithSlot,
  getAllAppointments,
  getAppointmentsByPatient,
  getAvailableSlots,
} from '../../apis/appointmentSlice';
import { getPatientByPhone, postalApi } from '../../apis/patientSlice';
import { pink } from '@mui/material/colors';
import { toast } from 'react-toastify';

const localizer = momentLocalizer(moment);

export default function PatientCalendar() {
  const dispatch = useDispatch();
  const { loggedIn } = useSelector((state) => state.authData || {});
  const { appointments, apptLoading, availableSlots, slotsLoading } = useSelector(
    (state) => state.appointmentData || {},
  );
  const { doctors, docLoading } = useSelector((state) => state.doctorData || {});
console.log(appointments , "-----")

  const [openBooking, setOpenBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
 
  const [patientData, setPatientData] = useState({
    name: '',
    phone: '',
    email: '',
    age: '',
    address: '',
    pincode: '',
    city: '',
    state: '',
    gender: '',
  });

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [openAppointmentDetail, setOpenAppointmentDetail] = useState(false);

  useEffect(() => {
    if (loggedIn && loggedIn._id) {
      dispatch(getAppointmentsByPatient({ patientId: loggedIn._id }));
    }
    dispatch(getDoctors({ page: 0, pageSize: 1000 }));
  }, [dispatch, loggedIn]);


 

  // const events = (appointments || []).map((appt) => {
  //   const apptDate = appt.appointmentDate ? new Date(appt.appointmentDate) : new Date();
  //   const [sh, sm] = (appt.startTime || '09:00').split(':').map((s) => parseInt(s, 10));
  //   const [eh, em] = (appt.endTime || '10:00').split(':').map((s) => parseInt(s, 10));
  //   const start = new Date(apptDate);
  //   start.setHours(sh, sm, 0, 0);
  //   const end = new Date(apptDate);
  //   end.setHours(eh, em, 0, 0);
  //   return {
  //     title: `${appt.patientId.name} - Dr. ${appt.doctorId?.name || ''}`,
  //     start,
  //     end,
  //     resource: appt,
  //   };
  // });

  const events = (appointments || []).map((appt) => {
  // ensure appointmentDate is valid
  const apptDate = appt.appointmentDate && !isNaN(new Date(appt.appointmentDate))
    ? new Date(appt.appointmentDate)
    : new Date(); // fallback

  const [sh, sm] = (appt.startTime || '09:00').split(':').map(Number);
  const [eh, em] = (appt.endTime || '10:00').split(':').map(Number);

  const start = new Date(apptDate.getFullYear(), apptDate.getMonth(), apptDate.getDate(), sh, sm);
  const end = new Date(apptDate.getFullYear(), apptDate.getMonth(), apptDate.getDate(), eh, em);
  
  
  
  return {
      title: `${appt.patientId?.name || ''} - Dr. ${appt.doctorId?.name || ''}`,
      start,
      end,
      resource: appt,
  };
});

  const handleSelectSlot = (slotInfo) => {
    // open booking dialog for selected date (use start)
    const date = slotInfo.start instanceof Date ? slotInfo.start : new Date(slotInfo.start);
    setSelectedDate(date);
    setSelectedDoctor('');
    setSelectedSlot(null);
    setOpenBooking(true);
  };

  const handleSelectEvent = (event) => {
    // Show booked appointment details
    setSelectedAppointment(event.resource);
    setOpenAppointmentDetail(true);
  };

  const handlePatientDataChange = (e) => {
    const { name, value } = e.target;
    
    setPatientData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Auto-fill patient details if phone number is 10 digits and exists
    if (name === "phone" && value.length === 10 && /^\d{10}$/.test(value)) {
      handleAutoFillPatient(value);
    }
 if (name === "phone" && value.trim() === "") {
    setPatientData({
      name: "",
      phone: "",
      email: "",
      age: "",
      address: "",
      pincode: "",
      city: "",
      state: "",
      gender: "",
    });
  }

  };

  const handleAutoFillPatient = async (phone) => {
    try {
      const response = await dispatch(getPatientByPhone({ phone }));
      
      if (response?.payload?.found && response?.payload?.data) {
        const existingPatient = response?.payload?.data;
        toast.info("Patient details found! Auto-filled from existing record.");
        
        setPatientData((prev) => ({
          ...prev,
          name: existingPatient.name || prev.name,
          phone: existingPatient.phone || prev.phone,
          email: prev.email, // Email is optional in patient model
          age: existingPatient.age || prev.age,
          address: existingPatient.address || prev.address,
          pincode: existingPatient.pincode || prev.pincode,
          city: existingPatient.city || prev.city,
          state: existingPatient.state || prev.state,
          gender: existingPatient.gender || prev.gender,
        }));
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
    }
  };

  const handleDoctorChange = (e) => {
    setSelectedDoctor(e.target.value);
    setSelectedSlot(null);
    if (e.target.value && selectedDate) {
      dispatch(
        getAvailableSlots({
          doctorId: e.target.value,
          appointmentDate: selectedDate.toISOString(),
        }),
      );
    }
  };

  const handleSlotClick = (slot) => {
    if (slot.isBooked) return;
    setSelectedSlot(slot);
  };

  const handleBook = async () => {
    // kept for backward-compatibility when logged in
    if (loggedIn && loggedIn._id) {
      if (!selectedDoctor || !selectedSlot) return;

      const payload = {
        doctorId: selectedDoctor,
        patientId: loggedIn._id,
        appointmentDate: selectedDate.toISOString(),
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        treatment: '',
        description: '',
      };

      const result = await dispatch(createAppointmentWithSlot(payload));
      if (result.type && result.type.includes('fulfilled')) {
        // refresh appointments
        dispatch(getAppointmentsByPatient({ patientId: loggedIn._id }));
        setOpenBooking(false);
      } else {
        // backend will return conflict if booked
        alert(result.payload?.message || 'Failed to book slot');
      }
      return;
    }

    // Guest patient booking - validate required fields
    if (!patientData.name || !patientData.phone) {
      alert('Please enter your name and phone number');
      return;
    }

    if (!selectedDoctor || !selectedSlot) {
      alert('Please select a doctor and time slot');
      return;
    }

    // Guest booking with patient form data
    const guestPayload = {
      doctorId: selectedDoctor,
      patientId: 'guest-booking',
      appointmentDate: selectedDate.toISOString(),
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      treatment: '',
      description: '',
      patientData: {
        name: patientData.name,
        phone: patientData.phone,
        email: patientData.email,
        age: patientData.age,
        address: patientData.address,
        pincode: patientData.pincode,
        city: patientData.city,
        state: patientData.state,
        gender: patientData.gender
      },
    };

    const result = await dispatch(createAppointmentWithSlot(guestPayload));
    if (result.type && result.type.includes('fulfilled')) {
      toast.success('Appointment booked successfully!');
      setOpenBooking(false);
      // Reset form
      setPatientData({
        name: '',
        phone: '',
        email: '',
        age: '',
        address: '',
        pincode: '',
        city: '',
        state: '',
        gender: '',
      });
    } else {
      alert(result.payload?.message || 'Failed to book appointment');
    }
  };

  const handleCancel = () => {

    setOpenBooking(false);
    setPatientData({
        name: '',
        phone: '',
        email: '',
        age: '',
        address: '',
        pincode: '',
        city: '',
        state: '',
        gender: '',
      });
      setSelectedSlot(null)
      setSelectedDoctor('')
      setSelectedSlot(null)
  }

  return (
    <div style={{ padding: 16, height: 'calc(100vh - 40px)' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        My Appointments
      </Typography>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        // style={{ height: 870 }}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
      />

      <Dialog open={openBooking} onClose={() => setOpenBooking(false)} fullWidth maxWidth="md">
        <DialogTitle>
          Book Appointment for {selectedDate ? moment(selectedDate).format('LL') : ''}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', gap: 2, flexDirection: 'column' }}>
            <FormControl fullWidth>
              <InputLabel id="doctor-select-label">Doctor</InputLabel>
              <Select
                labelId="doctor-select-label"
                value={selectedDoctor}
                label="Doctor"
                onChange={handleDoctorChange}
              >
                {docLoading ? (
                  <MenuItem disabled>Loading...</MenuItem>
                ) : (
                  doctors?.map((d) => (
                    <MenuItem key={d._id} value={d._id}>
                      Dr. {d.name} {d.docSpeciality?.name ? `- ${d.docSpeciality.name}` : ''}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Available 1-hour slots
              </Typography>
              {slotsLoading ? (
                <CircularProgress />
              ) : availableSlots && availableSlots.length > 0 ? (
                <Grid container spacing={2}>
                  {availableSlots.map((slot, idx) => (
                    <Grid item xs={6} sm={4} md={3} key={idx}>
                      <Box
                        onClick={() => !slot.isBooked && handleSlotClick(slot)}
                        sx={{
                          border: '1px solid',
                          borderColor: slot.isBooked
                            ? 'grey.300'
                            : selectedSlot?.startTime === slot.startTime
                            ? 'primary.main'
                            : 'grey.300',
                          bgcolor: slot.isBooked
                            ? 'grey.100'
                            : selectedSlot?.startTime === slot.startTime
                            ? 'primary.light'
                            : 'background.paper',
                          color: slot.isBooked ? 'text.disabled' : 'text.primary',
                          py: 1.2,
                          px: 1.5,
                          borderRadius: 1,
                          cursor: slot.isBooked ? 'not-allowed' : 'pointer',
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.5,
                          alignItems: 'center',
                        }}
                      >
                        <Typography sx={{ fontWeight: 600 }}>
                          {`${slot.startTime} - ${slot.endTime}`}
                        </Typography>
                        {slot.isBooked ? (
                          <Typography variant="caption">Booked</Typography>
                        ) : selectedSlot?.startTime === slot.startTime ? (
                          <Typography variant="caption" color="primary">
                            Selected
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Available
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2">
                  No slots available for selected doctor/date.
                </Typography>
              )}
              {/** Guest patient form shown when user not logged in */}
              <Box sx={{ mt: 2, display: 'flex', gap: 2, flexDirection: 'column' }}>
                <Typography variant="subtitle2">Patient details (guest)</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Phone"
                      name="phone"
                      value={patientData.phone}
                      onChange={handlePatientDataChange}
                      fullWidth
                    />
                    </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Name"
                      name="name"
                      value={patientData.name}
                      onChange={handlePatientDataChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email (optional)"
                      name="email"
                      value={patientData.email}
                      onChange={handlePatientDataChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Age"
                      name="age"
                      value={patientData.age}
                      onChange={handlePatientDataChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Address"
                      name="address"
                      value={patientData.address}
                      onChange={handlePatientDataChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Pincode"
                      name="pincode"
                      value={patientData.pincode}
                      onChange={handlePatientDataChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="City"
                      name="city"
                      value={patientData.city}
                      onChange={handlePatientDataChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="State"
                      name="state"
                      value={patientData.state}
                      onChange={handlePatientDataChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Gender"
                      name="gender"
                      value={patientData.gender}
                      onChange={handlePatientDataChange}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button
            onClick={handleBook}
            variant="contained"
            disabled={!selectedSlot || !selectedDoctor}
          >
            Book Slot
          </Button>
        </DialogActions>
      </Dialog>

      {/* Appointment Details Dialog */}
      <Dialog 
        open={openAppointmentDetail} 
        onClose={() => setOpenAppointmentDetail(false)} 
        fullWidth 
        maxWidth="sm"
      >
        <DialogTitle>Appointment Details</DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <Box sx={{ mt: 2, display: 'flex', gap: 2, flexDirection: 'column' }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Doctor Information
                </Typography>
                <Typography variant="body2">
                  <strong>Name:</strong> Dr. {selectedAppointment.doctorId?.name || 'N/A'}
                </Typography>
                <Typography variant="body2">
                  <strong>Speciality:</strong> {selectedAppointment.doctorId?.docSpeciality?.name || 'N/A'}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {selectedAppointment.doctorId?.email || 'N/A'}
                </Typography>
                <Typography variant="body2">
                  <strong>Phone:</strong> {selectedAppointment.doctorId?.phone || 'N/A'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Patient Information
                </Typography>
                <Typography variant="body2">
                  <strong>Name:</strong> {selectedAppointment.patientId?.name || 'N/A'}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {selectedAppointment.patientId?.email || 'N/A'}
                </Typography>
                <Typography variant="body2">
                  <strong>Phone:</strong> {selectedAppointment.patientId?.phone || 'N/A'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Appointment Information
                </Typography>
                <Typography variant="body2">
                  <strong>Date:</strong> {selectedAppointment.appointmentDate 
                    ? moment(selectedAppointment.appointmentDate).format('LL')
                    : 'N/A'
                  }
                </Typography>
                <Typography variant="body2">
                  <strong>Time:</strong> {selectedAppointment.startTime} - {selectedAppointment.endTime}
                </Typography>
                <Typography variant="body2">
                  <strong>Treatment:</strong> {selectedAppointment.treatment || 'N/A'}
                </Typography>
                <Typography variant="body2">
                  <strong>Description:</strong> {selectedAppointment.description || 'N/A'}
                </Typography>
               
                <Typography variant="body2">
                  <strong>Doctor Approval:</strong>
                  <Chip 
                    label={selectedAppointment.docApproval || 'pending'} 
                    color={
                      selectedAppointment.docApproval === 'approved' ? 'success' : 
                      selectedAppointment.docApproval === 'rejected' ? 'error' : 
                      'default'
                    }
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAppointmentDetail(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
