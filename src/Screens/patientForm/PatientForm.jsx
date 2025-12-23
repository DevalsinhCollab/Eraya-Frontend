import PatientStyle from './doctor.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { Button, Card, Tooltip } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import PatientFormDialog from './PatientFormDialog';
import { DataGrid } from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import { deletePatientForm, getPatientsForm } from '../../apis/patientFormSlice';
import { getPatients } from '../../apis/patientSlice';
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

const COMPARE_FIELDS = [
  // Doctor
  { key: "doctor.name", label: "Doctor Name", group: "Doctor" },
  { key: "referenceDoctor.name", label: "Reference Doctor", group: "Doctor" },

  // // Patient
  // { key: "patient.name", label: "Patient Name", group: "Patient" },
  // { key: "patient.age", label: "Age", group: "Patient" },
  // { key: "patient.gender", label: "Gender", group: "Patient" },
  // { key: "patient.phone", label: "Phone", group: "Patient" },
  // { key: "patient.address", label: "Address", group: "Patient" },
  // { key: "patient.city", label: "City", group: "Patient" },
  // { key: "patient.state", label: "State", group: "Patient" },
  // { key: "patient.pincode", label: "Pincode", group: "Patient" },
  // { key: "patient.occupation", label: "Occupation", group: "Patient" },

  // Visit
  { key: "date", label: "Visited Date", group: "Visit", type: "date" },
  { key: "treatment", label: "Treatment", group: "Visit" },
  { key: "description", label: "Description", group: "Visit" },

  // Clinical
  { key: "cc", label: "Chief Complaint", group: "Clinical" },
  { key: "history", label: "History", group: "Clinical" },
  { key: "examinationComment", label: "Examination Comment", group: "Clinical" },
  { key: "nrs", label: "Pain Scale (NRS)", group: "Clinical" },
  { key: "flex", label: "Flex", group: "Clinical" },
  { key: "abd", label: "ABD", group: "Clinical" },
  { key: "spasm", label: "Spasm", group: "Clinical" },
  { key: "stiffness", label: "Stiffness", group: "Clinical" },
  { key: "tenderness", label: "Tenderness", group: "Clinical" },
  { key: "effusion", label: "Effusion", group: "Clinical" },
  { key: "mmt", label: "MMT", group: "Clinical" },
  { key: "joint", label: "Joint", group: "Clinical" },

  // Prescription
  { key: "dosage1", label: "Dosage 1", group: "Prescription" },
  { key: "dosage2", label: "Dosage 2", group: "Prescription" },
  { key: "dosage3", label: "Dosage 3", group: "Prescription" },
  { key: "dosage4", label: "Dosage 4", group: "Prescription" },
  { key: "dosage5", label: "Dosage 5", group: "Prescription" },
  { key: "dosage6", label: "Dosage 6", group: "Prescription" },
  { key: "prescribeMedicine", label: "Prescribed Medicine", group: "Prescription" },

  // Payment
  { key: "payment", label: "Payment Amount", group: "Payment" },
  { key: "paymentType", label: "Payment Type", group: "Payment" },
  { key: "numOfSessions", label: "No. of Sessions", group: "Payment" },

  // Meta
  { key: "assessBy", label: "Assessed By", group: "Meta" },
];


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
  const [compareForms, setCompareForms] = useState([]);
  const [selectedFormA, setSelectedFormA] = useState('');
  const [selectedFormB, setSelectedFormB] = useState('');
  const [openCompareDialog, setOpenCompareDialog] = useState(false);
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
  const { patients: patientsList = [] } = useSelector((state) => state.patientData || {});

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

  // load patients for dropdown
  useEffect(() => {
    (async () => {
      try {
        await dispatch(getPatients({ page: 0, pageSize: 1000 }));
      } catch (err) {
        console.error('Failed to load patients', err);
      }
    })();
  }, [dispatch]);

  // Fetch all forms for compare when a patient is selected
  const fetchFormsForCompare = async (patientId) => {
    try {
      if (!patientId) {
        setCompareForms([]);
        return;
      }

      const payload = {
        page: 0,
        pageSize: 1000,
        patient: patientId,
      };

      const resp = await dispatch(getPatientsForm(payload));
      if (resp?.payload?.success) {
        setCompareForms(resp.payload.data || []);
      } else {
        setCompareForms([]);
      }
    } catch (err) {
      console.error('Failed to load forms for compare', err);
      setCompareForms([]);
    }
  };

  useEffect(() => {
    callApi();
  }, [page, pageSize, dispatch, loggedIn, search, patientData, doctorData, dateRange]);

  // when patient selection changes, refresh compare-pool
  useEffect(() => {
    fetchFormsForCompare(patientData?.patient?.value || '');
    // reset selects
    setSelectedFormA('');
    setSelectedFormB('');
  }, [patientData]);

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

  const getValue = (obj, path) =>
  path.split(".").reduce((o, k) => (o ? o[k] : ""), obj) ?? "";

