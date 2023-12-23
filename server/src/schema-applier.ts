import { IndexSpecification, MongoClient } from 'mongodb';

type Config = {
    ip: string;
    db: string;
    options: Record<string, string | boolean>;
};

type Unique = {
    type: 'unique';
    field: string;
    indexSpec: {
        pattern: 1 | -1;
    };
};

type Default = {
    type: 'default';
    field: string;
    indexSpec: {
        pattern: 1 | -1;
    };
};

type Compound = {
    type: 'compound';
    field: string;
    indexSpec: {
        [key: string]: 1 | -1;
    };
};

type Sparse = {
    type: 'sparse';
    field: string;
    indexSpec: {
        pattern: 1 | -1;
    };
};

type TTLIndex = {
    type: 'ttl';
    field: string;
    indexSpec: {
        pattern: 1 | -1;
        expiresAfterSeconds: number;
    };
};

type Schema = {
    collections: Record<string, { indexes: (Default | Compound | Sparse | TTLIndex | Unique)[] }>;
};

export { Schema };

export default class Applier {
    private config: Config;
    private client: MongoClient;

    constructor(config: Config) {
        this.config = config;
        const options = Object.entries(config.options).map(([key, value]) => `${key}=${value}`).join('&');
        const url = `${config.ip}/?${options}`;
        this.client = new MongoClient(url);
    }

    async apply(schema: Schema) {
        await this.client.connect(); // throws error
        const db = this.client.db(this.config.db);
        await Promise.all(Object.entries(schema.collections).flatMap(([collection, { indexes }]) => {
            return indexes.map(({ field, type, indexSpec }) => {
                switch (type) {
                    case 'default': return db.collection(collection).createIndex({ [field]: indexSpec.pattern });
                    case 'compound': return db.collection(collection).createIndex(indexSpec as IndexSpecification);
                    case 'sparse': return db.collection(collection).createIndex({ [field]: indexSpec.pattern }, { sparse: true });
                    case 'ttl': return db.collection(collection).createIndex({ [field]: indexSpec.pattern }, { expireAfterSeconds: indexSpec.expiresAfterSeconds });
                    case 'unique': return db.collection(collection).createIndex({ [field]: indexSpec.pattern }, { unique: true })
                }
            });
        }));
    }
}