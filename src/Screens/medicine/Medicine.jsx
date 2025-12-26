import React, { useEffect, useState } from 'react';
import Style from '../doctors/doctor.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, Tooltip } from '@mui/material';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import { toast } from 'react-toastify';
import { getMedicines, addMedicine, updateMedicine, deleteMedicine } from '../../apis/medicineSlice';

export default function Medicine() {
  const dispatch = useDispatch();
  const { medicines, loading } = useSelector((state) => state.medicineData || { medicines: [], loading: false });

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [openPopup, setOpenPopup] = useState(false);
  const [medicineName, setMedicineName] = useState('');
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    dispatch(getMedicines({ page, pageSize }));
  }, [dispatch, page, pageSize]);

  const handleOpenAdd = () => {
    setEditId(null);
    setMedicineName('');
    setOpenPopup(true);
  };

  const handleOpenEdit = (row) => {
    setEditId(row._id);
    setMedicineName(row.name);
    setOpenPopup(true);
  };

  const handleSubmit = async () => {
    if (!medicineName.trim()) {
      toast.error('Name is required');
      return;
    }

    let response;

    if (editId) {
      response = await dispatch(updateMedicine({ id: editId, name: medicineName }));
    } else {
      response = await dispatch(addMedicine({ name: medicineName }));
    }

    if (response?.payload?.message) {
      toast.success(response.payload.message);
      setOpenPopup(false);
      dispatch(getMedicines({ page, pageSize }));
    } else {
      toast.error(response?.payload?.message || 'Error');
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm('Are you sure to delete this medicine?')) return;
    const response = await dispatch(deleteMedicine(row._id));

    if (response?.payload?.message) {
      toast.success(response.payload.message);
      dispatch(getMedicines({ page, pageSize }));
    } else {
      toast.error('Error deleting medicine');
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
    { field: 'name', headerName: 'Name', width: 300 },
  ];

  return (
    <div className={Style.mainDataTable}>
      <Card className={Style.tableCard}>
        <div className={Style.tableHeader}>
          <h2 className={Style.tableTitle}>Medicines</h2>
          <Button className={Style.addBtn} variant="contained" startIcon={<LocalPharmacyIcon />} onClick={handleOpenAdd}>
            Add Medicine
          </Button>
        </div>
        <DataGrid
          rows={medicines || []}
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
        <DialogTitle>{editId ? 'Edit Medicine' : 'Add Medicine'}</DialogTitle>

        <DialogContent>
          <TextField autoFocus margin="dense" label="Medicine Name" fullWidth value={medicineName} onChange={(e) => setMedicineName(e.target.value)} />
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