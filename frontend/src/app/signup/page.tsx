'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import FormSeparator from '@/components/ui/form-separator';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import 'remixicon/fonts/remixicon.css';
import z from 'zod';
import { Centered } from '../with-navbar';

const formSchema = z.object({
    email: z.string().email({ message: '- invalid email address' }),
    name: z.string().min(1, { message: '- name is required' }),
    password: z.string().min(6, { message: '- password must be at least 6 characters long' }),
});
export default function Signup() {
    const router = useRouter();
    const { signUpWithEmail, signInWithGoogle } = useAuth();

    const [passwordVisible, setPasswordVisible] = useState(false);
    const togglePasswordVisibility = () => setPasswordVisible(p => !p);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            name: '',
            password: '',
        }
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        signUpWithEmail(values.email, values.password, values.name)
            .then(() => router.push('/'))
            .catch(e => {
                console.log(e);
                switch (e.code) {
                    case 'auth/email-already-in-use': return form.setError('email', { message: '- email already in use' });
                    case 'auth/user-token-expired': return router.push('/login');
                    default: return form.setError('email', { message: '- an unknown error has occurred' });
                }
            });
    }

    function onGoogle() {
        signInWithGoogle().then(success => {
            if (success) router.push('/');
        });
    }

    return (
        <Centered>
            <main className='w-full h-full flex items-center justify-center'>
                <div className='flex flex-col items-center justify-center rounded-xl overflow-hidden w-modal h-modal' style={{ boxShadow: '0 0 53px 4px rgba(0, 0, 0, 0.07)' }}>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='w-[310px] flex flex-col gap-4'>
                            <h1 className='font-bold text-3xl leading-10 text-center'>welcome!</h1>
                            <div className='h-4' />
                            <FormField
                                control={form.control}
                                name='name'
                                render={({ field }) => (
                                    <FormItem>
                                        <div className='flex flex-row items-center'>
                                            <FormLabel className='leading-1'>Name {form.formState.errors.name && <>{form.formState.errors.name.message}</>}</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Input placeholder='Mikey' {...field} autoComplete='on' />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
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
                            <FormField
                                control={form.control}
                                name='password'
                                render={({ field }) => (
                                    <FormItem>
                                        <div className='flex flex-row items-center'>
                                            <FormLabel className='leading-1'>Password {form.formState.errors.password && <>{form.formState.errors.password.message}</>}</FormLabel>
                                        </div>
                                        <FormControl>
                                            <div className='relative'>
                                                <Input placeholder={passwordVisible ? 'password' : '●●●●●●●●'} {...field} type={passwordVisible ? 'text' : 'password'} autoComplete='on' className='pr-10' />
                                                <div className='absolute inset-y-0 right-0 px-3 flex items-center text-muted-foreground cursor-pointer'>
                                                    {passwordVisible ?
                                                        <i className='ri-eye-off-line' onClick={togglePasswordVisibility} /> :
                                                        <i className='ri-eye-line' onClick={togglePasswordVisibility} />
                                                    }
                                                </div>
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <div className='h-4' />
                            <Button type='submit'>Sign Up</Button>
                            <Button variant='secondary' type='button' onClick={onGoogle}>Sign Up with Google</Button>
                            <FormSeparator label='already have an account?' />
                            <Link className={buttonVariants({ variant: 'secondary' })} href={'/login'}>Sign In</Link>
                        </form>
                    </Form>
                </div>
            </main>
        </Centered>
    );
};