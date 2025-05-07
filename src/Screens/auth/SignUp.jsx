import AuthStyle from './Auth.module.scss';
import SideImage from '../../Img/login-side.png';
import OptImage from '../../Img/side-img.png';
import { LoadingButton } from '@mui/lab';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { OtpInput } from 'reactjs-otp-input';
import { toast } from 'react-toastify';
import { loginUser, signupUser, verifyOtp } from '../../apis/authSlice';
import { addDoctor } from '../../apis/doctorSlice';

export default function SignUp() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [docMsg, setDocMsg] = useState(false);
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'U',
    otp: '',
  });

  const [doctor, setDoctor] = useState({
    name: '',
    email: '',
    phone: '',
    docId: '',
    speciality: '',
    isClinic: 'N',
    clinicName: '',
    address: '',
    timing: '',
  });

  const [isChecked, setIsChecked] = useState(false);

  const { authLoading } = useSelector((state) => state.authData);
  const { docLoading } = useSelector((state) => state.doctorData);

  const handelOnKeepChange = () => {
    setIsChecked(!isChecked);
  };

  const handelOnChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    if (name === 'phone' && value.length <= 10) {
      setUser((oldData) => ({
        ...oldData,
        [name]: value,
      }));
    } else if (name !== 'phone') {
      setUser((oldData) => ({
        ...oldData,
        [name]: value,
      }));
    }
  };

  const handelOnDocDataChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone' && value.length <= 10) {
      setDoctor((oldData) => ({
        ...oldData,
        [name]: value,
      }));
    } else if (name !== 'phone') {
      setDoctor((oldData) => ({
        ...oldData,
        [name]: value,
      }));
    }
  };

  const handelVerifyOTP = async (e) => {
    e.preventDefault();
    if (!user.otp) {
      return toast.error('Please enter OTP');
    }
    if (!user.email) {
      return toast.error('Please enter email');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      return toast.error('Please enter valid email');
    }
    // console.log(user);
    const finalData = {
      email: user.email,
      otp: user.otp,
    };
    const response = await dispatch(verifyOtp(finalData));
    // console.log(response);
    if (response.type.includes('fulfilled')) {
      toast.success(response?.payload?.message);
      setUser({
        name: '',
        email: '',
        phone: '',
        role: 'U',
        otp: '',
      });
      if (response?.payload?.data?.role === 'D') {
        navigate('/dashboard');
      } else {
        navigate('/problem');
      }
    } else {
      toast.error(response?.payload?.message);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!user.role) {
      return toast.error('Please enter user type');
    }
    if (!user.name) {
      return toast.error('Please enter name');
    }
    if (!user.email) {
      return toast.error('Please enter email');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      return toast.error('Please enter valid email');
    }
    if (!user.phone) {
      return toast.error('Please enter phone');
    }
    // console.log({ ...user, keepMeLoggedIn: isChecked });
    const response = await dispatch(signupUser({ ...user, keepMeLoggedIn: isChecked }));
    console.log(response);
    if (response.type.includes('fulfilled')) {
      toast.success(response?.payload?.message);
      setStep(2);
    } else {
      toast.error(response?.payload?.message);
    }
  };

  const handelSubmitDoctor = async (e) => {
    e.preventDefault();
    if (!user.role) {
      return toast.error('Please enter user type');
    }
    if (!doctor.name) {
      return toast.error('Please enter name');
    }
    if (!doctor.email) {
      return toast.error('Please enter email');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(doctor.email)) {
      return toast.error('Please enter valid email');
    }
    if (!doctor.phone) {
      return toast.error('Please enter phone');
    }
    if (!doctor.docId) {
      return toast.error('Please enter Doctor ID');
    }
    if (!doctor.speciality) {
      return toast.error('Please select speciality');
    } else if (doctor.speciality === 'selected') {
      return toast.error('Please select speciality');
    }
    if (doctor.isClinic === 'Y') {
      if (!doctor.clinicName) {
        return toast.error('Please enter clinic name');
      }
      if (!doctor.timing) {
        return toast.error('Please enter timing');
      }
      if (!doctor.address) {
        return toast.error('Please select address');
      }
    }
    const response = await dispatch(addDoctor(doctor));
    // console.log(response);
    if (response.type.includes('fulfilled')) {
      toast.success(response?.payload?.message);
      setDocMsg(true);
      setDoctor({
        name: '',
        email: '',
        phone: '',
        docId: '',
        speciality: '',
        isClinic: 'N',
        clinicName: '',
        address: '',
        timing: '',
      });
    } else {
      toast.error(response?.payload?.message);
    }
  };

  return (
    <div className={AuthStyle.main}>
      <div className={AuthStyle.innerMain}>
        <div className={AuthStyle.img}>
          <img src={step === 1 ? SideImage : OptImage} alt="SideImage" height="100%" />
        </div>
        {docMsg ? (
          <div>
            <h1 style={{ textAlign: 'center' }}>Thank you !</h1>
            <h1>We'll check and inform you in 24hr</h1>
          </div>
        ) : (
          <>
            {user.role === 'U' ? (
              <>
                {step === 1 ? (
                  <div className={AuthStyle.content}>
                    <div className={AuthStyle.formBox}>
                      <h2 className={AuthStyle.loginTitle}>Sign Up | Register</h2>
                      <form onSubmit={handleSignUp}>
                        <div className={AuthStyle.radioGroup}>
                          <div className={AuthStyle.radiobox}>
                            <input
                              type="radio"
                              id="user"
                              name="role"
                              value="U"
                              checked={user.role === 'U' ? true : false}
                              onChange={handelOnChange}
                            />
                            <label for="user" className={AuthStyle.radioLable}>
                              User
                            </label>
                          </div>

                          <div className={AuthStyle.radiobox}>
                            <input
                              type="radio"
                              id="doctor"
                              name="role"
                              value="D"
                              checked={user.role === 'D' ? true : false}
                              onChange={handelOnChange}
                            />
                            <label for="doctor" className={AuthStyle.radioLable}>
                              Doctor
                            </label>
                          </div>
                        </div>
                        <input
                          type="text"
                          placeholder="Enter Name"
                          className={AuthStyle.input}
                          name="name"
                          value={user.name}
                          onChange={handelOnChange}
                        />
                        <input
                          type="email"
                          placeholder="Enter Email"
                          className={AuthStyle.input}
                          name="email"
                          value={user.email}
                          onChange={handelOnChange}
                        />
                        <input
                          type="number"
                          placeholder="Enter Phone"
                          className={AuthStyle.input}
                          name="phone"
                          value={user.phone}
                          onChange={handelOnChange}
                        />
                        <div className={AuthStyle.keep}>
                          <input
                            type="checkbox"
                            name="keepMeLoggedIn"
                            className={AuthStyle.keepcheckbox}
                            value={isChecked}
                            onChange={handelOnKeepChange}
                            id="isChecked"
                          />
                          <label className={AuthStyle.keepText} htmlFor="isChecked">
                            Keep Me Logged In
                          </label>
                        </div>
                        <div className={AuthStyle.btnBox}>
                          <LoadingButton
                            className={AuthStyle.submitButton}
                            loading={authLoading}
                            loadingPosition="end"
                            type="submit"
                          >
                            <span>Submit</span>
                          </LoadingButton>
                        </div>
                        <h6 className={AuthStyle.loginText}>
                          Already have an account ? <Link to={'/login'}>Login</Link>
                        </h6>
                      </form>
                    </div>
                  </div>
                ) : (
                  <div className={AuthStyle.content}>
                    <div className={AuthStyle.formBox}>
                      <h2 className={AuthStyle.loginTitle}>Enter OTP</h2>
                      <form className={AuthStyle.otpForm} onSubmit={handelVerifyOTP}>
                        <div className={AuthStyle.otpBox}>
                          <OtpInput
                            value={user.otp}
                            onChange={(value) => {
                              setUser({ ...user, otp: value });
                            }}
                            numInputs={6}
                            inputStyle={AuthStyle.OtpInput}
                            isInputNum
                          />
                        </div>
                        <LoadingButton
                          loading={authLoading}
                          className={AuthStyle.submitButton}
                          loadingPosition="end"
                          type="submit"
                        >
                          <span>Verify</span>
                        </LoadingButton>
                      </form>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className={AuthStyle.content}>
                <div className={AuthStyle.formBox}>
                  <h2 className={AuthStyle.loginTitle}>Sign Up | Register</h2>
                  <form onSubmit={handelSubmitDoctor}>
                    <div className={AuthStyle.radioGroup}>
                      <div className={AuthStyle.radiobox}>
                        <input
                          type="radio"
                          id="user"
                          name="role"
                          value="U"
                          checked={user.role === 'U' ? true : false}
                          onChange={handelOnChange}
                        />
                        <label for="user" className={AuthStyle.radioLable}>
                          User
                        </label>
                      </div>

                      <div className={AuthStyle.radiobox}>
                        <input
                          type="radio"
                          id="doctor"
                          name="role"
                          value="D"
                          checked={user.role === 'D' ? true : false}
                          onChange={handelOnChange}
                        />
                        <label for="doctor" className={AuthStyle.radioLable}>
                          Doctor
                        </label>
                      </div>
                    </div>
                    <div className={AuthStyle.inputBox}>
                      <input
                        type="text"
                        placeholder="Enter Name"
                        className={AuthStyle.input}
                        name="name"
                        value={doctor.name}
                        onChange={handelOnDocDataChange}
                      />
                      <input
                        type="email"
                        placeholder="Enter Email"
                        className={AuthStyle.input}
                        name="email"
                        value={doctor.email}
                        onChange={handelOnDocDataChange}
                      />
                    </div>
                    <div className={AuthStyle.inputBox}>
                      <input
                        type="number"
                        placeholder="Enter Phone"
                        className={AuthStyle.input}
                        name="phone"
                        value={doctor.phone}
                        onChange={handelOnDocDataChange}
                      />
                      <input
                        className={AuthStyle.input}
                        type="text"
                        id="docId"
                        name="docId"
                        placeholder="Enter ID"
                        value={doctor.docId}
                        onChange={handelOnDocDataChange}
                      />
                    </div>
                    <select
                      className={AuthStyle.input}
                      type="text"
                      id="speciality"
                      name="speciality"
                      value={doctor.speciality}
                      onChange={handelOnDocDataChange}
                    >
                      <option value="selected">---Select Speciality---</option>
                      <option value="NE" className={AuthStyle.input}>
                        Neurologist
                      </option>
                      <option value="PH" className={AuthStyle.input}>
                        Physiotherapist
                      </option>
                    </select>
                    <div className={`${AuthStyle.radioGroup} ${AuthStyle.mt}`}>
                      <label>Clinic :-</label>
                      <div className={AuthStyle.radiobox}>
                        <input
                          type="radio"
                          id="clinic"
                          name="isClinic"
                          value="Y"
                          checked={doctor.isClinic === 'Y' ? true : false}
                          onChange={handelOnDocDataChange}
                        />
                        <label for="clinic" className={AuthStyle.radioLable}>
                          Yes
                        </label>
                      </div>

                      <div className={AuthStyle.radiobox}>
                        <input
                          type="radio"
                          id="clinicNo"
                          name="isClinic"
                          value="N"
                          checked={doctor.isClinic === 'N' ? true : false}
                          onChange={handelOnDocDataChange}
                        />
                        <label for="clinicNo" className={AuthStyle.radioLable}>
                          No
                        </label>
                      </div>
                    </div>
                    {doctor.isClinic === 'Y' && (
                      <>
                        <div className={AuthStyle.inputBox}>
                          <input
                            type="text"
                            placeholder="Enter Clinic Name"
                            className={AuthStyle.input}
                            name="clinicName"
                            value={doctor.clinicName}
                            onChange={handelOnDocDataChange}
                          />
                          <input
                            className={AuthStyle.input}
                            type="text"
                            name="timing"
                            placeholder="Enter Timing"
                            value={doctor.timing}
                            onChange={handelOnDocDataChange}
                          />
                        </div>
                        <input
                          className={AuthStyle.input}
                          type="text"
                          name="address"
                          placeholder="Enter Address"
                          value={doctor.address}
                          onChange={handelOnDocDataChange}
                        />
                      </>
                    )}
                    <div className={`${AuthStyle.btnBox} ${AuthStyle.mt}`}>
                      <LoadingButton
                        className={AuthStyle.submitButton}
                        loading={docLoading}
                        loadingPosition="end"
                        type="submit"
                      >
                        <span>Submit</span>
                      </LoadingButton>
                    </div>
                    <h6 className={AuthStyle.loginText}>
                      Already have an account ? <Link to={'/login'}>Login</Link>
                    </h6>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
