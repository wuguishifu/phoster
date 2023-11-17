import { GoogleAuthProvider, User, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from "firebase/auth";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase-config";

type AuthContext = {
    hasCheckedAuth: boolean;
    currentUser: null | User;
    signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    user_id: string | undefined;
    signInWithGoogle: () => Promise<boolean>;
}

const AuthContext = createContext({} as AuthContext);

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
    const [currentUser, setCurrentUser] = useState<null | User>(null);
    const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setCurrentUser(user);
            setHasCheckedAuth(true);
        });

        return unsubscribe;
    }, []);

    async function signUpWithEmail(email: string, password: string, name: string) {
        await createUserWithEmailAndPassword(auth, email, password);
        if (currentUser) await updateProfile(currentUser, { displayName: name });
    }

    async function signInWithEmail(email: string, password: string) {
        await signInWithEmailAndPassword(auth, email, password);
    }

    async function logout() {
        await signOut(auth);
    }

    async function resetPassword(email: string) {
        await sendPasswordResetEmail(auth, email);
    }

    async function signInWithGoogle(): Promise<boolean> {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        return !!result.user?.uid;
    }

    const value = {
        hasCheckedAuth,
        currentUser,
        signUpWithEmail,
        signInWithEmail,
        logout,
        resetPassword,
        user_id: currentUser?.uid,
        signInWithGoogle,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}