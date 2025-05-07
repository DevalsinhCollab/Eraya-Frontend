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
import { getProblemsByDocForDashboard } from '../../apis/problemSlice';
import { Link } from 'react-router-dom';
import { getDashboardCount } from '../../apis/dashboardSlice';

export default function Dashboard(props) {
  const { greeting } = props;
  const dispatch = useDispatch();

  const { loggedIn } = useSelector((state) => state.authData);
  const { patientCount, doctorCount, patientFormCount } = useSelector((state) => state.dashboardData)


  useEffect(() => {
    if (loggedIn && loggedIn.role === 'D') {
      dispatch(getProblemsByDocForDashboard(loggedIn?._id));
    }
  }, [loggedIn]);

  useEffect(() => {
    dispatch(getDashboardCount())
  }, [])

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
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
}
