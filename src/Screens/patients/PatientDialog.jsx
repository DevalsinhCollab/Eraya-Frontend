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
import PatientStyle from './problem.module.scss';
import CustomTextField from '../components/form/CustomTextField';
import { toast } from 'react-toastify';
import { addPatient, updatePatient } from '../../apis/patientSlice';
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

export default function PatientDialog(props) {
  const { open, setOpen, editData, operationMode, setOperationMode, callApi } = props;
  const dispatch = useDispatch();

  const { prbLoading } = useSelector((state) => state.problemData);

  const [patientData, setPatientData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "Male",
    age: "",
    occupation: "",
    address: "",
  });

  React.useEffect(() => {
    if (editData && Object.keys(editData) && Object.keys(editData).length > 0 && operationMode === "Edit") {
      setPatientData(editData)
    } else {
      setPatientData({
        name: "",
        email: "",
        phone: "",
        gender: "Male",
        age: "",
        occupation: "",
        address: "",
      })
      setOperationMode("Add")
    }
  }, [editData, operationMode])

  const handleClose = () => {
    setOpen(false);
    setPatientData({
      name: "",
      email: "",
      phone: "",
      gender: "Male",
      age: "",
      occupation: "",
      address: "",
    });
    setOperationMode("Add")
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setPatientData({ ...patientData, [name]: value });
  };

  const handleSubmit = async () => {
    if (!patientData.name) {
      return toast.error('Please enter name');
    }
    if (!patientData.email) {
      return toast.error('Please select email');
    }
    if (!patientData.phone) {
      return toast.error('Please enter phone number');
    }

    const response = await dispatch(operationMode == "Add" ? addPatient(patientData) : updatePatient({ ...patientData, id: patientData._id }));
    if (!response.payload?.error) {
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
        <DialogTitle className="modalHeader">{operationMode} Patient</DialogTitle>
        <DialogContent className="modalContent">
          <div>
            <CustomTextField
              label="Name"
              size="small"
              fullWidth
              className={PatientStyle.input}
              name="name"
              value={patientData?.name}
              onChange={handleOnChange}
              required
            />
          </div>
          <div>
            <CustomTextField
              label="Email"
              size="small"
              fullWidth
              className={PatientStyle.input}
              name="email"
              value={patientData?.email}
              onChange={handleOnChange}
              type="email"
              required
            />
          </div>
          <div>
            <CustomTextField
              label="Phone Number"
              size="small"
              fullWidth
              className={PatientStyle.input}
              name="phone"
              value={patientData?.phone}
              onChange={handleOnChange}
              type="number"
              required
            />
          </div>
          <div>
            <FormControl>
              <FormLabel id="demo-row-radio-buttons-group-label">Gender</FormLabel>
              <RadioGroup
                row
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
                defaultValue={patientData?.gender}
              >
                <FormControlLabel value="Male" control={<Radio />} label="Male" />
                <FormControlLabel value="Female" control={<Radio />} label="Female" />
                <FormControlLabel value="Other" control={<Radio />} label="Other" />
              </RadioGroup>
            </FormControl>
          </div>
          <div>
            <CustomTextField
              label="Age"
              size="small"
              fullWidth
              className={PatientStyle.input}
              name="age"
              value={patientData?.age}
              onChange={handleOnChange}
              type="number"
              required
            />
          </div>
          <div>
            <CustomTextField
              label="Occupation"
              size="small"
              fullWidth
              className={PatientStyle.input}
              name="occupation"
              value={patientData?.occupation}
              onChange={handleOnChange}
              required
            />
          </div>
          <div>
            <CustomTextField
              size="small"
              label="Address"
              fullWidth
              className={PatientStyle.input}
              multiline
              rows={3}
              name="address"
              value={patientData?.address}
              onChange={handleOnChange}
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
