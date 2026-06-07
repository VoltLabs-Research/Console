import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { sileo } from 'sileo';
import { Terminal, BadgeCheck, XCircle } from 'lucide-react';
import Heading from '@/shared/presentation/primitives/Heading';
import Text from '@/shared/presentation/primitives/Text';
import Stack from '@/shared/presentation/primitives/Stack';
import Button from '@/shared/presentation/primitives/Button';
import IconFrame from '@/shared/presentation/primitives/IconFrame';
import CodeInput from '@/shared/presentation/primitives/CodeInput';
import { usePageTitle } from '@/shared/presentation/hooks/use-page-title';
import { approveDevice, denyDevice, whoami, ApiError } from '@/lib/api';
import { getToken } from '@/lib/token';
import './DevicePage.css';

type DeviceState = 'form' | 'authorized' | 'denied';

const CODE_LENGTH = 8;

const DevicePage = () => {
    usePageTitle('Authorize device');

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [code, setCode] = useState(() => (searchParams.get('user_code') ?? '').toUpperCase());
    const [identity, setIdentity] = useState<string | null>(null);
    const [state, setState] = useState<DeviceState>('form');
    const [pendingAction, setPendingAction] = useState<'approve' | 'deny' | null>(null);

    useEffect(() => {
        const token = getToken();
        if (!token) {
            const next = encodeURIComponent('/device' + window.location.search);
            navigate('/login?next=' + next, { replace: true });
            return;
        }

        let active = true;
        whoami(token)
            .then((profile) => {
                if (active) {
                    setIdentity(profile.username);
                }
            })
            .catch(() => {
                // identity is a nice-to-have; ignore failures here
            });

        return () => {
            active = false;
        };
    }, [navigate]);

    const handleDecision = async (action: 'approve' | 'deny'): Promise<void> => {
        const token = getToken();
        if (!token) {
            const next = encodeURIComponent('/device' + window.location.search);
            navigate('/login?next=' + next, { replace: true });
            return;
        }

        const userCode = code.trim();
        if (!userCode) {
            sileo.error({ title: 'Enter the code shown in your terminal.' });
            return;
        }

        if (pendingAction) {
            return;
        }

        setPendingAction(action);
        try {
            if (action === 'approve') {
                await approveDevice(userCode, token);
                setState('authorized');
            } else {
                await denyDevice(userCode, token);
                setState('denied');
            }
        } catch (error) {
            const message = error instanceof ApiError
                ? error.message
                : 'Unexpected error. Please try again.';
            sileo.error({ title: 'Could not complete the request', description: message });
        } finally {
            setPendingAction(null);
        }
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        void handleDecision('approve');
    };

    return (
        <div className='device-page'>
            <div className='device-column'>
                {state === 'form' && (
                    <Stack as='form' gap='2' align='center' onSubmit={handleSubmit}>
                        <IconFrame size='md' tone='brand'>
                            <Terminal size={20} />
                        </IconFrame>

                        <Stack gap='025' align='center'>
                            <Heading level={1} size='xl' weight='bold' className='text-center'>Authorize device</Heading>
                            <Text tone='muted' size='sm' align='center'>
                                Enter the code shown in your terminal to authorize the vpm CLI.
                            </Text>
                            {identity && (
                                <Text tone='muted' size='xs' align='center' className='device-identity'>
                                    Signed in as {identity}
                                </Text>
                            )}
                        </Stack>

                        <CodeInput
                            value={code}
                            onChange={setCode}
                            length={CODE_LENGTH}
                            groupSize={4}
                            ariaLabel='Device code'
                        />

                        <Stack gap='075' className='device-actions'>
                            <Button
                                type='submit'
                                variant='solid'
                                intent='brand'
                                block
                                size='lg'
                                isLoading={pendingAction === 'approve'}
                                disabled={pendingAction !== null}
                            >
                                Authorize
                            </Button>
                            <Button
                                type='button'
                                variant='ghost'
                                intent='neutral'
                                block
                                isLoading={pendingAction === 'deny'}
                                disabled={pendingAction !== null}
                                onClick={() => void handleDecision('deny')}
                            >
                                Deny
                            </Button>
                        </Stack>
                    </Stack>
                )}

                {state === 'authorized' && (
                    <Stack gap='1' align='center'>
                        <IconFrame size='lg' tone='success'>
                            <BadgeCheck size={28} />
                        </IconFrame>
                        <Heading level={1} size='lg' weight='bold' className='text-center'>Device authorized</Heading>
                        <Text tone='muted' size='sm' align='center'>
                            You can return to your terminal.
                        </Text>
                    </Stack>
                )}

                {state === 'denied' && (
                    <Stack gap='1' align='center'>
                        <IconFrame size='lg' tone='danger'>
                            <XCircle size={28} />
                        </IconFrame>
                        <Heading level={1} size='lg' weight='bold' className='text-center'>Authorization denied</Heading>
                        <Text tone='muted' size='sm' align='center'>
                            The device was not granted access to your account.
                        </Text>
                    </Stack>
                )}
            </div>
        </div>
    );
};

export default DevicePage;
