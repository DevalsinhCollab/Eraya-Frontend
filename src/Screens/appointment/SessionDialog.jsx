import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MedicineDialog from '../../components/MedicineDialog';
export default function SessionDialog({ open, onClose, appointment, onSave, doctors = [] }) {
  const [form, setForm] = useState({
    sessionNo: 1,
    doctorId: null,
    treatment: '',
    sessionDesc: '',
    sessionDate: '',
    payment: 0,
    paidAmount: 0,
    remainingAmount: 0,
    prescribeMedicine: 'no',
    prescriptions: [],
    paymentMode: 'cash',
  });

  useEffect(() => {
    if (appointment) {
      const nextSessionNo = (appointment.sessions && appointment.sessions.length + 1) || 1;
      const treatmentVal = appointment.treatment || appointment.patientFormId?.treatment || '';
      const paymentVal = appointment.payment || 0;
      const doctorVal = appointment.doctorId?._id || appointment.doctorId || null;
      setForm({
        sessionNo: nextSessionNo,
        doctorId: doctorVal,
        treatment: treatmentVal,
        sessionDesc: '',
        sessionDate: appointment.sessionDate
          ? new Date(appointment.sessionDate).toISOString().slice(0, 10)
          : '',
        payment: paymentVal,
        paidAmount: 0,
        remainingAmount: paymentVal,
        paymentMode: 'cash',
        prescribeMedicine: 'no',
        prescriptions: [],
      });
    }
  }, [appointment]);

//   const handleChange = (field, value) => {
//     setForm((p) => {
//       const next = { ...p, [field]: value };
//       if (field === 'paidAmount' || field === 'payment') {
//         const paymentNum = Number(next.payment || 0);
//         const paidNum = Number(next.paidAmount || 0);
//         next.remainingAmount = Math.max(0, paymentNum - paidNum);
//       }
//       return next;
//     });
//   };

const numericFields = ['payment', 'paidAmount'];

const handleChange = (field, value) => {
  setForm((prev) => {
    let next = { ...prev, [field]: value };

    // ✅ Apply numeric rules ONLY for numeric fields
    if (numericFields.includes(field)) {
      let numValue = Number(value);

      // Prevent negative values
      if (numValue < 0) numValue = 0;

      next[field] = numValue;

      const paymentNum = Number(
        field === 'payment' ? numValue : next.payment || 0
      );
      let paidNum = Number(
        field === 'paidAmount' ? numValue : next.paidAmount || 0
      );

      // Prevent paidAmount > payment
      if (paidNum > paymentNum) {
        paidNum = paymentNum;
        next.paidAmount = paymentNum;
      }

      next.remainingAmount = Math.max(0, paymentNum - paidNum);
    }

    return next;
  });
};
  const handleSave = () => {
    onSave && onSave(form);
  };

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen={fullScreen}>
      <DialogTitle>Add Session</DialogTitle>
      <DialogContent>
        <div style={{ display: 'flex', gap: 12, flexDirection: 'column', marginTop: 8 }}>
            <Typography>Required Sessions : {appointment?.patientFormId?.numOfSessions}</Typography>
          <TextField label="Patient" value={(appointment && (appointment.patient?.name || appointment.patientId?.name)) || ''} fullWidth disabled />

          <TextField label="Session No" value={form.sessionNo} fullWidth disabled />

          <FormControl fullWidth>
            <InputLabel id="select-doctor-label">Doctor</InputLabel>
            <Select
              labelId="select-doctor-label"
              value={form.doctorId || ''}
              label="Doctor"
              onChange={(e) => handleChange('doctorId', e.target.value)}
            >
              {doctors && doctors.length > 0
                ? doctors.map((d) => (
                    <MenuItem key={d._id || d.value} value={d._id || d.value}>
                      {d.name || d.label || d.value}
                    </MenuItem>
                  ))
                : appointment && (
                    <MenuItem value={appointment.doctorId?._id || appointment.doctorId}>
                      {appointment.doctor?.name || (appointment.doctorId && appointment.doctorId?.name) || 'Doctor'}
                    </MenuItem>
                  )}
            </Select>
          </FormControl>


          <TextField label="Treatment" value={form.treatment} fullWidth disabled />

          <TextField
            label="Session Date"
            type="date"
            value={form.sessionDate || ''}
            fullWidth
            onChange={(e) => handleChange('sessionDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
          />

          <TextField
            label="Session Description"
            value={form.sessionDesc}
            fullWidth
            multiline
            minRows={3}
            onChange={(e) => handleChange('sessionDesc', e.target.value)}
          />

          <Box>
            <FormLabel>Prescribe Medicine</FormLabel>
            <RadioGroup
              row
              value={form.prescribeMedicine}
              onChange={(e) => {
                const v = e.target.value;
                setForm((prev) => ({ ...prev, prescribeMedicine: v, prescriptions: v === 'no' ? [] : prev.prescriptions }));
              }}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>

            {form.prescribeMedicine === 'yes' && (
              <Box sx={{ mt: 2 }}>
                <MedicineDialog
                  inline={true}
                  prescriptions={form.prescriptions}
                  setPrescriptions={(p) => setForm((prev) => ({ ...prev, prescriptions: p }))}
                />
              </Box>
            )}
          </Box>

          <TextField label="Payment" type="number" value={form.payment} fullWidth onChange={(e) => handleChange('payment', e.target.value)} />

          <TextField label="Paid Amount" type="number" value={form.paidAmount} fullWidth onChange={(e) => handleChange('paidAmount', e.target.value)} />

          <TextField label="Remaining Amount" type="number" value={form.remainingAmount} fullWidth disabled />

          <FormControl fullWidth>
            <InputLabel id="payment-mode-label">Payment Mode</InputLabel>
            <Select labelId="payment-mode-label" value={form.paymentMode} label="Payment Mode" onChange={(e) => handleChange('paymentMode', e.target.value)}>
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="bank">Bank</MenuItem>
              <MenuItem value="upi">UPI</MenuItem>
            </Select>
          </FormControl>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
