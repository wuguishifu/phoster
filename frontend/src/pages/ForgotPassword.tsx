import { useState } from "react";
import graphic from '../assets/forgot_password.svg';
import TextInput from "../components/TextInput";
import { useAuth } from "../context/AuthContext";
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
    const { resetPassword } = useAuth();

    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const [error, setError] = useState<{ fields: string[]; message: string; }[]>([]);

    const onDone = () => {
        setMessage('');
        setError([]);

        if (!email.trim()) {
            setError(p => [...p, { fields: ['email'], message: 'email required' }]);
            return;
        }

        if (!/^[\w-\+\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
            setError(p => [...p, { fields: ['email'], message: 'invalid email' }]);
            return;
        }

        resetPassword(email.trim())
            .then(() => setMessage('please check your email'))
            .catch(e => console.error(e));
    }

    return (
        <div className="w-full h-full flex flex-row items-center justify-center">
            <div className="flex flex-row relative rounded-xl overflow-hidden" style={{ width: 866, height: 648, boxShadow: '0 0 53px 4px rgba(0, 0, 0, 0.07)' }}>
                <div className="flex flex-col h-full relative flex-[334]" style={{ backgroundColor: '#E3EFFF' }}>
                    <img src={graphic} style={{ position: 'absolute', overflow: 'hidden', right: -52, top: 224 }} />
                </div>
                <div className="flex flex-col h-full relative flex-[532] items-center">
                    <div className='font-bold text-3xl leading-10 absolute top-16'>forgot password?</div>
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
                    <button
                        className='absolute button-primary rounded-lg flex flex-col items-center justify-center text-white font-semibold cursor-pointer outline-none border-none'
                        style={{ width: 310, height: 40, top: 456 }}
                        onClick={onDone}
                    >send reset email</button>
                    <Link
                        to='/log-in'
                        className='absolute w-full h-full button-secondary rounded-lg flex flex-col items-center justify-center text-black font-semibold cursor-pointer outline-none border-none'
                        style={{ width: 310, height: 40, top: 522 }}
                    >return to log in</Link>
                    <div style={{ width: 310, top: 570 }} className="absolute flex flex-row justify-center" >
                        <div
                            className='p-2 m-4 absolute font-semibold cursor-pointer outline-none border-none'
                            style={{ color: '#6C63FF' }}
                        >{message}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}