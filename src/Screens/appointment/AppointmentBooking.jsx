import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Typography,
} from '@mui/material';
import { Calendar } from 'react-big-calendar';
// import { dateFnsLocalizer } from 'react-big-calendar/date-fns';
import dateFnsLocalizer from "react-big-calendar/lib/localizers/date-fns";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay, addHours, isToday } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import { toast } from 'react-toastify';
import { addAppointment } from '../../apis/appointmentSlice';
import { getDoctors } from '../../apis/doctorSlice';
import Style from'./appointment.module.scss';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Working hours: 9 AM to 6 PM
const WORKING_HOURS = Array.from({ length: 9 }, (_, i) => ({
  start: i + 9,
  end: i + 10,
}));

export default function AppointmentBooking() {
  const dispatch = useDispatch();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  // Patient form data
  const [patientForm, setPatientForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    medicalHistory: '',
    currentMedications: '',
    allergies: '',
    issue: '',
  });

  const { loggedIn } = useSelector((state) => state.authData);
  const { doctors } = useSelector((state) => state.doctorData);
   console.log(doctors)

  useEffect(() => {
    if (!doctors || doctors.length === 0) {
      dispatch(getDoctors({ page: 0, pageSize: 100 }));
    }
  }, [dispatch, doctors]);

  
  const formatTo12Hour = (hour) => {
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12; // convert 0 → 12, 13 → 1 etc.
  return `${hour12}:00 ${suffix}`;
};

