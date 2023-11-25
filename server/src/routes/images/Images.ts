import express from 'express';
import { Db } from 'mongodb';
import fs from 'fs';
import sharp from 'sharp';

import Image from '../../models/Image';

const outputDir = process.env.OUTPUT_DIR || './';

export default function ImageRouter(db: Db) {
    const router = express.Router();

    router.post('/image', async (req, res) => {
        const { album_id, base64, user_id } = req.body as { album_id: string, base64: string, user_id: string };
        const image = new Image({ author: user_id, album_id });

        // save image to disk
        try {
            await saveImage({ base64, location: `${outputDir}/${album_id}/${image.image_id}` });
        } catch (error) {
            let message = 'an unknown error has occurred';
            if (error instanceof Error) message = error.message;
            return res.status(500).send({ error: 'error creating image', message });
        }

        // generate thumbnail
        try {
            await generateThumb({ base64, location: `${outputDir}/${album_id}/thumb_cache/${image.image_id}.thumb` });
        } catch (error) {

        }

        let result;
        try {
            result = await db.collection('images').insertOne(image);
        } catch (error) {
            let message = 'an unknown error has occurred';
            if (error instanceof Error) message = error.message;
            return res.status(500).send({ error: 'error creating image', message });
        }

        if (result.acknowledged) return res.status(201).send({ image });
        else return res.status(500).send({ error: 'error creating image' });
    });

    router.get('/image', async (req, res) => {
        const { image_id } = req.query as { image_id: string };

        let image;
        try {
            image = await db.collection('images').findOne(
                { image_id },
                { projection: { _id: 0 } }
            );
        } catch (error) {
            let message = 'an unknown error has occurred';
            if (error instanceof Error) message = error.message;
            return res.status(500).send({ error: 'error fetching image', message });
        }

        if (!image) return res.status(404).send({ error: 'image not found' });

        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Encoding': 'base64'
        });
        fs.createReadStream(`${outputDir}/${image.album_id}/${image.image_id}`, 'base64').pipe(res);
    });

    router.delete('/image', async (req, res) => {
        const { user_id, image_id } = req.query as { image_id: string, user_id: string };

        let result;
        try {
            result = await db.collection('images').deleteOne({ image_id, author: user_id });
        } catch (error) {
            let message = 'an unknown error has occurred';
            if (error instanceof Error) message = error.message;
            return res.status(500).send({ error: 'error deleting image', message });
        }

        if (result.deletedCount === 0) return res.status(404).send({ error: 'image not found' });
        else return res.status(200).send({ message: 'image deleted' });
    });

    router.get('/ping', (_, res) => {
        res.status(200).send({ message: 'pong' });
    });

    return router;
};

export function saveImage({ base64, location }: { base64: string; location: string }): Promise<void> {
    if (!base64?.length) throw new Error('data not supplied');
    if (fs.existsSync(location)) throw new Error('file already exists');
    return new Promise((resolve, reject) => {
        fs.writeFile(location, base64, 'base64', (err) => {
            if (err) reject(new Error('failed to write to disk'));
            resolve();
        });
    });
}

export function generateThumb({ base64, location }: { base64: string; location: string }): Promise<void> {
    if (!base64?.length) throw new Error('data not supplied');
    if (fs.existsSync(location)) throw new Error('file already exists');
    return new Promise((resolve, reject) => {
        const image = Buffer.from(base64, 'base64');
        sharp(image)
            .resize(128, 128, { fit: 'cover' })
            .toBuffer()
            .then(resizedImageBuffer => {
                fs.writeFile(location, resizedImageBuffer, (err) => {
                    if (err) reject('failed to write to disk');
                    resolve();
                });
            })
            .catch(error => reject(error));
    });
}