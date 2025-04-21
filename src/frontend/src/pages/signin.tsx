'use client';
import * as React from 'react';
import LinearProgress from '@mui/material/LinearProgress';
import Button from '@mui/material/Button';
import { SignInPage } from '@toolpad/core/SignInPage';
import { Navigate, useNavigate } from 'react-router';
import { useSession, type Session } from '../SessionContext';
import { signInWithGoogle, signInWithCredentials } from '../firebase/auth';

export default function SignIn() {
  const { session, setSession, loading } = useSession();
  const navigate = useNavigate();

  if (loading) {
    return <LinearProgress />;
  }

  if (session) {
    return <Navigate to="/" />;
  }

  return (
    <SignInPage
      providers={[{ id: 'google', name: 'Google' }, { id: 'credentials', name: 'Credentials' }]}
      signIn={async (provider, formData, callbackUrl) => {
        let result;
        try {
          if (provider.id === 'google') {
            console.log('Attempting Google sign-in...');
            result = await signInWithGoogle();
          }

          if (provider.id === 'credentials') {
            const email = formData?.get('email') as string;
            const password = formData?.get('password') as string;

            if (!email || !password) {
              console.error('Email and password are required');
              return { error: 'Email and password are required' };
            }

            console.log('Attempting credentials sign-in...');
            result = await signInWithCredentials(email, password);
          }

          if (result?.success && result?.user) {
            console.log('Sign-in successful.');
            const userSession: Session = {
              user: {
                email: result.user.email,
              },
            };
            setSession(userSession);

            // Check if the user exists in the database and add them if not
            try {
              const userCheckResponse = await fetch('http://localhost:9090/api/auth/checkUser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: result.user.email }),
              });

              if (!userCheckResponse.ok) {
                const errorText = await userCheckResponse.text();
                console.error('Failed to check or add user in the backend:', errorText);
              } else {
                console.log('User check/add operation completed successfully.');
              }
            } catch (error) {
              console.error('Error while checking or adding user in the backend:', error);
            }

            // Update login activity in the backend
            try {
              const loginResponse = await fetch('http://localhost:9090/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: result.user.email }),
              });

              if (!loginResponse.ok) {
                const errorText = await loginResponse.text();
                console.error('Failed to update last login in the backend:', errorText);
              } else {
                console.log('Last login updated successfully in the backend.');
              }
            } catch (error) {
              console.error('Error while updating last login in the backend:', error);
            }

            navigate(callbackUrl || '/', { replace: true });
            return {};
          }
          console.error('Sign-in failed:', result?.error || 'Unknown error');
          return { error: result?.error || 'Failed to sign in' };
        } catch (error) {
          console.error('An error occurred during sign-in:', error);
          return { error: error instanceof Error ? error.message : 'An error occurred' };
        }
      }}
      slots={{
        signUpLink: () => (
          <Button
            variant="text"
            onClick={() => {
              navigate('/sign-up');
            }}
          >
            Sign Up
          </Button>
        ),
      }}
    />
  );
}