import { UsersApi } from "@/lib/api";
import { createContext, useContext } from "react";
import { db } from "@/firebase-config";

type ApiContextType = {
    users: UsersApi;
};

const ApiContext = createContext({} as ApiContextType);

export function useApi() {
    return useContext(ApiContext);
}

export function ApiProvider({ children }: { children: React.ReactNode }): JSX.Element {
    const value = {
        users: new UsersApi(db),
    };

    return (
        <ApiContext.Provider value={value}>
            {children}
        </ApiContext.Provider>
    );
};