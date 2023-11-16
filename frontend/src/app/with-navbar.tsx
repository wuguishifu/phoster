'use client';

import Navbar from "@/components/ui/navbar";

export default function WithNavbar({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col h-full px-4">
            <Navbar />
            {children}
        </div>
    );
};

export function Centered({ children }: { children: React.ReactNode }) {
    return (
        <div className="pb-14 h-full">
            {children}
        </div>
    );
}