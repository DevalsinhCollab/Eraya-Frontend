import ProblemStyle from './problem.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { Button, Card } from '@mui/material';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import ProblemDailog from './ProblemDailog';
import { getProblemsByPatient } from '../../apis/problemSlice';
import { DataGrid } from '@mui/x-data-grid';

export default function ProblemTable() {
  const dispatch = useDispatch();
  // const [problems, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [count, setCount] = useState(0);
  const [openProblemDailog, setOpenProblemDailog] = useState(false);

  const { loggedIn } = useSelector((state) => state.authData);
  const { problems, prbLoading } = useSelector((state) => state.problemData);
  // console.log(problems);
  useEffect(() => {
    async function callApi() {
      const response = await dispatch(getProblemsByPatient({ page, pageSize, id: loggedIn?._id }));
      // // const response = await dispatch(getDoctors({ page, pageSize }));
      // // console.log(response);
      // setData(response?.payload?.problems);
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
      // renderCell: (cell) => (
      //   // <Stack direction="row" spacing={1}>
      //   <>
      //     {cell.row.isApproved === '0' ? (
      //       <BootstrapTooltip title="Approve">
      //         <EditButtonStyled onClick={() => handelApprove(cell.row)}>
      //           <TaskAltIcon />
      //         </EditButtonStyled>
      //       </BootstrapTooltip>
      //     ) : (
      //       <div className={DocTableStyle.status}>Approved</div>
      //     )}
      //   </>
      //   // </Stack>
      // ),
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
    {
      field: 'description',
      // headerName: 'Description',
      headerName: <div className="gridHeaderText">Description</div>,
      width: 250,
    },
  ];

  return (
    <div className={ProblemStyle.mainDataTable}>
      <Card className={ProblemStyle.tableCard}>
        <div className={ProblemStyle.tableHeader}>
          <h2 className={ProblemStyle.tableTitle}>Problems</h2>
          <Button
            className={ProblemStyle.addBtn}
            variant="contained"
            startIcon={<HealthAndSafetyIcon />}
            onClick={() => setOpenProblemDailog(true)}
          >
            Add Problem
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
          rows={problems}
          columns={columns}
          loading={prbLoading}
          pagination
          paginationMode="server"
          rowCount={count}
          initialState={{
            ...problems.initialState,
            pagination: {
              ...problems.initialState?.pagination,
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
        <ProblemDailog
          openProblemDailog={openProblemDailog}
          setOpenProblemDailog={setOpenProblemDailog}
        />
      </Card>
    </div>
  );
}
