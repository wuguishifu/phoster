import { Link, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import SignUp from './pages/SignUp';
import LogIn from './pages/LogIn';
import ForgotPassword from './pages/ForgotPassword';
import { useState } from 'react';

export default function App() {
    return (
        <Routes>
            <Route path='/' element={<NavigationContainer />}>
                <Route index element={<Landing />} />

                <Route path='sign-up' element={<SignUp />} />
                <Route path='log-in' element={<LogIn />} />
                <Route path='forgot-password' element={<ForgotPassword />} />

                <Route element={<Protected />}>
                    <Route path='dashboard' element={<div>Dashboard</div>} />
                </Route>
            </Route>
        </Routes>
    );
};

function NavigationContainer() {
    const { currentUser } = useAuth();

    return (
        <div className='flex flex-col min-h-screen py-0 relative h-screen'>
            <div className='items-center justify-center flex flex-row'>
                <div className='absolute top-0 left-0 w-full flex flex-row items-center px-8 py-5'>
                    <Link to='/' className='font-extrabold text-black text-[32px] leading-10 transition-all duration-[0.5s] hover:text-blue cursor-pointer'>Phoster</Link>
                    <div className='flex-1' />
                    {currentUser ? (currentUser.photoURL ? (
                        <img src={currentUser?.photoURL || undefined} className='rounded-full w-10 h-10 border-2 border-blue' />
                    ) : (
                        <div className='rounded-full w-10 h-10 border-2 border-blue flex justify-center items-center'>
                            <p className='text-blue font-semibold text-xl'>{currentUser.email?.[0].toUpperCase()}</p>
                        </div>
                    )) : (
                        <div className='rounded-full w-10 h-10 border-2 border-blue flex justify-center items-center'>
                            <i className='ri-user-line text-blue font-semibold text-xl' />
                        </div>
                    )}
                </div>
            </div>
            <Outlet />
        </div>
    );
}

function Protected() {
    const { currentUser, hasCheckedAuth } = useAuth();
    if (!hasCheckedAuth) return null;
    if (currentUser) return <Outlet />;
    else return <Navigate to='/login' replace />;
}
