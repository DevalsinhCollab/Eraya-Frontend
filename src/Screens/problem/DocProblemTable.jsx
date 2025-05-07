import ProblemStyle from './problem.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
// import { Button } from '@mui/material';
// import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import ProblemDailog from './ProblemDailog';
import { getProblemsByDoc } from '../../apis/problemSlice';
import { DataGrid } from '@mui/x-data-grid';
import { Card } from '@mui/material';
import { dateFormate } from '../../common/common';
// import io from 'socket.io-client';
// import { toast } from 'react-toastify';
// import { backendPath } from 'src/common/common';

// const socket = io(backendPath);

export default function DocProblemTable() {
  const dispatch = useDispatch();
  // const [problems, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [count, setCount] = useState(0);
  const [openProblemDailog, setOpenProblemDailog] = useState(false);

  const { loggedIn } = useSelector((state) => state.authData);
  const { problems, prbLoading } = useSelector((state) => state.problemData);

  // console.log(problems);
  useEffect(() => {
    async function callApi() {
      const response = await dispatch(getProblemsByDoc({ page, pageSize, id: loggedIn?._id }));
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
    // {
    //   field: 'actions',
    //   headerName: <div className="gridHeaderText">Action</div>,
    //   // width: 160,
    //   // flex: 1,
    //   // renderCell: (cell) => (
    //   //   // <Stack direction="row" spacing={1}>
    //   //   <>
    //   //     {cell.row.isApproved === '0' ? (
    //   //       <BootstrapTooltip title="Approve">
    //   //         <EditButtonStyled onClick={() => handelApprove(cell.row)}>
    //   //           <TaskAltIcon />
    //   //         </EditButtonStyled>
    //   //       </BootstrapTooltip>
    //   //     ) : (
    //   //       <div className={DocTableStyle.status}>Approved</div>
    //   //     )}
    //   //   </>
    //   //   // </Stack>
    //   // ),
    // },
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
  return (
    <>
      <Card className={ProblemStyle.tableCard}>
        <div className={ProblemStyle.tableHeader}>
          <h2 className={ProblemStyle.tableTitle}>Patient Problems</h2>
          {/* <Button
            className={ProblemStyle.addBtn}
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
      </Card>
      <ProblemDailog
        openProblemDailog={openProblemDailog}
        setOpenProblemDailog={setOpenProblemDailog}
      />
    </>
  );
}
