import express from 'express';
import http from 'http';
import { ApiRouter } from './api';

import { MongoClient } from 'mongodb';
import mongodbConfig from './config/mongodb-config.json';
import Applier, { Schema } from './schema-applier';
import dbSchema from './config/db-schema.json';

const options = Object.entries(mongodbConfig.options).map(([key, value]) => `${key}=${value}`).join('&');
const client = new MongoClient(`${mongodbConfig.ip}/?${options}`);
client.connect().then(() => console.log('connected to mongodb db')); // throws error
const db = client.db(mongodbConfig.db);

const applier = new Applier(mongodbConfig);
applier.apply(dbSchema as Schema);

const app = express();
const server = http.createServer(app);

app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: '20mb' }));
app.use('/api', ApiRouter(db));

app.get('/ping', async (_, res) => {
    res.status(200).send({ message: 'pong' });
});

let port = parseInt(process.env.PORT ?? '8080');
if (port > 65535 || port < 0) port = 8080;
server.listen(+port, () => console.log(`server running on port ${+port}`));

const exit = (a: string) => {
    console.log('exiting:', a);
    process.exit(0);
};

process.on('SIGINT', () => exit('SIGINT'));
process.on('SIGTERM', () => exit('SIGTERM'));
process.on('uncaughtException', () => exit('uncaught exception'));
process.on('unhandledRejection', () => exit('unhandled rejection'));

if (process.platform === 'win32') {
    require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    }).on('SIGINT', () => exit('SIGINT'));
}