const getAvailableTimeSlots = () => {
  if (!selectedDate || !selectedDoctor) return [];

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  return WORKING_HOURS.map((slot) => ({
    id: `${dateStr}-${slot.start}:00`,
    start: slot.start,
    end: slot.end,
    label: `${formatTo12Hour(slot.start)} - ${formatTo12Hour(slot.end)}`,
    isBooked: bookedSlots.includes(`${dateStr}-${slot.start}:00`),
  }));
};

  const handleDateSelect = (date) => {
    // Only allow future dates
    if (date < new Date()) {
      toast.error('Please select a future date');
      return;
    }
    setSelectedDate(date);
    setSelectedDoctor('');
    setSelectedTimeSlot('');
    setActiveStep(1);
  };

  const handleDoctorSelect = (event) => {
    setSelectedDoctor(event.target.value);
    setSelectedTimeSlot('');
  };

  const handleDoctorNext = () => {
    if (!selectedDoctor) {
      toast.error('Please select a doctor');
      return;
    }
    setActiveStep(2);
  };

  const handlePatientFormChange = (e) => {
    const { name, value } = e.target;
    setPatientForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePatientFormNext = () => {
    if (!patientForm.firstName || !patientForm.lastName || !patientForm.email || !patientForm.phone) {
      toast.error('Please fill in all required fields');
      return;
    }
    setActiveStep(3);
  };

  const handleTimeSlotSelect = (slotId) => {
    setSelectedTimeSlot(slotId);
  };

  const handleSubmit = async () => {
    if (!selectedTimeSlot) {
      toast.error('Please select a time slot');
      return;
    }

    setLoading(true);
    try {
      const [dateStr, timeStr] = selectedTimeSlot.split('-');
      const [hour] = timeStr.split(':');
      const appointmentDate = new Date(selectedDate);
      appointmentDate.setHours(parseInt(hour), 0, 0, 0);

      const appointmentData = {
        patientId: loggedIn?._id,
        doctorId: selectedDoctor,
        date: appointmentDate,
        start: appointmentDate,
        end: addHours(appointmentDate, 1),
        issue: patientForm.issue,
        patientName: `${patientForm.firstName} ${patientForm.lastName}`,
        email: patientForm.email,
        phone: patientForm.phone,
        age: patientForm.age,
        gender: patientForm.gender,
        medicalHistory: patientForm.medicalHistory,
        currentMedications: patientForm.currentMedications,
        allergies: patientForm.allergies,
      };

      const response = await dispatch(addAppointment(appointmentData));

      if (response?.payload?.success) {
        toast.success('Appointment booked successfully!');
        // Reset form
        setActiveStep(0);
        setSelectedDate(null);
        setSelectedDoctor('');
        setSelectedTimeSlot('');
        setPatientForm({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          age: '',
          gender: '',
          medicalHistory: '',
          currentMedications: '',
          allergies: '',
          issue: '',
        });
      } else {
        toast.error(response?.payload?.message || 'Failed to book appointment');
      }
    } catch (error) {
      toast.error('Error booking appointment');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const steps = ['Select Date', 'Select Doctor', 'Patient Information', 'Select Time'];

  return (
    <div className={Style.appointmentBookingContainer}>
      <Card className={Style.bookingCard}>
        <Typography variant="h4" component="h1" className={Style.title}>
          Book an Appointment
        </Typography>

        <Stepper activeStep={activeStep} className={Style.stepper}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box className={Style.stepContent}>
          {/* Step 0: Date Selection */}
          {activeStep === 0 && (
            <Box className={Style.stepBox}>
              <Typography variant="h6" className={Style.stepTitle}>
                Select an Appointment Date
              </Typography>
              <Box className={Style.calendarContainer}>
                <Calendar
                  localizer={localizer}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 'auto', minHeight: 550 }}
                  onSelectSlot={(slotInfo) => handleDateSelect(slotInfo.start)}
                  selectable
                  popup
                  defaultDate={new Date()}
                  view="month"
                  views={['month']}
                  toolbar={true}
                />
              </Box>
              {selectedDate && (
                <Alert severity="success" className={Style.selectedInfo}>
                  ✓ Selected Date: <strong>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</strong>
                </Alert>
              )}
              <Button
                variant="contained"
                onClick={() => {
                  if (!selectedDate) {
                    toast.error('Please select a date');
                    return;
                  }
                  setActiveStep(1);
                }}
                disabled={!selectedDate}
                className={Style.nextButton}
                fullWidth
              >
                Continue to Doctor Selection
              </Button>
            </Box>
          )}

          {/* Step 1: Doctor Selection */}
          {activeStep === 1 && (
            <Box className={Style.stepBox}>
              <Typography variant="h6" className={Style.stepTitle}>
                Select a Doctor for {format(selectedDate, 'MMMM d, yyyy')}
              </Typography>
              <FormControl fullWidth className={Style.formControl}>
                <InputLabel>Select Doctor</InputLabel>
                <Select value={selectedDoctor} onChange={handleDoctorSelect} label="Select Doctor">
                  <MenuItem value="">
                    <em>Choose a doctor</em>
                  </MenuItem>
                  {doctors.map((doctor) => (
                    <MenuItem key={doctor._id} value={doctor._id}>
                      {doctor.name} - {doctor.docSpeciality?.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedDoctor && (
                <Card className={Style.doctorInfoCard}>
                  {(() => {
                    const doctor = doctors.find((d) => d._id === selectedDoctor);
                    return doctor ? (
                      <div>
                        <Typography variant="subtitle1">
                          <strong>{doctor.name}</strong>
                        </Typography>
                        <Typography variant="body2">
                          Speciality:  {doctor.docSpeciality?.name}
                        </Typography>
                        {doctor.experience && (
                          <Typography variant="body2">
                            Experience: {doctor.experience} years
                          </Typography>
                        )}
                      </div>
                    ) : null;
                  })()}
                </Card>
              )}

              <Box className={Style.buttonGroup}>
                <Button variant="outlined" onClick={handleBack}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleDoctorNext}
                  disabled={!selectedDoctor}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}

          {/* Step 2: Patient Information */}
          {activeStep === 2 && (
            <Box className={Style.stepBox}>
              <Typography variant="h6" className={Style.stepTitle}>
                Patient Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name *"
                    name="firstName"
                    value={patientForm.firstName}
                    onChange={handlePatientFormChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name *"
                    name="lastName"
                    value={patientForm.lastName}
                    onChange={handlePatientFormChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email *"
                    name="email"
                    type="email"
                    value={patientForm.email}
                    onChange={handlePatientFormChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone *"
                    name="phone"
                    value={patientForm.phone}
                    onChange={handlePatientFormChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Age"
                    name="age"
                    type="number"
                    value={patientForm.age}
                    onChange={handlePatientFormChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      name="gender"
                      value={patientForm.gender}
                      onChange={handlePatientFormChange}
                      label="Gender"
                    >
                      <MenuItem value="">Select Gender</MenuItem>
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Reason for Visit *"
                    name="issue"
                    multiline
                    rows={3}
                    value={patientForm.issue}
                    onChange={handlePatientFormChange}
                    placeholder="Please describe your health concern"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Medical History"
                    name="medicalHistory"
                    multiline
                    rows={2}
                    value={patientForm.medicalHistory}
                    onChange={handlePatientFormChange}
                    placeholder="Any past surgeries, conditions, etc."
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Medications"
                    name="currentMedications"
                    multiline
                    rows={2}
                    value={patientForm.currentMedications}
                    onChange={handlePatientFormChange}
                    placeholder="List any medications you are currently taking"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Allergies"
                    name="allergies"
                    multiline
                    rows={2}
                    value={patientForm.allergies}
                    onChange={handlePatientFormChange}
                    placeholder="Any known allergies"
                  />
                </Grid>
              </Grid>

              <Box className={Style.buttonGroup}>
                <Button variant="outlined" onClick={handleBack}>
                  Back
                </Button>
                <Button variant="contained" onClick={handlePatientFormNext}>
                  Next
                </Button>
              </Box>
            </Box>
          )}

          {/* Step 3: Time Slot Selection */}
          {activeStep === 3 && (
            <Box className={Style.stepBox}>
              <Typography variant="h6" className={Style.stepTitle}>
                Select Appointment Time
              </Typography>
              <Typography variant="body2" className={Style.dateInfo}>
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </Typography>

              <Box className={Style.timeSlotsContainer}>
                {getAvailableTimeSlots().map((slot) => (
                  <Button
                    key={slot.id}
                    onClick={() => handleTimeSlotSelect(slot.id)}
                    variant={selectedTimeSlot === slot.id ? 'contained' : 'outlined'}
                    disabled={slot.isBooked}
                    className={`${Style.timeSlot} ${slot.isBooked ? Style.bookedSlot : ''}`}
                  >
                    {slot.label}
                    {slot.isBooked && <span className={Style.bookedLabel}>(Booked)</span>}
                  </Button>
                ))}
              </Box>

              {selectedTimeSlot && (
                <Alert severity="success" className={Style.selectedInfo}>
                  Selected Time: {getAvailableTimeSlots().find((s) => s.id === selectedTimeSlot)?.label}
                </Alert>
              )}

              <Box className={Style.buttonGroup}>
                <Button variant="outlined" onClick={handleBack}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={!selectedTimeSlot || loading}
                  className={Style.submitButton}
                >
                  {loading ? <CircularProgress size={24} /> : 'Confirm Appointment'}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Card>
    </div>
  );
}
