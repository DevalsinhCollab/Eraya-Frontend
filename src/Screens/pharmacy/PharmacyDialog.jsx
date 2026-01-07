import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { LoadingButton } from '@mui/lab';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { addPharmacyShop, updatePharmacyShop } from '../../apis/pharmacyShopSlice';
import SearchClinic from '../../components/Autocomplete/SearchClinic';
import { Button, TextField } from '@mui/material';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

export default function PharmacyDialog(props) {
  const { open, setOpen, editData, operationMode, setOperationMode, callApi } = props;
  const dispatch = useDispatch();

  const [shopData, setShopData] = useState({
    shopName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    clinicId: '',
  });

  const { loggedIn } = useSelector((state) => state.authData || {});
  const { loading } = useSelector((state) => state.pharmacyShopData || {});

  React.useEffect(() => {
    if (editData && Object.keys(editData || {}).length > 0 && operationMode === 'Edit') {
      setShopData({
        ...editData,
        clinicId: editData.clinicId?._id || editData.clinicId || '',
      });
    } else {
      setShopData({ shopName: '', ownerName: '', email: '', phone: '', address: '', clinicId: '' });
      setOperationMode('Add');
    }
  }, [editData, operationMode]);

  React.useEffect(() => {
    if (open && operationMode === 'Add' && loggedIn?.clinicId) {
      setShopData((prev) => ({ ...prev, clinicId: loggedIn.clinicId }));
    }
  }, [open, operationMode, loggedIn?.clinicId]);

  const handleClose = () => {
    setOpen(false);
    setShopData({ shopName: '', ownerName: '', email: '', phone: '', address: '', clinicId: '' });
    setOperationMode('Add');
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setShopData({ ...shopData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!shopData.clinicId) return toast.error('Please select clinic');
    if (!shopData.shopName) return toast.error('Please enter shop name');
    if (!shopData.email) return toast.error('Please enter email');

    const response = await dispatch(
      operationMode == 'Add'
        ? addPharmacyShop(shopData)
        : updatePharmacyShop({ ...shopData, id: shopData._id }),
    );


    if (!response.payload?.data) {
      return toast.error(response.payload?.message || 'Error');
    } else {
      handleClose();
      toast.success(response.payload?.message);
    }

    callApi();
  };

  return (
    <React.Fragment>
      <Dialog open={open} TransitionComponent={Transition} keepMounted onClose={handleClose} fullWidth>
        <DialogTitle className="modalHeader">{operationMode} Pharmacy Shop</DialogTitle>
        <DialogContent className="modalContent" sx={{display :"flex" , flexDirection:"column" , gap:"1rem"}}>
          <div style={{marginTop : "5px"}}>
            <SearchClinic open={open} setData={setShopData} data={shopData} name="clinicId" label="Clinic" size="small" />
          </div>
          <div >
            <TextField label="Shop Name" type="text" size="small" fullWidth name="shopName" value={shopData?.shopName} onChange={handleOnChange} required />
          </div>
          <div>
            <TextField label="Owner Name" type="text" size="small" fullWidth name="ownerName" value={shopData?.ownerName} onChange={handleOnChange} />
          </div>
          <div>
            <TextField label="Email" type="email" size="small" fullWidth name="email" value={shopData?.email} onChange={handleOnChange} required />
          </div>
          <div>
            <TextField label="Phone" type="text" size="small" fullWidth name="phone" value={shopData?.phone} onChange={handleOnChange} inputProps={{ maxLength: 10 }} />
          </div>
          <div>
            <TextField label="Address" type="text" size="small" fullWidth name="address" value={shopData?.address} onChange={handleOnChange} />
          </div>
        </DialogContent>
        <DialogActions className="modalFooter">
          <Button variant='contained' color='error' onClick={handleClose}>Cancel</Button>
          <LoadingButton loading={loading} variant="contained" onClick={handleSubmit} className="dialogSubmitBtn">Submit</LoadingButton>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
