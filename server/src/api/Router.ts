import express from 'express';
import { Db } from 'mongodb';
import { AlbumRouter, GatewayRouter, AuthRouter } from './handlers';

export function ApiRouter(db: Db): express.Router {
    const router = express.Router();

    router.use('/auth', AuthRouter(db));

    router.use(GatewayRouter(db));
    router.use('/album', AlbumRouter(db));

    return router;
}