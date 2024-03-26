/* eslint-disable @next/next/no-img-element */
import { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';
import { firebaseAuth } from '@/components/firebase/firebaseAuth';
import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useRouter } from 'next/navigation';
import ToastBox from '@/components/ui/ToastBox';
import { useAppDispatch } from '@/components/redux/store';
import { showToast } from '@/components/redux/toast/toastSlice';
import Input from '@/components/ui/Input';
import LoadingButton from '@/components/ui/LoadingButton';
import Logout from './Logout';
import { useAuth } from '../useAuth';
import { LoadingStateTypes } from '../redux/types';
import {
    sendVerificationCode,
    useSendVerificationCodeLoading,
    useVerifyPhoneNumberLoading,
    verifyPhoneNumber,
} from '../redux/auth/verifyPhone';

interface Props {
    type: 'link' | 'sign-in';
}
const SignWithPhone = (props: Props) => {
    const dispatch = useAppDispatch();
    const auth = useAuth();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [OTPCode, setOTPCode] = useState('');
    const [show, setShow] = useState(false);

    const sendVerificationLoading = useSendVerificationCodeLoading();
    const verifyPhoneNumberLoading = useVerifyPhoneNumberLoading();

    const [recaptcha, setRecaptcha] = useState<RecaptchaVerifier | null>(null);
    const [recaptchaResolved, setRecaptchaResolved] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const router = useRouter();

    const pageTitle = props.type === 'sign-in' ? 'Sign in to your account' : 'Link your phone';

    // Sending OTP and storing id to verify it later
    const handleSendVerification = async () => {
        if (props.type === 'link' && auth.type !== LoadingStateTypes.LOADED) return;
        if (props.type === 'sign-in' && auth.type !== LoadingStateTypes.NOT_LOADED) return;

        dispatch(
            sendVerificationCode({
                type: props.type,
                phoneNumber,
                auth,
                recaptcha,
                recaptchaResolved,
                callback: (result) => {
                    if (result.type === 'error') {
                        setRecaptchaResolved(false);
                        return;
                    }
                    setConfirmationResult(result.confrimationResult);
                    setShow(true);
                },
            })
        );
    };

    // Validating the filled OTP by user
    const ValidateOtp = async () => {
        if (confirmationResult && OTPCode) {
            dispatch(
                verifyPhoneNumber({
                    auth,
                    OTPCode,
                    confirmationResult,
                    callback: (result) => {
                        if (result.type === 'error') {
                            return;
                        }
                        // needed to reload auth user
                        router.push('/');
                    },
                })
            );
        }
    };

    // generating the recaptcha on page render
    useEffect(() => {
        const captcha = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', {
            size: 'normal',
            callback: () => {
                setRecaptchaResolved(true);
            },

            'expired-callback': () => {
                setRecaptchaResolved(false);
                dispatch(
                    showToast({
                        message: 'Recaptcha Expired, please verify it again',
                        type: 'info',
                    })
                );
            },
        });

        captcha.render();

        setRecaptcha(captcha);
    }, []);

    return (
        <div className="flex items-center justify-center min-h-full px-4 py-12 sm:px-6 lg:px-8 w-full">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <img
                        className="w-auto h-12 mx-auto"
                        src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
                        alt="Workflow"
                    />
                    <h2 className="mt-10 text-3xl font-extrabold text-center text-gray-900">
                        {pageTitle}
                    </h2>
                </div>

                <div className="max-w-xl w-full rounded overflow-hidden shadow-lg py-2 px-4">
                    <div className="px-4 flex p-4 pb-5 gap-4 flex-col">
                        <Input
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="phone number"
                            type="text"
                        />
                        <LoadingButton
                            onClick={handleSendVerification}
                            loading={sendVerificationLoading}
                            loadingText="Sending OTP"
                        >
                            Send OTP
                        </LoadingButton>
                    </div>
                    <div id="recaptcha-container" className="flex justify-center pb-7" />
                    {auth.type === LoadingStateTypes.LOADED && (
                        <div className="flex w-full flex-col p-5">
                            <Logout />
                        </div>
                    )}

                    <Modal show={show} setShow={setShow}>
                        <div className="max-w-xl w-full bg-white py-6 rounded-lg">
                            <h2 className="text-lg font-semibold text-center mb-10">
                                Enter Code to Verify
                            </h2>
                            <div className="px-4 flex items-center gap-4 pb-10">
                                <Input
                                    value={OTPCode}
                                    type="text"
                                    placeholder="Enter your OTP"
                                    onChange={(e) => setOTPCode(e.target.value)}
                                />

                                <LoadingButton
                                    onClick={ValidateOtp}
                                    loading={verifyPhoneNumberLoading}
                                    loadingText="Verifying..."
                                >
                                    Verify
                                </LoadingButton>
                            </div>
                        </div>
                    </Modal>
                </div>
            </div>
            <ToastBox />
        </div>
    );
};

export default SignWithPhone;
