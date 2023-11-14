import { useState } from "react";
import graphic from '../assets/login_graphic.svg';
import TextInput from "../components/TextInput";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LogIn() {

    const { login } = useAuth();
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

    return (
        <div className="w-full h-full flex flex-row items-center justify-center">
            <div className="flex flex-row relative rounded-xl overflow-hidden" style={{ width: 866, height: 648, boxShadow: '0 0 53px 4px rgba(0, 0, 0, 0.07)' }}>
                <div className="flex flex-col h-full relative flex-[532] items-center">
                    <div className='font-bold text-3xl leading-10 absolute top-16'>welcome back!</div>
                    <TextInput
                        value={email}
                        error={error.filter(e => e.fields.includes('email')).length > 0}
                        placeholder={'email'}
                        setValue={v => {
                            setEmail(v);
                            setError(p => p.filter(e => !e.fields.includes('email')));
                        }}
                        secure={false}
                        style={{ position: 'absolute', width: 310, height: 40, top: 152 }}
                        onDone={onDone}
                    />
                    <TextInput
                        value={password}
                        error={error.filter(e => e.fields.includes('password')).length > 0}
                        placeholder={'password'}
                        setValue={v => {
                            setPassword(v);
                            setError(p => p.filter(e => !e.fields.includes('password')));
                        }}
                        secure={true}
                        style={{ position: 'absolute', width: 310, height: 40, top: 218 }}
                        onDone={onDone}
                    />
                    {error.length > 0 && (
                        <div className='absolute flex flex-col justify-center' style={{ top: 271, height: 40 }}>
                            <div className='text-red-200'>
                                {error.length > 1 ? 'multiple errors' : error[0].message}
                            </div>
                        </div>
                    )}
                    <button
                        className='absolute button-primary rounded-lg flex flex-col items-center justify-center text-white font-semibold cursor-pointer outline-none border-none'
                        style={{ width: 310, height: 40, top: 456 }}
                        onClick={onDone}
                    >log in</button>
                    <Link
                        to='/sign-up'
                        style={{ width: 310, height: 40, top: 522 }}
                        className='absolute w-full h-full button-secondary rounded-lg flex flex-col items-center justify-center text-black font-semibold cursor-pointer outline-none border-none'
                    >sign up</Link>
                    <div style={{ width: 310, top: 570 }} className="absolute flex flex-row justify-center" >
                        <Link
                            to='/forgot-password'
                            className='p-2 m-4 absolute font-semibold cursor-pointer outline-none border-none text-blue'
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