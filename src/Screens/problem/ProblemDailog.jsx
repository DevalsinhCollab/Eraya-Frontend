import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { LoadingButton } from '@mui/lab';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { useCallback, useEffect, useState } from 'react';
import _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { CircularProgress } from '@mui/material';
import ProblemStyle from './problem.module.scss';
import CustomTextField from '../components/form/CustomTextField';
import { addProblem } from '../../apis/problemSlice';
import { toast } from 'react-toastify';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

export default function ProblemDailog(props) {
  const { openProblemDailog, setOpenProblemDailog } = props;
  const dispatch = useDispatch();

  const { loggedIn } = useSelector((state) => state.authData);
  const { loading } = useSelector((state) => state.problemData);

  const [doctorsBySpeciality, setDoctorsBySpeciality] = useState([]);
  const [doctorsOptionData, setDoctorsOptionData] = useState([]);
  const [problemFormData, setProblemFormData] = useState({
    docId: null,
    docSpeciality: null,
    issue: '',
    description: '',
  });

  const handleClose = () => {
    setOpenProblemDailog(false);
    setProblemFormData({
      docId: null,
      docSpeciality: null,
      issue: '',
      description: '',
    });
  };

  useEffect(() => {
    if (doctorsBySpeciality && doctorsBySpeciality.length > 0) {
      setDoctorsOptionData(
        doctorsBySpeciality.map((doctor) => ({
          label: doctor?.name,
          value: doctor?._id,
        })),
      );
    } else {
      setDoctorsOptionData([]);
    }
  }, [doctorsBySpeciality]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setProblemFormData({ ...problemFormData, [name]: value });
  };

  const handelSubmit = async () => {
    if (!problemFormData.docSpeciality) {
      return toast.error('Please select speciality');
    }
    if (!problemFormData.docId) {
      return toast.error('Please select doctor');
    }
    if (!problemFormData.issue) {
      return toast.error('Please enter issue');
    }
    const finalData = {
      ...problemFormData,
      patientId: loggedIn._id,
      patientName: loggedIn.name,
      docId: problemFormData.docId.value,
      docSpeciality: problemFormData.docSpeciality.value,
    };
    const response = await dispatch(addProblem(finalData));
    if (!response.payload?.error) {
      handleClose();
      toast.success(response.payload?.message);
    }
  };
  return (
    <React.Fragment>
      <Dialog
        open={openProblemDailog}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
        fullWidth
      >
        <DialogTitle className="modalHeader">Add Problem</DialogTitle>
        <DialogContent className="modalContent">
          {/* <DialogContentText id="alert-dialog-slide-description"> */}
          <div>
            <Autocomplete
              disablePortal
              size="small"
              id="combo-box-demo"
              options={[
                { label: 'Neurologist', value: 'NE' },
                { label: 'Physiotherapist', value: 'PH' },
              ]}
              value={problemFormData?.docSpeciality}
              renderInput={(params) => <TextField {...params} label="Select Speciality" />}
              fullWidth
              className={ProblemStyle.input}
            />
          </div>
          <div>
            <Autocomplete
              size="small"
              id="doctors-autocomplete"
              options={doctorsOptionData}
              onChange={(e, newValue) =>
                setProblemFormData({ ...problemFormData, docId: newValue })
              }
              onInputChange={async (e, newInputValue) => {
                if (!newInputValue) {

                } else {
                }
              }}
              value={problemFormData?.docId}
              loading={loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Doctors"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <React.Fragment>
                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </React.Fragment>
                    ),
                  }}
                />
              )}
              fullWidth
              className={ProblemStyle.input}
            />
          </div>
          <div>
            <CustomTextField
              label="Issue"
              size="small"
              fullWidth
              className={ProblemStyle.input}
              name="issue"
              value={problemFormData?.issue}
              onChange={handleOnChange}
            />
          </div>
          <div>
            <CustomTextField
              size="small"
              label="Description"
              fullWidth
              className={ProblemStyle.input}
              multiline
              rows={3}
              name="description"
              value={problemFormData?.description}
              onChange={handleOnChange}
            />
          </div>
          {/* </DialogContentText> */}
        </DialogContent>
        <DialogActions className="modalFooter">
          <Button variant="contained" onClick={handleClose} color="error">
            Cancel
          </Button>
          <LoadingButton
            loading={loading}
            variant="contained"
            onClick={handelSubmit}
            className="dialogSubmitBtn"
          >
            Submit
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
