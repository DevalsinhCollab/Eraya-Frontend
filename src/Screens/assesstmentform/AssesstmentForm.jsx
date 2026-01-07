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
  Checkbox,
  TextField,
} from '@mui/material';
import Box from '@mui/material/Box';
import { JointtypeArray } from '../../common/common';
import SearchDoctor from '../../components/Autocomplete/SearchDoctor';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useEffect, useState, useMemo } from 'react';
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
import Signature from '../../components/Signature/Signature';
import { clearPatientForm } from '../../apis/patientFormSlice';

// Returns an empty formData object matching backend schema for a given type
const getEmptyFormData = (type) => {
  const PHYSIO = {
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
    treatment: '',
    numOfSessions: '',
    date: '',
  };

  // Nested structures for dental and esthetic must match backend-ish shapes
  const DENTAL = {
    dentalQuestions: {
      specificConcern: '',
      previousTreatments: '',
      evaluationAndTreatmentPlan: '',
      medicalHistory: {
        underCareOfOtherDentist: '',
        medications: '',
        allergies: '',
      },
      consent: {
        agreed: false,
        signature: '',
        date: '',
      },
    },
  };

  const ESTHETIC = {
    estheticsQuestions: {
      skinConcern: '',
      previousTreatments: '',
      medicalHistory: {
        underPhysicianCare: false,
        medications: '',
        allergies: '',
      },
      preferences: {
        aestheticGoals: '',
        procedureInterest: '',
        skincareRoutine: '',
      },
      consent: {
        agreed: false,
        signature: '',
        date: '',
      },
    },
  };

  if (type === 'DENTAL') return DENTAL;
  if (type === 'ESTHETIC') return ESTHETIC;
  return PHYSIO;
};

// Dental question configuration used to render the dental assessment UI
const DENTAL_QUESTIONS = [
  {
    section: 'Chief Complaint',
    question:
      'What specific concern would you like to address?(eg. pain,missing teeth,teeth alignment',
    type: 'text',
    path: 'dentalQuestions.specificConcern',
  },
  {
    section: 'Chief Complaint',
    question:
      'Have you undergone any previous dental treatments?(Yes/No) if yes,please provide details',
    type: 'text',
    path: 'dentalQuestions.previousTreatments',
  },

  {
    section: 'Medical History',
    question: 'Are you currently under care of any other dentist?(Yes/No)',
    type: 'text',
    path: 'dentalQuestions.medicalHistory.underCareOfOtherDentist',
  },
  {
    section: 'Medical History',
    question: 'List any current medications or supplements',
    type: 'text',
    path: 'dentalQuestions.medicalHistory.medications',
  },
  {
    section: 'Medical History',
    question: 'Any known allergies?',
    type: 'text',
    path: 'dentalQuestions.medicalHistory.allergies',
  },

  {
    section: 'Evaluation',
    question: 'Dental Evaluation and Treatment Plan',
    type: 'textarea',
    path: 'dentalQuestions.evaluationAndTreatmentPlan',
  },

  {
    section: 'Consent',
    question: 'I consent to the proposed dental treatment',
    type: 'checkbox',
    path: 'dentalQuestions.consent.agreed',
  },
  {
    section: 'Consent',
    question: 'Signature',
    type: 'text',
    path: 'dentalQuestions.consent.signature',
  },
  {
    section: 'Consent',
    question: 'Consent Date',
    type: 'date',
    path: 'dentalQuestions.consent.date',
  },
];

