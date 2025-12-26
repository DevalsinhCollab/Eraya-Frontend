import React, { useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Divider,
  Box,
} from '@mui/material';

const fmtDate = (d) => {
  if (!d) return 'N/A';
  const date = new Date(d);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

export default function SessionSummaryDialog({ open, onClose, appointment }) {
  const sessions = appointment?.sessions || [];
  // const assessmentFee = appointment?.patientFormId?.payment || 0;
  const rawAssessmentFee = appointment?.patientFormId?.payment;

  const assessmentFee = rawAssessmentFee === 'FOC' ? 0 : Number(rawAssessmentFee || 0);

  const totals = useMemo(() => {
    const totalPayment = sessions.reduce((s, it) => s + Number(it.payment || 0), 0);
    const totalPaid = sessions.reduce((s, it) => s + Number(it.paidAmount || 0), 0);
    const totalRemaining = sessions.reduce(
      (s, it) =>
        s + Number(it.remainingAmount ?? Math.max(0, (it.payment || 0) - (it.paidAmount || 0))),
      0,
    );
    return { totalPayment, totalPaid, totalRemaining };
  }, [sessions]);

  console.log(appointment , "appointment");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Session Summary</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Patient</Typography>
            <Typography>
              {appointment?.patient?.name || appointment?.patientId?.name || 'N/A'}
            </Typography>
            <Typography variant="caption">
              Phone: {appointment?.patient?.phone || appointment?.patientId?.phone || 'N/A'}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6">Doctor</Typography>
            <Typography>
              {appointment?.doctor?.name || appointment?.doctorId?.name || 'N/A'}
            </Typography>
            <Typography variant="caption">
              Treatment: {appointment?.treatment || appointment?.patientFormId?.treatment || 'N/A'}
            </Typography>
          </Grid>
        </Grid>

        

        <Paper
          variant="outlined"
          sx={{ p: 2, mb: 2, background: 'linear-gradient(90deg, #f7f9ff, #ffffff)' }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            Assessment Fee
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* <Typography sx={{ fontSize: 20, fontWeight: 700 }}>₹ {assessmentFee}</Typography> */}
            <Typography sx={{ fontSize: 20, fontWeight: 700 }}>
              {rawAssessmentFee === 'FOC' ? 'FOC' : `₹ ${assessmentFee}`}
            </Typography>

            <Typography color="text.secondary">(Included in overall totals)</Typography>
          </Box>
        </Paper>

        <Typography variant="h6" sx={{ mb: 1 }}>
          Sessions
        </Typography>

        <Table size="small" sx={{ mb: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Payment</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Paid</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Remaining</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No sessions
                </TableCell>
              </TableRow>
            )}
            {sessions.map((s, idx) => (
              <TableRow key={idx} hover>
                <TableCell>{s.sessionNo || idx + 1}</TableCell>
                <TableCell>{appointment.patientFormId.description?.trim() ? appointment.patientFormId.description : '-'}</TableCell>
                <TableCell>{fmtDate(s.sessionDate)}</TableCell>
                <TableCell>₹ {s.payment || 0}</TableCell>
                <TableCell>₹ {s.paidAmount || 0}</TableCell>
                <TableCell>
                  ₹ {s.remainingAmount ?? Math.max(0, (s.payment || 0) - (s.paidAmount || 0))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2">Sessions Total</Typography>
              <Typography variant="h6">₹ {totals.totalPayment}</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2">Paid (Sessions)</Typography>
              <Typography variant="h6">₹ {totals.totalPaid}</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2">Remaining (Sessions)</Typography>
              <Typography variant="h6">₹ {totals.totalRemaining}</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6} sx={{ mt: 2 }}>
            <Paper variant="outlined" sx={{ p: 2, background: '#f3f6ff' }}>
              <Typography variant="subtitle2">Overall Total (Assessment + Sessions)</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                ₹{Number(assessmentFee) + Number(totals.totalPayment)}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6} sx={{ mt: 2 }}>
            <Paper variant="outlined" sx={{ p: 2, background: '#fff7f0' }}>
              <Typography variant="subtitle2">Overall Remaining</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                ₹ {totals.totalRemaining}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          onClick={() => window.print()}
          sx={{ backgroundImage: 'linear-gradient(90deg,#4B45FF,#191C63)', color: '#fff' }}
        >
          Print
        </Button>
      </DialogActions>
    </Dialog>
  );
}
