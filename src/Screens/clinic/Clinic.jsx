import React, { useEffect, useState } from 'react';
import Style from '../doctors/doctor.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { toast } from 'react-toastify';
import { getClinics, addClinic, updateClinic, deleteClinic } from '../../apis/clinicSlice';

export default function Clinic() {
  const dispatch = useDispatch();
  const { clinics, loading } = useSelector((state) => state.clinicData || { clinics: [], loading: false });

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [openPopup, setOpenPopup] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    dispatch(getClinics({ page, pageSize }));
  }, [dispatch, page, pageSize]);

  const handleOpenAdd = () => {
    setEditId(null);
    setForm({ name: '', email: '', phone: '', address: '' });
    setOpenPopup(true);
  };

  const handleOpenEdit = (row) => {
    setEditId(row._id);
    setForm({ name: row.name || '', email: row.email || '', phone: row.phone || '', address: row.address || '' });
    setOpenPopup(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }

    let response;

    if (editId) {
      response = await dispatch(updateClinic({ id: editId, ...form }));
    } else {
      response = await dispatch(addClinic(form));
    }

    if (response?.payload?.message) {
      toast.success(response.payload.message);
      setOpenPopup(false);
      dispatch(getClinics({ page, pageSize }));
    } else {
      toast.error(response?.payload?.message || 'Error');
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm('Are you sure to delete this clinic?')) return;
    const response = await dispatch(deleteClinic(row._id));

    if (response?.payload?.message) {
      toast.success(response.payload.message);
      dispatch(getClinics({ page, pageSize }));
    } else {
      toast.error('Error deleting clinic');
    }
  };

  const columns = [
    {
      field: 'actions',
      headerName: 'Actions',
      width: 160,
      sortable: false,
      renderCell: (params) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Tooltip title="Edit">
            <IconButton color="primary" onClick={() => handleOpenEdit(params.row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton color="error" onClick={() => handleDelete(params.row)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
    { field: 'name', headerName: 'Name', width: 250 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    { field: 'address', headerName: 'Address', width: 300 },
  ];

  return (
    <div className={Style.mainDataTable}>
      <Card className={Style.tableCard}>
        <div className={Style.tableHeader}>
          <h2 className={Style.tableTitle}>Clinics</h2>
          <Button className={Style.addBtn} variant="contained" startIcon={<LocalHospitalIcon />} onClick={handleOpenAdd}>
            Add Clinic
          </Button>
        </div>
        <DataGrid
          rows={clinics || []}
          columns={columns}
          getRowId={(row) => row._id}
          loading={loading}
          autoHeight
          pagination
          pageSize={pageSize}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        />
      </Card>

      <Dialog open={openPopup} fullWidth maxWidth={'sm'} onClose={() => setOpenPopup(false)}>
        <DialogTitle>{editId ? 'Edit Clinic' : 'Add Clinic'}</DialogTitle>

        <DialogContent>
          <TextField autoFocus margin="dense" label="Name" fullWidth value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField margin="dense" label="Email" fullWidth value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField margin="dense" label="Phone" fullWidth value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <TextField margin="dense" label="Address" fullWidth value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenPopup(false)} variant="contained" color="error">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit} className="dialogSubmitBtn">
            {editId ? 'Update' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