// Esthetic question configuration
const ESTHETIC_QUESTIONS = [
  {
    section: 'Skin & Beauty Concern',
    question: 'What specific concern would you like to address?(eg. wrinkles,acne,pigmentation)',
    type: 'text',
    path: 'estheticsQuestions.skinConcern',
  },
  {
    section: 'Skin & Beauty Concern',
    question:
      'Have you undergone any previous cosmetic treatments?(Yes/No) if yes,please provide details',
    type: 'text',
    path: 'estheticsQuestions.previousTreatments',
  },

  {
    section: 'Medical History',
    question: 'Are you under care of a physician?(Yes/No)',
    type: 'text',
    path: 'estheticsQuestions.medicalHistory.underPhysicianCare',
  },
  {
    section: 'Medical History',
    question: 'Current medications or supplements you are taking',
    type: 'text',
    path: 'estheticsQuestions.medicalHistory.medications',
  },
  {
    section: 'Medical History',
    question: 'Any known allergies?',
    type: 'text',
    path: 'estheticsQuestions.medicalHistory.allergies',
  },

  {
    section: 'Esthetic Preferences',
    question: 'What aesthetic goals do you have in mind?',
    type: 'textarea',
    path: 'estheticsQuestions.preferences.aestheticGoals',
  },
  {
    section: 'Esthetic Preferences',
    question: 'Interested in non-invasive / injections / surgical?',
    type: 'radio',
    path: 'estheticsQuestions.preferences.procedureInterest',
    options: ['Non-invasive', 'Injections', 'Surgical', 'Not sure'],
  },
  {
    section: 'Esthetic Preferences',
    question: 'Describe your current skincare routine',
    type: 'textarea',
    path: 'estheticsQuestions.preferences.skincareRoutine',
  },

  {
    section: 'Consent',
    question: 'I consent to the proposed esthetic treatment',
    type: 'checkbox',
    path: 'estheticsQuestions.consent.agreed',
  },
  {
    section: 'Consent',
    question: 'Signature',
    type: 'text',
    path: 'estheticsQuestions.consent.signature',
  },
  {
    section: 'Consent',
    question: 'Consent Date',
    type: 'date',
    path: 'estheticsQuestions.consent.date',
  },
];

