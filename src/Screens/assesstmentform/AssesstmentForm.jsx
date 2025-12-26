import {
  Autocomplete,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  TextareaAutosize,
  TextField,
} from '@mui/material';
import Box from '@mui/material/Box';
import { JointtypeArray } from '../../common/common';
import SearchDoctor from '../../components/Autocomplete/SearchDoctor';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useEffect, useState } from 'react';
import {
  addPatientForm,
  assessmentForm,
  getPatientsFormById,
  updatePatientForm,
} from '../../apis/patientFormSlice';
import { LoadingButton } from '@mui/lab';
import { toast } from 'react-toastify';
import { addPatient, getPatientById, postalApi, updatePatient } from '../../apis/patientSlice';
import MedicineDialog from '../../components/MedicineDialog';
import HistoryDialog from '../../components/HistoryDialog';
import { clearPatientForm } from '../../apis/patientFormSlice';

const AssesstmentForm = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { patientForm: patient } = useSelector((state) => state.patientFormData);
  const { loggedIn } = useSelector((state) => state.authData);
  


  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    address: '',
    treatment: '',
    payment: '',
    numOfSessions: '',
    paymentOption: 'FOC',
    date: '',
    flex: '',
    abd: '',
    extension : '',
    rotation : '',
    spasm: '',
    stiffness: '',
    tenderness: '',
    effusion: '',
    mmt: '',
    cc: '',
    history: '',
    examinationComment: '',
    nrs: '',
    dosage1: '',
    dosage2: '',
    dosage3: '',
    dosage4: '',
    dosage5: '',
    dosage6: '',
    description: '',
    joint: null,
    treatment: '',
    assessBy: loggedIn && loggedIn.name,
    doctor: null,
    referenceDoctor: null,
    paymentType: 'prepaid',
    prescribeMedicine: 'no',
    gender: 'Male',
    occupation: '',
    pincode: '',
    city: '',
    state: '',
    area: null,
    prescriptions: [],
  });
  const [areaOptions, setAreaOptions] = useState([]);
  const [openHistory, setOpenHistory] = useState(false);

  const patientId = (patient && (patient.patient && patient.patient._id)) || (patient && patient._id) || null;

  useEffect(() => {
    if (id && id !== undefined) {
      dispatch(getPatientsFormById(id));
    }
  }, [id]);

  console.log('patient----', patient);
  

  // useEffect(() => {
  //   if (patient && id !== undefined) {
  //     setFormData({
  //       name: patient && patient?.patient?.name,
  //       phone: patient && patient?.patient?.phone,
  //       occupation: patient && patient?.patient?.occupation,
  //       pincode: patient && patient?.patient?.pincode,
  //       city: patient && patient?.patient?.city,
  //       state: patient && patient?.patient?.state,
  //       area:
  //         patient && patient?.patient?.area
  //           ? { label: patient?.patient?.area, value: patient?.patient?.area }
  //           : null,
  //       age: patient && patient?.patient?.age,
  //       address: patient && patient?.patient?.address,
  //       paymentOption: patient && patient.paymentOption,
  //       payment: patient && patient.payment,
  //       numOfSessions: patient && patient.numOfSessions,
  //       date: patient && patient.date,
  //       flex: patient && patient.flex,
  //       abd: patient && patient.abd,
  //       extension: patient && patient.extension,
  //       rotation: patient && patient.rotation,
  //       spasm: patient && patient.spasm,
  //       stiffness: patient && patient.stiffness,
  //       tenderness: patient && patient.tenderness,
  //       effusion: patient && patient.effusion,
  //       mmt: patient && patient.mmt,
  //       cc: patient && patient.cc,
  //       history: patient && patient.history,
  //       examinationComment: patient && patient.examinationComment,
  //       nrs: patient && patient.nrs,
  //       dosage1: patient && patient.dosage1,
  //       dosage2: patient && patient.dosage2,
  //       dosage3: patient && patient.dosage3,
  //       dosage4: patient && patient.dosage4,
  //       dosage5: patient && patient.dosage5,
  //       dosage6: patient && patient.dosage6,
  //       description: patient && patient.description,
  //       joint:
  //         { label: (patient && patient.joint) || '', value: (patient && patient.joint) || '' } ||
  //         null,
  //       treatment: patient && patient.treatment,
  //       assessBy: (patient && patient.assessBy) || (loggedIn && loggedIn.name),
  //       doctor:
  //         {
  //           label: (patient && patient.doctor && patient.doctor.name) || '',
  //           value: (patient && patient.doctor && patient.doctor._id) || '',
  //           ...patient.doctor,
  //         } || null,
  //       referenceDoctor:
  //         {
  //           label: (patient && patient.referenceDoctor && patient.referenceDoctor.name) || '',
  //           value: (patient && patient.referenceDoctor && patient.referenceDoctor._id) || '',
  //           ...patient.referenceDoctor,
  //         } || null,
  //       paymentType: patient && patient.paymentType ? patient.paymentType : 'prepaid',
  //       prescribeMedicine: patient && patient.prescribeMedicine ? patient.prescribeMedicine : 'no',
  //       prescriptions: patient && patient.prescriptions ? patient.prescriptions : [],
  //       gender: (patient && patient.gender) || 'Male',
  //     });
  //   } else {
  //     setFormData({
  //       name: '',
  //       phone: '',
  //       age: '',
  //       address: '',
  //       treatment: '',
  //       payment: '',
  //       numOfSessions: '',
  //       paymentOption: 'FOC',
  //       date: '',
  //       flex: '',
  //       abd: '',
  //       spasm: '',
  //       extension : '',
  //       rotation : '',
  //       stiffness: '',
  //       tenderness: '',
  //       effusion: '',
  //       mmt: '',
  //       cc: '',
  //       history: '',
  //       examinationComment: '',
  //       nrs: '',
  //       dosage1: '',
  //       dosage2: '',
  //       dosage3: '',
  //       dosage4: '',
  //       dosage5: '',
  //       dosage6: '',
  //       description: '',
  //       joint: null,
  //       treatment: '',
  //       assessBy: loggedIn && loggedIn.name,
  //       doctor: null,
  //       referenceDoctor: null,
  //       paymentType: 'prepaid',
  //       prescribeMedicine: 'no',
  //       prescriptions: [],
  //       gender: 'Male',
  //       occupation: '',
  //       pincode: '',
  //       city: '',
  //       state: '',
  //       area: null,
  //     });
  //   }
  // }, [patient, id]);


  useEffect(() => {
  if (id && patient) {
    // Edit mode: populate form
    setFormData({
      name: patient.patient?.name || '',
      phone: patient.patient?.phone || '',
      occupation: patient.patient?.occupation || '',
      pincode: patient.patient?.pincode || '',
      city: patient.patient?.city || '',
      state: patient.patient?.state || '',
      area: patient.patient?.area ? { label: patient.patient?.area, value: patient.patient?.area } : null,
      age: patient.patient?.age || '',
      address: patient.patient?.address || '',
      paymentOption: patient.paymentOption || 'FOC',
      payment: patient.payment || '',
      numOfSessions: patient.numOfSessions || '',
      date: patient.date || '',
      flex: patient.flex || '',
      abd: patient.abd || '',
      extension: patient.extension || '',
      rotation: patient.rotation || '',
      spasm: patient.spasm || '',
      stiffness: patient.stiffness || '',
      tenderness: patient.tenderness || '',
      effusion: patient.effusion || '',
      mmt: patient.mmt || '',
      cc: patient.cc || '',
      history: patient.history || '',
      examinationComment: patient.examinationComment || '',
      nrs: patient.nrs || '',
      dosage1: patient.dosage1 || '',
      dosage2: patient.dosage2 || '',
      dosage3: patient.dosage3 || '',
      dosage4: patient.dosage4 || '',
      dosage5: patient.dosage5 || '',
      dosage6: patient.dosage6 || '',
      description: patient.description || '',
      joint: patient.joint ? { label: patient.joint, value: patient.joint } : null,
      treatment: patient.treatment || '',
      assessBy: patient.assessBy || (loggedIn && loggedIn.name),
      doctor: patient.doctor
        ? { label: patient.doctor.name, value: patient.doctor._id, ...patient.doctor }
        : null,
      referenceDoctor: patient.referenceDoctor
        ? { label: patient.referenceDoctor.name, value: patient.referenceDoctor._id, ...patient.referenceDoctor }
        : null,
      paymentType: patient.paymentType || 'prepaid',
      prescribeMedicine: patient.prescribeMedicine || 'no',
      prescriptions: patient.prescriptions || [],
      gender: patient.gender || 'Male',
    });
  } else {
    // New form: reset
    setFormData({
      name: '',
      phone: '',
      age: '',
      address: '',
      treatment: '',
      payment: '',
      numOfSessions: '',
      paymentOption: 'FOC',
      date: '',
      flex: '',
      abd: '',
      extension: '',
      rotation: '',
      spasm: '',
      stiffness: '',
      tenderness: '',
      effusion: '',
      mmt: '',
      cc: '',
      history: '',
      examinationComment: '',
      nrs: '',
      dosage1: '',
      dosage2: '',
      dosage3: '',
      dosage4: '',
      dosage5: '',
      dosage6: '',
      description: '',
      joint: null,
      assessBy: loggedIn?.name || '',
      doctor: null,
      referenceDoctor: null,
      paymentType: 'prepaid',
      prescribeMedicine: 'no',
      prescriptions: [],
      gender: 'Male',
      occupation: '',
      pincode: '',
      city: '',
      state: '',
      area: null,
    });
  }
}, [patient, id, loggedIn]);


  const handleChange = async (e, fieldName, newValue) => {
    const { name, value } = e.target;

    // Handle Autocomplete (area)
    if (e && e.target && e.target.name === 'area') {
      setFormData((prev) => ({
        ...prev,
        area: newValue ? newValue.value : null,
      }));
    }

    // Handle phone number restriction (only digits, max 10)
    if (name === 'phone') {
      if (/^\d{0,10}$/.test(value)) {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
      return;
    }

    if (name === 'paymentOption') {
      setFormData((prev) => ({
        ...prev,
        paymentOption: value,
        payment: value === 'FOC' ? 'FOC' : '',
      }));
      return;
    }

    // Handle pincode and auto-fetch city/state
    if (name === 'pincode') {
      if (value.length === 6) {
        const response = await dispatch(postalApi({ pincode: value }));

        if (response && response.payload && response.payload[0] && response.payload[0].PostOffice) {
          const city = response.payload[0].PostOffice[0].District;
          const state = response.payload[0].PostOffice[0].State;

          setAreaOptions(
            response.payload[0].PostOffice.map((item) => ({
              label: item.Name,
              value: item.Name,
            })),
          );

          setFormData((prev) => ({
            ...prev,
            [name]: value,
            city,
            state,
          }));
          return;
        }
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          city: '',
          state: '',
          area: null,
        }));
      }
      return;
    }

    if (fieldName !== undefined && newValue !== undefined) {
      setFormData((prevData) => ({
        ...prevData,
        [fieldName]: newValue,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };


  const handlePaymentChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');

    setFormData((prev) => ({
      ...prev,
      payment: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.paymentType) {
      return toast.error('Please select payment type');
    }
    if (!formData.treatment || !formData.treatment.trim()) {
      return toast.error('Please enter treatment');
    }

    let finalData = {
      ...formData,
      id: id,
      joint:
        formData && formData.joint && typeof formData.joint == 'object'
          ? formData.joint.value
          : formData.joint,
      area: (formData && formData.area && formData.area.value) || '',
      patient: {
        name: formData.name,
        phone: formData.phone,
        age: formData.age,
        gender: formData.gender,
        occupation: formData.occupation,
        pincode: formData.pincode,
        city: formData.city,
        state: formData.state,
        area: (formData && formData.area && formData.area.value) || '',
        address: formData.address,
      },
    };

    // only include prescriptions when prescribing medicine
    finalData.prescriptions = formData && formData.prescribeMedicine === 'yes' ? formData.prescriptions || [] : [];



    const data = await dispatch(
      id == undefined ? addPatientForm(finalData) : updatePatientForm({ ...finalData, id: id }),
    );
    // const data = await dispatch(id == undefined ? addPatient(finalData) : updatePatient({ ...finalData, id: id }))

    toast.success(data?.payload?.message || 'Error Occurred');

    if (data && data.payload && data.payload.success) {
      navigate('/appointment');
      setFormData({
        name: '',
        phone: '',
        age: '',
        address: '',
        treatment: '',
        payment: '',
        numOfSessions: '',
        date: '',
        flex: '',
        abd: '',
        extension : '',
        rotation : '',
        spasm: '',
        stiffness: '',
        tenderness: '',
        effusion: '',
        mmt: '',
        cc: '',
        history: '',
        examinationComment: '',
        nrs: '',
        dosage1: '',
        dosage2: '',
        dosage3: '',
        dosage4: '',
        dosage5: '',
        dosage6: '',
        description: '',
        joint: null,
        treatment: '',
        assessBy: loggedIn && loggedIn.name,
        doctor: null,
        referenceDoctor: null,
        paymentType: 'prepaid',
        prescribeMedicine: 'no',
        gender: 'Male',
        occupation: '',
        pincode: '',
        city: '',
        state: '',
        area: null,
        paymentOption: 'FOC',
      });
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, marginBottom: '20px' }}>
        <a
          className={`btn btn-outline-success d-flex align-items-center p-2`}
          href={`${process.env.REACT_APP_BACKEND_API}/patientform/generateassessment?id=${id}`}
          target="_blank"
          rel="noreferrer"
          style={{
            textDecoration: 'none',
            color: '#fff',
            borderRadius: '5px',
          }}
        >
          <Button variant="contained">Generate Assessment Pdf</Button>
        </a>

        <Button variant="outlined" onClick={() => setOpenHistory(true)}>
          History
        </Button>
      </Box>

      <Box
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: '20px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <Box
          sx={{ width: '100%', borderRadius: '10px', border: '2px solid #282891', padding: '20px' }}
        >
          <h2>General Info</h2>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <TextField
                label="Patient Name"
                name="name"
                variant="standard"
                fullWidth
                value={formData && formData.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Patient Phone"
                name="phone"
                variant="standard"
                fullWidth
                value={formData && formData.phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Age"
                type="number"
                name="age"
                variant="standard"
                fullWidth
                value={formData && formData.age}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl>
                <FormLabel id="demo-row-radio-buttons-group-label">Gender</FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="demo-row-radio-buttons-group-label"
                  name="row-radio-buttons-group"
                  defaultValue={formData?.gender}
                >
                  <FormControlLabel value="Male" control={<Radio />} label="Male" />
                  <FormControlLabel value="Female" control={<Radio />} label="Female" />
                  <FormControlLabel value="Other" control={<Radio />} label="Other" />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Occupation"
                name="occupation"
                variant="standard"
                fullWidth
                value={formData && formData.occupation}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Pincode"
                name="pincode"
                variant="standard"
                fullWidth
                value={formData && formData.pincode}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="City"
                name="city"
                variant="standard"
                fullWidth
                value={formData && formData.city}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="State"
                name="state"
                variant="standard"
                fullWidth
                value={formData && formData.state}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <Autocomplete
                disablePortal
                name="area"
                options={areaOptions}
                size="small"
                value={formData?.area || null}
                onChange={(e, newValue) =>
                  handleChange({ target: { name: 'area', value: newValue } })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Area"
                    variant="standard" // <-- This makes it underline only
                    InputProps={{
                      ...params.InputProps,
                      disableUnderline: false, // ensure underline is shown
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Address"
                name="address"
                variant="standard"
                fullWidth
                value={formData && formData.address}
                onChange={handleChange}
              />
            </Grid>
            {/* <Grid item xs={6}>
              <TextField
                label="Payment"
                name="payment"
                type="number"
                variant="standard"
                fullWidth
                value={formData && formData.payment}
                onChange={handleChange}
              />
            </Grid> */}
            <Grid item xs={2}>
              <FormControl>
                <FormLabel>Payment Options</FormLabel>
                <RadioGroup
                  row
                  name="paymentOption"
                  value={formData.paymentOption}
                  onChange={handleChange}
                >
                  <FormControlLabel value="FOC" control={<Radio />} label="FOC" />
                  <FormControlLabel value="PAID" control={<Radio />} label="Paid" />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item xs={5}>
              <TextField
                label="Amount"
                name="payment"
                variant="standard"
                fullWidth
                disabled={formData.paymentOption === 'FOC'}
                value={formData.payment}
                onChange={handlePaymentChange}
                helperText={formData.paymentOption === 'FOC' ? 'Free of Cost' : 'Enter amount'}
                inputProps={{
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                }}
              />
            </Grid>
            
            <Grid item xs={5}>
              <TextField
                label="Select Date"
                type="date"
                variant="standard"
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                name="date"
                onChange={handleChange}
                value={
                  formData && formData.date && new Date(formData.date).toISOString().split('T')[0]
                }
              />
            </Grid>
          </Grid>
        </Box>
        <Box
          sx={{ width: '100%', borderRadius: '10px', border: '2px solid #282891', padding: '20px' }}
        >
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <TextField
                label="C/C"
                name="cc"
                value={formData && formData.cc}
                variant="standard"
                fullWidth
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="History"
                name="history"
                value={formData && formData.history}
                variant="standard"
                fullWidth
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Examination Comment"
                name="examinationComment"
                value={formData && formData.examinationComment}
                variant="standard"
                fullWidth
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </Box>
        <Box
          sx={{ width: '100%', borderRadius: '10px', border: '2px solid #282891', padding: '20px' }}
        >
          <h2>Examination</h2>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <TextField
                label="Flex"
                name="flex"
                value={formData && formData.flex}
                variant="standard"
                fullWidth
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Abd"
                name="abd"
                value={formData && formData.abd}
                variant="standard"
                fullWidth
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Extension"
                name="extension"
                value={formData && formData.extension}
                variant="standard"
                fullWidth
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Rotation"
                name="rotation"
                value={formData && formData.rotation}
                variant="standard"
                fullWidth
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </Box>
        <Box
          sx={{ width: '100%', borderRadius: '10px', border: '2px solid #282891', padding: '20px' }}
        >
          <h2>Palpation</h2>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <TextField
                label="Spasm"
                name="spasm"
                value={formData && formData.spasm}
                variant="standard"
                fullWidth
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Stiffness"
                name="stiffness"
                value={formData && formData.stiffness}
                variant="standard"
                fullWidth
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Tenderness"
                name="tenderness"
                value={formData && formData.tenderness}
                variant="standard"
                fullWidth
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Effusion"
                name="effusion"
                value={formData && formData.effusion}
                variant="standard"
                fullWidth
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </Box>
        <Box
          sx={{ width: '100%', borderRadius: '10px', border: '2px solid #282891', padding: '20px' }}
        >
          <h2>Other Info</h2>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <TextField
                label="MMT"
                name="mmt"
                value={formData && formData.mmt}
                variant="standard"
                fullWidth
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </Box>
        
        <Box
          sx={{ width: '100%', borderRadius: '10px', border: '2px solid #282891', padding: '20px' }}
        >
          <h2>Functional Assessment and Treatment</h2>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="NRS"
                name="nrs"
                value={formData && formData.nrs}
                variant="standard"
                fullWidth
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <h2 style={{ marginTop: '10px' }}>Dosage</h2>

          <Grid container spacing={3}>
            <Grid item xs={6}>
              <TextField
                label="Dosage 1"
                name="dosage1"
                value={formData && formData.dosage1}
                variant="standard"
                fullWidth
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Dosage 2"
                name="dosage2"
                value={formData && formData.dosage2}
                variant="standard"
                fullWidth
                onChange={handleChange}
              />
            </Grid>
          </Grid>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <TextField
                label="Dosage 3"
                name="dosage3"
                value={formData && formData.dosage3}
                variant="standard"
                fullWidth
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Dosage 4"
                name="dosage4"
                value={formData && formData.dosage4}
                variant="standard"
                fullWidth
                onChange={handleChange}
              />
            </Grid>
          </Grid>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <TextField
                label="Dosage 5"
                name="dosage5"
                value={formData && formData.dosage5}
                variant="standard"
                fullWidth
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Dosage 6"
                name="dosage6"
                value={formData && formData.dosage6}
                variant="standard"
                fullWidth
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </Box>

        <Box
          sx={{ width: '100%', borderRadius: '10px', border: '2px solid #282891', padding: '20px' }}
        >
          <h2>Diagnosis</h2>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <TextField
                label="Description"
                name="description"
                value={formData && formData.description}
                variant="standard"
                fullWidth
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <Autocomplete
                id="tags-standard"
                options={JointtypeArray}
                getOptionLabel={(option) => option?.label}
                value={
                  JointtypeArray.find((item) => item.value == formData.joint)
                    ? JointtypeArray.find((item) => item.value == formData.joint)
                    : formData.joint || null
                }
                onChange={(e, newValue) => handleChange(e, 'joint', newValue?.value || '')}
                renderInput={(params) => (
                  <TextField {...params} variant="standard" label="Joint" placeholder="Joint" />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextareaAutosize
                minRows={7}
                placeholder="Treatment"
                name="treatment"
                onChange={handleChange}
                fullWidth
                value={formData && formData.treatment}
                style={{
                  width: '100%',
                  border: '1px solid #282891',
                  borderRadius: '5px',
                  padding: '10px',
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Assess By"
                name="assessBy"
                value={formData && formData.assessBy}
                variant="standard"
                fullWidth
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <SearchDoctor
                variant="standard"
                open={true}
                setData={setFormData}
                data={formData}
                name="doctor"
              />
            </Grid>
          </Grid>
        </Box>

        <Box
          sx={{ width: '100%', borderRadius: '10px', border: '2px solid #282891', padding: '20px' }}
        >
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <SearchDoctor
                variant="standard"
                open={true}
                label="Reference Doctor"
                setData={setFormData}
                data={formData}
                name="referenceDoctor"
              />
            </Grid>
             <Grid item xs={4}>
              <TextField
                label="No. of Sessions"
                name="numOfSessions"
                type="number"
                variant="standard"
                fullWidth
                value={formData && formData.numOfSessions}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={2}>
              <FormControl>
                <FormLabel id="demo-row-radio-buttons-group-label">Payment Type</FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="demo-row-radio-buttons-group-label"
                  name="row-radio-buttons-group"
                  value={formData && formData.paymentType}
                  onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                  defaultValue={formData && formData.paymentType}
                >
                  <FormControlLabel value="prepaid" control={<Radio />} label="Prepaid" />
                  <FormControlLabel value="postpaid" control={<Radio />} label="Postpaid" />
                </RadioGroup>
              </FormControl>
            </Grid>
            
            <Grid item xs={6}>
              <FormControl>
                <FormLabel id="demo-row-radio-buttons-group-label">Prescribe Medicine</FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="demo-row-radio-buttons-group-label"
                  name="row-radio-buttons-group"
                  value={formData && formData.prescribeMedicine}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFormData((prev) => ({ ...prev, prescribeMedicine: v, prescriptions: v === 'no' ? [] : prev.prescriptions }));
                  }}
                  defaultValue={formData && formData.prescribeMedicine}
                >
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </Grid>

          </Grid>
              {formData && formData.prescribeMedicine === 'yes' && (
          <Box sx={{ mt: 2 }}>
            <MedicineDialog
              inline={true}
              prescriptions={formData.prescriptions}
              setPrescriptions={(p) => setFormData((prev) => ({ ...prev, prescriptions: p }))}
            />
          </Box>
        )}
        </Box>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '20px',
          }}
        >
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              // reset redux and local state before leaving
              dispatch(clearPatientForm());
              setFormData({
                name: '',
                phone: '',
                age: '',
                address: '',
                treatment: '',
                payment: '',
                numOfSessions: '',
                paymentOption: 'FOC',
                date: '',
                flex: '',
                abd: '',
                extension: '',
                rotation: '',
                spasm: '',
                stiffness: '',
                tenderness: '',
                effusion: '',
                mmt: '',
                cc: '',
                history: '',
                examinationComment: '',
                nrs: '',
                dosage1: '',
                dosage2: '',
                dosage3: '',
                dosage4: '',
                dosage5: '',
                dosage6: '',
                description: '',
                joint: null,
                treatment: '',
                assessBy: loggedIn && loggedIn.name,
                doctor: null,
                referenceDoctor: null,
                paymentType: 'prepaid',
                prescribeMedicine: 'no',
                gender: 'Male',
                occupation: '',
                pincode: '',
                city: '',
                state: '',
                area: null,
                prescriptions: [],
              });
              navigate('/appointment');
            }}
          >
            Cancel
          </Button>
          <LoadingButton variant="contained" className="dialogSubmitBtn" onClick={handleSubmit}>
            Submit
          </LoadingButton>
        </Box>
      
      </Box>
      <HistoryDialog open={openHistory} onClose={() => setOpenHistory(false)} patientId={patientId} />
    </>
  );
};

export default AssesstmentForm;
