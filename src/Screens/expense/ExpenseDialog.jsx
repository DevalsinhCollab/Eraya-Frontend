import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Stack,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useDispatch, useSelector } from 'react-redux';
import { createExpense, updateExpense } from '../../apis/expenseSlice';
import { toast } from 'react-toastify';

const ExpenseDialog = ({ open, handleClose, editData, callApi }) => {
  const dispatch = useDispatch();
  const { expenseLoading } = useSelector((state) => state.expenseData);

  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    category: 'other',
    expenseDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (editData && editData._id) {
      setFormData({
        description: editData.description,
        amount: editData.amount,
        category: editData.category,
        expenseDate: editData.expenseDate
          ? new Date(editData.expenseDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
      });
    } else {
      setFormData({
        description: '',
        amount: 0,
        category: 'other',
        expenseDate: new Date().toISOString().split('T')[0],
      });
    }
  }, [editData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.description) return toast.error('Description is required');
    if (formData.amount <= 0) return toast.error('Amount must be greater than 0');

    const payload = {
      description: formData.description,
      amount: formData.amount,
      category: formData.category,
      expenseDate: new Date(formData.expenseDate),
    };

    const response = editData && editData._id
      ? await dispatch(updateExpense({ id: editData._id, data: payload }))
      : await dispatch(createExpense(payload));

    if (!response.payload?.error) {
      toast.success(response.payload?.message || 'Expense saved successfully');
      handleClose();
      callApi();
    } else {
      toast.error(response.payload?.message || 'Error saving expense');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>{editData && editData._id ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ marginTop: 1 }}>
          <TextField
            label="Description"
            fullWidth
            value={formData.description}
            onChange={handleChange}
            name="description"
            placeholder="e.g., Office supplies"
          />
          <TextField
            label="Amount"
            type="number"
            fullWidth
            value={formData.amount}
            onChange={handleChange}
            name="amount"
            InputProps={{ step: '0.01', min: '0' }}
          />
          <TextField
            label="Category"
            select
            fullWidth
            value={formData.category}
            onChange={handleChange}
            name="category"
          >
            <MenuItem value="utilities">Utilities</MenuItem>
            <MenuItem value="salary">Salary</MenuItem>
            <MenuItem value="rent">Rent</MenuItem>
            <MenuItem value="supplies">Supplies</MenuItem>
            <MenuItem value="maintenance">Maintenance</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>
          <TextField
            label="Date"
            type="date"
            fullWidth
            value={formData.expenseDate}
            onChange={handleChange}
            name="expenseDate"
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="error" variant="outlined">
          Cancel
        </Button>
        <LoadingButton loading={expenseLoading} onClick={handleSubmit} variant="contained">
          Save
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default ExpenseDialog;
