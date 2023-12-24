import sqlite3 from "sqlite3";

export class Db {
    private db: sqlite3.Database;

    constructor(dbPath: string) {
        this.db = new sqlite3.Database(dbPath, error => {
            if (error) throw error;
            else console.log('connected to sqlite database');
        });

        this.db.run(`
            CREATE TABLE IF NOT EXISTS users (
                username TEXT UNIQUE PRIMARY KEY,
                password TEXT NOT NULL
            )
        `);

        this.db.run(`
            CREATE TABLE IF NOT EXISTS albums (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        this.db.run(`
            CREATE TABLE IF NOT EXISTS images (
                id TEXT PRIMARY KEY,
                album_id TEXT NOT NULL,
                author TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE ON UPDATE CASCADE
            )
        `);

        this.db.run(`CREATE INDEX IF NOT EXISTS idx_album_id ON images (album_id)`);
    }

    run(query: string, params?: any[], callback?: (error: Error | null) => void) {
        this.db.run(query, params, callback);
    }

    get<T>(query: string, params?: any[], callback?: (error: Error | null, row: T) => void) {
        this.db.get<T>(query, params, callback);
    }

    all<T>(query: string, params?: any[], callback?: (error: Error | null, rows: T[]) => void) {
        this.db.all<T>(query, params, callback);
    }

    async close(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.db.close(error => {
                if (error) reject(error);
                resolve();
            });
        });
    }
};