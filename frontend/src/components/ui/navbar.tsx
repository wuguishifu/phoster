'use client';

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function Navbar() {
    const { currentUser } = useAuth();

    return (
        <div className="w-full flex flex-row items-center gap-8 px-4 py-3">
            <Link href="/" className='text-4xl font-bold text-primary hover:text-primary/90'>Phoster</Link>
            <div className="flex-1" />
            <div className="rounded-full h-10 w-10 border-2 border-primary">
                <div className="rounded-full h-full w-full border-2 border-transparent flex items-center justify-center">
                    {currentUser ? (
                        <>
                            {currentUser.photoURL ? (
                                <img src={currentUser.photoURL} className="rounded-full h-full w-full" />
                            ) : (
                                <div>{currentUser?.displayName?.[0].toUpperCase() || '!'}</div>
                            )}
                        </>
                    ) : (
                        <div></div>
                    )}
                </div>
            </div>
        </div>
    );
};