// Dynamic renderer for Esthetic form using ESTHETIC_QUESTIONS
const DynamicEstheticFormRenderer = ({ formData, onChange }) => {
  if (!formData || !onChange) return null;

  const sections = ESTHETIC_QUESTIONS.reduce((acc, q) => {
    acc[q.section] = acc[q.section] || [];
    acc[q.section].push(q);
    return acc;
  }, {});

  const handleChange = (path, rawValue, type) => {
    let value = rawValue;
    if (type === 'checkbox') value = !!rawValue;
    if (type === 'date') value = rawValue ? new Date(rawValue).toISOString() : '';
    const updated = setValueByPath(formData, path, value);
    onChange(updated);
  };

  return (
    <Box sx={{ width: '100%', borderRadius: '10px', border: '2px solid #282891', padding: '20px' }}>
      <h2 style={{ marginBottom: '1rem' }}>Esthetic Assessment</h2>
      {Object.keys(sections).map((section) => (
        <Box key={section} sx={{ marginBottom: 2 }}>
          <h3>{section}</h3>
          <Grid container spacing={3}>
            {sections[section].map((q) => {
              const val = getValueByPath(formData, q.path);
              if (q.type === 'textarea') {
                return (
                  <Grid item xs={12} key={q.path}>
                    <TextField
                      label={q.question}
                      variant="standard"
                      fullWidth
                      multiline
                      minRows={3}
                      value={val || ''}
                      onChange={(e) => handleChange(q.path, e.target.value, 'textarea')}
                    />
                  </Grid>
                );
              }

              if (q.type === 'checkbox') {
                return (
                  <Grid item xs={12} key={q.path}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!!val}
                          onChange={(e) => handleChange(q.path, e.target.checked, 'checkbox')}
                        />
                      }
                      label={q.question}
                    />
                  </Grid>
                );
              }

              if (q.type === 'date') {
                const dateVal = val ? new Date(val).toISOString().split('T')[0] : '';
                return (
                  <Grid item xs={6} key={q.path}>
                    <TextField
                      label={q.question}
                      type="date"
                      variant="standard"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={dateVal}
                      onChange={(e) => handleChange(q.path, e.target.value, 'date')}
                    />
                  </Grid>
                );
              }

              if (q.type === 'radio') {
                return (
                  <Grid item xs={12} key={q.path}>
                    <FormControl>
                      <FormLabel>{q.question}</FormLabel>
                      <RadioGroup
                        row
                        value={val || ''}
                        onChange={(e) => handleChange(q.path, e.target.value, 'radio')}
                      >
                        {q.options &&
                          q.options.map((opt) => (
                            <FormControlLabel
                              key={opt}
                              value={opt}
                              control={<Radio />}
                              label={opt}
                            />
                          ))}
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                );
              }

              // Signature field uses a specialized component
              if (
                (q.path && q.path.toLowerCase().includes('signature')) ||
                (q.question && q.question.toLowerCase().includes('signature'))
              ) {
                return (
                  <Grid item xs={12} key={q.path}>
                    <Signature
                      label={q.question}
                      value={val || ''}
                      onChange={(data) => handleChange(q.path, data, 'signature')}
                    />
                  </Grid>
                );
              }

              // default to text
              return (
                <Grid item xs={6} key={q.path}>
                  <TextField
                    label={q.question}
                    variant="standard"
                    fullWidth
                    value={val || ''}
                    onChange={(e) => handleChange(q.path, e.target.value, 'text')}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Box>
      ))}
    </Box>
  );
};

// Immutable set helper for nested path (dot notation). Returns a new object.
const setValueByPath = (obj, path, value) => {
  const keys = path.split('.');
  const root = Array.isArray(obj) ? [...obj] : { ...obj };
  let cursor = root;

  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    if (i === keys.length - 1) {
      cursor[k] = value;
    } else {
      const next = cursor[k];
      cursor[k] =
        next && typeof next === 'object' ? (Array.isArray(next) ? [...next] : { ...next }) : {};
      cursor = cursor[k];
    }
  }
  return root;
};

const getValueByPath = (obj, path) => {
  if (!obj) return undefined;
  const keys = path.split('.');
  let cursor = obj;
  for (let k of keys) {
    if (cursor == null) return undefined;
    cursor = cursor[k];
  }
  return cursor;
};

// Reusable dental renderer which reads DENTAL_QUESTIONS and updates formSpecific immutably
const DynamicDentalFormRenderer = ({ formData, onChange }) => {
  if (!formData || !onChange) return null;

  // Group questions by section
  const sections = DENTAL_QUESTIONS.reduce((acc, q) => {
    acc[q.section] = acc[q.section] || [];
    acc[q.section].push(q);
    return acc;
  }, {});

  const handleChange = (path, rawValue, type) => {
    let value = rawValue;
    if (type === 'checkbox') {
      value = !!rawValue;
    }
    if (type === 'date') {
      // store ISO date string or empty
      value = rawValue ? new Date(rawValue).toISOString() : '';
    }
    const updated = setValueByPath(formData, path, value);
    onChange(updated);
  };

  return (
    <Box sx={{ width: '100%', borderRadius: '10px', border: '2px solid #282891', padding: '20px' }}>
      <h2 style={{ marginBottom: '1rem' }}>Dental Assessment</h2>
      {Object.keys(sections).map((section) => (
        <Box key={section} sx={{ marginBottom: 2 }}>
          <h3>{section}</h3>
          <Grid container spacing={3}>
            {sections[section].map((q) => {
              const val = getValueByPath(formData, q.path);
              if (q.type === 'textarea') {
                return (
                  <Grid item xs={12} key={q.path}>
                    <TextField
                      label={q.question}
                      variant="standard"
                      fullWidth
                      multiline
                      minRows={3}
                      value={val || ''}
                      onChange={(e) => handleChange(q.path, e.target.value, 'textarea')}
                    />
                  </Grid>
                );
              }

              if (q.type === 'checkbox') {
                return (
                  <Grid item xs={12} key={q.path}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!!val}
                          onChange={(e) => handleChange(q.path, e.target.checked, 'checkbox')}
                        />
                      }
                      label={q.question}
                    />
                  </Grid>
                );
              }

              if (q.type === 'date') {
                const dateVal = val ? new Date(val).toISOString().split('T')[0] : '';
                return (
                  <Grid item xs={6} key={q.path}>
                    <TextField
                      label={q.question}
                      type="date"
                      variant="standard"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={dateVal}
                      onChange={(e) => handleChange(q.path, e.target.value, 'date')}
                    />
                  </Grid>
                );
              }

              // Signature field uses a specialized component
              if (
                (q.path && q.path.toLowerCase().includes('signature')) ||
                (q.question && q.question.toLowerCase().includes('signature'))
              ) {
                return (
                  <Grid item xs={12} key={q.path}>
                    <Signature
                      label={q.question}
                      value={val || ''}
                      onChange={(data) => handleChange(q.path, data, 'signature')}
                    />
                  </Grid>
                );
              }

              // default to text
              return (
                <Grid item xs={6} key={q.path}>
                  <TextField
                    label={q.question}
                    variant="standard"
                    fullWidth
                    value={val || ''}
                    onChange={(e) => handleChange(q.path, e.target.value, 'text')}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Box>
      ))}
    </Box>
  );
};

// Small renderer that maps a template object to TextField controls and keeps them controlled
const DynamicFormRenderer = ({
  formType,
  formData,
  onChange,
  parentFormData,
  setParentFormData,
}) => {
  if (!formData || !onChange) return null;

  const renderField = (key) => (
    <Grid item xs={6} key={key}>
      <TextField
        label={key}
        name={key}
        variant="standard"
        fullWidth
        value={formData[key] ?? ''}
        onChange={(e) => onChange({ ...formData, [key]: e.target.value })}
      />
    </Grid>
  );

  if (formType === 'DENTAL') {
    return <DynamicDentalFormRenderer formData={formData} onChange={onChange} />;
  }

  if (formType === 'ESTHETIC') {
    return <DynamicEstheticFormRenderer formData={formData} onChange={onChange} />;
  }

  // PHYSIO: render groups similarly to original layout but driven from formData keys
  return (
    <>
      <Box
        sx={{ width: '100%', borderRadius: '10px', border: '2px solid #282891', padding: '20px' }}
      >
        <Grid container spacing={3}>
          {['cc', 'history', 'examinationComment'].map((k) => (
            <Grid item xs={6} key={k}>
              <TextField
                label={k}
                name={k}
                variant="standard"
                fullWidth
                value={formData[k] ?? ''}
                onChange={(e) => onChange({ ...formData, [k]: e.target.value })}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
      <Box
        sx={{ width: '100%', borderRadius: '10px', border: '2px solid #282891', padding: '20px' }}
      >
        <h2>Examination</h2>
        <Grid container spacing={3}>
          {['flex', 'abd', 'extension', 'rotation'].map((k) => renderField(k))}
        </Grid>
      </Box>

      <Box
        sx={{ width: '100%', borderRadius: '10px', border: '2px solid #282891', padding: '20px' }}
      >
        <h2>Palpation</h2>
        <Grid container spacing={3}>
          {['spasm', 'stiffness', 'tenderness', 'effusion'].map((k) => renderField(k))}
        </Grid>
      </Box>

      <Box
        sx={{ width: '100%', borderRadius: '10px', border: '2px solid #282891', padding: '20px' }}
      >
        <h2>Other Info</h2>
        <Grid container spacing={3}>
          {['mmt', 'nrs'].map((k) => renderField(k))}
        </Grid>
      </Box>

      <Box
        sx={{ width: '100%', borderRadius: '10px', border: '2px solid #282891', padding: '20px' }}
      >
        <h2 style={{ marginTop: '10px' }}>Dosage</h2>
        <Grid container spacing={3}>
          {['dosage1', 'dosage2', 'dosage3', 'dosage4', 'dosage5', 'dosage6'].map((k) =>
            renderField(k),
          )}
        </Grid>
      </Box>
      {console.log(
  'joint in state:',
  parentFormData?.joint,
  'matched option:',
  JointtypeArray.find(j => j.value === parentFormData?.joint)
)
}

      <Box
        sx={{ width: '100%', borderRadius: '10px', border: '2px solid #282891', padding: '20px' }}
      >
        <h2>Diagnosis</h2>
        <Grid container spacing={3}>
          {['description'].map((k) => renderField(k))}
          <Grid item xs={6}>



            <Autocomplete
              id="tags-standard"
              options={JointtypeArray}
              getOptionLabel={(option) => option?.label}
              isOptionEqualToValue={(option, value) => option.value === value.value}
              // value={
              //   JointtypeArray.find(
              //     (item) => item.value == (parentFormData && parentFormData.joint),
              //   )
              //     ? JointtypeArray.find(
              //         (item) => item.value == (parentFormData && parentFormData.joint),
              //       )
              //     : (parentFormData && parentFormData.joint) || null
              // }
                value={
    JointtypeArray.find(
      (item) => item.value === parentFormData?.joint
    ) || null
  }
              // onChange={(e, newValue) => {
              //   // Keep joint selection in parent form state (preserve original behavior)
              //   if (setParentFormData) {
              //     setParentFormData((prev) => ({ ...prev, joint: newValue?.value || '' }));
              //   }
              // }}

              onChange={(e, newValue) => {
    setParentFormData((prev) => ({
      ...prev,
      joint: newValue?.value || '',
    }));
  }}
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
              onChange={(e) => onChange({ ...formData, treatment: e.target.value })}
              style={{
                width: '100%',
                border: '1px solid #282891',
                borderRadius: '5px',
                padding: '10px',
              }}
              value={formData.treatment || ''}
            />
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

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
  const [areaOptions, setAreaOptions] = useState([]);
  const [openHistory, setOpenHistory] = useState(false);
  const [formSpecific, setFormSpecific] = useState(getEmptyFormData('PHYSIO'));

  const handleOpenHistory = () => {
    console.log('History button clicked - patientId:', patientId);
    if (!patientId) {
      toast.info('Save the assessment first to view history');
      return;
    }
    setOpenHistory(true);
  };

  // compute patientId robustly from possible shapes
  const patientId = useMemo(() => {
    if (!patient) return null;
    if (patient.patient && patient.patient._id) return patient.patient._id;
    if (patient.patientId && typeof patient.patientId === 'object' && patient.patientId._id)
      return patient.patientId._id;
    if (patient.patientId && typeof patient.patientId === 'string') return patient.patientId;
    if (patient._id) return patient._id;
    return null;
  }, [patient]);

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
        area: patient.patient?.area
          ? { label: patient.patient?.area, value: patient.patient?.area }
          : null,
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
        // joint: patient.joint ? { label: patient.joint, value: patient.joint } : null,
        joint: patient.formData?.joint || '',

        treatment: patient.treatment || '',
        assessBy: patient.assessBy || (loggedIn && loggedIn.name),
        doctor: patient.doctor
          ? { label: patient.doctor.name, value: patient.doctor._id, ...patient.doctor }
          : null,
        referenceDoctor: patient.referenceDoctor
          ? {
              label: patient.referenceDoctor.name,
              value: patient.referenceDoctor._id,
              ...patient.referenceDoctor,
            }
          : null,
        paymentType: patient.paymentType || 'prepaid',
        prescribeMedicine: patient.prescribeMedicine || 'no',
        prescriptions: patient.prescriptions || [],
        gender: patient.gender || 'Male',
      });
      // initialize template data from backend for edit mode
      setFormSpecific(patient.formData || getEmptyFormData(patient.formType || 'PHYSIO'));
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
      // new form: initialize default template
      setFormSpecific(getEmptyFormData('PHYSIO'));
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
    // if (!formData.treatment || !formData.treatment.trim()) {
    //   return toast.error('Please enter treatment');
    // }

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
    finalData.prescriptions =
      formData && formData.prescribeMedicine === 'yes' ? formData.prescriptions || [] : [];

    // attach dynamic speciality payload and use backend-provided formType
    finalData.formData = formSpecific || {};
    finalData.formType = (patient && patient.formType) || 'PHYSIO';

    // Ensure PHYSIO keeps existing joint handling: prefer top-level joint (selected via Autocomplete)
    if (finalData.formType === 'PHYSIO') {
      const jointVal =
        formData && formData.joint && typeof formData.joint === 'object'
          ? formData.joint.value
          : formData.joint;
      finalData.formData = { ...(finalData.formData || {}), joint: jointVal };
    }

    // remove legacy physio keys from top-level payload to keep data normalized
    const physioKeys = [
      'flex',
      'abd',
      'extension',
      'rotation',
      'spasm',
      'stiffness',
      'tenderness',
      'effusion',
      'mmt',
      'cc',
      'history',
      'examinationComment',
      'nrs',
      'dosage1',
      'dosage2',
      'dosage3',
      'dosage4',
      'dosage5',
      'dosage6',
      'description',
      'joint',
      'treatment',
      'date',
    ];
    physioKeys.forEach((k) => delete finalData[k]);

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

        <Button variant="outlined" onClick={handleOpenHistory}>
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
            {/* formType comes from backend (patient.formType) - no selector here */}
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

            {/* <Grid item xs={5}>
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
            </Grid> */}
          </Grid>
        </Box>
        {/* Dynamic middle section: render PHYSIO using existing fields; render DENTAL/ESTHETIC from backend `patient.formType` */}
        {patient?.formType && (
          <DynamicFormRenderer
            formType={patient.formType}
            formData={formSpecific}
            onChange={setFormSpecific}
            parentFormData={formData}
            setParentFormData={setFormData}
          />
        )}

        <Box
          sx={{ width: '100%', borderRadius: '10px', border: '2px solid #282891', padding: '20px' }}
        >
          <Grid container spacing={3}>
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
                    setFormData((prev) => ({
                      ...prev,
                      prescribeMedicine: v,
                      prescriptions: v === 'no' ? [] : prev.prescriptions,
                    }));
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
              setFormSpecific(getEmptyFormData((patient && patient.formType) || 'PHYSIO'));
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
      {openHistory && (
        <HistoryDialog
          open={openHistory}
          onClose={() => setOpenHistory(false)}
          patientId={patientId}
          patientFormObj={patient}
          formId={id}
        />
      )}
    </>
  );
};

export default AssesstmentForm;
