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
  getAppointmentsByPatient,
  getAvailableSlots,
} from '../../apis/appointmentSlice';
import { pink } from '@mui/material/colors';
import { toast } from 'react-toastify';

const localizer = momentLocalizer(moment);

export default function PatientCalendar() {
  const dispatch = useDispatch();
  const { loggedIn } = useSelector((state) => state.authData || {});
  const { appointments, apptLoading, availableSlots, slotsLoading } = useSelector(
    (state) => state.appointmentData || {},
  );
  useSelector((state) => console.log(state));
  const { doctors, docLoading } = useSelector((state) => state.doctorData || {});

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

  useEffect(() => {
    if (loggedIn && loggedIn._id) {
      dispatch(getAppointmentsByPatient({ patientId: loggedIn._id }));
    }
    dispatch(getDoctors({ page: 0, pageSize: 1000 }));
  }, [dispatch, loggedIn]);

  const events = (appointments || []).map((appt) => {
    const apptDate = appt.appointmentDate ? new Date(appt.appointmentDate) : new Date();
    const [sh, sm] = (appt.startTime || '09:00').split(':').map((s) => parseInt(s, 10));
    const [eh, em] = (appt.endTime || '10:00').split(':').map((s) => parseInt(s, 10));
    const start = new Date(apptDate);
    start.setHours(sh, sm, 0, 0);
    const end = new Date(apptDate);
    end.setHours(eh, em, 0, 0);
    return {
      title: `${appt.patientId.name} - Dr. ${appt.doctorId?.name || ''}`,
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

  const handlePatientDataChange = (e) => {
    const { name, value } = e.target;
    setPatientData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
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
        onSelectEvent={(event) => alert('Appointment: ' + event.title)}
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
                      label="Name"
                      name="name"
                      value={patientData.name}
                      onChange={handlePatientDataChange}
                      fullWidth
                    />
                  </Grid>
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
    </div>
  );
}
