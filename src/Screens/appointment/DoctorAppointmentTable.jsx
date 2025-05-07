import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAppointmentByDoctor, getAppointmentByPatient } from '../../apis/appointmentSlice';
import ApptStyle from './appt.module.scss';
// import ChatIcon from '@mui/icons-material/Chat';
import { useNavigate } from 'react-router';
import { Card, IconButton, Stack } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import { startendDateFormate } from '../../common/common';
import BootstrapTooltip from '../components/form/BootstrapTooltip';
import ChatIcon from '../../Img/chat-icon.png';

export default function DoctorAppointmentTable() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const [appointments, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [count, setCount] = useState(0);
  // const [openProblemDailog, setOpenProblemDailog] = useState(false);

  const { loggedIn } = useSelector((state) => state.authData);
  const { appointments, apptLoading } = useSelector((state) => state.appointmentData);

  // console.log(appointments);
  useEffect(() => {
    async function callApi() {
      const response = await dispatch(
        getAppointmentByDoctor({ page, pageSize, id: loggedIn?._id }),
      );
      // // const response = await dispatch(getDoctors({ page, pageSize }));
      // // console.log(response);
      // setData(response?.payload?.appointments);
      setCount(response?.payload?.totalCount);
    }
    callApi();
  }, [page, pageSize, dispatch, loggedIn]);

  const handlePaginationModelChange = (model) => {
    setPage(model.page);
    setPageSize(model.pageSize);
  };
  //   console.log(allDoctorsData);
  const columns = [
    {
      field: 'actions',
      headerName: <div className="gridHeaderText">Action</div>,
      width: 160,
      renderCell: (cell) => (
        <Stack direction="row">
          <BootstrapTooltip title="Chat">
            <IconButton
              onClick={() =>
                navigate(`/chat/${cell.row.prbData.prbId}/${loggedIn._id}/${cell.row.patientId}`)
              }
            >
              <img src={ChatIcon} alt="ChatIcon" height={25} />
            </IconButton>
          </BootstrapTooltip>
        </Stack>
      ),
    },
    {
      field: 'start',
      headerName: <div className="gridHeaderText">Start Time</div>,
      width: 250,
      valueFormatter: ( value ) => {
        return startendDateFormate(value);
      },
    },
    {
      field: 'end',
      headerName: <div className="gridHeaderText">End Time</div>,
      width: 250,
      valueFormatter: ( value ) => {
        return startendDateFormate(value);
      },
    },
    {
      field: 'issue',
      headerName: <div className="gridHeaderText">Issue</div>,
      width: 250,
    },
    {
      field: 'patientName',
      headerName: <div className="gridHeaderText">Patient</div>,
      width: 250,
    },
  ];
  return (
    <div>
      <Card className={ApptStyle.tableCard}>
        <div className={ApptStyle.tableHeader}>
          <h2 className={ApptStyle.tableTitle}>Patient Appointments</h2>
          {/* <Button
            className={ApptStyle.addBtn}
            variant="outlined"
            startIcon={<HealthAndSafetyIcon />}
            onClick={() => setOpenProblemDailog(true)}
          >
            Add Problem
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
          rows={appointments}
          columns={columns}
          loading={apptLoading}
          pagination
          paginationMode="server"
          rowCount={count}
          initialState={{
            ...appointments.initialState,
            pagination: {
              ...appointments.initialState?.pagination,
              paginationModel: {
                pageSize: pageSize,
                /* page: 0 // default value will be used if not passed */
              },
            },
          }}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          onPaginationModelChange={handlePaginationModelChange}
          rowsPerPageOptions={[10]}
          pageSizeOptions={[5, 10, 20]}
          getRowId={(e) => e._id}
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0 ? 'rowbgColor1' : 'rowbgColor2'
          }
        />
      </Card>
    </div>
  );
}
