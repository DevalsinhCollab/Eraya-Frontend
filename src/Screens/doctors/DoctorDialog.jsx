import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { LoadingButton } from '@mui/lab';
import { useState } from 'react';
import _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import PatientStyle from './doctor.module.scss';
import CustomTextField from '../components/form/CustomTextField';
import { toast } from 'react-toastify';
import { addDoctor, updateDoctor } from '../../apis/doctorSlice';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

export default function DoctorDialog(props) {
  const { open, setOpen, editData, operationMode, setOperationMode, callApi } = props;
  const dispatch = useDispatch();

  const { prbLoading } = useSelector((state) => state.problemData);

  const [doctorData, setDoctorData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  React.useEffect(() => {
    if (editData && Object.keys(editData) && Object.keys(editData).length > 0 && operationMode === "Edit") {
      setDoctorData(editData)
    } else {
      setDoctorData({
        name: "",
        email: "",
        phone: ""
      })
      setOperationMode("Add")
    }
  }, [editData, operationMode])

  const handleClose = () => {
    setOpen(false);
    setDoctorData({
      name: "",
      email: "",
      phone: ""
    });
    setOperationMode("Add")
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setDoctorData({ ...doctorData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!doctorData.name) {
      return toast.error('Please enter name');
    }

    if (!doctorData.email) {
      return toast.error('Please enter email');
    }

    if (!doctorData.phone) {
      return toast.error('Please enter phone');
    }

    const response = await dispatch(operationMode == "Add" ? addDoctor(doctorData) : updateDoctor({ ...doctorData, id: doctorData._id }));
    if (!response.payload?.success) {
      return toast.success(response.payload?.message);
    } else {
      handleClose();
      toast.success(response.payload?.message);
    }

    callApi();
  };

  return (
    <React.Fragment>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
        fullWidth
      >
        <DialogTitle className="modalHeader">{operationMode} Doctor</DialogTitle>
        <DialogContent className="modalContent">
          <div>
            <CustomTextField
              label="Name"
              type="text"
              size="small"
              fullWidth
              className={PatientStyle.input}
              name="name"
              value={doctorData?.name}
              onChange={handleOnChange}
              required
            />
          </div>
          <div>
            <CustomTextField
              label="Email"
              type="email"
              size="small"
              fullWidth
              className={PatientStyle.input}
              name="email"
              value={doctorData?.email}
              onChange={handleOnChange}
              required
            />
          </div>
          <div>
            <CustomTextField
              label="Phone"
              type="number"
              size="small"
              fullWidth
              className={PatientStyle.input}
              name="phone"
              value={doctorData?.phone}
              onChange={handleOnChange}
              required
            />
          </div>
        </DialogContent>
        <DialogActions className="modalFooter">
          <Button variant="contained" onClick={handleClose} color="error">
            Cancel
          </Button>
          <LoadingButton
            loading={prbLoading}
            variant="contained"
            onClick={handleSubmit}
            className="dialogSubmitBtn"
          >
            Submit
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
