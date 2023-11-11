import { Link, Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing';

export default function App() {
    return (
        <Routes>
            <Route path='/' element={<Wrapper />}>
                <Route index element={<Landing />} />
            </Route>
        </Routes>
    );
};

function Wrapper() {
    return (
        <div className='flex flex-col min-h-screen py-0 relative'>
            <div className='items-center justify-center flex flex-row'>
                <div className='w-full flex flex-row items-center px-8 py-5'>
                    <Link to='/' className='font-extrabold text-black text-[32px] leading-10 transition-all duration-[0.5s] hover:text-blue cursor-pointer'>Phoster</Link>
                    <div className='flex-1' />
                </div>
            </div>
        </div>
    );
}
