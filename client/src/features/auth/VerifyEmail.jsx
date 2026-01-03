import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { verifyEmail } from '../../store/slices/authSlice';
import { Button } from '../../components/ui/button';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    const verify = async () => {
      try {
        const result = await dispatch(verifyEmail(token)).unwrap();
        setStatus('success');
        setMessage(result.message || 'Email verified successfully!');
        toast.success('Email verified! You can now sign in.');
      } catch (error) {
        setStatus('error');
        setMessage(error || 'Verification failed');
        toast.error('Verification failed');
      }
    };

    verify();
  }, [token, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#23CED9]/10 to-[#097087]/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl text-center">
        {status === 'loading' && (
          <>
            <Loader className="mx-auto h-16 w-16 text-[#097087] animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900">
              Verifying your email...
            </h2>
            <p className="text-gray-600">Please wait while we verify your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="mx-auto h-16 w-16 text-[#A1CCA6]" />
            <h2 className="text-2xl font-bold text-gray-900">
              Email Verified Successfully!
            </h2>
            <p className="text-gray-600">{message}</p>
            <div className="mt-6">
              <Button
                onClick={() => navigate('/signin')}
                className="w-full bg-[#097087] hover:bg-[#23CED9] text-white"
              >
                Go to Sign In
              </Button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="mx-auto h-16 w-16 text-[#FCA47C]" />
            <h2 className="text-2xl font-bold text-gray-900">
              Verification Failed
            </h2>
            <p className="text-gray-600">{message}</p>
            <div className="mt-6 space-y-3">
              <Link to="/signup">
                <Button className="w-full bg-[#097087] hover:bg-[#23CED9] text-white">
                  Sign Up Again
                </Button>
              </Link>
              <Link to="/signin">
                <Button variant="outline" className="w-full">
                  Go to Sign In
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;

