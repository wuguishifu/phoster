import express from 'express';
import fs from 'fs';
import { Db } from 'mongodb';
import { Album } from '../../models';
import { ImageRouter, ThumbRouter } from '.';

const outputDir = process.env.OUTPUT_DIR || './';
const location = (album_name: string) => `${outputDir}/${album_name}`;

export function AlbumRouter(db: Db): express.Router {
    const router = express.Router();

    router.use('/image', ImageRouter(db));
    router.use('/thumb', ThumbRouter(db));

    router.post('/', async (req, res) => {
        const { 'x-username': username } = req.headers as { 'x-username': string };
        const { album_name } = req.body as { album_name: string };
        const album = new Album({ album_name, author: username });

        try {
            if (fs.existsSync(location(album_name))) return res.status(409).send({ error: 'album already exists' });
            fs.mkdirSync(`${location(album_name)}/thumb_cache`, { recursive: true });
            fs.mkdirSync(`${location(album_name)}/metadata`, { recursive: true });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'an unknown error has occurred';
            return res.status(500).send({ error: 'error creating album', message });
        }

        let result;
        try {
            result = await db.collection('albums').insertOne(album);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'an unknown error has occurred';
            return res.status(500).send({ error: 'error creating album', message });
        }

        if (result.insertedId) return res.status(201).send(album);
        return res.status(500).send({ error: 'error creating album' });
    });

    router.get('/:album_name', async (req, res) => {
        const { album_name } = req.params as { album_name: string };
        const page = +req.query.page! || 0;

        try {
            if (!fs.existsSync(location(album_name))) return res.status(404).send({ error: 'album not found' });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'an unknown error has occurred';
            return res.status(500).send({ error: 'error fetching album', message });
        }

        const [albumPromise, imagesPromise] = await Promise.allSettled([
            db.collection('albums').findOne({ album_name }, { projection: { _id: 0 } }),
            db.collection('images')
                .find({ album_name }, { projection: { _id: 0, album_name: 0 } })
                .sort({ uploaded_at: -1, image_id: 1 })
                .skip(page * 20)
                .limit(20)
                .toArray()
        ]);

        if (albumPromise.status === 'rejected') {
            const message = albumPromise.reason instanceof Error ? albumPromise.reason.message : 'an unknown error has occurred';
            return res.status(500).send({ error: 'error fetching album', message });
        }

        if (imagesPromise.status === 'rejected') {
            const message = imagesPromise.reason instanceof Error ? imagesPromise.reason.message : 'an unknown error has occurred';
            return res.status(500).send({ error: 'error fetching images', message });
        }

        const album = albumPromise.value;
        const images = imagesPromise.value;

        if (!album) return res.status(404).send({ error: 'album not found' });

        return res.status(200).send({ album, images: images ?? [] });
    });

    router.delete('/:album_name', async (req, res) => {
        const { album_name } = req.params as { album_name: string };

        let result;
        try {
            const imageCount = await db.collection('images').countDocuments({ album_name });
            if (imageCount) return res.status(409).send({ error: 'album is not empty' });
            result = await db.collection('albums').deleteOne({ album_name });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'an unknown error has occurred';
            return res.status(500).send({ error: 'error deleting album', message });
        }

        try {
            fs.rmdirSync(location(album_name));
        } catch (ignored) { }

        if (result.deletedCount) return res.status(200).send({ deleted: true });
        return res.status(500).send({ error: 'error deleting album' });
    });

    return router;
};