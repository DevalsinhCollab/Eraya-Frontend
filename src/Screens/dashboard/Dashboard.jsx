import DashStyle from './Dashboard.module.scss';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { Card } from '@mui/material';
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
import { getDashboardCount, getRemainingPatients, getReceivedByPatient } from '../../apis/dashboardSlice';

export default function Dashboard(props) {
  const { greeting } = props;
  const dispatch = useDispatch();

  const { loggedIn } = useSelector((state) => state.authData);
  const { patientCount, doctorCount, patientFormCount, totalIncome, totalExpense, totalPaid, remainingAmount } = useSelector((state) => state.dashboardData)



  useEffect(() => {
    if (loggedIn && loggedIn.role === 'D') {
      dispatch(getProblemsByDocForDashboard(loggedIn?._id));
    }
  }, [loggedIn]);

  useEffect(() => {
    dispatch(getDashboardCount())
  }, [])

  const [openRemaining, setOpenRemaining] = useState(false);
  const [openReceived, setOpenReceived] = useState(false);

  const { remainingPatients = [], receivedByPatient = [] } = useSelector((state) => state.dashboardData || {});

  const handleOpenRemaining = async () => {
    await dispatch(getRemainingPatients());
    setOpenRemaining(true);
  };

  const handleOpenReceived = async () => {
    await dispatch(getReceivedByPatient());
    setOpenReceived(true);
  };

  const remainingColumns = [
    { field: 'patientName', headerName: 'Patient', width: 200 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    { field: 'totalPayment', headerName: 'Total Payment', width: 150 },
    { field: 'totalPaid', headerName: 'Total Paid', width: 150 },
    { field: 'remaining', headerName: 'Remaining', width: 150 },
  ];

  const receivedColumns = [
    { field: 'patientName', headerName: 'Patient', width: 200 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    { field: 'totalPaid', headerName: 'Total Received', width: 150 },
    { field: 'totalPayment', headerName: 'Total Payment', width: 150 },
  ];

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
                <Link to={"/doctors"} style={{ textDecoration: "none" }}>
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
                <Link to={"/patients"} style={{ textDecoration: "none" }}>
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
                <Link to={"/form"} style={{ textDecoration: "none" }}>
                  <Card
                    variant="outlined"
                    className={`${DashStyle.cardBorder} ${DashStyle.dashCount}`}
                  >
                    <div className={DashStyle.subCount}>
                      <div className={DashStyle.earnBagIconBox}>
                        <img src={DashEarnBagIcon} alt="DashApptIcon" height={'100%'} />
                      </div>
                      <div className={DashStyle.nameCount}>
                        <div className={DashStyle.name}>Appoinments</div>
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
                >
                  <div className={DashStyle.subCount}>
                    <div className={DashStyle.nameCount}>
                      <div className={DashStyle.name}>Profit / Loss</div>
                      <h2 className={DashStyle.count}>₹ {((totalPaid || 0) - (totalExpense || 0)).toFixed(0)}</h2>
                    </div>
                  </div>
                </Card>
              </Grid>
              <Grid item xs={12} lg={3}>
                <Card
                  variant="outlined"
                  className={`${DashStyle.cardBorder} ${DashStyle.dashCount}`}
                >
                  <div className={DashStyle.subCount}>
                    <div className={DashStyle.nameCount}>
                      <div className={DashStyle.name}>Total Expense</div>
                      <h2 className={DashStyle.count}>₹ {(totalExpense || 0).toFixed(0)}</h2>
                    </div>
                  </div>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
      <Dialog open={openRemaining} onClose={() => setOpenRemaining(false)} fullWidth maxWidth="md">
        <DialogTitle>Patients With Remaining Balance</DialogTitle>
        <DialogContent>
          <div style={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={remainingPatients.map((r, idx) => ({ id: r._id || idx, ...r }))}
              columns={remainingColumns}
              pageSize={10}
              rowsPerPageOptions={[10]}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRemaining(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openReceived} onClose={() => setOpenReceived(false)} fullWidth maxWidth="md">
        <DialogTitle>Patients - Total Received</DialogTitle>
        <DialogContent>
          <div style={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={receivedByPatient.map((r, idx) => ({ id: r._id || idx, ...r }))}
              columns={receivedColumns}
              pageSize={10}
              rowsPerPageOptions={[10]}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReceived(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
