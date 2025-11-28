import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  CircularProgress,
} from '@mui/material';
import { toast } from 'react-toastify';
import { deleteAppointment, getAppointmentsWithTime, updateAppointmentStatus } from '../../apis/appointmentSlice';

const localizer = momentLocalizer(moment);

export default function AppointmentCalender() {
  const dispatch = useDispatch();
  const { appointments, apptLoading } = useSelector((state) => state.appointmentData || {});

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [openAppointmentDetail, setOpenAppointmentDetail] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    dispatch(getAppointmentsWithTime());
  }, [dispatch]);

  const events = (appointments || []).map((appt) => {
    const apptDate = appt.appointmentDate ? new Date(appt.appointmentDate) : new Date();
    const [sh, sm] = (appt.startTime || '09:00').split(':').map((s) => parseInt(s, 10));
    const [eh, em] = (appt.endTime || '10:00').split(':').map((s) => parseInt(s, 10));
    const start = new Date(apptDate);
    start.setHours(sh, sm, 0, 0);
    const end = new Date(apptDate);
    end.setHours(eh, em, 0, 0);
    return {
      title: `${appt.patientId?.name || 'Unknown'} - Dr. ${appt.doctorId?.name || ''}`,
      start,
      end,
      resource: appt,
    };
  });

  const handleSelectEvent = (event) => {
    setSelectedAppointment(event.resource);
    setOpenAppointmentDetail(true);
  };

  const handleApprove = async (id) => {
    setIsUpdating(true);
    const result = await dispatch(updateAppointmentStatus({ id, docApproval: 'approved' }));
    setIsUpdating(false);
    
    if (result.type && result.type.includes('fulfilled')) {
      toast.success('Appointment approved successfully!');
      setOpenAppointmentDetail(false);
      setSelectedAppointment(null);
      // Refresh the calendar data
      dispatch(getAppointmentsWithTime());
    } else {
      toast.error(result.payload?.message || 'Failed to approve appointment');
    }
  };

  const handleDecline = async (id) => {
    setIsUpdating(true);
    const result = await dispatch(deleteAppointment(id));
    setIsUpdating(false);
    
    if (result.type && result.type.includes('fulfilled')) {
      toast.success('Appointment declined successfully!');
      setOpenAppointmentDetail(false);
      setSelectedAppointment(null);
      // Refresh the calendar data
      dispatch(getAppointmentsWithTime());
    } else {
      toast.error(result.payload?.message || 'Failed to decline appointment');
    }
  };

  return (
    <div style={{ padding: 16, height: 'calc(100vh - 200px)' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Admin Appointment Calendar
      </Typography>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectEvent={handleSelectEvent}
      />
      <Dialog 
        open={openAppointmentDetail} 
        onClose={() => setOpenAppointmentDetail(false)} 
        fullWidth 
        maxWidth="sm"
      >
        <DialogTitle>Appointment Request</DialogTitle>
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
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Patient Information
                </Typography>
                <Typography variant="body2">
                  <strong>Name:</strong> {selectedAppointment.patientId?.name || 'N/A'}
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
                  <strong>Status:</strong>
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
          {selectedAppointment && selectedAppointment.docApproval === 'pending' && (
            <>
              <Button 
                onClick={() => handleApprove(selectedAppointment._id)} 
                color="success" 
                variant="contained"
                disabled={isUpdating}
              >
                {isUpdating ? <CircularProgress size={20} /> : 'Approve'}
              </Button>
              <Button 
                onClick={() => handleDecline(selectedAppointment._id)} 
                color="error" 
                variant="contained"
                disabled={isUpdating}
              >
                {isUpdating ? <CircularProgress size={20} /> : 'Decline'}
              </Button>
            </>
          )}
          {selectedAppointment && selectedAppointment.docApproval !== 'pending' && (
            <Box>
              <Typography variant="body2" color="textSecondary">
                Status: <Chip 
                  label={selectedAppointment.docApproval} 
                  color={
                    selectedAppointment.docApproval === 'approved' ? 'success' : 'error'
                  }
                  size="small"
                />
              </Typography>
            </Box>
          )}
          <Button onClick={() => setOpenAppointmentDetail(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}


 