import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Mail, Shield } from 'lucide-react';
import { authAPI } from '../../services/authService';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const email = location.state?.email || '';
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleChange = (index, value) => {
    if (value.length > 1) {
      value = value[0];
    }
    
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('');
    while (newOtp.length < 6) newOtp.push('');
    setOtp(newOtp);

    // Focus last filled input
    const lastFilledIndex = Math.min(pastedData.length - 1, 5);
    const input = document.getElementById(`otp-${lastFilledIndex}`);
    if (input) input.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter complete 6-digit OTP');
      return;
    }

    if (!email) {
      toast.error('Email not found. Please sign up again.');
      navigate('/signup');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.verifyEmail({ email, otp: otpCode });
      toast.success(response.message || 'Email verified successfully!');
      setTimeout(() => {
        navigate('/signin');
      }, 1500);
    } catch (error) {
      toast.error(error.message || 'Invalid or expired OTP');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      toast.error('Email not found. Please sign up again.');
      navigate('/signup');
      return;
    }

    setIsResending(true);
    try {
      const response = await authAPI.resendVerification(email);
      toast.success(response.message || 'OTP sent successfully!');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } catch (error) {
      toast.error(error.message || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#23CED9]/10 to-[#097087]/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl border-t-4 border-[#097087]">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-[#097087] rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-[#097087]">
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a 6-digit OTP to
          </p>
          <p className="text-sm font-semibold text-[#097087] flex items-center justify-center gap-2 mt-1">
            <Mail className="h-4 w-4" />
            {email || 'your email'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 text-center mb-4">
              Enter 6-Digit OTP
            </label>
            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#097087] focus:border-[#097087] transition-all"
                  autoComplete="off"
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center mt-3">
              OTP expires in 10 minutes
            </p>
          </div>

          <Button
            type="submit"
            disabled={isLoading || otp.join('').length !== 6}
            className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#097087] hover:bg-[#23CED9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#097087] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Didn't receive the OTP?
            </p>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={isResending}
              className="text-sm font-medium text-[#097087] hover:text-[#23CED9] disabled:opacity-50"
            >
              {isResending ? 'Sending...' : 'Resend OTP'}
            </button>
          </div>

          <div className="text-center pt-4 border-t">
            <Link to="/signin" className="text-sm font-medium text-[#097087] hover:text-[#23CED9]">
              ← Back to Sign In
            </Link>
          </div>
        </form>

        <div className="mt-6 p-4 bg-[#F9D779]/20 rounded-lg border border-[#F9D779]/50">
          <p className="text-xs text-gray-700 text-center">
            <strong>Tip:</strong> Check your spam folder if you don't see the email
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
