import AuthStyle from './Auth.module.scss';
import SideImage from '../../Img/login-side.png';
import OptImage from '../../Img/side-img.png';
import { LoadingButton } from '@mui/lab';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { OtpInput } from 'reactjs-otp-input';
import { toast } from 'react-toastify';
import { loginUser, verifyOtp } from '../../apis/authSlice';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [user, setUser] = useState({
    email: '',
    otp: '',
    keepMeLoggedIn: false,
  });

  const [isChecked, setIsChecked] = useState(false);

  const { authLoading } = useSelector((state) => state.authData);

  const handelOnChange = (e) => {
    const { name, value } = e.target;
    setUser((oldData) => ({
      ...oldData,
      [name]: value,
    }));
  };

  const handelOnKeepChange = () => {
    setIsChecked(!isChecked);
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
      navigate('/dashboard');
    } else {
      toast.error(response?.payload?.message);
    }
  };

  const handelLogin = async (e) => {
    e.preventDefault();

    if (!user.email) {
      return toast.error('Please enter email');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      return toast.error('Please enter valid email');
    }
    // console.log(user);

    const response = await dispatch(loginUser({ ...user, keepMeLoggedIn: isChecked }));
    // console.log(response);
    if (response.type.includes('fulfilled')) {
      toast.success(response?.payload?.message);
      setStep(2);
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
        {step === 1 ? (
          <div className={AuthStyle.content}>
            <div className={AuthStyle.title}>
              <h1>Hello,</h1>
              <h1> Welcome back</h1>
            </div>
            <div className={AuthStyle.formBox}>
              <h2 className={AuthStyle.loginTitle}>Login Here</h2>
              <form onSubmit={handelLogin}>
                <input
                  type="email"
                  placeholder="Enter Email"
                  className={AuthStyle.input}
                  name="email"
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
                    type="submit"
                    loadingPosition="end"
                  >
                    <span>Submit</span>
                  </LoadingButton>
                </div>
                {/* <h6 className={AuthStyle.loginText}>
                  Don't have an account ? <Link to={'/signup'}>SignUp</Link>
                </h6> */}
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
      </div>
    </div>
  );
}
