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
} from '@mui/material';
import { paymentDoneApi, getOneAppointment } from '../../apis/appointmentApi';

const PaymentDialog = ({ open, handleClose, appointmentId, appointmentDetails, callApi }) => {
  const [formData, setFormData] = useState({
    totalPrice: 0,
    totalPaid: 0,
    paidByCustomer: 0,
    remainingAmount: 0,
  });

  const callApiForDataOfCustomerPaid = async () => {
    let res;
    if (appointmentId) {
      res = await getOneAppointment(appointmentId);
    } else if (appointmentDetails) {
      res = await getOneAppointment(appointmentDetails);
    }

    const total = Number(res?.data?.data?.payment || 0);
    const paid = Number(res?.data?.data?.paidAmount || 0);

    setFormData({
      totalPrice: total.toFixed(0),
      totalPaid: paid,
      paidByCustomer: 0,
      remainingAmount: Math.max(0, total - paid).toFixed(0),
    });
  };

  useEffect(() => {
    if (open) {
      callApiForDataOfCustomerPaid();
    }
  }, [open, appointmentId, appointmentDetails]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericValue = Number(value);
    if (name === 'paidByCustomer') {
      const maxPayable = Number(formData.totalPrice) - Number(formData.totalPaid);
      const amountToPay = Math.min(numericValue, maxPayable); // restrict to max

      const newRemaining = Math.max(
        0,
        Number(formData.totalPrice) - (Number(formData.totalPaid) + amountToPay),
      );

      setFormData((prev) => ({
        ...prev,
        paidByCustomer: amountToPay,
        remainingAmount: newRemaining,
      }));
    }
  };

  const handleSubmit = async () => {
    const targetId = appointmentId || appointmentDetails;
    if (targetId) {
      await paymentDoneApi(targetId, {
        paidByCustomer: formData.paidByCustomer,
      });
    }
    handleClose();
    callApi && callApi();
  };

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="payment-dialog-title">
      <DialogTitle id="payment-dialog-title">Payment Done?</DialogTitle>

      <DialogContent>
        <Stack direction={'row'} justifyContent={'space-around'} mb={2}>
          <Typography>
            <strong>Total Amount: {formData.totalPrice}</strong>
          </Typography>
          <Typography>
            <strong>Total Paid: {Number(formData.totalPaid) + Number(formData.paidByCustomer)}</strong>
          </Typography>
        </Stack>

        <Stack direction="row" spacing={2}>
          <TextField
            size="small"
            label="Paid By Customer"
            value={formData.paidByCustomer}
            name="paidByCustomer"
            type="number"
            onChange={handleChange}
          />
          <TextField
            size="small"
            label="Remaining Amount"
            name="remainingAmount"
            value={formData.remainingAmount}
            InputProps={{ readOnly: true }}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleSubmit}
          sx={{
            borderRadius: '2rem',
            backgroundImage: 'linear-gradient(180deg, #4B45FF 0%, #191C63 100%)',
            color: 'white',
          }}
        >
          Yes
        </Button>
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
          No
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDialog;
