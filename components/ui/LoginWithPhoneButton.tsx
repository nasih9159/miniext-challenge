// import Image from 'next/image';
// import GoogleGLogo from '@/public/statics/images/google-g-logo.svg';

import { useRouter } from 'next/router';

interface Props {
    mode: string;
}
const LoginWithPhoneButton = (props: Props) => {
    const router = useRouter();
    const { mode } = props;
    const loginWithPhoneNumber = async () => {
        router.push(`/phone/${mode}`);
    };
    return (
        <button
            className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
            onClick={loginWithPhoneNumber}
        >
            {/* <Image src={GoogleGLogo} alt="Google logo" layout="intrinsic" height={20} width={20} /> */}
            <div className="ml-2">Phone Number</div>
        </button>
    );
};

export default LoginWithPhoneButton;
