import React, { useEffect, useState } from 'react';
import Style from './doctor.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, Tooltip } from '@mui/material';
import {
  getSpecialities,
  addSpeciality,
  updateSpeciality,
  deleteSpeciality,
} from '../../apis/doctorSpecialitySlice';
import { toast } from 'react-toastify';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';


export default function DoctorSpecialities() {
  const dispatch = useDispatch();
  const { specialities, loading } = useSelector(
    (state) => state.doctorSpecialityData || { specialities: [], loading: false },
  );

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Popup states
  const [openPopup, setOpenPopup] = useState(false);
  const [specialityName, setSpecialityName] = useState('');
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    dispatch(getSpecialities({ page, pageSize }));
  }, [dispatch, page, pageSize]);

  // Open Add popup
  const handleOpenAdd = () => {
    setEditId(null); // reset edit mode
    setSpecialityName(''); // clear input
    setOpenPopup(true);
  };

  // Open Edit popup
  const handleOpenEdit = (row) => {
    setEditId(row._id); // store id for update
    setSpecialityName(row.name);
    setOpenPopup(true);
  };

  // Submit Add / Update
  const handleSubmit = async () => {
    if (!specialityName.trim()) {
      toast.error('Name is required');
      return;
    }

    let response;

    if (editId) {
      // UPDATE
      response = await dispatch(updateSpeciality({ id: editId, name: specialityName }));
    } else {
      // ADD
      response = await dispatch(addSpeciality({ name: specialityName }));
    }

    if (response?.payload?.success) {
      toast.success(response.payload.message);
      setOpenPopup(false); // close popup
      dispatch(getSpecialities({ page, pageSize }));
    } else {
      toast.error(response?.payload?.message || 'Error');
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm('Are you sure to delete this speciality?')) return;
    const response = await dispatch(deleteSpeciality(row._id));

    if (response?.payload?.success) {
      toast.success(response.payload.message);
      dispatch(getSpecialities({ page, pageSize }));
    } else {
      toast.error('Error deleting speciality');
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
          <h2 className={Style.tableTitle}>Doctors Speciality</h2>
          <Button
            className={Style.addBtn}
            variant="contained"
            startIcon={<HealthAndSafetyIcon />}
            onClick={handleOpenAdd}
          >
            Add Speciality
          </Button>
        </div>
        <DataGrid
          rows={specialities || []}
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

      {/* Popup */}
      <Dialog open={openPopup} fullWidth maxWidth={'sm'} onClose={() => setOpenPopup(false)}>
        <DialogTitle>{editId ? 'Edit Doctor Speciality' : 'Add Doctor Speciality'}</DialogTitle>

        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Speciality Name"
            fullWidth
            value={specialityName}
            onChange={(e) => setSpecialityName(e.target.value)}
          />
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
