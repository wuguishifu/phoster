'use client';

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import 'remixicon/fonts/remixicon.css';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./dropdown-menu";
import { cn } from "@/lib/utils";
import { LogOut, LogIn, ClipboardSignature, Settings, HardDrive } from 'lucide-react';

export default function Navbar({ className }: { className?: string }) {
    const { currentUser, logout } = useAuth();

    const router = useRouter();

    return (
        <div className={cn(className, "w-full flex flex-row items-center gap-8 py-3")}>
            <Link href="/" className='text-4xl font-bold text-primary hover:text-primary/90'>Phoster</Link>
            <div className="flex-1" />
            {currentUser ? (
                <DropdownMenu>
                    <DropdownMenuTrigger className="outline-none">
                        <div className="rounded-full h-10 w-10 border-2 border-primary cursor-pointer">
                            <div className="rounded-full h-full w-full border-2 border-transparent flex items-center justify-center">
                                {currentUser ? (
                                    <>
                                        {currentUser.photoURL ? (
                                            <img src={currentUser.photoURL} className="rounded-full h-full w-full" />
                                        ) : (
                                            <div className="rounded-full h-full w-full bg-empty flex items-center justify-center">
                                                <div className="text-xl font-semibold text-center mt-0.5">{currentUser?.email?.[0].toUpperCase() || '?'}</div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div></div>
                                )}
                            </div>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push('/my-servers')}>
                            <HardDrive className="mr-2 h-4 w-4 text-popover-foreground" />
                            <span>My Servers</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/settings')}>
                            <Settings className="mr-2 h-4 w-4 text-popover-foreground" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => logout().then(() => router.push('/'))}>
                            <LogOut className="mr-2 h-4 w-4 text-popover-foreground" />
                            <span>Log Out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <DropdownMenu>
                    <DropdownMenuTrigger className="outline-none">
                        <div className="rounded-full h-10 w-10 border-2 border-primary cursor-pointer">
                            <div className="rounded-full h-full w-full border-2 border-transparent flex items-center justify-center">
                                <img src="user_default.png" className="rounded-full h-full w-full" />
                            </div>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => router.push('/login')}>
                            <LogIn className="mr-2 h-4 w-4 text-popover-foreground" />
                            <span>Log In</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/signup')}>
                            <ClipboardSignature className="mr-2 h-4 w-4 text-popover-foreground" />
                            <span>Sign Up</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
};