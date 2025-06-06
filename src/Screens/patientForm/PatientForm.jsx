import PatientStyle from './doctor.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { Button, Card, Tooltip } from '@mui/material';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import PatientFormDialog from './PatientFormDialog';
import { DataGrid } from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import { deletePatientForm, getPatientsForm } from '../../apis/patientFormSlice';
import moment from 'moment/moment';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SearchDoctor from '../../components/Autocomplete/SearchDoctor';
import SearchPatient from '../../components/Autocomplete/SearchPatient';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { useNavigate } from 'react-router';
import AssessmentIcon from '@mui/icons-material/Assessment';

export default function PatientForm({ search }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [operationMode, setOperationMode] = useState("Add");
  const [filter, setFilter] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [doctorData, setDoctorData] = useState(null);
  const [isDisabled, setIsDisabled] = useState(true);
  const [message, setMessage] = useState("");
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
      patient: patientData?.patient?.value || "",
      doctor: doctorData?.doctor?.value || "",
    };

    if (dateRange[0]?.startDate)
      payload.startDate = moment(dateRange[0].startDate).format("DD/MM/YYYY");
    if (dateRange[0]?.endDate)
      payload.endDate = moment(dateRange[0].endDate).format("DD/MM/YYYY");

    dispatch(getPatientsForm(payload));
  }

  useEffect(() => {
    callApi();
  }, [page, pageSize, dispatch, loggedIn, search, patientData, doctorData, dateRange]);

  useEffect(() => {
    if (doctorData == null) {
      setIsDisabled(true);
      return setMessage("Please select a doctor");
    } else if (patientData == null) {
      setIsDisabled(true);
      return setMessage("Please select a patient");
    } else if (dateRange && dateRange[0]?.startDate == null) {
      setIsDisabled(true);
      return setMessage("Please select a date");
    } else {
      setIsDisabled(false);
      return setMessage("");
    }
  }, [patientData, doctorData, dateRange]);

  const reportUrl = `${process.env.REACT_APP_BACKEND_API}/patientform/generatereport?doctor=${doctorData?.doctor?.value}&patient=${patientData?.patient?.value}&startDate=${moment(
    dateRange[0]?.startDate
  ).format("DD/MM/YYYY")}&endDate=${moment(dateRange[0]?.endDate).format("DD/MM/YYYY")}`;

  const receiptUrl = `${process.env.REACT_APP_BACKEND_API}/patientform/generatereceipt?doctor=${doctorData?.doctor?.value}&patient=${patientData?.patient?.value}&startDate=${moment(
    dateRange[0]?.startDate
  ).format("DD/MM/YYYY")}&endDate=${moment(dateRange[0]?.endDate).format("DD/MM/YYYY")}`;

  const prescriptionUrl = `${process.env.REACT_APP_BACKEND_API}/patientform/generateprescription?doctor=${doctorData?.doctor?.value}&patient=${patientData?.patient?.value}&startDate=${moment(
    dateRange[0]?.startDate
  ).format("DD/MM/YYYY")}&endDate=${moment(dateRange[0]?.endDate).format("DD/MM/YYYY")}`;

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
      headerName: <div className="gridHeaderText">Actions</div>,
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div>
          <Tooltip title="Edit">
            <IconButton
              onClick={() => handleEdit(params.row)}
              color="primary"
              aria-label="edit"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete">
            <IconButton
              onClick={() => handleDelete(params.row)}
              color="error"
              aria-label="delete"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Generate Certificate">
            <IconButton
              onClick={() => {
                const url = `${process.env.REACT_APP_BACKEND_API}/patientform/generatecertificate?id=${params.row._id}`;
                window.open(url, '_blank');
              }}
              color="success"
              aria-label="generate-certificate"
            >
              <WorkspacePremiumIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Assessment Form">
            <IconButton
              onClick={() => {
                navigate(`/assessmentform/${params.row._id}`)
              }}
              color="secondary"
              aria-label="generate-certificate"
            >
              <AssessmentIcon />
            </IconButton>
          </Tooltip>

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
      width: 150,
    },
    {
      field: 'patient',
      headerName: <div className="gridHeaderText">Patient Name</div>,
      renderCell: (params) => (
        <div>
          {params && params.row && params.row.patient && params.row.patient.name}
        </div>
      ),
      width: 280,
    },
    {
      field: 'patient.phone',
      headerName: <div className="gridHeaderText">Patient Phone</div>,
      renderCell: (params) => (
        <div>
          {params && params.row && params.row.patient && params.row.patient.phone}
        </div>
      ),
      width: 200,
    },
    {
      field: 'treatment',
      headerName: <div className="gridHeaderText">Treatment</div>,
      width: 200,
    },
    {
      field: 'description',
      headerName: <div className="gridHeaderText">Description</div>,
      width: 350,
    },
    {
      field: 'payment',
      headerName: <div className="gridHeaderText">Payment</div>,
      width: 120,
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
              ]);
              setPatientData(null);
              setDoctorData(null);
              setIsDisabled(true);
            }}
          >
            Filter
          </Button>

          <div style={{ display: "flex", gap: "1rem" }}>
            <div>
              <a
                className={`btn btn-outline-success d-flex align-items-center p-2 ${isDisabled ? "disabled-link" : ""}`}
                href={isDisabled || patientsForm.length === 0 ? "#" : reportUrl}
                target="_blank"
                onClick={(e) => {
                  if (patientsForm && patientsForm.length === 0) {
                    e.preventDefault();
                    return toast.error("No data found for this filter");
                  }

                  if (isDisabled) {
                    e.preventDefault();
                  }
                }}
              >
                <Button className={PatientStyle.addBtn} variant="contained" disabled={isDisabled}>
                  Generate Invoice
                </Button>
              </a>
              <p>{message}</p>
            </div>

            <div>
              <a
                className={`btn btn-outline-success d-flex align-items-center p-2 ${isDisabled ? "disabled-link" : ""}`}
                href={isDisabled || patientsForm.length === 0 ? "#" : receiptUrl}
                target="_blank"
                onClick={(e) => {
                  if (patientsForm && patientsForm.length === 0) {
                    e.preventDefault();
                    return toast.error("No data found for this filter");
                  }

                  if (isDisabled) {
                    e.preventDefault();
                  }
                }}
              >
                <Button className={PatientStyle.addBtn} variant="contained" disabled={isDisabled}>
                  Generate Receipt
                </Button>
              </a>
              <p>{message}</p>
            </div>

            <div>
              <a
                className={`btn btn-outline-success d-flex align-items-center p-2 ${isDisabled ? "disabled-link" : ""}`}
                href={isDisabled || patientsForm.length === 0 ? "#" : prescriptionUrl}
                target="_blank"
                onClick={(e) => {
                  if (patientsForm && patientsForm.length === 0) {
                    e.preventDefault();
                    return toast.error("No data found for this filter");
                  }

                  if (isDisabled) {
                    e.preventDefault();
                  }
                }}
              >
                <Button className={PatientStyle.addBtn} variant="contained" disabled={isDisabled}>
                  Generate Prescription
                </Button>
              </a>
              <p>{message}</p>
            </div>

          </div>

        </div>
      </div>

      {filter &&
        <Card className={PatientStyle.tableCard} style={{ marginBottom: "1rem", display: "flex" }}>
          <div style={{ width: "50%", padding: "1rem" }}>
            <SearchDoctor open={filter} setData={setDoctorData} data={doctorData} variant="outlined" name="doctor" />
          </div>

          <div style={{ width: "50%", padding: "1rem" }}>
            <SearchPatient open={filter} setData={setPatientData} />
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