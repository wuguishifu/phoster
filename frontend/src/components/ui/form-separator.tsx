export default function FormSeparator({ label, includesUppercase = false }: { label: string, includesUppercase?: boolean }) {
    return (
        <div className={`flex flex-row items-center w-full gap-2 ${includesUppercase ? 'py-0.5' : 'pt-0.5'}`}>
            <div className='flex-1 h-0.5 rounded-full bg-muted-foreground' />
            <div className={`text-muted-foreground font-semibold leading-none ${includesUppercase ? '' : 'pb-0.5'}`}>
                {label}
            </div>
            <div className='flex-1 h-0.5 rounded-full bg-muted-foreground' />
        </div>
    );
};