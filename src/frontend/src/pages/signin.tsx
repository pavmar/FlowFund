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
            console.log('Sign-in successful. Sending email to backend...');
            console.log('Sending email to backend:', {
              email: result.user.email,
            });

            // Call backend to add user email if it doesn't exist
            const response = await fetch('http://localhost:9090/api/auth/addUser', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: result.user.email,
              }),
            });

            if (response.ok) {
              console.log('User email checked/added successfully in the backend.');
              const user = await response.json();

              const userSession: Session = {
                user: {
                  email: user.email,
                },
              };
              setSession(userSession);
              navigate(callbackUrl || '/', { replace: true });
              return {};
            } else {
              const errorText = await response.text();
              console.error('Failed to connect to the backend or user creation failed:', errorText);
              return { error: 'Failed to sign in' };
            }
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