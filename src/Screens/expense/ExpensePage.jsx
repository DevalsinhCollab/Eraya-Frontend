import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Card, IconButton, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';
import { getAllExpenses, deleteExpense } from '../../apis/expenseSlice';
import ExpenseDialog from './ExpenseDialog';
import moment from 'moment';
import styles from './expense.module.scss';

const ExpensePage = () => {
  const dispatch = useDispatch();
  const { expenses, expenseLoading, total } = useSelector((state) => state.expenseData);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    callApi();
  }, [page, pageSize]);

  const callApi = () => {
    dispatch(getAllExpenses({ page, pageSize }));
  };

  const handleEdit = (data) => {
    setEditData(data);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      const response = await dispatch(deleteExpense(id));
      if (!response.payload?.error) {
        toast.success('Expense deleted successfully');
        callApi();
      }
    }
  };

  const columns = [
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <div>
          <Tooltip title="Edit">
            <IconButton onClick={() => handleEdit(params.row)} color="primary" size="small">
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => handleDelete(params.row._id)} color="error" size="small">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 200,
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 150,
      renderCell: (params) => (
        <span style={{ textTransform: 'capitalize' }}>
          {params.row.category}
        </span>
      ),
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 120,
      renderCell: (params) => <span>₹ {params.row.amount.toFixed(2)}</span>,
    },
    {
      field: 'expenseDate',
      headerName: 'Date',
      width: 150,
      renderCell: (params) => moment(params.row.expenseDate).format('DD/MM/YYYY'),
    },
  ];

  return (
    <div className={styles.mainDataTable}>
      <Card className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Expenses</h2>
          <Button
            className={styles.addBtn}
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditData(null);
              setOpen(true);
            }}
          >
            Add Expense
          </Button>
        </div>
        <DataGrid
          sx={{
            color: '#000',
            backgroundColor: '#fff',
            fontSize: '1rem',
            height: 'auto',
          }}
          rows={expenses || []}
          columns={columns}
          loading={expenseLoading}
          pagination
          paginationMode="server"
          rowCount={total}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: pageSize,
              },
            },
          }}
          onPaginationModelChange={(model) => {
            setPage(model.page);
            setPageSize(model.pageSize);
          }}
          getRowId={(e) => e._id}
        />
      </Card>

      <ExpenseDialog 
        open={open} 
        handleClose={() => setOpen(false)} 
        editData={editData} 
        callApi={callApi}
      />
    </div>
  );
};

export default ExpensePage;

