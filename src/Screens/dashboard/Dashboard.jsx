import DashStyle from './Dashboard.module.scss';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import {
  Card,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
} from '@mui/material';
import DoctorImg from '../../Img/doctor.png';
import DashApptIcon from '../../Img/dashAppt-icon.png';
import DashPatientIcon from '../../Img/dashPatient-icon.png';
import DashEarnBagIcon from '../../Img/dashEarnBag-icon.png';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { DataGrid } from '@mui/x-data-grid';
import { getProblemsByDocForDashboard } from '../../apis/problemSlice';
import { Link } from 'react-router-dom';
import {
  getDashboardCount,
  getRemainingPatients,
  getReceivedByPatient,
} from '../../apis/dashboardSlice';
import { getExpenseStats } from '../../apis/expenseSlice';
import moment from 'moment';
import { ApiHeaderWithToken } from '../../common/apisHeaders';
import InfoIcon from '@mui/icons-material/Info';

export default function Dashboard(props) {
  const { greeting } = props;
  const dispatch = useDispatch();

  const { loggedIn } = useSelector((state) => state.authData);
  const {
    patientCount,
    doctorCount,
    patientFormCount,
    totalIncome,
    totalExpense,
    totalPaid,
    remainingAmount,
  } = useSelector((state) => state.dashboardData);
  const { expenseStats } = useSelector((state) => state.expenseData);


  // Expense filter states
  const [expenseFilterType, setExpenseFilterType] = useState('all');
  const [selectedExpenseDate, setSelectedExpenseDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [selectedExpenseMonth, setSelectedExpenseMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [openExpenseDialog, setOpenExpenseDialog] = useState(false);
  const [expenseExportLoading, setExpenseExportLoading] = useState(false);

  // useEffect(() => {
  //   if (loggedIn && loggedIn.role === 'D') {
  //     dispatch(getProblemsByDocForDashboard(loggedIn?._id));
  //   }
  // }, [loggedIn, dispatch]);

  useEffect(() => {
    dispatch(getDashboardCount());
  }, [dispatch]);

  // Load expense stats based on filter
  useEffect(() => {
    const params = {};
    if (expenseFilterType === 'date') {
      params.date = selectedExpenseDate;
    } else if (expenseFilterType === 'month') {
      const [year, month] = selectedExpenseMonth.split('-');
      const monthKey = `${month}-${year}`;
      params.month = monthKey;
    }
    dispatch(getExpenseStats(params));
  }, [expenseFilterType, selectedExpenseDate, selectedExpenseMonth, dispatch]);

  const [openRemaining, setOpenRemaining] = useState(false);
  const [openReceived, setOpenReceived] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [selectedReceivedPatientId, setSelectedReceivedPatientId] = useState(null);
  const [openReceivedDetail, setOpenReceivedDetail] = useState(false);
  const [receivedDetailRows, setReceivedDetailRows] = useState([]);
  const [receivedDetailLoading, setReceivedDetailLoading] = useState(false);
  const [detailPatientName, setDetailPatientName] = useState('');

  const { remainingPatients = [], receivedByPatient = [] } = useSelector(
    (state) => state.dashboardData || {},
  );

  const handleOpenRemaining = async () => {
    await dispatch(getRemainingPatients());
    setOpenRemaining(true);
  };

  const handleOpenReceived = async () => {
    await dispatch(getReceivedByPatient());
    setOpenReceived(true);
  };

  const handleOpenReceivedDetail = async (patientId, patientName = '') => {
    try {
      if (!patientId) return;
      setReceivedDetailLoading(true);
      setDetailPatientName(patientName || '');

      const params = new URLSearchParams();
      params.append('patientId', patientId);
      params.append('page', 0);
      params.append('pageSize', 1000);

      const url = `${process.env.REACT_APP_BACKEND_API}/appointment/getAllAppointments?${params.toString()}`;
      const headers = ApiHeaderWithToken().headers;
      const resp = await fetch(url, { headers });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || 'Failed to fetch patient appointments');
      }

      const data = await resp.json();
      const appts = data.data || [];

      const rows = appts.map((appt) => ({
        id: appt._id,
        Date: appt.appointmentDate
          ? moment(appt.appointmentDate).format('DD/MM/YYYY')
          : appt.date
          ? moment(appt.date).format('DD/MM/YYYY')
          : appt.createdAt
          ? moment(appt.createdAt).format('DD/MM/YYYY')
          : '',
        Month: appt.appointmentDate
          ? moment(appt.appointmentDate).format('MMMM YYYY')
          : appt.date
          ? moment(appt.date).format('MMMM YYYY')
          : '',
        Patient: appt.patientId ? appt.patientId.name : appt.patientName || '',
        Phone: appt.patientId ? appt.patientId.phone : appt.phone || '',
        Doctor: appt.doctorId ? appt.doctorId.name : '',
        Payment: Number(appt.payment || 0),
        Paid: Number(appt.paidAmount || 0),
      }));

      setReceivedDetailRows(rows);
      setOpenReceivedDetail(true);
    } catch (err) {
      console.error('Failed to load patient details', err);
      alert('Failed to load patient details');
    } finally {
      setReceivedDetailLoading(false);
    }
  };

  const remainingColumns = [
    { field: 'patientName', headerName: 'Patient', width: 200 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    { field: 'totalPayment', headerName: 'Total Payment', width: 150 },
    { field: 'totalPaid', headerName: 'Total Paid', width: 150 },
    { field: 'remaining', headerName: 'Remaining', width: 150 },
    {
      field: 'info',
      headerName: '',
      width: 60,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={async () => {
            const pid = params.row.patientId || params.row.patientId;
            const pname = params.row.patientName || '';
            await handleOpenReceivedDetail(pid, pname);
          }}
        >
          <InfoIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  const receivedColumns = [
    { field: 'patientName', headerName: 'Patient', width: 200 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    { field: 'totalPaid', headerName: 'Total Received', width: 150 },
    { field: 'totalPayment', headerName: 'Total Payment', width: 150 },
    {
      field: 'info',
      headerName: '',
      width: 60,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={async () => {
            const pid = params.row.patientId || params.row.patientId;
            const pname = params.row.patientName || '';
            await handleOpenReceivedDetail(pid, pname);
          }}
        >
          <InfoIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  const receivedDetailColumns = [
    { field: 'Date', headerName: 'Date', width: 110 },
    { field: 'Month', headerName: 'Month', width: 130 },
    { field: 'Patient', headerName: 'Patient', width: 140 },
    { field: 'Phone', headerName: 'Phone', width: 120 },
    { field: 'Doctor', headerName: 'Doctor', width: 150 },
    { field: 'Payment', headerName: 'Payment', width: 100 },
    { field: 'Paid', headerName: 'Paid', width: 100 },
  ];

  const getExpenseFilterLabel = () => {
    if (expenseFilterType === 'date') {
      return `Summary for ${moment(selectedExpenseDate).format('DD/MM/YYYY')}`;
    } else if (expenseFilterType === 'month') {
      return `Summary for ${moment(selectedExpenseMonth).format('MMMM YYYY')}`;
    }
    return 'Overall Summary';
  };

  const handleExportExpenseStats = async () => {
    try {
      setExpenseExportLoading(true);

      const params = new URLSearchParams();
      if (expenseFilterType === 'date') {
        params.append('date', selectedExpenseDate);
      } else if (expenseFilterType === 'month') {
        const [year, month] = selectedExpenseMonth.split('-');
        const monthKey = `${month}-${year}`;
        params.append('month', monthKey);
      }

      const url = `${process.env.REACT_APP_BACKEND_API}/expense/exportExpenseStats${
        params.toString() ? `?${params.toString()}` : ''
      }`;

      const headers = ApiHeaderWithToken().headers;
      const resp = await fetch(url, { headers });

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || 'Export failed');
      }

      const blob = await resp.blob();
      const disp = resp.headers.get('content-disposition');

      let filename = `Expense_Stats_${moment().format('DD-MM-YYYY')}.xlsx`;

      if (disp) {
        const m = /filename="?([^"]+)"?/.exec(disp);
        if (m && m[1]) filename = m[1];
      }

      const urlBlob = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlBlob;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(urlBlob);
    } catch (err) {
      console.error('Export failed', err);
      alert('Failed to download expense stats');
    } finally {
      setExpenseExportLoading(false);
    }
  };

  return (
    <div className={DashStyle.mainDash}>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={12}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card variant="outlined" className={`${DashStyle.gmCard} ${DashStyle.cardBorder}`}>
                  <div className={DashStyle.gmTitle}>
                    <h2 className={DashStyle.gmDocName}>
                      {/* Good&nbsp;Morning&nbsp; */}
                      {greeting}
                      <b className={DashStyle.gmDocNameText}>&nbsp;Dr.&nbsp;{loggedIn?.name}</b>
                    </h2>
                    <div className={DashStyle.gmSubTitle}>Have a Nice Day At Work</div>
                  </div>
                  <div className={DashStyle.docImg}>
                    <img src={DoctorImg} alt="DoctorImg" height={'100%'} />
                  </div>
                </Card>
              </Grid>
              <Grid item xs={12} lg={4}>
                <Link to={'/doctors'} style={{ textDecoration: 'none' }}>
                  <Card
                    variant="outlined"
                    className={`${DashStyle.cardBorder} ${DashStyle.dashCount}`}
                  >
                    <div className={DashStyle.subCount}>
                      <div className={DashStyle.apptIconBox}>
                        <img src={DashApptIcon} alt="DashApptIcon" height={'100%'} />
                      </div>
                      <div className={DashStyle.nameCount}>
                        <div className={DashStyle.name}>Doctors</div>
                        <h2 className={DashStyle.count}>{doctorCount || 0}</h2>
                      </div>
                    </div>
                  </Card>
                </Link>
              </Grid>
              <Grid item xs={12} lg={4}>
                <Link to={'/patients'} style={{ textDecoration: 'none' }}>
                  <Card
                    variant="outlined"
                    className={`${DashStyle.cardBorder} ${DashStyle.dashCount}`}
                  >
                    <div className={DashStyle.subCount}>
                      <div className={DashStyle.patientIconBox}>
                        <img src={DashPatientIcon} alt="DashApptIcon" height={'100%'} />
                      </div>
                      <div className={DashStyle.nameCount}>
                        <div className={DashStyle.name}>Patients</div>
                        <h2 className={DashStyle.count}>{patientCount || 0}</h2>
                      </div>
                    </div>
                  </Card>
                </Link>
              </Grid>
              <Grid item xs={12} lg={4}>
                <Link to={'/appointment'} style={{ textDecoration: 'none' }}>
                  <Card
                    variant="outlined"
                    className={`${DashStyle.cardBorder} ${DashStyle.dashCount}`}
                  >
                    <div className={DashStyle.subCount}>
                      <div className={DashStyle.earnBagIconBox}>
                        <img src={DashEarnBagIcon} alt="DashApptIcon" height={'100%'} />
                      </div>
                      <div className={DashStyle.nameCount}>
                        <div className={DashStyle.name}>Appointments</div>
                        <h2 className={DashStyle.count}>{patientFormCount || 0}</h2>
                      </div>
                    </div>
                  </Card>
                </Link>
              </Grid>
              <Grid item xs={12} lg={3}>
                <Card
                  variant="outlined"
                  className={`${DashStyle.cardBorder} ${DashStyle.dashCount}`}
                >
                  <div className={DashStyle.subCount}>
                    <div className={DashStyle.nameCount}>
                      <div className={DashStyle.name}>Total Income</div>
                      <h2 className={DashStyle.count}>₹ {(totalIncome || 0).toFixed(0)}</h2>
                    </div>
                  </div>
                </Card>
              </Grid>
              <Grid item xs={12} lg={3}>
                <Card
                  variant="outlined"
                  className={`${DashStyle.cardBorder} ${DashStyle.dashCount}`}
                  onClick={handleOpenReceived}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={DashStyle.subCount}>
                    <div className={DashStyle.nameCount}>
                      <div className={DashStyle.name}>Total Received</div>
                      <h2 className={DashStyle.count}>₹ {(totalPaid || 0).toFixed(0)}</h2>
                    </div>
                  </div>
                </Card>
              </Grid>
              <Grid item xs={12} lg={3}>
                <Card
                  variant="outlined"
                  className={`${DashStyle.cardBorder} ${DashStyle.dashCount}`}
                  onClick={handleOpenRemaining}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={DashStyle.subCount}>
                    <div className={DashStyle.nameCount}>
                      <div className={DashStyle.name}>Total Remaining</div>
                      <h2 className={DashStyle.count}>₹ {(remainingAmount || 0).toFixed(0)}</h2>
                    </div>
                  </div>
                </Card>
              </Grid>
              <Grid item xs={12} lg={3}>
                <Card
                  variant="outlined"
                  className={`${DashStyle.cardBorder} ${DashStyle.dashCount}`}
                  onClick={() => setOpenExpenseDialog(true)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={DashStyle.subCount}>
                    <div className={DashStyle.nameCount}>
                      <div className={DashStyle.name}>Total Expense</div>
                      <h2 className={DashStyle.count}>₹ {(totalExpense || 0).toFixed(0)}</h2>
                    </div>
                  </div>
                </Card>
              </Grid>
              <Grid item xs={12} lg={12}>
                <Card
                  variant="outlined"
                  className={`${DashStyle.cardBorder} ${DashStyle.dashCount}`}
                >
                  <div className={DashStyle.subCount}>
                    <div className={DashStyle.nameCount}>
                      <div className={DashStyle.name}>Profit / Loss</div>
                      <h2 className={DashStyle.count}>
                        ₹ {((totalIncome || 0) - (totalExpense || 0)).toFixed(0)}
                      </h2>
                    </div>
                  </div>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
      <Dialog
        open={openRemaining}
        onClose={() => {
          setOpenRemaining(false);
          setSelectedPatientId(null);
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Patients With Remaining Balance</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Patient</InputLabel>
            <Select
              value={selectedPatientId || ''}
              label="Select Patient"
              onChange={(e) => setSelectedPatientId(e.target.value || null)}
            >
              <MenuItem value="">All Patients</MenuItem>
              {remainingPatients.map((patient) => (
                <MenuItem key={patient.patientId} value={patient.patientId}>
                  {patient.patientName} ({patient.phone})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <div style={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={(selectedPatientId
                ? remainingPatients.filter((r) => r.patientId === selectedPatientId)
                : remainingPatients
              ).map((r, idx) => ({ id: r.patientId || r._id || idx, ...r }))}
              columns={remainingColumns}
              pageSize={10}
              rowsPerPageOptions={[10]}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={async () => {
              try {
                const params = new URLSearchParams();

                // Only append patientId if selected
                if (selectedPatientId) {
                  params.append('patientId', selectedPatientId);
                }

                const url = `${process.env.REACT_APP_BACKEND_API}/dashboard/exportRemaining${
                  params.toString() ? `?${params.toString()}` : ''
                }`;

                const headers = ApiHeaderWithToken().headers;

                const resp = await fetch(url, { headers });
                if (!resp.ok) {
                  const txt = await resp.text();
                  throw new Error(txt || 'Export failed');
                }

                const blob = await resp.blob();
                const disp = resp.headers.get('content-disposition');
                let filename = selectedPatientId
                  ? `Patient_${selectedPatientId}_Transactions.xlsx`
                  : `Remaining_Transactions.xlsx`;

                if (disp) {
                  const m = /filename="?([^"]+)"?/.exec(disp);
                  if (m && m[1]) filename = m[1];
                }

                const urlBlob = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = urlBlob;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(urlBlob);
              } catch (err) {
                console.error('Export failed', err);
                alert('Failed to download export');
              }
            }}
            variant="contained"
            color="success"
          >
            Download Excel
          </Button>
          <Button
            onClick={() => {
              setOpenRemaining(false);
              setSelectedPatientId(null);
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Received Patient Detail Dialog */}
      <Dialog
        open={openReceivedDetail}
        onClose={() => {
          setOpenReceivedDetail(false);
          setReceivedDetailRows([]);
          setDetailPatientName('');
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Patient Payments {detailPatientName ? `- ${detailPatientName}` : ''}</DialogTitle>
        <DialogContent>
          <div style={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={receivedDetailRows}
              columns={receivedDetailColumns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              loading={receivedDetailLoading}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenReceivedDetail(false);
              setReceivedDetailRows([]);
              setDetailPatientName('');
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openReceived}
        onClose={() => {
          setOpenReceived(false);
          setSelectedReceivedPatientId(null);
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Patients - Total Received</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Patient</InputLabel>
            <Select
              value={selectedReceivedPatientId || ''}
              label="Select Patient"
              onChange={(e) => setSelectedReceivedPatientId(e.target.value || null)}
            >
              <MenuItem value="">All Patients</MenuItem>
              {receivedByPatient.map((patient) => (
                <MenuItem key={patient.patientId} value={patient.patientId}>
                  {patient.patientName} ({patient.phone})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <div style={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={(selectedReceivedPatientId
                ? receivedByPatient.filter((r) => r.patientId === selectedReceivedPatientId)
                : receivedByPatient
              ).map((r, idx) => ({ id: r.patientId || r._id || idx, ...r }))}
              columns={receivedColumns}
              pageSize={10}
              rowsPerPageOptions={[10]}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={async () => {
              try {
                const params = new URLSearchParams();

                // Append only if selected — otherwise fetch ALL
                if (selectedReceivedPatientId) {
                  params.append('patientId', selectedReceivedPatientId);
                }

                const url = `${process.env.REACT_APP_BACKEND_API}/dashboard/exportReceived${
                  params.toString() ? `?${params.toString()}` : ''
                }`;

                const headers = ApiHeaderWithToken().headers;
                const resp = await fetch(url, { headers });

                if (!resp.ok) {
                  const txt = await resp.text();
                  throw new Error(txt || 'Export failed');
                }

                const blob = await resp.blob();
                const disp = resp.headers.get('content-disposition');

                let filename = selectedReceivedPatientId
                  ? `Patient_${selectedReceivedPatientId}_Received.xlsx`
                  : `All_Received.xlsx`;

                if (disp) {
                  const m = /filename="?([^"]+)"?/.exec(disp);
                  if (m && m[1]) filename = m[1];
                }

                const urlBlob = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = urlBlob;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(urlBlob);
              } catch (err) {
                console.error('Export failed', err);
                alert('Failed to download export');
              }
            }}
            variant="contained"
            color="success"
          >
            Download Excel
          </Button>
          <Button
            onClick={() => {
              setOpenReceived(false);
              setSelectedReceivedPatientId(null);
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Expense Stats Dialog */}
      <Dialog
        open={openExpenseDialog}
        onClose={() => setOpenExpenseDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Expense Statistics</DialogTitle>
        <DialogContent sx={{ paddingTop: 2 }}>
          {/* Filter Section */}
          <Box sx={{ marginBottom: '20px' }}>
            <Box sx={{ marginBottom: '15px' }}>
              <label style={{ marginRight: '20px', fontWeight: '500' }}>Filter By:</label>
              <ToggleButtonGroup
                value={expenseFilterType}
                exclusive
                onChange={(e, newValue) => {
                  if (newValue !== null) {
                    setExpenseFilterType(newValue);
                  }
                }}
                sx={{ marginLeft: '10px' }}
              >
                <ToggleButton value="all" sx={{ textTransform: 'none' }}>
                  All
                </ToggleButton>
                <ToggleButton value="date" sx={{ textTransform: 'none' }}>
                  By Date
                </ToggleButton>
                <ToggleButton value="month" sx={{ textTransform: 'none' }}>
                  By Month
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {expenseFilterType === 'date' && (
              <Box sx={{ marginBottom: '15px' }}>
                <TextField
                  label="Select Date"
                  type="date"
                  value={selectedExpenseDate}
                  onChange={(e) => setSelectedExpenseDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: '200px' }}
                />
              </Box>
            )}

            {expenseFilterType === 'month' && (
              <Box sx={{ marginBottom: '15px' }}>
                <TextField
                  label="Select Month"
                  type="month"
                  value={selectedExpenseMonth}
                  onChange={(e) => setSelectedExpenseMonth(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: '200px' }}
                />
              </Box>
            )}
          </Box>

          {/* Summary Stats */}
          {expenseStats && (
            <Box>
              <h4 style={{ margin: '15px 0 10px 0', fontWeight: '600', fontSize: '14px' }}>
                {getExpenseFilterLabel()}
              </h4>
              <Paper sx={{ padding: '15px', backgroundColor: '#f9f9f9', marginBottom: '15px' }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingBottom: '10px',
                    borderBottom: '1px solid #e0e0e0',
                    marginBottom: '10px',
                  }}
                >
                  <span style={{ fontWeight: '500' }}>Total Expenses:</span>
                  <span style={{ fontWeight: '600', color: '#d32f2f', fontSize: '16px' }}>
                    ₹ {expenseStats.totalExpense?.toFixed(2) || '0.00'}
                  </span>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingBottom: '10px',
                    color: '#666',
                    fontSize: '14px',
                  }}
                >
                  <span style={{ fontWeight: '500' }}>Total Count:</span>
                  <span style={{ fontWeight: '600' }}>{expenseStats.expenseCount || 0} items</span>
                </Box>
              </Paper>

              {expenseStats.byCategory && expenseStats.byCategory.length > 0 && (
                <Box>
                  <h5
                    style={{
                      margin: '10px 0 8px 0',
                      fontSize: '13px',
                      color: '#333',
                      fontWeight: '600',
                    }}
                  >
                    Category Breakdown:
                  </h5>
                  {expenseStats.byCategory.map((cat) => (
                    <Paper
                      key={cat._id}
                      sx={{
                        display: 'block',
                        fontSize: '13px',
                        padding: '12px',
                        marginBottom: '8px',
                        backgroundColor: '#fff',
                        borderLeft: '4px solid #4B45FF',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '8px',
                        }}
                      >
                        <Box>
                          <span
                            style={{
                              textTransform: 'capitalize',
                              fontWeight: '500',
                              display: 'block',
                              marginBottom: '4px',
                            }}
                          >
                            {cat._id}:
                          </span>
                          <span style={{ color: '#999', fontSize: '12px' }}>{cat.count} items</span>
                        </Box>
                        <span style={{ fontWeight: '600', color: '#d32f2f' }}>
                          ₹ {cat.total?.toFixed(2) || '0.00'}
                        </span>
                      </Box>
                      {cat.descriptions && cat.descriptions.length > 0 && (
                        <Box
                          sx={{
                            marginTop: '8px',
                            backgroundColor: '#f9f9f9',
                            padding: '8px',
                            borderRadius: '4px',
                            borderTop: '1px solid #e0e0e0',
                          }}
                        >
                          <p
                            style={{
                              margin: '0 0 6px 0',
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#333',
                            }}
                          >
                            Descriptions:
                          </p>

                          <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                            {cat.descriptions.map((desc, idx) => (
                              <div
                                key={idx}
                                style={{
                                  fontSize: '12px',
                                  color: '#555',
                                  marginBottom: '4px',
                                  paddingLeft: '8px',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <span>• {desc.description}</span>
                                <span style={{ fontWeight: '600' }}>₹ {desc.amount}</span>
                              </div>
                            ))}
                          </div>
                        </Box>
                      )}
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleExportExpenseStats}
            color="success"
            variant="contained"
            disabled={expenseExportLoading}
          >
            {expenseExportLoading ? 'Exporting...' : 'Download Excel'}
          </Button>
          <Button onClick={() => setOpenExpenseDialog(false)} color="primary" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
