import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import graphic from '../assets/login_graphic.svg';
import TextInput from "../components/TextInput";
import { useAuth } from "../context/AuthContext";

export default function LogIn() {

    const { login, signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState<{ fields: string[]; message: string; }[]>([]);

    const onDone = () => {
        setError([]);

        let errored = false;
        if (!email.trim()) {
            setError(p => [...p, { fields: ['email'], message: 'email required' }]);
            errored = true;
        }

        if (!/^[\w-\+\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
            setError(p => [...p, { fields: ['email'], message: 'invalid email' }]);
            errored = true;
        }

        if (!password) {
            setError(p => [...p, { fields: ['password'], message: 'password required' }]);
            errored = true;
        }

        if (errored) return;
        login(email.trim(), password)
            .then(() => navigate('/'))
            .catch(e => {
                console.error(e);
                if (e.code === 'auth/user-not-found') setError(p => [...p, { fields: ['email'], message: 'email not found' }]);
                if (e.code === 'auth/wrong-password') setError(p => [...p, { fields: ['password'], message: 'incorrect password' }]);
            });
    };

    const onGoogle = async () => {
        await signInWithGoogle();
    };

    return (
        <div className="w-full h-full flex flex-row items-center justify-center">
            <div className="flex flex-row relative rounded-xl overflow-hidden" style={{ width: 866, height: 648, boxShadow: '0 0 53px 4px rgba(0, 0, 0, 0.07)' }}>
                <div className="flex flex-col h-full relative flex-[532] items-center">
                    <h1 className='font-bold text-3xl leading-10 pt-10'>welcome back!</h1>
                    <div className="pt-6">
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
                    <div className="pt-6">
                        <TextInput
                            value={password}
                            error={error.filter(e => e.fields.includes('password')).length > 0}
                            placeholder={'password'}
                            setValue={v => {
                                setPassword(v);
                                setError(p => p.filter(e => !e.fields.includes('password')));
                            }}
                            secure={true}
                            style={{ width: 310, height: 40 }}
                            onDone={onDone}
                        />
                    </div>
                    <div className="flex-1" />
                    {error.length > 0 && (
                        <div className='flex flex-col justify-center' style={{ height: 40 }}>
                            <div className='text-red-200'>
                                {error.length > 1 ? 'multiple errors' : error[0].message}
                            </div>
                        </div>
                    )}
                    <button
                        className='button-primary rounded-lg flex flex-col items-center justify-center text-white font-semibold cursor-pointer outline-none border-none'
                        style={{ width: 310, height: 40 }}
                        onClick={onDone}
                    >log in</button>
                    <div className="pt-6">
                        <button
                            className='button-secondary rounded-lg flex flex-col items-center justify-center text-black font-semibold cursor-pointer outline-none border-none'
                            style={{ width: 310, height: 40 }}
                            onClick={onGoogle}
                        >sign in with Google</button>
                    </div>
                    <div className="pt-6">
                        <Link
                            to='/sign-up'
                            style={{ width: 310, height: 40 }}
                            className='w-full h-full button-secondary rounded-lg flex flex-col items-center justify-center text-black font-semibold cursor-pointer outline-none border-none'
                        >create an account</Link>
                    </div>
                    <div style={{ width: 310 }} className="flex flex-row justify-center" >
                        <Link
                            to='/forgot-password'
                            className='p-6 font-semibold cursor-pointer outline-none border-none text-blue'
                        >forgot password?</Link>
                    </div>
                </div>
                <div className="flex flex-col h-full relative flex-[334]" style={{ backgroundColor: '#E3EFFF' }}>
                    <img src={graphic} style={{ position: 'absolute', overflow: 'hidden', left: -42, top: 224 }} />
                </div>
            </div>
        </div>
    );
}