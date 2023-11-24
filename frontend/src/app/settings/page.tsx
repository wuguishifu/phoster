'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Centered } from "../with-navbar";

export default function Settings() {
    const router = useRouter();

    return (
        <Centered>
            <main className="w-full h-full flex items-center justify-center">
                <div className="modal">
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