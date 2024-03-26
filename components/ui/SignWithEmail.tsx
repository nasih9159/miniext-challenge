import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch } from '../redux/store';
import LoadingButton from './LoadingButton';
import LoginWithGoogleButton from './LoginWithGoogleButton';
import Input from './Input';
import { isEmail } from 'validator';
import { loginWithEmail, useIsLoginWithEmailLoading } from '../redux/auth/loginWithEmail';
import LoginWithPhoneButton from './LoginWithPhoneButton';
import { useAuth } from '../useAuth';
import { LoadingStateTypes } from '../redux/types';
import Logout from './Logout';
import { useRouter } from 'next/router';
import { useSearchParams } from 'next/navigation';

interface Props {
    type: 'sign-up' | 'link';
}

const fillingText = {
    pageTitle: 'Sign Up',
    buttonText: 'Sign Up',
    textSignWith: 'sign up',
};

const SignWithEmail = (props: Props) => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const params = useSearchParams();
    const auth = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [disableSubmit, setDisableSubmit] = useState(true);
    const isLoading = useIsLoginWithEmailLoading();

    if (props.type === 'link') {
        fillingText.pageTitle = 'Link your email';
        fillingText.buttonText = 'Link';
        fillingText.textSignWith = 'link';
    }

    useEffect(() => {
        if (isEmail(email) && password.length >= 6) {
            setDisableSubmit(false);
        } else {
            setDisableSubmit(true);
        }
    }, [email, password]);

    useEffect(() => {
        const email = params.get('email');
        if (email) setEmail(email);
    }, [params]);

    // Signup with email and password and redirecting to home page
    const signUpWithEmail = useCallback(async () => {
        // verify the user email before signup

        dispatch(
            loginWithEmail({
                type: props.type,
                email,
                password,
                auth,
                callback(result) {
                    if (result.type === 'success') {
                        router.push('/');
                    }
                },
            })
        );

        /* if (credentials.user.emailVerified === false) {
                await sendEmailVerification(credentials.user);

                dispatch(
                    showToast({
                        message: 'Verification Email has been sent to your Email',
                        type: 'success',
                    })
                );
            } */

        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [email, password, dispatch]);

    return (
        <div className="flex items-center justify-center min-h-full px-4 py-12 sm:px-6 lg:px-8 w-full">
            <div className="max-w-md w-full bg-white py-6 rounded-lg">
                <img
                    className="w-auto h-12 mx-auto"
                    src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
                    alt="Workflow"
                />
                <h2 className="text-lg font-semibold text-center mb-10 mt-10">
                    {fillingText.pageTitle}
                </h2>
                <div className="px-4 flex p-4 pb-10 gap-4 flex-col">
                    <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        name="email"
                        type="text"
                    />
                    <Input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        name="password"
                        type="password"
                    />
                    <LoadingButton
                        onClick={signUpWithEmail}
                        disabled={disableSubmit}
                        loading={isLoading}
                    >
                        {fillingText.buttonText}
                    </LoadingButton>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-2 text-gray-500">
                                Or {fillingText.textSignWith} with
                            </span>
                        </div>
                    </div>
                    <div className="mt-2 grid grid-cols-1 gap-3">
                        <LoginWithGoogleButton type={props.type} />
                    </div>
                    {auth.type === LoadingStateTypes.NOT_LOADED && (
                        <div className="mt-2 grid grid-cols-1 gap-3">
                            <LoginWithPhoneButton mode="signup" />
                        </div>
                    )}
                    {auth.type === LoadingStateTypes.LOADED && (
                        <div className="mt-2 grid grid-cols-1 gap-3">
                            <Logout />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SignWithEmail;
