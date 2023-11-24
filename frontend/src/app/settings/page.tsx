'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Centered } from "../with-navbar";

export default function Settings() {
    const router = useRouter();

    return (
        <Centered>
            <main className="w-full h-full flex items-center justify-center">
                <div className="flex flex-col items-center justify-center rounded-xl overflow-hidden w-modal h-modal" style={{ boxShadow: '0 0 53px 4px rgba(0, 0, 0, 0.07)' }}>
                    <Button
                        variant="destructive"
                        onClick={() => router.push('/login?next=delete')}
                        className="w-[310px]">
                        delete account
                    </Button>
                </div>
            </main>
        </Centered>
    );
};