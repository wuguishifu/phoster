import fs from 'fs';
import Electron from 'electron';
import express from 'express';
import http from 'http';
import path from 'path';
import { Db } from '../lib/db';
import { ApiRouter } from './Router';

export default class Server {
    private app: express.Express;
    private server: http.Server;
    private db: Db;

    constructor(electron: Electron.App) {
        if (!fs.existsSync(path.join(electron.getPath('userData'), 'phoster'))) {
            fs.mkdirSync(path.join(electron.getPath('userData'), 'phoster'), { recursive: true });
        }

        const dbPath = path.join(electron.getPath('userData'), 'phoster', 'phoster.db');
        console.log(dbPath);
        this.db = new Db(dbPath);

        this.app = express();
        this.server = http.createServer(this.app);

        this.app.use(express.urlencoded({ extended: false }));
        this.app.use(express.json({ limit: '20mb' }));

        this.app.use('/api', ApiRouter(this.db));

        this.app.get('/ping', async (_, res) => {
            return res.status(200).send({ message: 'pong', timestamp: new Date() });
        });
    }

    run(port: number) {
        this.server.listen(port, () => console.log('server running on port', +port));
    }

    async close() {
        this.server.close();
        try {
            await this.db.close();
            console.log('sqlite db closed');
        } catch (error) {
            console.error(error);
        }
    }
}