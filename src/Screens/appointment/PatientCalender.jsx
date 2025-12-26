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
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import {
  createAppointmentWithSlot,
  getAppointmentsByPatient,
  getAvailableSlots,
} from '../../apis/appointmentSlice';
import { getPatientByPhone, postalApi } from '../../apis/patientSlice';
import { getUnavailabilityByDoctor } from '../../apis/doctorUnavailabilitySlice';
import { toast } from 'react-toastify';

const localizer = momentLocalizer(moment);

export default function PatientCalendar() {
  const dispatch = useDispatch();
  const { loggedIn } = useSelector((state) => state.authData || {});
  const { appointments, apptLoading, availableSlots, slotsLoading } = useSelector(
    (state) => state.appointmentData || {},
  );
  const { doctors, docLoading } = useSelector((state) => state.doctorData || {});
  const { unavailability } = useSelector((state) => state.unavailabilityData || {});

  const [openBooking, setOpenBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingType, setBookingType] = useState('treatment'); // 'treatment' (hourly) or 'assessment' (half-hour)
  const [doctorUnavailability, setDoctorUnavailability] = useState(null);
  const [displaySlots, setDisplaySlots] = useState([]);

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

  const events = (appointments || [])
    .filter((appt) => appt.appointmentDate) // <<< prevents undefined appointmentDate from crashing calendar
    .map((appt) => {
      const apptDate = new Date(appt.appointmentDate);

      const [sh, sm] = (appt.startTime || '09:00').split(':').map(Number);
      const [eh, em] = (appt.endTime || '10:00').split(':').map(Number);

      const start = new Date(
        apptDate.getFullYear(),
        apptDate.getMonth(),
        apptDate.getDate(),
        sh,
        sm,
      );

      const end = new Date(apptDate.getFullYear(), apptDate.getMonth(), apptDate.getDate(), eh, em);

      return {
        title: `${appt.patientId?.name || ''} -  ${appt.doctorId?.name || ''}`,
        start,
        end,
        resource: appt,
      };
    });

  // const events = (appointments || []).map((appt) => {
  //   // ensure appointmentDate is valid
  //   const apptDate =
  //     appt.appointmentDate && !isNaN(new Date(appt.appointmentDate))
  //       ? new Date(appt.appointmentDate)
  //       : new Date(); // fallback

  //   const [sh, sm] = (appt.startTime || '09:00').split(':').map(Number);
  //   const [eh, em] = (appt.endTime || '10:00').split(':').map(Number);

  //   const start = new Date(apptDate.getFullYear(), apptDate.getMonth(), apptDate.getDate(), sh, sm);
  //   const end = new Date(apptDate.getFullYear(), apptDate.getMonth(), apptDate.getDate(), eh, em);

  //   return {
  //     title: `${appt.patientId?.name || ''} - Dr. ${appt.doctorId?.name || ''}`,
  //     start,
  //     end,
  //     resource: appt,
  //   };
  // });

  const handleSelectSlot = (slotInfo) => {
    // open booking dialog for selected date (use start)
    const date = slotInfo.start instanceof Date ? slotInfo.start : new Date(slotInfo.start);

    const today = new Date();
    today.setHours(0, 0, 0, 0); // ignore time

    if (date < today) {
      toast.error('You cannot book an appointment on a past date');
      return;
    }

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

  const handlePatientDataChange = async (e) => {
    const { name, value } = e.target;

    /* ---------------- PHONE (only numbers, max 10) ---------------- */
    if (name === 'phone') {
      if (!/^\d{0,10}$/.test(value)) return;

      setPatientData((prev) => ({
        ...prev,
        phone: value,
      }));

      // 🔹 Auto-fill patient when phone is 10 digits
      if (value.length === 10) {
        handleAutoFillPatient(value);
      }

      // 🔹 Reset when phone cleared
      if (value.trim() === '') {
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
      }
      return;
    }

    /* ---------------- PINCODE (only numbers, max 6) ---------------- */
    if (name === 'pincode') {
      if (!/^\d{0,6}$/.test(value)) return;

      setPatientData((prev) => ({
        ...prev,
        pincode: value,
        city: '',
        state: '',
      }));

      // 🔹 Call API only when pincode is 6 digits
      if (value.length === 6) {
        try {
          const response = await dispatch(postalApi({ pincode: value }));

          if (response?.payload?.[0]?.PostOffice?.length) {
            const postOffice = response.payload[0].PostOffice[0];

            setPatientData((prev) => ({
              ...prev,
              pincode: value,
              city: postOffice.District,
              state: postOffice.State,
            }));
          }
        } catch (err) {
          console.error('Pincode API error', err);
        }
      }
      return;
    }

    /* ---------------- GENERIC FIELDS ---------------- */
    setPatientData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleAutoFillPatient = async (phone) => {
    try {
      const response = await dispatch(getPatientByPhone({ phone }));

      if (response?.payload?.found && response?.payload?.data) {
        const existingPatient = response?.payload?.data;
        toast.info('Patient details found! Auto-filled from existing record.');

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
      console.error('Error fetching patient details:', error);
    }
  };

  const handleDoctorChange = (e) => {
    setSelectedDoctor(e.target.value);
    setSelectedSlot(null);
    setDoctorUnavailability(null);
    // when doctor or date changed we fetch up-to-date info via effect below
  };

  const handleBookingTypeChange = (e) => {
    setBookingType(e.target.value);
    setSelectedSlot(null);
  };

  // fetch slots and unavailability whenever doctor + date selected
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      dispatch(
        getAvailableSlots({
          doctorId: selectedDoctor,
          appointmentDate: selectedDate.toISOString(),
        }),
      );

      dispatch(
        getUnavailabilityByDoctor({
          doctorId: selectedDoctor,
          date: selectedDate,
        }),
      ).then((result) => {
        if (result.payload?.data) {
          setDoctorUnavailability(result.payload.data);
        } else {
          setDoctorUnavailability(null);
        }
      });
    } else {
      setDisplaySlots([]);
      setDoctorUnavailability(null);
    }
  }, [selectedDoctor, selectedDate, dispatch]);

  const handleSlotClick = (slot) => {
    if (slot.disabled) return;
    setSelectedSlot(slot);
  };

  // Merge availableSlots (from API) and doctorUnavailability into displaySlots
  useEffect(() => {
    if (!availableSlots || availableSlots.length === 0 || !selectedDate) {
      setDisplaySlots([]);
      return;
    }

    const appointmentDateObj = new Date(selectedDate);
    const dayName = appointmentDateObj.toLocaleDateString('en-US', { weekday: 'long' });

    // Normalize to compare dates consistently
    const selectedDateStr = appointmentDateObj.toISOString().split('T')[0];

    // Build list of already booked intervals for this doctor+date from appointments state
    const bookedIntervals = (appointments || [])
      .filter((appt) => {
        const apptDoctor = appt.doctorId?._id || appt.doctorId;
        const apptDate = appt.appointmentDate
          ? new Date(appt.appointmentDate).toISOString().split('T')[0]
          : null;
        return (
          apptDoctor &&
          selectedDoctor &&
          apptDoctor.toString() === selectedDoctor.toString() &&
          apptDate === selectedDateStr
        );
      })
      .map((appt) => ({ startTime: appt.startTime, endTime: appt.endTime }));

    const timeToMinutes = (t) => {
      if (!t) return 0;
      const [hh, mm] = t.split(':').map(Number);
      return hh * 60 + mm;
    };

    const intervalsOverlap = (aStart, aEnd, bStart, bEnd) => {
      const aS = timeToMinutes(aStart);
      const aE = timeToMinutes(aEnd);
      const bS = timeToMinutes(bStart);
      const bE = timeToMinutes(bEnd);
      return Math.max(aS, bS) < Math.min(aE, bE);
    };

    let isFullDayOff = false;
    let fullDayReason = '';
    let unavailableCustomSlots = [];

    if (doctorUnavailability && doctorUnavailability.length > 0) {
      // Handle case where getUnavailabilityByDoctorAndDate returns an array
      const unavailData = Array.isArray(doctorUnavailability)
        ? doctorUnavailability[0]
        : doctorUnavailability;

      if (unavailData) {
        // ===== CHECK 1: Full Day Dates (Holidays) =====
        if (Array.isArray(unavailData.fullDayDates) && unavailData.fullDayDates.length > 0) {
          const fullDayMatch = unavailData.fullDayDates.find((fd) => {
            const fdDate = new Date(fd.date).toISOString().split('T')[0];
            return fdDate === selectedDateStr;
          });

          if (fullDayMatch) {
            isFullDayOff = true;
            fullDayReason = fullDayMatch.reason || 'Doctor not available';
          }
        }

        // ===== CHECK 2: Weekly Off (only if not already full day off) =====
        if (
          !isFullDayOff &&
          Array.isArray(unavailData.weeklyOff) &&
          unavailData.weeklyOff.length > 0
        ) {
          if (unavailData.weeklyOff.includes(dayName)) {
            isFullDayOff = true;
            fullDayReason = `Weekly off on ${dayName}`;
          }
        }

        // ===== CHECK 3: Custom Unavailable Slots =====
        if (Array.isArray(unavailData.customSlots) && unavailData.customSlots.length > 0) {
          const customSlotEntry = unavailData.customSlots.find((entry) => {
            const entryDate = new Date(entry.date).toISOString().split('T')[0];
            return entryDate === selectedDateStr;
          });

          if (customSlotEntry && Array.isArray(customSlotEntry.slots)) {
            unavailableCustomSlots = customSlotEntry.slots.map((s) => ({
              startTime: s.startTime,
              endTime: s.endTime,
            }));
          }
        }
      }
    }

    // ===== MERGE LOGIC: Build final display slots =====
    // If bookingType === 'assessment' split each available slot into multiple half-hour slots
    const merged = [];
    availableSlots.forEach((s) => {
      const pushSlot = (startTime, endTime) => {
        // mark as booked if any existing appointment overlaps this chunk
        const isBookedFromAppts = bookedIntervals.some((b) =>
          intervalsOverlap(b.startTime, b.endTime, startTime, endTime),
        );
        // If the doctor has a full-day off, treat all chunks as holiday (not booked)
        // const isHoliday = isFullDayOff;
        const isHoliday = Boolean(s.isHoliday || isFullDayOff);
        // const isBooked = isBookedFromAppts || !!s.isBooked;
        const isBooked = isHoliday ? false : isBookedFromAppts || !!s.isBooked;
        const isUnavailableCustom =
          !!s.isUnavailable ||
          unavailableCustomSlots.some((u) => u.startTime === startTime && u.endTime === endTime);

          // const isHoliday = isFullDayOff;
        const [sh, sm] = (startTime || '00:00').split(':').map(Number);
        const [eh, em] = (endTime || '00:00').split(':').map(Number);

        const slotStart = new Date(
          appointmentDateObj.getFullYear(),
          appointmentDateObj.getMonth(),
          appointmentDateObj.getDate(),
          sh,
          sm,
        );

        const slotEnd = new Date(
          appointmentDateObj.getFullYear(),
          appointmentDateObj.getMonth(),
          appointmentDateObj.getDate(),
          eh,
          em,
        );

        const now = new Date();
        const isPast = slotEnd <= now;

        const disabled = isBooked || isUnavailableCustom || isHoliday || isPast;

        let statusType = null;
        let statusReason = '';

        if (isHoliday) {
          statusType = 'Holiday';
          statusReason = fullDayReason;
        } else if (isUnavailableCustom) {
          statusType = 'Unavailable';
          statusReason = 'Doctor unavailable during this time';
        } else if (isBooked) {
          statusType = 'Booked';
          statusReason = 'Already booked by another patient';
        } else if (isPast) {
          statusType = 'Past';
          statusReason = 'This time is in the past';
        } else {
          statusType = 'Available';
          statusReason = '';
        }

        merged.push({
          ...s,
          startTime,
          endTime,
          isBooked,
          isUnavailable: isUnavailableCustom,
          isHoliday,
          isPast,
          disabled,
          statusType,
          statusReason,
          __slotStart: slotStart,
          __slotEnd: slotEnd,
        });
      };

      if (bookingType === 'assessment') {
        const [sh, sm] = (s.startTime || '00:00').split(':').map(Number);
        const [eh, em] = (s.endTime || '00:00').split(':').map(Number);
        const startDate = new Date(
          appointmentDateObj.getFullYear(),
          appointmentDateObj.getMonth(),
          appointmentDateObj.getDate(),
          sh,
          sm,
        );
        const endDate = new Date(
          appointmentDateObj.getFullYear(),
          appointmentDateObj.getMonth(),
          appointmentDateObj.getDate(),
          eh,
          em,
        );
        const diffMins = (endDate - startDate) / (1000 * 60);
        for (let offset = 0; offset < diffMins; offset += 30) {
          const chunkStart = new Date(startDate.getTime() + offset * 60000);
          const chunkEnd = new Date(
            Math.min(startDate.getTime() + (offset + 30) * 60000, endDate.getTime()),
          );
          const startH = String(chunkStart.getHours()).padStart(2, '0');
          const startM = String(chunkStart.getMinutes()).padStart(2, '0');
          const endH = String(chunkEnd.getHours()).padStart(2, '0');
          const endM = String(chunkEnd.getMinutes()).padStart(2, '0');
          pushSlot(`${startH}:${startM}`, `${endH}:${endM}`);
        }
      } else {
        pushSlot(s.startTime, s.endTime);
      }
    });

    // console.log('📅 Slot Merge Summary:', {
    //   selectedDate: selectedDateStr,
    //   dayName,
    //   isFullDayOff,
    //   fullDayReason,
    //   customSlotsCount: unavailableCustomSlots.length,
    //   totalSlots: merged.length,
    //   availableSlots: merged.filter(s => s.statusType === 'Available').length,
    //   bookedSlots: merged.filter(s => s.isBooked).length,
    //   unavailableSlots: merged.filter(s => s.isUnavailable).length,
    //   holidaySlots: merged.filter(s => s.isHoliday).length,
    // });

    setDisplaySlots(merged);
  }, [availableSlots, doctorUnavailability, selectedDate, bookingType]);

  const handleBook = async () => {
    // kept for backward-compatibility when logged in
    if (loggedIn && loggedIn._id) {
      if (!selectedDoctor || !selectedSlot) return;

      const payload = {
        doctorId: selectedDoctor,
        appointmentDate: selectedDate.toISOString(),
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        bookingType: bookingType,
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

    if (!patientData.phone) {
      toast.error('Please enter your phone number');
      return;
    }

    // Indian mobile number validation: 10 digits, starts with 6-9
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(patientData.phone)) {
      toast.error('Please enter a valid mobile number (10 digits, starting with 6-9)');
      return;
    }

    if (!patientData.name || patientData.name.trim() === '') {
      toast.error('Please enter your name');
      return;
    }
    if (!selectedDoctor || !selectedSlot) {
      alert('Please select a doctor and time slot');
      return;
    }

    // Guest booking with patient form data
    const guestPayload = {
      doctorId: selectedDoctor,
      appointmentDate: selectedDate.toISOString(),
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      bookingType: bookingType,
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
        gender: patientData.gender,
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
    setSelectedSlot(null);
    setSelectedDoctor('');
  };

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
                      {d.name} {d.docSpeciality?.name ? `- ${d.docSpeciality.name}` : ''}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography variant="subtitle1">Available slots</Typography>
                <FormControl component="fieldset" variant="standard">
                  <RadioGroup row value={bookingType} onChange={handleBookingTypeChange}>
                    <FormControlLabel
                      value="treatment"
                      control={<Radio size="small" />}
                      label="Treatment"
                    />
                    <FormControlLabel
                      value="assessment"
                      control={<Radio size="small" />}
                      label="Assessment"
                    />
                  </RadioGroup>
                </FormControl>
              </Box>
              {slotsLoading ? (
                <CircularProgress />
              ) : displaySlots && displaySlots.length > 0 ? (
                <>
                  {/* Show full-day unavailability alert if entire day is off */}
                  {displaySlots.some((s) => s.isHoliday) && (
                    <Alert
                      severity="error"
                      sx={{ mb: 2, backgroundColor: '#ffebee', borderLeft: '4px solid #d32f2f' }}
                    >
                      <strong>🚫 Doctor not available on this date</strong>
                      <br />
                      <small>
                        Reason: {displaySlots[0]?.statusReason || 'Doctor not available'}
                      </small>
                    </Alert>
                  )}

                  {/* Slot Grid */}
                  <Grid container spacing={2}>
                    {displaySlots.map((slot, idx) => {
                      let bgColor = 'background.paper';
                      let borderColor = '#ccc';
                      let statusColor = '#4caf50';
                      let statusIcon = '✓';
                      let statusLabel = 'Available';
                      let tooltip = 'Click to select';

                      if (slot.isHoliday) {
                        bgColor = '#ffebee';
                        borderColor = '#d32f2f';
                        statusColor = '#d32f2f';
                        statusIcon = '🚫';
                        statusLabel = 'Holiday';
                        tooltip = slot.statusReason;
                      } else if (slot.isUnavailable) {
                        bgColor = '#ffe8e8';
                        borderColor = '#e57373';
                        statusColor = '#d32f2f';
                        statusIcon = '🚫';
                        statusLabel = 'Unavailable';
                        tooltip = slot.statusReason;
                      } else if (slot.isBooked) {
                        bgColor = '#f5f5f5';
                        borderColor = '#ff9800';
                        statusColor = '#ff9800';
                        statusIcon = '🚫';
                        statusLabel = 'Booked';
                        tooltip = slot.statusReason;
                      } else if (slot.isPast) {
                        bgColor = '#eeeeee';
                        borderColor = '#9e9e9e';
                        statusColor = '#9e9e9e';
                        statusIcon = '⌛';
                        statusLabel = 'Past';
                        tooltip = slot.statusReason || 'This time is in the past';
                      } else if (selectedSlot?.startTime === slot.startTime) {
                        bgColor = '#e3f2fd';
                        borderColor = '#1976d2';
                        statusColor = '#1976d2';
                        statusIcon = '✓';
                        statusLabel = 'Selected';
                        tooltip = 'Selected for booking';
                      }

                      return (
                        <Grid item xs={6} sm={4} md={3} key={idx}>
                          <Box
                            onClick={() => !slot.disabled && handleSlotClick(slot)}
                            title={tooltip}
                            sx={{
                              border: '2px solid',
                              borderColor,
                              bgcolor: bgColor,
                              cursor: slot.disabled ? 'not-allowed' : 'pointer',
                              py: 1.2,
                              px: 1.5,
                              borderRadius: 1,
                              textAlign: 'center',
                              transition: 'all 0.3s',
                              '&:hover': !slot.disabled
                                ? {
                                    borderColor: '#1976d2',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    transform: 'translateY(-2px)',
                                  }
                                : {
                                    cursor: 'not-allowed',
                                  },
                            }}
                          >
                            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', mb: 0.5 }}>
                              {`${slot.startTime} - ${slot.endTime}`}
                            </Typography>

                            {/* Status Badge */}
                            <Box
                              sx={{
                                display: 'inline-block',
                                bgcolor: statusColor,
                                color: 'white',
                                px: 1,
                                py: 0.3,
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                              }}
                            >
                              {statusIcon} {statusLabel}
                            </Box>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>

                  {/* Summary Stats */}
                  <Box
                    sx={{
                      mt: 3,
                      p: 2,
                      backgroundColor: '#f5f5f5',
                      borderRadius: 1,
                      borderLeft: '4px solid #1976d2',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, mb: 1.5, fontSize: '0.95rem' }}
                    >
                      📊 Slot Summary
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography
                            variant="caption"
                            sx={{ display: 'block', fontWeight: 600, color: '#4caf50' }}
                          >
                            ✓ Available
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#4caf50' }}>
                            {displaySlots.filter((s) => s.statusType === 'Available').length}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography
                            variant="caption"
                            sx={{ display: 'block', fontWeight: 600, color: '#ff9800' }}
                          >
                            🚫 Booked
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#ff9800' }}>
                            {displaySlots.filter((s) => s.isBooked).length}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography
                            variant="caption"
                            sx={{ display: 'block', fontWeight: 600, color: '#e57373' }}
                          >
                            🚫 Unavailable
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#e57373' }}>
                            {displaySlots.filter((s) => s.isUnavailable).length}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography
                            variant="caption"
                            sx={{ display: 'block', fontWeight: 600, color: '#d32f2f' }}
                          >
                            🚫 Holiday
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: '#d32f2f' }}>
                            {displaySlots.filter((s) => s.isHoliday).length}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    No slots available for selected doctor/date.
                  </Typography>
                </Box>
              )}
              {/** Guest patient form shown when user not logged in */}
              <Box sx={{ mt: 2, display: 'flex', gap: 2, flexDirection: 'column' }}>
                <Typography variant="subtitle2">Patient details (guest)</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    {/* <TextField
                      label="Phone"
                      name="phone"
                      value={patientData.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ''); // remove non-numbers
                        if (value.length <= 10) {
                          setPatientData({
                            ...patientData,
                            phone: value,
                          });
                        }
                      }}
                      fullWidth
                      inputProps={{
                        inputMode: 'numeric', // mobile numeric keypad
                        pattern: '[0-9]*',
                        maxLength: 10,
                      }}
                    /> */}
                    <TextField
                      label="Phone"
                      name="phone"
                      value={patientData.phone}
                      onChange={handlePatientDataChange}
                      fullWidth
                      inputProps={{
                        inputMode: 'numeric',
                        pattern: '[0-9]*',
                        maxLength: 10,
                      }}
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
                    {/* <TextField
                      label="Gender"
                      name="gender"
                      value={patientData.gender}
                      onChange={handlePatientDataChange}
                      fullWidth
                    /> */}
                    <FormControl fullWidth>
                      <InputLabel id="gender-label">Gender</InputLabel>
                      <Select
                        labelId="gender-label"
                        name="gender"
                        label="Gender"
                        value={patientData.gender}
                        onChange={handlePatientDataChange}
                      >
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Pincode"
                      name="pincode"
                      value={patientData.pincode}
                      onChange={handlePatientDataChange}
                      fullWidth
                      inputProps={{ maxLength: 6, inputMode: 'numeric' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="City"
                      name="city"
                      value={patientData.city}
                      fullWidth
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="State"
                      name="state"
                      value={patientData.state}
                      fullWidth
                      disabled
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
            // disabled={!selectedSlot || !selectedDoctor}
            disabled={
              !selectedSlot ||
              !selectedDoctor ||
              selectedSlot?.isHoliday ||
              selectedSlot?.isBooked ||
              selectedSlot?.isPast
            }
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
                  <strong>Name:</strong> {selectedAppointment.doctorId?.name || 'N/A'}
                </Typography>
                <Typography variant="body2">
                  <strong>Speciality:</strong>{' '}
                  {selectedAppointment.doctorId?.docSpeciality?.name || 'N/A'}
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
                  <strong>Date:</strong>{' '}
                  {selectedAppointment.appointmentDate
                    ? moment(selectedAppointment.appointmentDate).format('LL')
                    : 'N/A'}
                </Typography>
                <Typography variant="body2">
                  <strong>Time:</strong> {selectedAppointment.startTime} -{' '}
                  {selectedAppointment.endTime}
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
                      selectedAppointment.docApproval === 'approved'
                        ? 'success'
                        : selectedAppointment.docApproval === 'rejected'
                        ? 'error'
                        : 'default'
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
