import { useState } from 'react';
import graphic from '../assets/signup_graphic.svg';
import TextInput from '../components/TextInput';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function SignUp() {
    const { signup } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password0, setPassword0] = useState('');
    const [password1, setPassword1] = useState('');

    const [error, setError] = useState<{ fields: string[]; message: string; }[]>([]);

    const onDone = () => {
        setError([]);

        let errored = false;
        if (!name.trim()) {
            setError(p => [...p, { fields: ['name'], message: 'name required' }]);
            errored = true;
        }

        if (!email) {
            setError(p => [...p, { fields: ['email'], message: 'email required' }]);
            errored = true;
        }

        if (!/^[\w-\+\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
            setError(p => [...p, { fields: ['email'], message: 'invalid email' }]);
            errored = true;
        }

        if (!password0) {
            setError(p => [...p, { fields: ['password0', 'password1'], message: 'password required' }]);
            errored = true;
        }

        if (password0 !== password1) {
            setError(p => [...p, { fields: ['password0', 'password1'], message: 'passwords must match' }]);
            errored = true;
        }

        if (errored) return;
        signup(email, password0, name.trim())
            .then(() => navigate('/'))
            .catch(e => {
                if (e.code === 'auth/email-already-in-use') setError(p => [...p, { fields: ['email'], message: 'email already in use' }]);
                if (e.code === 'auth/weak-password') setError(p => [...p, { fields: ['password0', 'password1'], message: 'password must be at least 6 characters' }]);
            });
    };

    return (
        <div className='w-full h-full flex flex-row items-center justify-center'>
            <div className='flex flex-row relative rounded-xl overflow-hidden' style={{ width: 866, height: 648, boxShadow: '0 0 53px 4px rgba(0, 0, 0, 0.07)' }}>
                <div className="flex flex-col h-full relative flex-[334]" style={{ backgroundColor: '#E3EFFF' }}>
                    <img src={graphic} style={{ position: 'absolute', overflow: 'hidden', right: -42, top: 224 }} />
                </div>
                <div className="flex flex-col h-full relative flex-[532] items-center">
                    <h1 className='font-bold text-3xl leading-10 pt-10'>welcome!</h1>
                    <div className='pt-6'>
                        <TextInput
                            value={name}
                            error={error.filter(e => e.fields.includes('name')).length > 0}
                            placeholder={'name'}
                            setValue={v => {
                                setName(v);
                                setError(p => p.filter(e => !e.fields.includes('name')));
                            }}
                            secure={false}
                            style={{ width: 310, height: 40 }}
                            onDone={onDone}
                        />
                    </div>
                    <div className='pt-6'>
                        <TextInput
                            value={email}
                            error={error.filter(e => e.fields.includes('email')).length > 0}
                            placeholder={'email'}
                            setValue={v => {
                                setEmail(v);
                                setError(p => p.filter(e => !e.fields.includes('email')));
                            }}
                            secure={false}
                            style={{ width: 310, height: 40 }}
                            onDone={onDone}
                        />
                    </div>
                    <div className='pt-6'>
                        <TextInput
                            value={password0}
                            error={error.filter(e => e.fields.includes('password0')).length > 0}
                            placeholder={'password (6+ characters)'}
                            setValue={v => {
                                setPassword0(v);
                                setError(p => p.filter(e => !e.fields.includes('password0')));
                            }}
                            secure={true}
                            style={{ width: 310, height: 40 }}
                            onDone={onDone}
                        />
                    </div>
                    <div className='pt-6'>
                        <TextInput
                            value={password1}
                            error={error.filter(e => e.fields.includes('password1')).length > 0}
                            placeholder={'confirm password'}
                            setValue={v => {
                                setPassword1(v);
                                setError(p => p.filter(e => !e.fields.includes('password1')))
                            }}
                            secure={true}
                            style={{ width: 310, height: 40 }}
                            onDone={onDone}
                        />
                    </div>
                    <div className='flex-1' />
                    {error.length > 0 && (
                        <div className='flex flex-col justify-center' style={{ height: 40 }}>
                            <div className='text-red'>
                                {error.length > 1 ? 'multiple errors' : error[0].message}
                            </div>
                        </div>
                    )}
                    <button
                        className='button-primary rounded-lg flex flex-col items-center justify-center text-white font-semibold cursor-pointer outline-none border-none'
                        style={{ width: 310, height: 40 }}
                        onClick={onDone}
                    >sign up</button>
                    <div className='pt-6'>
                        <Link
                            to='/log-in'
                            className='w-full h-full button-secondary rounded-lg flex flex-col items-center justify-center text-black font-semibold cursor-pointer outline-none border-none'
                            style={{ width: 310, height: 40 }}
                        >log into an existing account</Link>
                    </div>
                    <div style={{ width: 310 }} className="flex flex-row justify-center" >
                        <Link
                            to='/forgot-password'
                            className='p-6 font-semibold cursor-pointer outline-none border-none text-blue'
                        >forgot password?</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}