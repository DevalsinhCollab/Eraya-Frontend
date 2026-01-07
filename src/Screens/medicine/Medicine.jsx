// import React, { useEffect, useState } from 'react';
// import Style from '../doctors/doctor.module.scss';
// import { useDispatch, useSelector } from 'react-redux';
// import { Button, Card, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
// import { DataGrid } from '@mui/x-data-grid';
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/Delete';
// import { IconButton, Tooltip } from '@mui/material';
// import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
// import { toast } from 'react-toastify';
// import { getMedicines, addMedicine, updateMedicine, deleteMedicine } from '../../apis/medicineSlice';
// import SearchClinic from '../../components/Autocomplete/SearchClinic';

// export default function Medicine() {
//   const dispatch = useDispatch();
//   const { medicines, loading } = useSelector((state) => state.medicineData || { medicines: [], loading: false });

//   const [page, setPage] = useState(0);
//   const [pageSize, setPageSize] = useState(10);

//   const [openPopup, setOpenPopup] = useState(false);
//   const [medicineData, setMedicineData] = useState({ name: '', clinicId: null });
//   const [editId, setEditId] = useState(null);

//   useEffect(() => {
//     dispatch(getMedicines({ page, pageSize }));
//   }, [dispatch, page, pageSize]);

//   const handleOpenAdd = () => {
//     setEditId(null);
//     setMedicineData({ name: '', clinicId: null });
//     setOpenPopup(true);
//   };

//   const handleOpenEdit = (row) => {
//     setEditId(row._id);
//     setMedicineData({ name: row.name, clinicId: row.clinicId || null });
//     setOpenPopup(true);
//   };

//   const handleSubmit = async () => {
//     if (!medicineData.name || !medicineData.name.trim()) {
//       toast.error('Name is required');
//       return;
//     }

//     let response;

//     if (editId) {
//       response = await dispatch(updateMedicine({ id: editId, name: medicineData.name, clinicId: medicineData.clinicId }));
//     } else {
//       response = await dispatch(addMedicine({ name: medicineData.name, clinicId: medicineData.clinicId }));
//     }

//     if (response?.payload?.message) {
//       toast.success(response.payload.message);
//       setOpenPopup(false);
//       dispatch(getMedicines({ page, pageSize }));
//     } else {
//       toast.error(response?.payload?.message || 'Error');
//     }
//   };

//   const handleDelete = async (row) => {
//     if (!window.confirm('Are you sure to delete this medicine?')) return;
//     const response = await dispatch(deleteMedicine(row._id));

//     if (response?.payload?.message) {
//       toast.success(response.payload.message);
//       dispatch(getMedicines({ page, pageSize }));
//     } else {
//       toast.error('Error deleting medicine');
//     }
//   };

//   const columns = [
//     {
//       field: 'actions',
//       headerName: 'Actions',
//       width: 160,
//       sortable: false,
//       renderCell: (params) => (
//         <div style={{ display: 'flex', gap: 8 }}>
//           <Tooltip title="Edit">
//             <IconButton color="primary" onClick={() => handleOpenEdit(params.row)}>
//               <EditIcon />
//             </IconButton>
//           </Tooltip>
//           <Tooltip title="Delete">
//             <IconButton color="error" onClick={() => handleDelete(params.row)}>
//               <DeleteIcon />
//             </IconButton>
//           </Tooltip>
//         </div>
//       ),
//     },
//  {
//   field: 'clinicName',
//   headerName: 'Clinic Name',
//   width: 200,
//   renderCell: (params) => (
//     <span style={{ textTransform: 'capitalize' }}>
//       {params.row?.clinicId?.name || 'N/A'}
//     </span>
//   ),
// },
//         { field: 'name', headerName: 'Name', width: 300 },
//   ];

//   return (
//     <div className={Style.mainDataTable}>
//       <Card className={Style.tableCard}>
//         <div className={Style.tableHeader}>
//           <h2 className={Style.tableTitle}>Medicines</h2>
//           <Button className={Style.addBtn} variant="contained" startIcon={<LocalPharmacyIcon />} onClick={handleOpenAdd}>
//             Add Medicine
//           </Button>
//         </div>
//         <DataGrid
//           rows={medicines || []}
//           columns={columns}
//           getRowId={(row) => row._id}
//           loading={loading}
//           autoHeight
//           pagination
//           pageSize={pageSize}
//           onPageChange={(newPage) => setPage(newPage)}
//           onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
//         />
//       </Card>

//       <Dialog open={openPopup} fullWidth maxWidth={'sm'} onClose={() => setOpenPopup(false)}>
//         <DialogTitle>{editId ? 'Edit Medicine' : 'Add Medicine'}</DialogTitle>

