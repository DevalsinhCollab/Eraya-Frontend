import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  Tab,
  Tabs,
  TextField,
  Typography,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  FormGroup,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import {
  getUnavailabilityByDoctor,
  addFullDayUnavailability,
  addCustomSlotUnavailability,
  addWeeklyOff,
  removeFullDayUnavailability,
  removeCustomSlotUnavailability,
  removeWeeklyOff,
} from '../../apis/doctorUnavailabilitySlice';
import { toast } from 'react-toastify';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function DoctorUnavailability() {
  const dispatch = useDispatch();
  const { loggedIn } = useSelector((state) => state.authData || {});
  const { unavailability, unavailabilityLoading } = useSelector(
    (state) => state.unavailabilityData || {},
  );

  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('fullDay');

  // Form States
  const [fullDayDate, setFullDayDate] = useState('');           // "2025-12-04"
  const [fullDayReason, setFullDayReason] = useState('');

  const [customSlotDate, setCustomSlotDate] = useState('');
  const [customSlotStartTime, setCustomSlotStartTime] = useState('09:00');
  const [customSlotEndTime, setCustomSlotEndTime] = useState('10:00');

//   const [selectedWeeklyOffs, setSelectedWeeklyOffs] = useState([]);

  const doctorId = loggedIn?.doctorId || loggedIn?._id;


  useEffect(() => {
    if (doctorId) {
      dispatch(getUnavailabilityByDoctor({ doctorId }));
    }
  }, [dispatch, doctorId]);

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  const handleOpenDialog = (type) => {
    setDialogType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFullDayDate('');
    setFullDayReason('');
    setCustomSlotDate('');
    setCustomSlotStartTime('09:00');
    setCustomSlotEndTime('10:00');
    // setSelectedWeeklyOffs([]);
  };

  // ADD FULL DAY OFF
  const handleAddFullDay = async () => {
    if (!fullDayDate) {
      toast.error('Please select a date');
      return;
    }

    const payload = {
      doctorId,
      date: fullDayDate,                    // ← Send as "2025-12-04" string
      reason: fullDayReason || 'Doctor not available',
    };

    const result = await dispatch(addFullDayUnavailability(payload));
    if (result.type?.includes('fulfilled')) {
      toast.success('Full day off added');
      handleCloseDialog();
    } else {
      toast.error(result.payload?.message || 'Failed');
    }
  };

  // ADD CUSTOM SLOT
  const handleAddCustomSlot = async () => {
    if (!customSlotDate || !customSlotStartTime || !customSlotEndTime) {
      toast.error('Please fill all fields');
      return;
    }
    if (customSlotStartTime >= customSlotEndTime) {
      toast.error('End time must be after start time');
      return;
    }

    const payload = {
      doctorId,
      date: customSlotDate,                 // ← Send as "2025-12-04" string
      slots: [{
        startTime: customSlotStartTime,
        endTime: customSlotEndTime,
      }],
    };

    const result = await dispatch(addCustomSlotUnavailability(payload));
    if (result.type?.includes('fulfilled')) {
      toast.success('Custom slot added');
      handleCloseDialog();
    } else {
      toast.error(result.payload?.message || 'Failed');
    }
  };

  // ADD WEEKLY OFF
//   const handleAddWeeklyOff = async () => {
//     if (selectedWeeklyOffs.length === 0) {
//       toast.error('Select at least one day');
//       return;
//     }

//     const payload = { doctorId, weeklyOff: selectedWeeklyOffs };
//     const result = await dispatch(addWeeklyOff(payload));
//     if (result.type?.includes('fulfilled')) {
//       toast.success('Weekly off updated');
//       handleCloseDialog();
//     } else {
//       toast.error(result.payload?.message || 'Failed');
//     }
//   };

  // REMOVE FULL DAY
  const handleRemoveFullDay = async (dateString) => {
    const payload = { doctorId, date: dateString }; // date is already "YYYY-MM-DD"
    const result = await dispatch(removeFullDayUnavailability(payload));
    if (result.type?.includes('fulfilled')) {
      toast.success('Removed');
    } else {
      toast.error('Failed to remove');
    }
  };

  // REMOVE CUSTOM SLOT
  const handleRemoveCustomSlot = async (dateString, startTime, endTime) => {
    const payload = { doctorId, date: dateString, startTime, endTime };
    const result = await dispatch(removeCustomSlotUnavailability(payload));
    if (result.type?.includes('fulfilled')) {
      toast.success('Slot removed');
    } else {
      toast.error('Failed');
    }
  };

//   // REMOVE WEEKLY OFF
//   const handleRemoveWeeklyOff = async (day) => {
//     const payload = { doctorId, day };
//     const result = await dispatch(removeWeeklyOff(payload));
//     if (result.type?.includes('fulfilled')) {
//       toast.success('Weekly off removed');
//     } else {
//       toast.error('Failed');
//     }
//   };

//   const handleWeeklyOffChange = (day) => {
//     setSelectedWeeklyOffs(prev =>
//       prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
//     );
//   };

  const handleSave = () => {
    if (dialogType === 'fullDay') handleAddFullDay();
    else if (dialogType === 'customSlot') handleAddCustomSlot();
    // else if (dialogType === 'weeklyOff') handleAddWeeklyOff();
  };

  if (unavailabilityLoading && !unavailability) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        Doctor Unavailability Management
      </Typography>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tab label="Full Day Off" />
        <Tab label="Custom Slots" />
        {/* <Tab label="Weekly Off" /> */}
      </Tabs>

      {/* === FULL DAY OFF TAB === */}
      {tabValue === 0 && (
        <Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog('fullDay')} sx={{ mb: 2 }}>
            Add Full Day Off
          </Button>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {unavailability?.fullDayDates?.length > 0 ? (
                  unavailability.fullDayDates.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>{moment(item.date).format('DD/MM/YYYY')}</TableCell>
                      <TableCell>{item.reason || '—'}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <IconButton color="error" size="small" onClick={() => handleRemoveFullDay(item.date)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} sx={{ textAlign: 'center', py: 4 }}>
                      No full day off set
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* === CUSTOM SLOTS TAB === */}
      {tabValue === 1 && (
        <Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog('customSlot')} sx={{ mb: 2 }}>
            Add Custom Slot
          </Button>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Unavailable Slot</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {unavailability?.customSlots?.length > 0 ? (
                  unavailability.customSlots.flatMap((dateGroup) =>
                    dateGroup.slots.map((slot, idx) => (
                      <TableRow key={`${dateGroup.date}-${idx}`}>
                        <TableCell>{moment(dateGroup.date).format('DD/MM/YYYY')}</TableCell>
                        <TableCell>{slot.startTime} – {slot.endTime}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleRemoveCustomSlot(dateGroup.date, slot.startTime, slot.endTime)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} sx={{ textAlign: 'center', py: 4 }}>
                      No custom unavailable slots
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* === WEEKLY OFF TAB === */}
      {/* {tabValue === 2 && (
        <Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog('weeklyOff')} sx={{ mb: 2 }}>
            Set Weekly Off
          </Button>

          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {unavailability?.weeklyOff?.length > 0 ? (
              unavailability.weeklyOff.map(day => (
                <Chip
                  key={day}
                  label={day}
                  onDelete={() => handleRemoveWeeklyOff(day)}
                  color="primary"
                  variant="outlined"
                />
              ))
            ) : (
              <Typography color="text.secondary">No weekly off days set</Typography>
            )}
          </Box>
        </Box>
      )} */}

      {/* === DIALOG === */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {dialogType === 'fullDay' && 'Add Full Day Off'}
          {dialogType === 'customSlot' && 'Add Custom Unavailable Slot'}
          {dialogType === 'weeklyOff' && 'Set Weekly Off Days'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* Full Day */}
            {dialogType === 'fullDay' && (
              <>
                <TextField
                  label="Date"
                  type="date"
                  value={fullDayDate}
                  onChange={e => setFullDayDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label="Reason (optional)"
                  value={fullDayReason}
                  onChange={e => setFullDayReason(e.target.value)}
                  multiline
                  rows={2}
                  fullWidth
                />
              </>
            )}

            {/* Custom Slot */}
            {dialogType === 'customSlot' && (
              <>
                <TextField
                  label="Date"
                  type="date"
                  value={customSlotDate}
                  onChange={e => setCustomSlotDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label="Start Time"
                  type="time"
                  value={customSlotStartTime}
                  onChange={e => setCustomSlotStartTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label="End Time"
                  type="time"
                  value={customSlotEndTime}
                  onChange={e => setCustomSlotEndTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </>
            )}

            {/* Weekly Off */}
            {/* {dialogType === 'weeklyOff' && (
              <FormGroup>
                {WEEKDAYS.map(day => (
                  <FormControlLabel
                    key={day}
                    control={
                      <Checkbox
                        checked={selectedWeeklyOffs.includes(day)}
                        onChange={() => handleWeeklyOffChange(day)}
                      />
                    }
                    label={day}
                  />
                ))}
              </FormGroup>
            )} */}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {dialogType === 'weeklyOff' ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}