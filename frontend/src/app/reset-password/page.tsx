'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { Centered } from '../with-navbar';

const formSchema = z.object({
    email: z.string().email({ message: '- invalid email address.' })
});

export default function ResetPassword() {
    const router = useRouter();
    const { resetPassword } = useAuth();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: ''
        }
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        resetPassword(values.email).then(() => router.push('/login'));
    }

    return (
        <Centered>
            <main className='w-full h-full flex items-center justify-center'>
                <div className='flex flex-col items-center justify-center rounded-xl overflow-hidden w-[532px] h-[648px]' style={{ boxShadow: '0 0 53px 4px rgba(0, 0, 0, 0.07)' }}>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='w-[310px] flex flex-col gap-4'>
                            <h1 className='font-bold text-3xl leading-10 text-center'>reset password</h1>
                            <div className='h-8' />
                            <FormField
                                control={form.control}
                                name='email'
                                render={({ field }) => (
                                    <FormItem>
                                        <div className='flex flex-row items-center'>
                                            <FormLabel className='leading-1'>Email {form.formState.errors.email && <>{form.formState.errors.email.message}</>}</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Input placeholder='mikey@phoster.com' {...field} autoComplete='on' />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <p>Can't remember your password? Enter your email above to recieve password reset instructions if an account exists with that email.</p>
                            <div className='h-8' />
                            <Button type='submit'>Send Password Reset Instructions</Button>
                            <Link className={buttonVariants({ variant: 'secondary' })} href={'/login'}>Back to Sign In</Link>
                        </form>
                    </Form>
                </div>
            </main>
        </Centered>
    );
};