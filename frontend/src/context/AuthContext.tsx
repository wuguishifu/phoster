import { GoogleAuthProvider, User, createUserWithEmailAndPassword, deleteUser, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from "firebase/auth";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase-config";

type AuthContextType = {
    hasCheckedAuth: boolean;
    currentUser: null | User;
    signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    user_id: string | undefined;
    signInWithGoogle: () => Promise<boolean>;
    deleteAccount: () => Promise<boolean>;
};

const AuthContext = createContext({} as AuthContextType);

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
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name })
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

    // must be authenticated, send to login page first
    async function deleteAccount(): Promise<boolean> {
        const user = auth.currentUser;
        if (!user) return false;
        await deleteUser(user);
        return true;
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
        deleteAccount
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}