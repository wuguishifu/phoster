import express from 'express';
import http from 'http';

import { MongoClient } from 'mongodb';
import mongodbConfig from './config/mongodb-config.json';
import Applier, { Schema } from './schema-applier';
import dbSchema from './config/db-schema.json';
import Router from './routes/Router';

const config = mongodbConfig[process.env.NODE_ENV ?? 'development'];
const options = Object.entries(config.options).map(([key, value]) => `${key}=${value}`).join('&');
const client = new MongoClient(`${config.ip}/?${options}`);
client.connect().then(() => console.log('connected to mongodb db')); // throws error
const db = client.db(config.db);

const applier = new Applier(config);
applier.apply(dbSchema as Schema);

const app = express();
const server = http.createServer(app);

app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: '20mb' }));

app.use('/api', Router(db));

let port = parseInt(process.env.PORT ?? '8080');
if (port > 65535 || port < 0) port = 8080;
server.listen(+port, () => console.log(`server running on port ${+port}`));

const close = () => client.close().then(() => process.exit(0)).catch(() => process.exit(1));
process.on('SIGINT', close);
process.on('SIGTERM', close);
process.on('uncaughtException', close);
process.on('unhandledRejection', close);

if (process.platform === 'win32') {
    require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    }).on('SIGINT', close);
}