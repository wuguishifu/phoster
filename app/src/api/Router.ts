import express from 'express';
import { Db } from '../lib/db';
import { AuthRouter, Gateway } from './auth';
import { AlbumRouter } from './albums';

export function ApiRouter(db: Db): express.Router {
    const router = express.Router();

    router.use('/auth', AuthRouter(db));
    router.use(Gateway(db));

    router.use('/albums', AlbumRouter(db));

    return router;
};