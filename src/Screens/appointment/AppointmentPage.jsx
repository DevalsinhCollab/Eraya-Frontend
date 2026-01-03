import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Chip,
  Tooltip,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { getDoctors } from '../../apis/doctorSlice';
// import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { DataGrid } from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PaymentIcon from '@mui/icons-material/Payment';
import ArticleIcon from '@mui/icons-material/Article';

import HistoryIcon from '@mui/icons-material/History';
import { toast } from 'react-toastify';
import {
  deleteAppointment,
  getAllAppointments,
  updateAppointment,
} from '../../apis/appointmentSlice';
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
import Style from '../patientForm/doctor.module.scss';
import PatientFormDialog from '../patientForm/PatientFormDialog';
import PaymentDialog from '../patientForm/PaymentDialog';
import TransactionHistoryDialog from '../patientForm/TransactionHistoryDialog';
import { set } from 'lodash';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import SessionDialog from './SessionDialog';
import SessionSummaryDialog from './SessionSummaryDialog';

export default function AppointmentPage({ search }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [filter, setFilter] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [doctorData, setDoctorData] = useState(null);
  const [isDisabled, setIsDisabled] = useState(true);
  const [message, setMessage] = useState('');
  const [dateRange, setDateRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: 'selection',
      color: '#3d91ff',
    },
  ]);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [operationMode, setOperationMode] = useState('Edit');
  const [openPayment, setOpenPayment] = useState(false);
  const [openTransaction, setOpenTransaction] = useState(false);
  const [selectedApptId, setSelectedApptId] = useState(null);
  const [selectedApptData, setSelectedApptData] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedPatientFormId, setSelectedPatientFormId] = useState(null);
  const [appointmentOptions, setAppointmentOptions] = useState([]);
  const [selectedAppointmentDate, setSelectedAppointmentDate] = useState(null);

  const resolveId = (data) => {
    if (!data) return '';
    return (
      data?.doctor?.value ||
      data?.value ||
      data?._id ||
      data?.doctor?._id ||
      data?.patient?._id ||
      data?.patient?._id ||
      ''
    );
  };

  const { loggedIn } = useSelector((state) => state.authData);
  const { appointments, apptLoading, totalCount } = useSelector((state) => state.appointmentData);

  // const totalCount = appointments?.length || 0;
  async function callApi() {
    const payload = {
      page,
      pageSize,
      search: search || '',
      doctorId: resolveId(doctorData) || '',
      patientId: resolveId(patientData) || '',
    };

    if (dateRange[0]?.startDate) {
      payload.startDate = moment(dateRange[0].startDate).startOf('day').toISOString();
    }

    if (dateRange[0]?.endDate) {
      payload.endDate = moment(dateRange[0].endDate).endOf('day').toISOString();
    }

    dispatch(getAllAppointments(payload));
  }

  useEffect(() => {
    callApi();
  }, [page, pageSize, dispatch, loggedIn, search, patientData, doctorData, dateRange]);

  useEffect(() => {
    if (!doctorData) {
      setIsDisabled(true);
      setMessage('Please select a doctor');
      return;
    }

    if (!patientData) {
      setIsDisabled(true);
      setMessage('Please select a patient');
      return;
    }

    // if (!dateRange[0]?.startDate) {
    //   setIsDisabled(true);
    //   setMessage('Please select start date');
    //   return;
    // }

    // if (!dateRange[0]?.endDate) {
    //   setIsDisabled(true);
    //   setMessage('Please select end date');
    //   return;
    // }

    setIsDisabled(false);
    setMessage('');
  }, [doctorData, patientData, dateRange]);
  const appointmentDateForUrl = selectedAppointmentDate
    ? moment(selectedAppointmentDate).format('DD/MM/YYYY')
    : '';

  const doctorIdForUrl = resolveId(doctorData) || '';
  const patientIdForUrl = resolveId(patientData) || '';

  const reportUrl = `${process.env.REACT_APP_BACKEND_API}/appointment/generatereport?doctor=${doctorIdForUrl}&patient=${patientIdForUrl}&appointmentDate=${appointmentDateForUrl}`;

  const receiptUrl = `${process.env.REACT_APP_BACKEND_API}/appointment/generatereceipt?doctor=${doctorIdForUrl}&patient=${patientIdForUrl}&appointmentDate=${appointmentDateForUrl}`;

  const prescriptionUrl = `${process.env.REACT_APP_BACKEND_API}/appointment/generateprescription?doctor=${doctorIdForUrl}&patient=${patientIdForUrl}&appointmentDate=${appointmentDateForUrl}`;

  const handleGenerate = (type) => {
    const base = `${process.env.REACT_APP_BACKEND_API}/appointment/`;

    // If an appointment is selected and has a patientFormId, prefer that
    if (
      selectedAppointment &&
      selectedAppointment.patientFormId &&
      selectedAppointment.patientFormId._id
    ) {
      const pid = selectedAppointment.patientFormId._id;
      const url = `${base}${type}?patientFormId=${pid}`;
      window.open(url, '_blank');
      return;
    }

    // Fallback to previous behaviour (doctor + patient + appointmentDate)
    if (type === 'generatereport') window.open(reportUrl, '_blank');
    else if (type === 'generatereceipt') window.open(receiptUrl, '_blank');
    else if (type === 'generateprescription') window.open(prescriptionUrl, '_blank');
  };

  const handlePaginationModelChange = (model) => {
    setPage(model.page);
    setPageSize(model.pageSize);
  };

  const handleEdit = (data) => {
    // navigate(`/appointmentform/${data._id}`);
    setOpen(true);
    setEditData(data);
    setOperationMode('Edit');
  };

  const handleVisitStatus = (data) => {
    dispatch(updateAppointment({ ...data, visitStatus: true })).then(() => {
      callApi();
    });
  };

  const handleDelete = async (data) => {
    const response = await dispatch(deleteAppointment(data._id));

    if (response?.payload?.success) {
      toast.success(response?.payload.message);
      callApi();
    } else {
      toast.error('Error deleting appointment');
    }
  };

  const [openSessionDialog, setOpenSessionDialog] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    sessionNo: 1,
    treatment: '',
    sessionDesc: '',
    payment: 0,
    paidAmount: 0,
    remainingAmount: 0,
    paymentMode: 'cash',
  });
  const [selectedApptForSession, setSelectedApptForSession] = useState(null);
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [openSummaryDialog, setOpenSummaryDialog] = useState(false);
  const [selectedApptForSummary, setSelectedApptForSummary] = useState(null);
  const { doctors } = useSelector((state) => state.doctorData || { doctors: [] });

  useEffect(() => {
    // load doctors for select
    dispatch(getDoctors({ page: 0, pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    if (doctors) setDoctorOptions(doctors);
  }, [doctors]);

  useEffect(() => {
    const opts = (appointments || []).map((a) => ({
      _id: a._id,
      label: `${a.patient?.name || a.patientId?.name || 'Patient'} - ${
        a.appointmentDate ? moment(a.appointmentDate).format('DD/MM/YYYY') : 'N/A'
      } - ${a.startTime || ''}`,
      appointment: a,
    }));
    setAppointmentOptions(opts);
  }, [appointments]);

  // clear selected appointment date when patient changes
  useEffect(() => {
    setSelectedAppointmentDate(null);
    setSelectedAppointment(null);
    setSelectedPatientFormId(null);
  }, [patientData]);

  const toggleSelectAppointment = (appt) => {
    if (!appt) return;
    if (selectedAppointment && selectedAppointment._id === appt._id) {
      setSelectedAppointment(null);
      setSelectedPatientFormId(null);
    } else {
      setSelectedAppointment(appt);
      setSelectedPatientFormId(appt?.patientFormId?._id || null);
    }
  };

  const handleOpenSession = (appt) => {
    const nextSessionNo = (appt.sessions && appt.sessions.length + 1) || 1;
    const treatmentVal = appt.treatment || appt.patientFormId?.treatment || '';
    const paymentVal = appt.payment || 0;
    setSelectedApptForSession(appt);
    setSessionForm({
      sessionNo: nextSessionNo,
      treatment: treatmentVal,
      sessionDesc: '',
      payment: paymentVal,
      paidAmount: 0,
      remainingAmount: paymentVal,
      paymentMode: 'cash',
    });
    setOpenSessionDialog(true);
  };

  const handleSessionFormChange = (field, value) => {
    setSessionForm((p) => {
      const next = { ...p, [field]: value };
      if (field === 'paidAmount' || field === 'payment') {
        const paymentNum = Number(next.payment || 0);
        const paidNum = Number(next.paidAmount || 0);
        next.remainingAmount = Math.max(0, paymentNum - paidNum);
      }
      return next;
    });
  };

  const handleSaveSession = async (formData) => {
    if (!formData.sessionDate) return toast.error('Please select session date');

    // formData comes from SessionDialog
    if (!selectedApptForSession) return;
    const appt = selectedApptForSession;
    // const newSession = {
    //   sessionNo: formData.sessionNo,
    //   doctorId: formData.doctorId || appt.doctorId?._id || appt.doctorId,
    //   treatment: formData.treatment || appt.treatment || appt.patientFormId?.treatment,
    //   sessionDesc: formData.sessionDesc,
    //   sessionDate: formData.sessionDate ? new Date(formData.sessionDate) : undefined,
    //   payment: Number(formData.payment || 0),
    //   paidAmount: Number(formData.paidAmount || 0),
    //   remainingAmount: Number(formData.remainingAmount || 0),
    //   paymentMode: formData.paymentMode,
    //   paymentLogs: formData.paidAmount
    //     ? [
    //         {
    //           paidAmount: Number(formData.paidAmount || 0),
    //           receiveBy: (loggedIn && loggedIn.userId) || null,
    //           paymentDate: new Date(),
    //         },
    //       ]
    //     : [],
    // };

    const newSession = {
      sessionNo: formData.sessionNo,
      doctorId: formData.doctorId || appt.doctorId?._id || appt.doctorId,
      treatment: formData.treatment || appt.treatment || appt.patientFormId?.formData?.treatment,

      sessionDesc: formData.sessionDesc,
      sessionDate: formData.sessionDate ? new Date(formData.sessionDate) : undefined,

      // 🔥 IMPORTANT FIX STARTS HERE
      prescribeMedicine: formData.prescribeMedicine === 'yes' ? 'yes' : 'no',

      prescriptions: formData.prescribeMedicine === 'yes' ? formData.prescriptions || [] : [],
      // 🔥 IMPORTANT FIX ENDS HERE

      payment: Number(formData.payment || 0),
      paidAmount: Number(formData.paidAmount || 0),
      remainingAmount: Number(formData.remainingAmount || 0),
      paymentMode: formData.paymentMode,

      paymentLogs: formData.paidAmount
        ? [
            {
              paidAmount: Number(formData.paidAmount || 0),
              receiveBy: (loggedIn && loggedIn.userId) || null,
              paymentDate: new Date(),
            },
          ]
        : [],
    };

    const updatedSessions = [...(appt.sessions || []), newSession];

    const payload = {
      _id: appt._id,
      sessions: updatedSessions,
    };

    const response = await dispatch(updateAppointment(payload));
    if (response?.payload?.success) {
      toast.success('Session added');
      setOpenSessionDialog(false);
      callApi();
    } else {
      toast.error('Error adding session');
    }
  };

  const columns = [
    {
      field: 'select',
      headerName: <div className="gridHeaderText">Select</div>,
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Checkbox
          checked={selectedAppointment && selectedAppointment._id === params.row._id}
          onChange={() => toggleSelectAppointment(params.row)}
          inputProps={{ 'aria-label': 'select appointment' }}
          disabled={!patientData || !doctorData}
        />
      ),
    },
    {
      field: 'actions',
      headerName: <div className="gridHeaderText">Actions</div>,
      width: 320,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div>
          <Tooltip title="Edit">
            <IconButton
              onClick={() => handleEdit(params.row)}
              color="primary"
              aria-label="edit"
              disabled={params.row.docApproval == 'rejected'}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete">
            <IconButton onClick={() => handleDelete(params.row)} color="error" aria-label="delete">
              <DeleteIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Generate Certificate">
            <IconButton
              onClick={() => {
                const url = `${process.env.REACT_APP_BACKEND_API}/appointment/generatecertificate?id=${params.row._id}`;
                window.open(url, '_blank');
              }}
              color="success"
              aria-label="generate-certificate"
              disabled={params.row.docApproval == 'rejected'}
            >
              <WorkspacePremiumIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Assessment Form">
            <IconButton
              onClick={() => {
                navigate(`/assessmentform/${params.row.patientFormId._id}`);
              }}
              color="secondary"
              aria-label="assessment-form"
              disabled={params.row.docApproval == 'rejected'}
            >
              <AssessmentIcon />
            </IconButton>
          </Tooltip>
          {params.row.patientFormId.formData?.treatment && (
            <Tooltip title="Add Session">
              <IconButton
                color="primary"
                aria-label="add-session"
                onClick={() => handleOpenSession(params.row)}
                disabled={params.row.docApproval == 'rejected'}
              >
                <AddCircleOutlineIcon />
              </IconButton>
            </Tooltip>
          )}

          {params.row.sessions?.length > 0 && (
            <Tooltip title="Summary of Sessions">
              <IconButton
                color="success"
                aria-label="payment"
                disabled={params.row.docApproval == 'rejected'}
                onClick={() => {
                  setSelectedApptForSummary(params.row);
                  setOpenSummaryDialog(true);
                }}
              >
                <ArticleIcon />
              </IconButton>
            </Tooltip>
          )}
          {Array.isArray(params.row.sessions) &&
            params.row.sessions.some((session) => Number(session.remainingAmount) > 0) && (
              <Tooltip title="Add Payment">
                <IconButton
                  onClick={() => {
                    setSelectedApptId(params.row._id);
                    setSelectedApptData(params.row);
                    setOpenPayment(true);
                  }}
                  color="warning"
                  aria-label="payment"
                  disabled={params.row.docApproval === 'rejected'}
                >
                  <PaymentIcon />
                </IconButton>
              </Tooltip>
            )}

          {/* {params.row.visitStatus !== true && (
            <Tooltip title="Visit Status">
              <IconButton
                onClick={() => handleVisitStatus(params.row)}
                color="info"
                aria-label="visit-status"
                disabled={params.row.docApproval == 'rejected'}
              >
                <HowToRegIcon />
              </IconButton>
            </Tooltip>
          )} */}

          {/* 
          {params.row.paymentLog.length !== 0 && (
            <Tooltip title="View Transaction History">
              <IconButton
                onClick={() => {
                  setSelectedApptData(params.row);
                  setOpenTransaction(true);
                }}
                color="info"
                aria-label="transaction-history"
                disabled={params.row.docApproval == 'rejected'}
              >
                <HistoryIcon />
              </IconButton>
            </Tooltip>
          )} */}
          {/* {params.row.docApproval === 'pending' && (
              <>
                <Tooltip title="Approve Appointment">
                  <IconButton
                    onClick={() => {
                      dispatch(updateAppointment({ ...params.row, docApproval: 'approved' })).then(
                        () => {
                          callApi();
                        },
                      );
                    }}
                    color="success"
                    aria-label="approve-appointment"
                  >
                    <CheckCircleOutlineIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Decline Appointment">
                  <IconButton
                    onClick={() => handleDelete(params.row)}
                    color="error"
                    aria-label="decline-appointment"
                  >
                    <CancelIcon />
                  </IconButton>
                </Tooltip>
              </>
            )} */}
        </div>
      ),
    },
    {
      field: 'clinicName',
      headerName: <div className="gridHeaderText">Clinic Name</div>,
      renderCell: (params) => <div>{params && params.row && params.row.clinicId?.name}</div>,
      width: 150,
    },
    {
      field: 'doctor',
      headerName: <div className="gridHeaderText">Doctor Name</div>,
      renderCell: (params) => (
        <div>{params && params.row && (params.row.doctor?.name || params.row.doctorId?.name)}</div>
      ),
      width: 150,
    },
    {
      field: 'patient',
      headerName: <div className="gridHeaderText">Patient Name</div>,
      renderCell: (params) => (
        <div>
          {params && params.row && (params.row.patient?.name || params.row.patientId?.name)}
        </div>
      ),
      width: 170,
    },
    {
      field: 'patient.phone',
      headerName: <div className="gridHeaderText">Patient Phone</div>,
      renderCell: (params) => (
        <div>
          {params && params.row && (params.row.patient?.phone || params.row.patientId?.phone)}
        </div>
      ),
      width: 180,
    },
    {
      field: 'treatment',
      headerName: <div className="gridHeaderText">Treatment</div>,
      renderCell: (params) => (
        <div>
          {/* {params.row.patientFormId
            ? `${params && params.row && params.row?.patientFormId?.formData?.treatment}`
            : 'N/A'} */}
            {params?.row?.patientFormId?.formData?.treatment || params?.row?.patientFormId?.formData?.dentalQuestions?.specificConcern || params?.row?.patientFormId?.formData?.estheticsQuestions?.skinConcern  || 'N/A'}

        </div>
      ),
      width: 200,
    },
    // {
    //   field: 'description',
    //   headerName: <div className="gridHeaderText">Description</div>,
    //   width: 300,
    // },
    {
      field: 'assessmentFee',
      headerName: <div className="gridHeaderText">Assessment Fee</div>,
      renderCell: (params) => (
        <div>
          {params.row.patientFormId
            ? `${params && params.row && params.row?.patientFormId?.payment}`
            : 'N/A'}
        </div>
      ),
      width: 150,
    },
    // {
    //   field: 'payment',
    //   headerName: <div className="gridHeaderText">Payment</div>,
    //   width: 120,
    // },
    // {
    //   field: 'remainingAmount',
    //   headerName: <div className="gridHeaderText">Remaining</div>,
    //   width: 120,
    // },
    // {
    //   field: 'paidAmount',
    //   headerName: <div className="gridHeaderText">Paid Amount</div>,
    //   width: 120,
    // },
    // {
    //   field: 'date',
    //   headerName: <div className="gridHeaderText">Date</div>,
    //   renderCell: (params) => (
    //     <div>
    //       {params && params.row && params.row.date && moment(params.row.date).format('DD/MM/YYYY')}
    //     </div>
    //   ),
    //   width: 150,
    // },
    {
      field: 'appointmentDate',
      headerName: <div className="gridHeaderText">Appt. Date</div>,
      renderCell: (params) => (
        <div>
          {params && params.row && params.row.appointmentDate
            ? moment(params.row.appointmentDate).format('DD/MM/YYYY')
            : 'N/A'}
        </div>
      ),
      width: 150,
    },

    {
      field: 'Time',
      headerName: <div className="gridHeaderText">Time</div>,
      renderCell: (params) => (
        <div>
          {params.row.startTime
            ? `${params && params.row && params.row.startTime} To ${
                params && params.row && params.row.endTime
              }`
            : 'N/A'}
        </div>
      ),
      width: 150,
    },
    // {
    //   field: 'visitStatus',
    //   headerName: <div className="gridHeaderText">Visit Status</div>,
    //   renderCell: (params) => (
    //     <div>
    //       {(params && params.row && params.row.visitStatus == true && (
    //         <Chip color="success" label="Visited" />
    //       )) ||
    //         'N/A'}
    //     </div>
    //   ),
    //   width: 120,
    // },
    {
      field: 'docApproval',
      headerName: <div className="gridHeaderText">Appointment Status</div>,
      renderCell: (params) => (
        <div>
          {params && params.row && params.row.docApproval == 'approved' ? (
            <Chip color="success" label="Approved" />
          ) : params.row.docApproval == 'rejected' ? (
            <Chip color="error" label="Rejected" />
          ) : (
            'N/A'
          )}
        </div>
      ),
      width: 120,
    },
  ];

  return (
    <div className={Style.mainDataTable}>
      <Card
        className={Style.tableCard}
        sx={{
          mb: 2,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
        }}
      >
        {/* Doctor */}
        <div style={{ minWidth: 220 }}>
          <SearchDoctor
            open={true}
            setData={setDoctorData}
            data={doctorData}
            variant="outlined"
            name="doctor"
            size="small"
          />
        </div>

        {/* Patient */}
        <div style={{ minWidth: 220 }}>
          <SearchPatient open={true} setData={setPatientData} data={patientData} size="small" />
        </div>

        {/* Start Date */}
        <TextField
          size="small"
          label="Start Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={dateRange[0].startDate ? moment(dateRange[0].startDate).format('YYYY-MM-DD') : ''}
          onChange={(e) =>
            setDateRange((prev) => [
              {
                ...prev[0],
                startDate: e.target.value ? new Date(e.target.value) : null,
              },
            ])
          }
        />

        {/* End Date */}
        <TextField
          size="small"
          label="End Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={dateRange[0].endDate ? moment(dateRange[0].endDate).format('YYYY-MM-DD') : ''}
          onChange={(e) =>
            setDateRange((prev) => [
              {
                ...prev[0],
                endDate: e.target.value ? new Date(e.target.value) : null,
              },
            ])
          }
        />

        {/* Clear */}
        <Button
          variant="outlined"
          color="error"
          onClick={() => {
            setDoctorData(null);
            setPatientData(null);
            setDateRange([
              {
                startDate: null,
                endDate: null,
                key: 'selection',
                color: '#3d91ff',
              },
            ]);
            setSelectedAppointmentDate(null);
            setSelectedAppointment(null);
            setSelectedPatientFormId(null);
            setIsDisabled(true);
          }}
        >
          Clear
        </Button>

        {/* Buttons */}
        <Button
          variant="contained"
          onClick={() => handleGenerate('generatereport')}
          disabled={isDisabled || !selectedPatientFormId}
        >
          Generate Invoice
        </Button>

        <Button
          variant="contained"
          disabled={isDisabled || !selectedPatientFormId}
          onClick={() => handleGenerate('generatereceipt')}
        >
          Generate Receipt
        </Button>

        <Button
          variant="contained"
          disabled={isDisabled || !selectedPatientFormId}
          onClick={() => handleGenerate('generateprescription')}
        >
          Generate Prescription
        </Button>
      </Card>

      <Card className={Style.tableCard}>
        <div className={Style.tableHeader}>
          <h2 className={Style.tableTitle}>Appointment</h2>
          {/* <Button
            className={Style.addBtn}
            variant="contained"
            startIcon={<HealthAndSafetyIcon />}
            onClick={() => navigate('/appointmentform')}
          >
            Add Data
          </Button> */}
        </div>
        <DataGrid
          sx={{
            color: '#000',
            backgroundColor: '#fff',
            fontSize: '1rem',
            height: 'auto',
            fontWeight: '600',
          }}
          rows={appointments || []}
          columns={columns}
          loading={apptLoading}
          pagination
          paginationMode="server"
          rowCount={totalCount}
          paginationModel={{ page: page, pageSize: pageSize }}
          // initialState={{
          //   ...appointments?.initialState,
          //   pagination: {
          //     ...appointments?.initialState?.pagination,
          //     paginationModel: {
          //       pageSize: pageSize,
          //     },
          //   },
          // }}
          // onPageChange={(newPage) => setPage(newPage)}
          // onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          onPaginationModelChange={handlePaginationModelChange}
          getRowId={(e) => e._id}
        />

        <SessionDialog
          open={openSessionDialog}
          onClose={() => setOpenSessionDialog(false)}
          appointment={selectedApptForSession}
          onSave={handleSaveSession}
          doctors={doctorOptions}
        />

        <SessionSummaryDialog
          open={openSummaryDialog}
          onClose={() => setOpenSummaryDialog(false)}
          appointment={selectedApptForSummary}
        />

        <PatientFormDialog
          open={open}
          editData={editData}
          setOpen={setOpen}
          operationMode={operationMode}
          setOperationMode={setOperationMode}
          callApi={callApi}
        />

        <PaymentDialog
          open={openPayment}
          handleClose={() => setOpenPayment(false)}
          appointmentId={selectedApptId}
          appointmentDetails={selectedApptData?._id}
          callApi={callApi}
        />

        <TransactionHistoryDialog
          open={openTransaction}
          setOpen={setOpenTransaction}
          paymentLog={(selectedApptData && selectedApptData.paymentLog) || []}
        />
      </Card>
    </div>
  );
}
