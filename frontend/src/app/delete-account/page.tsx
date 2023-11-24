'use client';

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Centered } from "../with-navbar";
import { Button } from "@/components/ui/button";

export default function DeleteAccount() {
    const router = useRouter();
    const { deleteAccount, currentUser } = useAuth();

    return (
        <Centered>
            <main className="w-full h-full flex items-center justify-center">
                <div className="flex flex-col items-center justify-center rounded-xl overflow-hidden w-modal h-modal" style={{ boxShadow: '0 0 53px 4px rgba(0, 0, 0, 0.07)' }}>
                    <div className="w-[400px] flex flex-col gap-4">
                        <h1 className="font-bold text-3xl leading-10 text-center">delete account?</h1>
                        <div className="h-4" />
                        <p>What you will lose:</p>
                        <ul className="list-disc pl-8">
                            <li>All of your account data</li>
                            <li>Website access to all your servers</li>
                        </ul>
                        <p>What you will NOT lose:</p>
                        <ul className="list-disc pl-8">
                            <li>Your server data (images, videos) on your hosted servers</li>
                        </ul>
                        <p>Other users will lose access to any servers you were hosting. You will still be able to access your own data through whatever 3rd party service you used to set up your server storage. You will also be able to export and view any data through the server webapp.</p>
                        <div className="flex flex-col items-center w-full pt-8">
                            <Button
                                variant="destructive"
                                onClick={() => deleteAccount().then(() => router.push('/'))}
                                className="w-[310px]">
                                delete account
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => router.push('/')}
                                className="w-[310px] mt-4">
                                cancel
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </Centered>
    )
};