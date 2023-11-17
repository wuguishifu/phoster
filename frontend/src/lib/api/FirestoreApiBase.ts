import { DocumentData, QuerySnapshot, Unsubscribe, WhereFilterOp } from "firebase/firestore";

export type Storable = Record<string, any>;

export type QueryParam = {
    property: string;
    op: WhereFilterOp;
    value: any;
};

export abstract class FirestoreApiBase {
    collectionName: string;

    constructor(collectionName: string) {
        this.collectionName = collectionName;
    }

    public get = async <T extends Storable>(key: string, parse: (_: DocumentData) => T): Promise<T | null> => {
        try {
            const data = await this._get(key);
            return data ? parse(data) : null;
        } catch (error) {
            let message = 'an unknown error has occurred';
            if (error instanceof Error) message = error.message;
            console.error(`error fetching data from ${{ collection: this.collectionName, key }}\nmessage=${message}`);
            return null;
        }
    };

    public getOrDefault = async <T extends Storable>(key: string, defaultValue: () => T, parse: (_: DocumentData) => T): Promise<T> => {
        const data = await this.get(key, parse);
        return data ?? defaultValue?.();
    };

    public set = async <T extends Storable>(key: string, data: T): Promise<string | null> => {
        try {
            await this._set(key, data);
            return key;
        } catch (error) {
            let message = 'an unknown error has occurred';
            if (error instanceof Error) message = error.message;
            console.error(`error setting data to ${{ collection: this.collectionName, key, data }}\nmessage=${message}`);
            return null;
        }
    };

    public search = async <T extends Storable>(path: string, params: QueryParam[], parse: (_: DocumentData) => T): Promise<T[] | null> => {
        try {
            const snapshot = await this._search(path, params);
            return snapshot.docs.map(doc => parse(doc.data()));
        } catch (error) {
            let message = 'an unknown error has occurred';
            if (error instanceof Error) message = error.message;
            console.error(`error searching data from ${{ collection: this.collectionName, path, params }}\nmessage=${message}`);
            return null;
        }
    }

    abstract listen: <T extends Storable>(key: string, callback: (_: T) => void, errCallback: (_: unknown) => void, defaultValue: () => T, parse: (_: DocumentData) => T) => Unsubscribe;
    abstract searchAndListen: <T extends Storable>(path: string, params: QueryParam[], callback: (_: T[]) => void, errCallback: (_: unknown) => void, parse: (_: DocumentData) => T) => Unsubscribe;
    abstract searchAndDelete: (path: string, params: QueryParam[]) => Promise<number>;
    abstract delete(key: string): Promise<void>;

    protected abstract _get(key: string): Promise<Storable | null>;
    protected abstract _set(key: string, data: Storable): Promise<void>;
    protected abstract _search(path: string, params: QueryParam[]): Promise<QuerySnapshot<DocumentData>>
}