import PatientStyle from './problem.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { Button, Card } from '@mui/material';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import PatientDialog from './PatientDialog';
import { DataGrid } from '@mui/x-data-grid';
import { deletePatient, getPatients } from '../../apis/patientSlice';
import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';

export default function Patients({ search }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [operationMode, setOperationMode] = useState("Add");

  const { loggedIn } = useSelector((state) => state.authData);
  const { patients, loading, totalCount } = useSelector((state) => state.patientData);

  async function callApi() {
    dispatch(getPatients({ page, pageSize, search: search || "" }));
  }

  useEffect(() => {
    callApi();
  }, [page, pageSize, dispatch, loggedIn, search]);

  const handlePaginationModelChange = (model) => {
    setPage(model.page);
    setPageSize(model.pageSize);
  };

  const handleEdit = (data) => {
    navigate(`/assessmentform/${data._id}`)
  }

  const handleDelete = async (data) => {
    const response = await dispatch(deletePatient(data._id));

    if (response?.payload?.success) {
      toast.success(response?.payload.message);
      callApi();
    } else {
      toast.error("Error deleting patient");
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
    {
      field: 'phone',
      headerName: <div className="gridHeaderText">Phone</div>,
      width: 200,
    },
    {
      field: 'pincode',
      headerName: <div className="gridHeaderText">Pincode</div>,
      width: 150,
    },
    {
      field: 'area',
      headerName: <div className="gridHeaderText">Area</div>,
      width: 220,
    },
    {
      field: 'city',
      headerName: <div className="gridHeaderText">City</div>,
      width: 150,
    },
    {
      field: 'state',
      headerName: <div className="gridHeaderText">State</div>,
      width: 150,
    },
    {
      field: 'address',
      headerName: <div className="gridHeaderText">Address</div>,
      width: 350,
    },
  ];

  return (
    <div className={PatientStyle.mainDataTable}>
      <Card className={PatientStyle.tableCard}>
        <div className={PatientStyle.tableHeader}>
          <h2 className={PatientStyle.tableTitle}>Patients</h2>
          <Button
            className={PatientStyle.addBtn}
            variant="contained"
            startIcon={<HealthAndSafetyIcon />}
            onClick={() => { navigate("/assessmentform") }}
          // onClick={() => { setOpen(true); setOperationMode("Add") }}
          >
            Add Patients
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
          rows={patients}
          columns={columns}
          loading={loading}
          pagination
          paginationMode="server"
          rowCount={totalCount}
          initialState={{
            ...patients.initialState,
            pagination: {
              ...patients.initialState?.pagination,
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
        <PatientDialog
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