const formatValue = (value, type) => {
  if (!value) return "—";
  if (type === "date") return moment(value).format("DD/MM/YYYY");
  return String(value);
};


  const columns = [
    // {
    //   field: 'actions',
    //   headerName: <div className="gridHeaderText">Actions</div>,
    //   width: 200,
    //   sortable: false,
    //   filterable: false,
    //   renderCell: (params) => (
    //     <div>
    //       <Tooltip title="Edit">
    //         <IconButton
    //           onClick={() => handleEdit(params.row)}
    //           color="primary"
    //           aria-label="edit"
    //         >
    //           <EditIcon />
    //         </IconButton>
    //       </Tooltip>

    //       <Tooltip title="Delete">
    //         <IconButton
    //           onClick={() => handleDelete(params.row)}
    //           color="error"
    //           aria-label="delete"
    //         >
    //           <DeleteIcon />
    //         </IconButton>
    //       </Tooltip>

    //       <Tooltip title="Generate Certificate">
    //         <IconButton
    //           onClick={() => {
    //             const url = `${process.env.REACT_APP_BACKEND_API}/patientform/generatecertificate?id=${params.row._id}`;
    //             window.open(url, '_blank');
    //           }}
    //           color="success"
    //           aria-label="generate-certificate"
    //         >
    //           <WorkspacePremiumIcon />
    //         </IconButton>
    //       </Tooltip>

    //       <Tooltip title="Assessment Form">
    //         <IconButton
    //           onClick={() => {
    //             navigate(`/assessmentform/${params.row._id}`)
    //           }}
    //           color="secondary"
    //           aria-label="generate-certificate"
    //         >
    //           <AssessmentIcon />
    //         </IconButton>
    //       </Tooltip>

    //     </div>
    //   ),
    // },
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
      {/* <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
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
      </div> */}

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
          {/* <Button
            className={PatientStyle.addBtn}
            variant="contained"
            startIcon={<HealthAndSafetyIcon />}
            onClick={() => { setOpen(true); setOperationMode("Add") }}
          >
            Add Data
          </Button> */}
        </div>
        {/* Patient selector + Compare Controls */}
        <Card sx={{ padding: '12px', margin: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 300 }} size="small">
              <InputLabel id="select-patient-label">Select Patient</InputLabel>
              <Select
                labelId="select-patient-label"
                value={patientData?.patient?.value || ''}
                label="Select Patient"
                onChange={(e) => {
                  const pid = e.target.value;
                  // find patient from patientsList
                  const p = patientsList.find((x) => x._id === pid) || null;
                  if (p) {
                    const opt = { label: `${p.name} (${p.phone || ''})`, value: p._id, _id: p._id, name: p.name, phone: p.phone };
                    setPatientData({ patient: opt });
                    // fetch forms for compare
                    fetchFormsForCompare(p._id);
                  } else {
                    setPatientData(null);
                    setCompareForms([]);
                  }
                }}
              >
                <MenuItem value="">None</MenuItem>
                {patientsList.map((p) => (
                  <MenuItem key={p._id} value={p._id}>{`${p.name} (${p.phone || ''})`}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* small helper text */}
            <div style={{ flex: 1 }}>
              <Typography variant="caption">Choose a patient to enable form comparison</Typography>
            </div>
          </div>
        </Card>

        {patientData?.patient?.value ? (
          <Card sx={{ padding: '12px', margin: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <FormControl sx={{ minWidth: 240 }} size="small">
                <InputLabel id="form-a-label">Form A</InputLabel>
                <Select
                  labelId="form-a-label"
                  value={selectedFormA}
                  label="Form A"
                  onChange={(e) => setSelectedFormA(e.target.value)}
                >
                  <MenuItem value="">None</MenuItem>
                  {compareForms.map((f) => (
                    <MenuItem key={f._id} value={f._id}>{`${f.treatment || 'Untitled'} - ${f.date ? moment(f.date).format('DD/MM/YYYY') : ''}`}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 240 }} size="small">
                <InputLabel id="form-b-label">Form B</InputLabel>
                <Select
                  labelId="form-b-label"
                  value={selectedFormB}
                  label="Form B"
                  onChange={(e) => setSelectedFormB(e.target.value)}
                >
                  <MenuItem value="">None</MenuItem>
                  {compareForms.map((f) => (
                    <MenuItem key={f._id} value={f._id}>{`${f.treatment || 'Untitled'} - ${f.date ? moment(f.date).format('DD/MM/YYYY') : ''}`}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                disabled={!selectedFormA || !selectedFormB || selectedFormA === selectedFormB}
                onClick={() => setOpenCompareDialog(true)}
              >
                Compare
              </Button>

              <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Typography variant="caption">Select two forms to compare side-by-side</Typography>
              </div>

              {/* Show small previews for selected forms */}
              <div style={{ width: '100%', display: 'flex', gap: '12px', marginTop: 12, flexWrap: 'wrap' }}>
                <div style={{ minWidth: 240 }}>
                  <Typography variant="subtitle2">Form A Preview</Typography>
                  {selectedFormA ? (
                    (() => {
                      const fa = compareForms.find((x) => x._id === selectedFormA) || {};
                      return <div style={{ padding: 8, backgroundColor: '#fafafa', borderRadius: 6 }}>{fa.treatment || '—'}<br />{fa.date ? moment(fa.date).format('DD/MM/YYYY') : ''}</div>;
                    })()
                  ) : (
                    <div style={{ padding: 8, color: '#888' }}>No form selected</div>
                  )}
                </div>

                <div style={{ minWidth: 240 }}>
                  <Typography variant="subtitle2">Form B Preview</Typography>
                  {selectedFormB ? (
                    (() => {
                      const fb = compareForms.find((x) => x._id === selectedFormB) || {};
                      return <div style={{ padding: 8, backgroundColor: '#fafafa', borderRadius: 6 }}>{fb.treatment || '—'}<br />{fb.date ? moment(fb.date).format('DD/MM/YYYY') : ''}</div>;
                    })()
                  ) : (
                    <div style={{ padding: 8, color: '#888' }}>No form selected</div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card sx={{ padding: '12px', margin: '12px' }}>
            <Typography variant="body2">Please select a patient first to enable form comparison.</Typography>
          </Card>
        )}
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
        {/* Compare Dialog */}
       <Dialog
  open={openCompareDialog}
  onClose={() => setOpenCompareDialog(false)}
  fullWidth
  maxWidth="lg"
>
  {(() => {
    const formA = compareForms.find((x) => x._id === selectedFormA) || {};
    const formB = compareForms.find((x) => x._id === selectedFormB) || {};

    const rows = COMPARE_FIELDS.map((f) => {
      const a = formatValue(getValue(formA, f.key), f.type);
      const b = formatValue(getValue(formB, f.key), f.type);
      return { ...f, a, b, diff: a !== b };
    });

    const diffCount = rows.filter((r) => r.diff).length;

    const grouped = rows.reduce((acc, r) => {
      acc[r.group] = acc[r.group] || [];
      acc[r.group].push(r);
      return acc;
    }, {});

    return (
      <>
        {/* HEADER */}
        <DialogTitle sx={{ pb: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6">Patient Form Comparison</Typography>
            <Typography
              sx={{
                color: diffCount ? "#d97706" : "#059669",
                fontWeight: 600,
              }}
            >
              {diffCount
                ? `${diffCount} Differences Found`
                : "No Differences"}
            </Typography>
          </div>
        </DialogTitle>

        {/* CONTENT */}
        <DialogContent sx={{ backgroundColor: "#F8FAFC" }}>
          {Object.entries(grouped).map(([group, fields]) => (
            <Card key={group} sx={{ mb: 3 }}>
              <Typography
                sx={{
                  px: 2,
                  py: 1,
                  fontWeight: 700,
                  backgroundColor: "#EEF2F6",
                }}
              >
                {group}
              </Typography>

              {fields.map((r) => (
                <div
                  key={r.key}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "240px 1fr 1fr",
                    gap: "12px",
                    padding: "12px",
                    backgroundColor: r.diff ? "#FFF4E5" : "#FFFFFF",
                    borderBottom: "1px solid #E5E7EB",
                  }}
                >
                  <Typography sx={{ fontWeight: 600 }}>
                    {r.label}
                  </Typography>

                  <Typography>{r.a}</Typography>
                  <Typography>{r.b}</Typography>
                </div>
              ))}
            </Card>
          ))}
        </DialogContent>

        {/* FOOTER */}
        <DialogActions>
          <Button variant="outlined" onClick={() => setOpenCompareDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </>
    );
  })()}
</Dialog>
      </Card>
    </div>
  );
}