import PharmacyStyle from '../doctors/doctor.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { Button, Card } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import PharmacyDialog from './PharmacyDialog';
import { DataGrid } from '@mui/x-data-grid';
import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import { deletePharmacyShop, getPharmacyShops } from '../../apis/pharmacyShopSlice';

export default function PharmacyShop({ search }) {
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [operationMode, setOperationMode] = useState('Add');

  const { shops, loading, totalCount } = useSelector((state) => state.pharmacyShopData || {});

  async function callApi() {
    dispatch(getPharmacyShops({ page, pageSize, search: search || '' }));
  }

  useEffect(() => {
    callApi();
  }, [page, pageSize, dispatch, search]);

  const handlePaginationModelChange = (model) => {
    setPage(model.page);
    setPageSize(model.pageSize);
  };

  const handleEdit = (data) => {
    setOpen(true);
    setEditData(data);
    setOperationMode('Edit');
  };

  const handleDelete = async (data) => {
    const response = await dispatch(deletePharmacyShop(data._id));

    if (response?.payload?.data) {
      toast.success(response?.payload.message);
      callApi();
    } else {
      toast.error('Error deleting shop');
    }
  };

  const columns = [
    {
      field: 'actions',
      headerName: <div className="gridHeaderText">Action</div>,
      width: 160,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <div>
          <IconButton onClick={() => handleEdit(params.row)} color="primary" aria-label="edit">
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row)} color="error" aria-label="delete">
            <DeleteIcon />
          </IconButton>
        </div>
      ),
    },
    {
      field: 'clinicName',
      headerName: <div className="gridHeaderText">Clinic Name</div>,
      width: 250,
      valueGetter: (value, row) => row.clinicId?.name || '-',
    },
    {
      field: 'shopName',
      headerName: <div className="gridHeaderText">Shop Name</div>,
      width: 250,
    },
    {
      field: 'ownerName',
      headerName: <div className="gridHeaderText">Owner</div>,
      width: 200,
    },
    {
      field: 'email',
      headerName: <div className="gridHeaderText">Email</div>,
      width: 250,
    },
    {
      field: 'phone',
      headerName: <div className="gridHeaderText">Phone</div>,
      width: 180,
    },
    {
      field: 'address',
      headerName: <div className="gridHeaderText">Address</div>,
      width: 300,
    },
  ];

  return (
    <div className={PharmacyStyle.mainDataTable}>
      <Card className={PharmacyStyle.tableCard}>
        <div className={PharmacyStyle.tableHeader}>
          <h2 className={PharmacyStyle.tableTitle}>Pharmacy Shops</h2>
          <Button className={PharmacyStyle.addBtn} variant="contained" startIcon={<AddShoppingCartIcon />} onClick={() => { setOpen(true); setOperationMode('Add'); }}>
            Add Shop
          </Button>
        </div>
        <DataGrid
          sx={{ color: '#000', backgroundColor: '#fff', fontSize: '1rem', height: 'auto', fontWeight: '600' }}
          rows={shops}
          columns={columns}
          loading={loading}
          pagination
          paginationMode="server"
          rowCount={totalCount}
          initialState={{
            ...shops.initialState,
            pagination: {
              ...shops.initialState?.pagination,
              paginationModel: { pageSize: pageSize },
            },
          }}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          onPaginationModelChange={handlePaginationModelChange}
          getRowId={(e) => e._id}
        />
        <PharmacyDialog open={open} setOpen={setOpen} editData={editData} operationMode={operationMode} setOperationMode={setOperationMode} callApi={callApi} />
      </Card>
    </div>
  );
}