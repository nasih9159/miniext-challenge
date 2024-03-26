import { User } from 'firebase/auth';
import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import Spinner from './Spinner';
import { firebaseAuth } from './firebase/firebaseAuth';
import { LoadingStateTypes } from './redux/types';
import Header from './ui/Header';
import SignWithPhone from './ui/SignWithPhone';
import SignWithEmail from './ui/SignWithEmail';

export type AuthContextType =
    | {
          type: LoadingStateTypes.LOADING;
      }
    | {
          type: LoadingStateTypes.NOT_LOADED;
      }
    | {
          type: LoadingStateTypes.LOADED;
          user: User;
      };

export const useAuth = (): AuthContextType => {
    const [user, loading] = useAuthState(firebaseAuth);

    return loading
        ? {
              type: LoadingStateTypes.LOADING,
          }
        : user == null
        ? {
              type: LoadingStateTypes.NOT_LOADED,
          }
        : {
              type: LoadingStateTypes.LOADED,
              user: user,
          };
};

export const AuthGuard = (props: { children: React.ReactElement }): React.ReactElement => {
    const auth = useAuth();
    switch (auth.type) {
        case LoadingStateTypes.LOADING:
            return <Spinner />;
        case LoadingStateTypes.NOT_LOADED:
            window.location.href = '/login';
            return <Spinner />;
        case LoadingStateTypes.LOADED:
            console.log(auth.user);
            if (auth.user && auth.user.email && !auth.user.phoneNumber) {
                return (
                    <>
                        <SignWithPhone type="link" />;
                    </>
                );
            }
            if (auth.user && auth.user.phoneNumber && !auth.user.email) {
                return (
                    <>
                        <SignWithEmail type="link" />;
                    </>
                );
            }
            break;
        default:
    }

    return (
        <>
            <Header />
            {props.children}
        </>
    );
};
