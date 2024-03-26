import { createAsyncThunk } from '@reduxjs/toolkit';
import {
    ConfirmationResult,
    PhoneAuthProvider,
    RecaptchaVerifier,
    linkWithPhoneNumber,
    signInWithPhoneNumber,
    updatePhoneNumber,
} from 'firebase/auth';
import { getFriendlyMessageFromFirebaseErrorCode } from './helpers';
import { showToast } from '../toast/toastSlice';
import { LoadingStateTypes } from '../types';
import { AuthContextType } from '@/components/useAuth';
import { firebaseAuth } from '@/components/firebase/firebaseAuth';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const sendVerificationCode = createAsyncThunk(
    'sendVerificationCode',
    async (
        args: {
            type: 'sign-in' | 'link';
            phoneNumber: string;
            auth: AuthContextType;
            recaptchaResolved: boolean;
            recaptcha: RecaptchaVerifier | null;
            callback: (
                args:
                    | { type: 'success'; confrimationResult: ConfirmationResult }
                    | {
                          type: 'error';
                          message: string;
                      }
            ) => void;
        },
        { dispatch }
    ) => {
        if (!args.recaptchaResolved || !args.recaptcha) {
            dispatch(showToast({ message: 'First Resolved the Captcha', type: 'info' }));
            return;
        }
        if (args.phoneNumber.slice() === '' || args.phoneNumber.length < 10) {
            dispatch(
                showToast({
                    message: 'Enter the Phone Number and provide the country code',
                    type: 'info',
                })
            );
            return;
        }

        try {
            let confrimationResult;

            if (args.auth.type === LoadingStateTypes.LOADED && args.type === 'link') {
                confrimationResult = await linkWithPhoneNumber(
                    args.auth.user,
                    args.phoneNumber,
                    args.recaptcha
                );
            } else if (args.auth.type === LoadingStateTypes.NOT_LOADED && args.type === 'sign-in') {
                confrimationResult = await signInWithPhoneNumber(
                    firebaseAuth,
                    args.phoneNumber,
                    args.recaptcha
                );
            }
            dispatch(
                showToast({
                    message: 'Verification Code has been sent to your Phone',
                    type: 'success',
                })
            );

            if (confrimationResult) {
                if (args.callback)
                    args.callback({
                        type: 'success',
                        confrimationResult: confrimationResult,
                    });
            }
        } catch (error: any) {
            dispatch(
                showToast({
                    message: getFriendlyMessageFromFirebaseErrorCode(error.code),
                    type: 'error',
                })
            );
            if (args.callback)
                args.callback({
                    type: 'error',
                    message: getFriendlyMessageFromFirebaseErrorCode(error.code),
                });
        }
    }
);

export const useSendVerificationCodeLoading = () => {
    const loading = useSelector((state: RootState) => state.loading.sendVerificationCode);
    return loading;
};

export const verifyPhoneNumber = createAsyncThunk(
    'verifyPhoneNumber',
    async (
        args: {
            OTPCode: string;
            auth: AuthContextType;
            confirmationResult: ConfirmationResult;
            callback: (
                args:
                    | { type: 'success' }
                    | {
                          type: 'error';
                          message: string;
                      }
            ) => void;
        },
        { dispatch }
    ) => {
        try {
            if (args.auth.type === LoadingStateTypes.LOADED) {
                const credential = PhoneAuthProvider.credential(
                    args.confirmationResult.verificationId,
                    args.OTPCode
                );
                await updatePhoneNumber(args.auth.user, credential);
                firebaseAuth.currentUser?.reload();
                dispatch(
                    showToast({
                        message: 'Logged in Successfully',
                        type: 'success',
                    })
                );
            } else {
                await args.confirmationResult.confirm(args.OTPCode);
            }
            args.callback({ type: 'success' });
        } catch (error: any) {
            dispatch(
                showToast({
                    message: getFriendlyMessageFromFirebaseErrorCode(error.code),
                    type: 'error',
                })
            );
            if (args.callback)
                args.callback({
                    type: 'error',
                    message: getFriendlyMessageFromFirebaseErrorCode(error.code),
                });
        }
    }
);

export const useVerifyPhoneNumberLoading = () => {
    const loading = useSelector((state: RootState) => state.loading.verifyPhoneNumber);
    return loading;
};
