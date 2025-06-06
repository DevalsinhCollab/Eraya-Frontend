import { Autocomplete, Button, FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, TextareaAutosize, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import { JointtypeArray } from '../../common/common';
import SearchDoctor from '../../components/Autocomplete/SearchDoctor';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { assessmentForm, getPatientsFormById } from '../../apis/patientFormSlice';
import { LoadingButton } from '@mui/lab';
import { toast } from 'react-toastify';

const AssesstmentForm = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { patientForm } = useSelector((state) => state.patientFormData);
    const { loggedIn } = useSelector((state) => state.authData);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        age: '',
        address: '',
        treatment: '',
        payment: '',
        date: '',
        flex: '',
        abd: '',
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
        patientId: ""
    })

    useEffect(() => {
        dispatch(getPatientsFormById(id))
    }, [id]);

    useEffect(() => {
        if (patientForm) {
            setFormData(
                {
                    patientId: patientForm && patientForm.patient && patientForm.patient._id,
                    name: patientForm && patientForm.patient && patientForm.patient.name,
                    phone: patientForm && patientForm.patient && patientForm.patient.phone,
                    age: patientForm && patientForm.patient && patientForm.patient.age,
                    address: patientForm && patientForm.patient && patientForm.patient.address,
                    treatment: patientForm && patientForm.treatment,
                    payment: patientForm && patientForm.payment,
                    date: patientForm && patientForm.date,
                    flex: patientForm && patientForm.flex,
                    abd: patientForm && patientForm.abd,
                    spasm: patientForm && patientForm.spasm,
                    stiffness: patientForm && patientForm.stiffness,
                    tenderness: patientForm && patientForm.tenderness,
                    effusion: patientForm && patientForm.effusion,
                    mmt: patientForm && patientForm.mmt,
                    cc: patientForm && patientForm.cc,
                    history: patientForm && patientForm.history,
                    examinationComment: patientForm && patientForm.examinationComment,
                    nrs: patientForm && patientForm.nrs,
                    dosage1: patientForm && patientForm.dosage1,
                    dosage2: patientForm && patientForm.dosage2,
                    dosage3: patientForm && patientForm.dosage3,
                    dosage4: patientForm && patientForm.dosage4,
                    dosage5: patientForm && patientForm.dosage5,
                    dosage6: patientForm && patientForm.dosage6,
                    description: patientForm && patientForm.description,
                    joint: { label: patientForm && patientForm.joint, value: patientForm && patientForm.joint } || null,
                    treatment: patientForm && patientForm.treatment,
                    assessBy: patientForm && patientForm.assessBy || loggedIn && loggedIn.name,
                    doctor: { label: patientForm && patientForm.doctor && patientForm.doctor.name || "", value: patientForm && patientForm.doctor && patientForm.doctor._id || "", ...patientForm.doctor } || null,
                    referenceDoctor: { label: patientForm && patientForm.referenceDoctor && patientForm.referenceDoctor.name || "", value: patientForm && patientForm.referenceDoctor && patientForm.referenceDoctor._id || "", ...patientForm.referenceDoctor } || null,
                    paymentType: patientForm && patientForm.paymentType ? patientForm.paymentType : 'prepaid',
                    prescribeMedicine: patientForm && patientForm.prescribeMedicine ? patientForm.prescribeMedicine : 'no',
                }
            )
        }
    }, [patientForm, id])

    const handleChange = (e, fieldName, newValue) => {
        const { name, value } = e.target

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

    const handleSubmit = async () => {
        let finalData = {
            ...formData,
            id: id,
            joint: formData.joint ? formData.joint.label : "",
        }

        const data = await dispatch(assessmentForm(finalData))

        toast.success(data?.payload?.message || "Error Occurred");

        if (data && data.payload && data.payload.success) {
            navigate("/form");
        }
    }

    return (
        <>
            <a
                className={`btn btn-outline-success d-flex align-items-center p-2`}
                href={`${process.env.REACT_APP_BACKEND_API}/patientform/generateassessment?id=${id}`}
                target="_blank"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'end', textDecoration: 'none', marginBottom: '20px', color: '#fff', borderRadius: '5px' }}
            >
                <Button variant="contained">
                    Generate Assessment Pdf
                </Button>
            </a>

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

                <Box sx={{ width: '100%', borderRadius: '10px', border: '2px solid #282891', padding: '20px' }}>
                    <h2>General Info</h2>
                    <Grid container spacing={3}>
                        <Grid item xs={6}>
                            <TextField label="Patient Name" name='name' variant="standard" fullWidth value={formData && formData.name} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Patient Phone" name='phone' variant="standard" fullWidth value={formData && formData.phone} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Age" name='age' variant="standard" fullWidth value={formData && formData.age} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Address" name='address' variant="standard" fullWidth value={formData && formData.address} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Payment" name='payment' variant="standard" fullWidth value={formData && formData.payment} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
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
                                value={patientForm && patientForm.date && new Date(patientForm.date).toISOString().split("T")[0]}
                            />
                        </Grid>
                    </Grid>
                </Box>
                <Box sx={{ width: '100%', borderRadius: '10px', border: '2px solid #282891', padding: '20px' }}>
                    <h2>Examination</h2>
                    <Grid container spacing={3}>
                        <Grid item xs={6}>
                            <TextField label="Flex" name='flex' value={formData && formData.flex} variant="standard" fullWidth onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Abd" name='abd' value={formData && formData.abd} variant="standard" fullWidth onChange={handleChange} />
                        </Grid>
                    </Grid>
                </Box>
                <Box sx={{ width: '100%', borderRadius: '10px', border: '2px solid #282891', padding: '20px' }}>
                    <h2>Palpation</h2>
                    <Grid container spacing={3}>
                        <Grid item xs={6}>
                            <TextField label="Spasm" name='spasm' value={formData && formData.spasm} variant="standard" fullWidth onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Stiffness" name='stiffness' value={formData && formData.stiffness} variant="standard" fullWidth onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Tenderness" name='tenderness' value={formData && formData.tenderness} variant="standard" fullWidth onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Effusion" name='effusion' value={formData && formData.effusion} variant="standard" fullWidth onChange={handleChange} />
                        </Grid>
                    </Grid>
                </Box>
                <Box sx={{ width: '100%', borderRadius: '10px', border: '2px solid #282891', padding: '20px' }}>
                    <h2>Other Info</h2>
                    <Grid container spacing={3}>
                        <Grid item xs={6}>
                            <TextField label="MMT" name='mmt' value={formData && formData.mmt} variant="standard" fullWidth onChange={handleChange} />
                        </Grid>
                    </Grid>
                </Box>
                <Box sx={{ width: '100%', borderRadius: '10px', border: '2px solid #282891', padding: '20px' }}>
                    <Grid container spacing={3}>
                        <Grid item xs={6}>
                            <TextField label="C/C" name='cc' value={formData && formData.cc} variant="standard" fullWidth onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="History" name='history' value={formData && formData.history} variant="standard" fullWidth onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Examination Comment" name='examinationComment' value={formData && formData.examinationComment} variant="standard" fullWidth onChange={handleChange} />
                        </Grid>
                    </Grid>
                </Box>
                <Box sx={{ width: '100%', borderRadius: '10px', border: '2px solid #282891', padding: '20px' }}>
                    <h2>Functional Assessment and Treatment</h2>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField label="NRS" name='nrs' value={formData && formData.nrs} variant="standard" fullWidth onChange={handleChange} />
                        </Grid>
                    </Grid>

                    <h2 style={{ marginTop: "10px" }}>Dosage</h2>

                    <Grid container spacing={3}>
                        <Grid item xs={6}>
                            <TextField label="Dosage 1" name='dosage1' value={formData && formData.dosage1} variant="standard" fullWidth onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Dosage 2" name='dosage2' value={formData && formData.dosage2} variant="standard" fullWidth onChange={handleChange} />
                        </Grid>
                    </Grid>
                    <Grid container spacing={3}>
                        <Grid item xs={6}>
                            <TextField label="Dosage 3" name='dosage3' value={formData && formData.dosage3} variant="standard" fullWidth onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Dosage 4" name='dosage4' value={formData && formData.dosage4} variant="standard" fullWidth onChange={handleChange} />
                        </Grid>
                    </Grid>
                    <Grid container spacing={3}>
                        <Grid item xs={6}>
                            <TextField label="Dosage 5" name='dosage5' value={formData && formData.dosage5} variant="standard" fullWidth onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Dosage 6" name='dosage6' value={formData && formData.dosage6} variant="standard" fullWidth onChange={handleChange} />
                        </Grid>
                    </Grid>
                </Box>

                <Box sx={{ width: '100%', borderRadius: '10px', border: '2px solid #282891', padding: '20px' }}>
                    <h2>Diagnosis</h2>
                    <Grid container spacing={3}>
                        <Grid item xs={6}>
                            <TextField label="Description" name='description' value={formData && formData.description} variant="standard" fullWidth onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <Autocomplete
                                id="tags-standard"
                                options={JointtypeArray}
                                getOptionLabel={(option) => option.label}
                                value={formData.joint}
                                onChange={(e, newValue) => handleChange(e, 'joint', newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="standard"
                                        label="Joint"
                                        placeholder="Favorites"
                                    />
                                )}
                            />

                        </Grid>
                        <Grid item xs={12}>
                            <TextareaAutosize
                                minRows={7}
                                placeholder="Treatment"
                                name='treatment'
                                onChange={handleChange}
                                fullWidth
                                value={formData && formData.treatment}
                                style={{ width: '100%', border: '1px solid #282891', borderRadius: '5px', padding: '10px' }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Assess By" name='assessBy' value={formData && formData.assessBy} variant="standard" fullWidth onChange={handleChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <SearchDoctor variant="standard" open={true} setData={setFormData} data={formData} name="doctor" />
                        </Grid>
                    </Grid>
                </Box>

                <Box sx={{ width: '100%', borderRadius: '10px', border: '2px solid #282891', padding: '20px' }}>
                    <Grid container spacing={3}>
                        <Grid item xs={6}>
                            <SearchDoctor variant="standard" open={true} label="Reference Doctor" setData={setFormData} data={formData} name="referenceDoctor" />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl>
                                <FormLabel id="demo-row-radio-buttons-group-label">Payment Type</FormLabel>
                                <RadioGroup
                                    row
                                    aria-labelledby="demo-row-radio-buttons-group-label"
                                    name="row-radio-buttons-group"
                                    value={formData && formData.paymentType}
                                    onChange={(e) =>
                                        setFormData({ ...formData, paymentType: e.target.value })
                                    }
                                    defaultValue={formData && formData.paymentType}
                                >
                                    <FormControlLabel value="prepaid" control={<Radio />} label="Prepaid" />
                                    <FormControlLabel value="postpaid" control={<Radio />} label="Postpaid" />
                                </RadioGroup>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl>
                                <FormLabel id="demo-row-radio-buttons-group-label">
                                    Prescribe Medicine
                                </FormLabel>
                                <RadioGroup
                                    row
                                    aria-labelledby="demo-row-radio-buttons-group-label"
                                    name="row-radio-buttons-group"
                                    value={formData && formData.prescribeMedicine}
                                    onChange={(e) =>
                                        setFormData({ ...formData, prescribeMedicine: e.target.value })
                                    }
                                    defaultValue={formData && formData.prescribeMedicine}
                                >
                                    <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                                    <FormControlLabel value="no" control={<Radio />} label="No" />
                                </RadioGroup>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Box>
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                    <Button variant="contained" color="error" onClick={() => navigate("/form")}>
                        Cancel
                    </Button>
                    <LoadingButton
                        variant="contained"
                        className="dialogSubmitBtn"
                        onClick={handleSubmit}
                    >
                        Submit
                    </LoadingButton>
                </Box>
            </Box>
        </>

    );
};

export default AssesstmentForm;