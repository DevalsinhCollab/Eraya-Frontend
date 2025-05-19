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
import { addPatient, postalApi, updatePatient } from '../../apis/patientSlice';
import { Autocomplete, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField } from '@mui/material';

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
    pincode: "",
    city: "",
    state: "",
    area: null,
  });
  const [areaOptions, setAreaOptions] = useState([]);

  React.useEffect(() => {
  const fetchData = async () => {
    if (
      editData &&
      Object.keys(editData).length > 0 &&
      operationMode === "Edit"
    ) {
      setPatientData(editData);

      try {
        const response = await dispatch(postalApi({ pincode: editData.pincode }));

        if (
          response &&
          response.payload &&
          response.payload[0] &&
          response.payload[0].PostOffice
        ) {
          setAreaOptions(
            response.payload[0].PostOffice.map((item) => ({
              label: item.Name,
              value: item.Name,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching postal data", error);
      }
    } else {
      setPatientData({
        name: "",
        email: "",
        phone: "",
        gender: "Male",
        age: "",
        occupation: "",
        address: "",
        pincode: "",
        city: "",
        state: "",
        area: null,
      });
      setOperationMode("Add");
    }
  };

  fetchData();
}, [editData, operationMode]);


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
      pincode: "",
      city: "",
      state: "",
      area: null,
    });
    setOperationMode("Add")
  };

  const handleOnChange = async (e, newValue) => {
    // Handle Autocomplete (area)
    if (e && e.target && e.target.name === "area") {
      setPatientData((prev) => ({
        ...prev,
        area: newValue ? newValue.value : null,
      }));
      return;
    }

    const { name, value } = e.target;

    if (name === "pincode") {
      if (value.length === 6) {
        const response = await dispatch(postalApi({ pincode: value }));

        if (
          response &&
          response.payload &&
          response.payload[0] &&
          response.payload[0].PostOffice
        ) {
          const city = response.payload[0].PostOffice[0].District;
          const state = response.payload[0].PostOffice[0].State;

          setAreaOptions(
            response.payload[0].PostOffice.map((item) => ({
              label: item.Name,
              value: item.Name,
            }))
          );

          setPatientData((prev) => ({
            ...prev,
            [name]: value,
            city,
            state,
          }));
          return;
        }
      } else {
        setPatientData((prev) => ({
          ...prev,
          [name]: value,
          city: "",
          state: "",
          area: null,
        }));
      }
    } else {
      setPatientData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
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
          <div style={{ display: "flex", gap: "10px" }}>
            <CustomTextField
              label="Pincode"
              size="small"
              className={PatientStyle.input}
              name="pincode"
              value={patientData?.pincode}
              onChange={handleOnChange}
              sx={{ width: "50%" }}
            />
            <CustomTextField
              label="City"
              size="small"
              className={PatientStyle.input}
              name="city"
              value={patientData?.city}
              onChange={handleOnChange}
              sx={{ width: "50%" }}
            />
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <CustomTextField
              label="State"
              size="small"
              className={PatientStyle.input}
              name="state"
              value={patientData?.state}
              onChange={handleOnChange}
              sx={{ width: "50%" }}
            />
            <Autocomplete
              disablePortal
              name="area"
              options={areaOptions}
              size="small"
              sx={{ width: "50%" }}
              value={patientData?.area || null}
              onChange={(e, newValue) => handleOnChange({ target: { name: "area" } }, newValue)}
              renderInput={(params) => <TextField {...params} label="Area" />}
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
