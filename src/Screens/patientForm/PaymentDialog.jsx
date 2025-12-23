import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { getOneAppointment } from '../../apis/appointmentApi';
import { useDispatch, useSelector } from 'react-redux';
import { updateAppointment } from '../../apis/appointmentSlice';

const PaymentDialog = ({ open, handleClose, appointmentId, appointmentDetails, callApi }) => {
  const dispatch = useDispatch();
  const { loggedIn } = useSelector((state) => state.authData || {});

  const [appointment, setAppointment] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSessionIndex, setSelectedSessionIndex] = useState(0);
  const [paidByCustomer, setPaidByCustomer] = useState(0);

  const fetchAppointment = async () => {
    let res;
    const targetId = appointmentId || appointmentDetails;
    if (!targetId) return;
    res = await getOneAppointment(targetId);
    const appt = res?.data?.data;
    setAppointment(appt);
    setSessions((appt && appt.sessions) || []);
    setSelectedSessionIndex(0);
    setPaidByCustomer(0);
  };

  useEffect(() => {
    if (open) fetchAppointment();
  }, [open, appointmentId, appointmentDetails]);

  const formatDate = (d) => {
    if (!d) return 'N/A';
    const date = new Date(d);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const handleSessionSelect = (e) => {
    setSelectedSessionIndex(Number(e.target.value));
    setPaidByCustomer(0);
  };

  const handleChangePaid = (val) => {
    const idx = selectedSessionIndex;
    const sess = sessions[idx] || {};
    const remaining = Number(sess.remainingAmount || sess.payment - sess.paidAmount || 0) || 0;
    const num = Math.max(0, Number(val || 0));
    setPaidByCustomer(Math.min(num, remaining));
  };

  const handleSubmit = async () => {
    const idx = selectedSessionIndex;
    if (!appointment) return;
    const updated = [...sessions];
    const sess = { ...(updated[idx] || {}) };
    const prevPaid = Number(sess.paidAmount || 0);
    const payNow = Number(paidByCustomer || 0);
    const newPaid = prevPaid + payNow;
    sess.paidAmount = newPaid;
    sess.remainingAmount = Math.max(0, Number(sess.payment || 0) - newPaid);
    sess.paymentLogs = sess.paymentLogs || [];
    if (payNow > 0) {
      sess.paymentLogs.push({
        paidAmount: payNow,
        receiveBy: (loggedIn && loggedIn._id) || null,
        paymentDate: new Date(),
      });
    }
    updated[idx] = sess;

    // send updated sessions to backend
    const payload = { _id: appointment._id, sessions: updated };
    const response = await dispatch(updateAppointment(payload));
    if (response?.payload?.success) {
      handleClose();
      callApi && callApi();
    }
  };

  const selectedSession = sessions[selectedSessionIndex] || {};

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="payment-dialog-title" fullWidth>
      <DialogTitle id="payment-dialog-title">Payment For Session</DialogTitle>

      <DialogContent>
        {!appointment && <Typography>Loading...</Typography>}

        {appointment && (
          <div>
            <Typography variant="subtitle1">
              Patient: {appointment.patient?.name || appointment.patientId?.name}
            </Typography>

            <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
              <InputLabel id="session-select-label">Select Session</InputLabel>
              <Select
                labelId="session-select-label"
                value={selectedSessionIndex}
                label="Select Session"
                onChange={handleSessionSelect}
              >
                {sessions.map((s, i) => (
                  <MenuItem key={i} value={i}>
                    {`Session ${s.sessionNo || i + 1} - ${formatDate(s.sessionDate)} - Remaining ${
                      s.remainingAmount || s.payment - s.paidAmount || 0
                    } - Paid ${s.paidAmount || 0}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <List>
              <ListItem>
                <ListItemText
                  primary={`Payment: ${selectedSession.payment || 0}`}
                  secondary={`Date: ${formatDate(selectedSession.sessionDate)}`}
                />
              </ListItem>
              <ListItem>
                <ListItemText primary={`Paid: ${selectedSession.paidAmount || 0}`} />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={`Remaining: ${
                    selectedSession.remainingAmount ??
                    Math.max(0, (selectedSession.payment || 0) - (selectedSession.paidAmount || 0))
                  }`}
                />
              </ListItem>
            </List>

            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <TextField
                size="small"
                label="Paid By Customer"
                value={paidByCustomer}
                type="number"
                onChange={(e) => handleChangePaid(e.target.value)}
              />
              <TextField
                size="small"
                label="Remaining After"
                value={Math.max(
                  0,
                  (selectedSession.payment || 0) -
                    ((selectedSession.paidAmount || 0) + Number(paidByCustomer || 0)),
                )}
                InputProps={{ readOnly: true }}
              />
            </Stack>
          </div>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={() => {
            handleClose();
          }}
          sx={{
            borderRadius: '2rem',
            backgroundImage: 'linear-gradient(180deg, #4B45FF 0%, #191C63 100%)',
            color: 'white',
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          sx={{
            borderRadius: '2rem',
            backgroundImage: 'linear-gradient(180deg, #4B45FF 0%, #191C63 100%)',
            color: 'white',
          }}
        >
          Pay
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDialog;
