import { createAsyncThunk } from '@reduxjs/toolkit';
import {
    AuthCredential,
    EmailAuthProvider,
    createUserWithEmailAndPassword,
    linkWithCredential,
    signInWithEmailAndPassword,
} from 'firebase/auth';
import { firebaseAuth } from '@/components/firebase/firebaseAuth';
import { getFriendlyMessageFromFirebaseErrorCode } from './helpers';
import { showToast } from '../toast/toastSlice';
import isEmail from 'validator/lib/isEmail';
import { useAppSelector } from '../store';
import { AuthContextType } from '@/components/useAuth';
import { LoadingStateTypes } from '../types';

type CallBackType =
    | { type: 'success'; continue: boolean }
    | { type: 'success'; continue: boolean }
    | {
          type: 'error';
          continue: boolean;
          message: string;
      };

export const loginWithEmail = createAsyncThunk(
    'login',
    async (
        args: {
            type: 'login' | 'sign-up' | 'link';
            email: string;
            password: string;
            auth?: AuthContextType;
            callback: (args: CallBackType) => void;
        },
        { dispatch }
    ) => {
        try {
            if (!isEmail(args.email)) {
                dispatch(
                    showToast({
                        message: 'Enter a valid email',
                        type: 'info',
                    })
                );
                return;
            }

            if (!args.password && args.type !== 'link') {
                dispatch(
                    showToast({
                        message: 'Password is required.',
                        type: 'success',
                    })
                );
                return;
            }

            if (args.password.length < 6 && args.type !== 'link') {
                dispatch(
                    showToast({
                        message: 'Password should be atleast 6 characters',
                        type: 'info',
                    })
                );
                return;
            }

            if (args.type === 'link' && args.auth && args.auth?.type === LoadingStateTypes.LOADED) {
                const credential: AuthCredential = EmailAuthProvider.credential(
                    args.email,
                    args.password
                );

                if (await linkWithCredential(args.auth.user, credential)) {
                    dispatch(
                        showToast({
                            message: 'Logged in Successfully',
                            type: 'success',
                        })
                    );
                    firebaseAuth.currentUser?.reload();
                    args.callback({ type: 'success', continue: true });
                }
            } else {
                if (args.type === 'sign-up') {
                    await createUserWithEmailAndPassword(firebaseAuth, args.email, args.password);
                }
                await signInWithEmailAndPassword(firebaseAuth, args.email, args.password);
            }
        } catch (e: any) {
            dispatch(
                showToast({
                    message: getFriendlyMessageFromFirebaseErrorCode(e.code),
                    type: 'error',
                })
            );
        }
    }
);

export const useIsLoginWithEmailLoading = () => {
    const loading = useAppSelector((state) => state.loading.loginWithEmail);
    return loading;
};
