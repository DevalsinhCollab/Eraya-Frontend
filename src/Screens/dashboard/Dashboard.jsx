import DashStyle from './Dashboard.module.scss';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { Card } from '@mui/material';
import DoctorImg from '../../Img/doctor.png';
import DashApptIcon from '../../Img/dashAppt-icon.png';
import DashPatientIcon from '../../Img/dashPatient-icon.png';
import DashEarnBagIcon from '../../Img/dashEarnBag-icon.png';
import { BarChart } from '@mui/x-charts';
import { axisClasses } from '@mui/x-charts/ChartsAxis';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProblemsByDocForDashboard } from '../../apis/problemSlice';
import { DataGrid } from '@mui/x-data-grid';
import { dateFormate } from '../../common/common';

export default function Dashboard(props) {
  const { greeting } = props;
  const dispatch = useDispatch();

  const { loggedIn } = useSelector((state) => state.authData);
  const { dashProblems, prbLoading } = useSelector((state) => state.problemData);

  const dataset = [
    {
      london: 59,
      paris: 57,
      newYork: 86,
      seoul: 21,
      month: 'Jan',
    },
    {
      london: 50,
      paris: 52,
      newYork: 78,
      seoul: 28,
      month: 'Feb',
    },
    {
      london: 47,
      paris: 53,
      newYork: 106,
      seoul: 41,
      month: 'Mar',
    },
    {
      london: 54,
      paris: 56,
      newYork: 92,
      seoul: 73,
      month: 'Apr',
    },
    {
      london: 57,
      paris: 69,
      newYork: 92,
      seoul: 99,
      month: 'May',
    },
    {
      london: 60,
      paris: 63,
      newYork: 103,
      seoul: 144,
      month: 'June',
    },
    {
      london: 59,
      paris: 60,
      newYork: 105,
      seoul: 319,
      month: 'July',
    },
    {
      london: 65,
      paris: 60,
      newYork: 106,
      seoul: 249,
      month: 'Aug',
    },
    {
      london: 51,
      paris: 51,
      newYork: 95,
      seoul: 131,
      month: 'Sept',
    },
    {
      london: 60,
      paris: 65,
      newYork: 97,
      seoul: 55,
      month: 'Oct',
    },
    {
      london: 67,
      paris: 64,
      newYork: 76,
      seoul: 48,
      month: 'Nov',
    },
    {
      london: 61,
      paris: 70,
      newYork: 103,
      seoul: 25,
      month: 'Dec',
    },
  ];

  const columns = [
    {
      field: 'issue',
      headerName: <div className="gridHeaderText">Issue</div>,
      // width: 300,
      flex: 1,
    },
    {
      field: 'patientName',
      headerName: <div className="gridHeaderText">Patient</div>,
      // width: 300,
      flex: 1,
    },
    {
      field: 'description',
      headerName: <div className="gridHeaderText">Description</div>,
      // width: 450,
      flex: 1,
    },
    {
      field: 'createdAt',
      headerName: <div className="gridHeaderText">Date</div>,
      // width: 450,
      flex: 1,
      valueFormatter: (value) => {
        return dateFormate(value);
      },
    },
  ];

  const valueFormatter = (value) => `${value}mm`;
  const chartSetting = {
    series: [{ dataKey: 'seoul', valueFormatter, color: '#2D307E' }],
    height: 270,
    sx: {
      [`& .${axisClasses.directionY} .${axisClasses.label}`]: {
        transform: 'translateX(-10px)',
      },
    },
  };

  useEffect(() => {
    if (loggedIn && loggedIn.role === 'D') {
      dispatch(getProblemsByDocForDashboard(loggedIn?._id));
    }
  }, [loggedIn]);

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
                <Card
                  variant="outlined"
                  className={`${DashStyle.cardBorder} ${DashStyle.dashCount}`}
                >
                  <div className={DashStyle.subCount}>
                    <div className={DashStyle.apptIconBox}>
                      <img src={DashApptIcon} alt="DashApptIcon" height={'100%'} />
                    </div>
                    <div className={DashStyle.nameCount}>
                      <div className={DashStyle.name}>Appointments</div>
                      <h2 className={DashStyle.count}>378</h2>
                    </div>
                  </div>
                </Card>
              </Grid>
              <Grid item xs={12} lg={4}>
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
                      <h2 className={DashStyle.count}>250</h2>
                    </div>
                  </div>
                </Card>
              </Grid>
              <Grid item xs={12} lg={4}>
                <Card
                  variant="outlined"
                  className={`${DashStyle.cardBorder} ${DashStyle.dashCount}`}
                >
                  <div className={DashStyle.subCount}>
                    <div className={DashStyle.earnBagIconBox}>
                      <img src={DashEarnBagIcon} alt="DashApptIcon" height={'100%'} />
                    </div>
                    <div className={DashStyle.nameCount}>
                      <div className={DashStyle.name}>Avg. Earnings</div>
                      <h2 className={DashStyle.count}>₹ 45000</h2>
                    </div>
                  </div>
                </Card>
              </Grid>
            </Grid>
          </Grid>
          {/* <Grid item xs={6} md={6}>
            <Card variant="outlined" className={`${DashStyle.cardBorder} ${DashStyle.chartBox}`}>
              <h2>Patients Visit</h2>
              <BarChart
                dataset={dataset}
                grid={{ horizontal: true }}
                xAxis={[{ scaleType: 'band', dataKey: 'month' }]}
                borderRadius={9}
                {...chartSetting}
              />
            </Card>
          </Grid> */}
        </Grid>
      </Box>
    </div>
  );
}
