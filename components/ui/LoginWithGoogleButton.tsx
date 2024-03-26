import Image from 'next/image';
import GoogleGLogo from '@/public/statics/images/google-g-logo.svg';
import { GoogleAuthProvider, linkWithPopup, signInWithPopup } from 'firebase/auth';
import { firebaseAuth } from '../firebase/firebaseAuth';
import { useAuth } from '../useAuth';
import { LoadingStateTypes } from '../redux/types';
import { useRouter } from 'next/navigation';
import { showToast } from '../redux/toast/toastSlice';
import { useDispatch } from 'react-redux';

const provider = new GoogleAuthProvider();

interface Props {
    type: 'sign-in' | 'sign-up' | 'link';
}
const LoginWithGoogleButton = (props: Props) => {
    const auth = useAuth();
    const router = useRouter();
    const dispatch = useDispatch();
    const loginWithGoogle = async () => {
        try {
            if (props.type === 'sign-up') {
                const result = await signInWithPopup(firebaseAuth, provider);
                GoogleAuthProvider.credentialFromResult(result);
            } else {
                if (auth.type === LoadingStateTypes.LOADED) {
                    await linkWithPopup(auth.user, provider);
                    dispatch(
                        showToast({
                            message: 'Logged in Successfully',
                            type: 'success',
                        })
                    );
                    firebaseAuth.currentUser?.reload();
                    router.refresh();
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <button
            className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
            onClick={loginWithGoogle}
        >
            <Image src={GoogleGLogo} alt="Google logo" layout="intrinsic" height={20} width={20} />
            <div className="ml-2">Google</div>
        </button>
    );
};

export default LoginWithGoogleButton;
