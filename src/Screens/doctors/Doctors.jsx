import DoctorStyle from './doctor.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { Button, Card } from '@mui/material';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import DoctorDialog from './DoctorDialog';
import { DataGrid } from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import { deleteDoctor, getDoctors } from '../../apis/doctorSlice';

export default function Doctors({ search }) {
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [operationMode, setOperationMode] = useState("Add");

  const { loggedIn } = useSelector((state) => state.authData);
  const { doctors, loading, totalCount } = useSelector((state) => state.doctorData);

  async function callApi() {
    dispatch(getDoctors({ page, pageSize, search: search || "" }));
  }

  useEffect(() => {
    callApi();
  }, [page, pageSize, dispatch, loggedIn, search]);

  const handlePaginationModelChange = (model) => {
    setPage(model.page);
    setPageSize(model.pageSize);
  };

  const handleEdit = (data) => {
    setOpen(true);
    setEditData(data)
    setOperationMode("Edit")
  }

  const handleDelete = async (data) => {
    const response = await dispatch(deleteDoctor(data._id));

    if (response?.payload?.success) {
      toast.success(response?.payload.message);
      callApi();
    } else {
      toast.error("Error deleting doctor");
    }
  }

  const columns = [
    {
      field: 'actions',
      headerName: <div className="gridHeaderText">Action</div>,
      width: 160,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div>
          <IconButton
            onClick={() => handleEdit(params.row)}
            color="primary"
            aria-label="edit"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => handleDelete(params.row)}
            color="error"
            aria-label="delete"
          >
            <DeleteIcon />
          </IconButton>
        </div>
      ),
    },
    {
      field: 'name',
      headerName: <div className="gridHeaderText">Name</div>,
      width: 250,
    },
  ];

  return (
    <div className={DoctorStyle.mainDataTable}>
      <Card className={DoctorStyle.tableCard}>
        <div className={DoctorStyle.tableHeader}>
          <h2 className={DoctorStyle.tableTitle}>Doctors</h2>
          <Button
            className={DoctorStyle.addBtn}
            variant="contained"
            startIcon={<HealthAndSafetyIcon />}
            onClick={() => { setOpen(true); setOperationMode("Add") }}
          >
            Add Doctors
          </Button>
        </div>
        <DataGrid
          sx={{
            color: '#000',
            backgroundColor: '#fff',
            fontSize: '1rem',
            height: 'auto',
            fontWeight: '600',
          }}
          rows={doctors}
          columns={columns}
          loading={loading}
          pagination
          paginationMode="server"
          rowCount={totalCount}
          initialState={{
            ...doctors.initialState,
            pagination: {
              ...doctors.initialState?.pagination,
              paginationModel: {
                pageSize: pageSize,
              },
            },
          }}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          onPaginationModelChange={handlePaginationModelChange}
          getRowId={(e) => e._id}
        />
        <DoctorDialog
          open={open}
          setOpen={setOpen}
          editData={editData}
          operationMode={operationMode}
          setOperationMode={setOperationMode}
          callApi={callApi}
        />
      </Card>
    </div>
  );
}
