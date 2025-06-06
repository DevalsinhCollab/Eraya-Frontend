import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAppointmentByPatient } from '../../apis/appointmentSlice';
import ApptStyle from './appt.module.scss';
import { startendDateFormate } from '../../common/common';
import BootstrapTooltip from '../components/form/BootstrapTooltip';
import { useNavigate } from 'react-router';
import { Card, IconButton } from '@mui/material';
import ChatIcon from '../../Img/chat-icon.png';

export default function PatientAppointmentTable() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const [appointments, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [count, setCount] = useState(0);
  // const [openProblemDailog, setOpenProblemDailog] = useState(false);

  const { loggedIn } = useSelector((state) => state.authData);
  const { appointments, apptLoading } = useSelector((state) => state.appointmentData);

  useEffect(() => {
    async function callApi() {
      const response = await dispatch(
        getAppointmentByPatient({ page, pageSize, id: loggedIn?._id }),
      );
      // // const response = await dispatch(getDoctors({ page, pageSize }));
      // setData(response?.payload?.appointments);
      setCount(response?.payload?.totalCount);
    }
    callApi();
  }, [page, pageSize, dispatch, loggedIn]);

  const handlePaginationModelChange = (model) => {
    setPage(model.page);
    setPageSize(model.pageSize);
  };

  const columns = [
    {
      field: 'actions',
      headerName: <div className="gridHeaderText">Action</div>,
      width: 160,
      renderCell: (cell) => (
        // <Stack direction="row" spacing={1}>
        <>
          {/* {cell.row.isApproved === '0' ? ( */}
          <BootstrapTooltip title="Chat">
            <IconButton
              onClick={() =>
                navigate(`/chat/${cell.row.prbData.prbId}/${loggedIn._id}/${cell.row.docId}`)
              }
            >
              <img src={ChatIcon} alt="ChatIcon" height={25} />
            </IconButton>
          </BootstrapTooltip>
          {/* ) : (
            <div className={DocTableStyle.status}>Approved</div>
          )} */}
        </>
        // </Stack>
      ),
    },
    {
      field: 'start',
      // headerName: 'Start Time',
      headerName: <div className="gridHeaderText">Start Time</div>,
      width: 250,
      valueFormatter: (value) => {
        return startendDateFormate(value);
      },
    },
    {
      field: 'end',
      // headerName: 'End Time',
      headerName: <div className="gridHeaderText">End Time</div>,
      width: 250,
      valueFormatter: (value) => {
        return startendDateFormate(value);
      },
    },
    {
      field: 'issue',
      // headerName: 'Issue',
      headerName: <div className="gridHeaderText">Issue</div>,
      width: 250,
    },
    {
      field: 'docName',
      // headerName: 'Doctor',
      headerName: <div className="gridHeaderText">Doctor</div>,
      width: 250,
    },
    {
      field: 'docSpeciality',
      // headerName: 'Speciality',
      headerName: <div className="gridHeaderText">Speciality</div>,
      width: 250,
      valueFormatter: (value) => {
        return value === 'NE' ? 'Neurologist' : value === 'PH' ? 'Physiotherapist' : 'Unknown';
      },
    },
  ];
  return (
    <div>
      <Card className={ApptStyle.tableCard}>
        <div className={ApptStyle.tableHeader}>
          <h2 className={ApptStyle.tableTitle}>Appointments</h2>
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
