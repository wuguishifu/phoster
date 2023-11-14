import { useState } from 'react';
import 'remixicon/fonts/remixicon.css';

interface TextInputProps {
    value: string;
    placeholder?: string;
    setValue: (value: string) => void;
    secure: boolean;
    style: React.CSSProperties;
    id?: string;
    onDone: () => void;
    error: boolean;
    onFocus?: () => void;
}

export default function TextInput(params: TextInputProps) {
    const { value, placeholder, setValue, secure, style, id, onDone, error, onFocus } = params;
    const [visible, setVisible] = useState(!secure);

    return (
        <div id={id} className={`text-input rounded-lg flex flex-row items-center justify-start relative ${error ? 'errored' : ''}`} style={style}>
            <input
                className={`flex-1 font-medium h-full flex flex-row items-center rounded-lg outline-none border-none py-0 px-4 overflow-hidden bg-transparent ${error ? 'placeholder-red-200 text-red-400' : 'placeholder-gray-200'}`}
                type={visible ? 'text' : 'password'}
                placeholder={placeholder}
                value={value}
                onChange={e => setValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onDone()}
                onFocus={() => onFocus?.()}
            />
            {secure && <div
                className='flex flex-row justify-center items-center cursor-pointer text-blue pr-4'
                onClick={() => setVisible(!visible)}
            >
                {visible ? <i className='ri-eye-off-line'></i> : <i className='ri-eye-line'></i>}
            </div>}
        </div>
    );
};