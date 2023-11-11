import express from 'express';
import { Db } from 'mongodb';
import AlbumRouter from './albums/Albums';
import ImageRouter from './images/Images';

export default function Router(db: Db) {
    const router = express.Router();

    router.use('/albums', AlbumRouter(db));
    router.use('/images', ImageRouter(db));

    return router;
};