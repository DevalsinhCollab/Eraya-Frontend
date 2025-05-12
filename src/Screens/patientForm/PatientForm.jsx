import PatientStyle from './doctor.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { Button, Card } from '@mui/material';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import PatientFormDialog from './PatientFormDialog';
import { DataGrid } from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import { deletePatientForm, generateReport, getPatientsForm } from '../../apis/patientFormSlice';
import moment from 'moment/moment';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SearchDoctor from '../../components/Autocomplete/SearchDoctor';
import SearchPatient from '../../components/Autocomplete/SearchPatient';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css

export default function PatientForm({ search }) {
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [operationMode, setOperationMode] = useState("Add");
  const [filter, setFilter] = useState(false);
  const [patient, setPatient] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [dateRange, setDateRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: 'selection',
      color: '#3d91ff',
    }
  ])

  const { loggedIn } = useSelector((state) => state.authData);
  const { patientsForm, loading, totalCount } = useSelector((state) => state.patientFormData)

  async function callApi() {
    const payload = {
      page,
      pageSize,
      search: search || "",
      patient: patient?.patient?.value || "",
      doctor: doctor?.doctor?.value || "",
    };

    if (dateRange[0]?.startDate)
      payload.startDate = moment(dateRange[0].startDate).format("DD/MM/YYYY");
    if (dateRange[0]?.endDate)
      payload.endDate = moment(dateRange[0].endDate).format("DD/MM/YYYY");

    dispatch(getPatientsForm(payload));
  }

  useEffect(() => {
    callApi();
  }, [page, pageSize, dispatch, loggedIn, search, patient, doctor, dateRange]);

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
    const response = await dispatch(deletePatientForm(data._id));

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
      field: 'doctor',
      headerName: <div className="gridHeaderText">Doctor Name</div>,
      renderCell: (params) => (
        <div>
          {params && params.row && params.row.doctor && params.row.doctor.name}
        </div>
      ),
      width: 250,
    },
    {
      field: 'patient',
      headerName: <div className="gridHeaderText">Patient Name</div>,
      renderCell: (params) => (
        <div>
          {params && params.row && params.row.patient && params.row.patient.name}
        </div>
      ),
      width: 250,
    },
    {
      field: 'patient.phone',
      headerName: <div className="gridHeaderText">Patient Phone</div>,
      renderCell: (params) => (
        <div>
          {params && params.row && params.row.patient && params.row.patient.phone}
        </div>
      ),
      width: 250,
    },
    {
      field: 'description',
      headerName: <div className="gridHeaderText">Description</div>,
      width: 250,
    },
    {
      field: 'payment',
      headerName: <div className="gridHeaderText">Payment</div>,
      width: 250,
    },
    {
      field: 'date',
      headerName: <div className="gridHeaderText">Visited Date</div>,
      renderCell: (params) => (
        <div>
          {params && params.row && params.row.date && moment(params.row.date).format("DD/MM/YYYY")}
        </div>
      ),
      width: 250,
    },
  ];

  return (
    <div className={PatientStyle.mainDataTable}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div></div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <a
            className="btn btn-outline-success d-flex align-items-center p-2"
            href={`${process.env.REACT_APP_BACKEND_API}/patientform/generatereport?patient=${patient?.patient?.value}&startDate=${moment(dateRange[0].startDate).format("DD/MM/YYYY")}&endDate=${moment(dateRange[0].endDate).format("DD/MM/YYYY")}`}
            target="_blank"
          >
            <Button className={PatientStyle.addBtn} variant="contained">
              Generate Report
            </Button>
          </a>


          <Button
            className={PatientStyle.addBtn}
            variant="contained"
            startIcon={<FilterAltIcon />}
            onClick={() => {
              setFilter(!filter); setDateRange([
                {
                  startDate: null,
                  endDate: null,
                  key: 'selection',
                  color: '#3d91ff',
                }
              ])
            }}
          >
            Filter
          </Button>
        </div>
      </div>

      {filter &&
        <Card className={PatientStyle.tableCard} style={{ marginBottom: "1rem", display: "flex" }}>
          <div style={{ width: "50%", padding: "1rem" }}>
            <SearchDoctor open={filter} setData={setDoctor} />
          </div>

          <div style={{ width: "50%", padding: "1rem" }}>
            <SearchPatient open={filter} setData={setPatient} />
          </div>

          <div style={{ width: "50%", padding: "1rem" }}>
            <DateRange
              editableDateInputs={true}
              onChange={item =>
                setDateRange([{
                  ...item.selection,
                  color: '#3d91ff',
                }])
              }
              moveRangeOnFirstSelection={false}
              ranges={dateRange}
            />
          </div>
        </Card>
      }

      <Card className={PatientStyle.tableCard}>
        <div className={PatientStyle.tableHeader}>
          <h2 className={PatientStyle.tableTitle}>Patient Form</h2>
          <Button
            className={PatientStyle.addBtn}
            variant="contained"
            startIcon={<HealthAndSafetyIcon />}
            onClick={() => { setOpen(true); setOperationMode("Add") }}
          >
            Add Data
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
          rows={patientsForm}
          columns={columns}
          loading={loading}
          pagination
          paginationMode="server"
          rowCount={totalCount}
          initialState={{
            ...patientsForm.initialState,
            pagination: {
              ...patientsForm.initialState?.pagination,
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
        <PatientFormDialog
          open={open}
          editData={editData}
          setOpen={setOpen}
          operationMode={operationMode}
          setOperationMode={setOperationMode}
          callApi={callApi}
        />
      </Card>
    </div>
  );
}
