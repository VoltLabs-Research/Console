import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { sileo } from 'sileo';
import { Eye, EyeOff } from 'lucide-react';
import Heading from '@/shared/presentation/primitives/Heading';
import Text from '@/shared/presentation/primitives/Text';
import Stack from '@/shared/presentation/primitives/Stack';
import Button from '@/shared/presentation/primitives/Button';
import UserBadge from '@/modules/auth/components/UserBadge';
import { usePageTitle } from '@/shared/presentation/hooks/use-page-title';
import { checkEmail, login, signup, ApiError } from '@/lib/api';
import { setToken } from '@/lib/token';
import './SignInPage.css';

type Step = 'email' | 'password' | 'register';

const STEP_COPY: Record<Step, { title: string; subtitle: string }> = {
    email: { title: 'Log in to Console', subtitle: 'Enter your email to continue.' },
    password: { title: 'Welcome back', subtitle: 'Enter your password to continue.' },
    register: { title: 'Create your account', subtitle: 'Pick a username and password to get started.' }
};

const SignInPage = () => {
    usePageTitle('Log in');

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const goToEmailStep = (): void => {
        setStep('email');
        setPassword('');
        setUsername('');
        setShowPassword(false);
    };

    const finalize = (accessToken: string): void => {
        setToken(accessToken);
        const next = searchParams.get('next');
        navigate(next ? decodeURIComponent(next) : '/device', { replace: true });
    };

    const reportError = (error: unknown, fallbackTitle: string): void => {
        const message = error instanceof ApiError ? error.message : 'Unexpected error. Please try again.';
        sileo.error({ title: fallbackTitle, description: message });
    };

    const handleEmailStep = async (): Promise<void> => {
        const { exists } = await checkEmail(email);
        setStep(exists ? 'password' : 'register');
    };

    const handlePasswordStep = async (): Promise<void> => {
        const tokens = await login(email, password);
        finalize(tokens.accessToken);
    };

    const handleRegisterStep = async (): Promise<void> => {
        await signup(email, username, password);
        const tokens = await login(email, password);
        finalize(tokens.accessToken);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        if (isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        try {
            if (step === 'email') {
                await handleEmailStep();
            } else if (step === 'password') {
                await handlePasswordStep();
            } else {
                await handleRegisterStep();
            }
        } catch (error) {
            const title = step === 'register' ? 'Could not create account' : step === 'password' ? 'Sign in failed' : 'Could not continue';
            reportError(error, title);
        } finally {
            setIsSubmitting(false);
        }
    };

    const { title, subtitle } = STEP_COPY[step];
    const passwordInput = (
        <div className='auth-input-wrap'>
            <input
                className='auth-input auth-input--with-button'
                type={showPassword ? 'text' : 'password'}
                autoComplete={step === 'register' ? 'new-password' : 'current-password'}
                required
                autoFocus
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder='Password'
                aria-label='Password'
            />
            <button
                type='button'
                className='auth-input-toggle'
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    );

    return (
        <div className='auth-page'>
            <Stack as='form' className='auth-column' gap='2' onSubmit={handleSubmit}>
                <Stack gap='025'>
                    <Heading level={1} size='xl' weight='bold'>{title}</Heading>
                    <Text tone='muted' size='sm'>{subtitle}</Text>
                </Stack>

                {step !== 'email' && (
                    <UserBadge
                        label={step === 'register' ? 'Signing up as' : 'Logging in as'}
                        email={email}
                        onChangeClick={goToEmailStep}
                    />
                )}

                <Stack gap='075'>
                    {step === 'email' && (
                        <input
                            className='auth-input'
                            type='email'
                            autoComplete='email'
                            autoFocus
                            required
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder='you@example.com'
                            aria-label='Email'
                        />
                    )}

                    {step === 'register' && (
                        <input
                            className='auth-input'
                            type='text'
                            autoComplete='username'
                            autoFocus
                            required
                            pattern='[a-z0-9][a-z0-9-]*'
                            minLength={2}
                            maxLength={39}
                            value={username}
                            onChange={(event) => setUsername(event.target.value.toLowerCase())}
                            placeholder='username'
                            aria-label='Username'
                        />
                    )}

                    {step !== 'email' && passwordInput}

                    <Button type='submit' variant='solid' intent='brand' block size='lg' isLoading={isSubmitting}>
                        {step === 'email' ? 'Continue' : step === 'password' ? 'Log in' : 'Create account'}
                    </Button>
                </Stack>
            </Stack>
        </div>
    );
};

export default SignInPage;