//         <DialogContent>
//           <div style={{ marginBottom: 12 }}>
//             <SearchClinic open={openPopup} setData={setMedicineData} data={medicineData} name="clinicId" label="Clinic" size="small" />
//           </div>
//           <TextField autoFocus margin="dense" label="Medicine Name" fullWidth value={medicineData.name} onChange={(e) => setMedicineData((prev) => ({ ...prev, name: e.target.value }))} />
//         </DialogContent>

//         <DialogActions>
//           <Button onClick={() => setOpenPopup(false)} variant="contained" color="error">
//             Cancel
//           </Button>
//           <Button variant="contained" onClick={handleSubmit} className="dialogSubmitBtn">
//             {editId ? 'Update' : 'Submit'}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </div>
//   );
// }

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
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, Tooltip } from '@mui/material';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import { toast } from 'react-toastify';
import {
  getMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
} from '../../apis/medicineSlice';
import SearchClinic from '../../components/Autocomplete/SearchClinic';

export default function Medicine() {
  const dispatch = useDispatch();
  const { medicines, loading } = useSelector(
    (state) => state.medicineData || { medicines: [], loading: false },
  );

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [openPopup, setOpenPopup] = useState(false);
  // Updated initial state to include qty
  const [medicineData, setMedicineData] = useState({ name: '', qty: '', clinicId: null });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    dispatch(getMedicines({ page, pageSize }));
  }, [dispatch, page, pageSize]);

  const handleOpenAdd = () => {
    setEditId(null);
    setMedicineData({ name: '', qty: '', clinicId: null });
    setOpenPopup(true);
  };

  const handleOpenEdit = (row) => {
    setEditId(row._id);
    setMedicineData({
      name: row.name,
      qty: row.qty || '', // fallback to empty if qty is missing
      clinicId: row.clinicId || null,
    });
    setOpenPopup(true);
  };

  const handleSubmit = async () => {
    if (!medicineData.name || !medicineData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    // Optional: validate qty is a positive number
    if (medicineData.qty === '' || isNaN(medicineData.qty) || Number(medicineData.qty) < 0) {
      toast.error('Please enter a valid quantity (non-negative number)');
      return;
    }

    let response;

    if (editId) {
      response = await dispatch(
        updateMedicine({
          id: editId,
          name: medicineData.name,
          qty: Number(medicineData.qty),
          clinicId: medicineData.clinicId,
        }),
      );
    } else {
      response = await dispatch(
        addMedicine({
          name: medicineData.name,
          qty: Number(medicineData.qty),
          clinicId: medicineData.clinicId,
        }),
      );
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
    {
      field: 'clinicName',
      headerName: 'Clinic Name',
      width: 200,
      renderCell: (params) => (
        <span style={{ textTransform: 'capitalize' }}>{params.row?.clinicId?.name || 'N/A'}</span>
      ),
    },
    { field: 'name', headerName: 'Name', width: 300 },
    // New Quantity column
    {
      field: 'qty',
      headerName: 'Quantity',
      width: 130,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <span>{params.row?.qty || 0}</span>
      ),
    },
  ];

  return (
    <div className={Style.mainDataTable}>
      <Card className={Style.tableCard}>
        <div className={Style.tableHeader}>
          <h2 className={Style.tableTitle}>Medicines</h2>
          <Button
            className={Style.addBtn}
            variant="contained"
            startIcon={<LocalPharmacyIcon />}
            onClick={handleOpenAdd}
          >
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
          paginationMode="server"
          rowCount={100} // Adjust if you have total count from backend
        />
      </Card>

      <Dialog open={openPopup} fullWidth maxWidth={'sm'} onClose={() => setOpenPopup(false)}>
        <DialogTitle>{editId ? 'Edit Medicine' : 'Add Medicine'}</DialogTitle>

        <DialogContent>
          <div style={{ margin: '12px 0' }}>
            <SearchClinic
              open={openPopup}
              setData={setMedicineData}
              data={medicineData}
              name="clinicId"
              label="Clinic"
              size="small"
            />
          </div>

          <TextField
            size="small"
            autoFocus
            margin="dense"
            label="Medicine Name"
            fullWidth
            value={medicineData.name}
            onChange={(e) => setMedicineData((prev) => ({ ...prev, name: e.target.value }))}
            style={{ marginBottom: 16 }}
          />

          {/* New Quantity Field */}
          <TextField
            size="small"
            margin="dense"
            label="Quantity"
            type="number"
            fullWidth
            value={medicineData.qty}
            onChange={(e) => setMedicineData((prev) => ({ ...prev, qty: e.target.value }))}
            inputProps={{ min: 0 }}
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
