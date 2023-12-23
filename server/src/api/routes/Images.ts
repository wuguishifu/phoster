import express from 'express';
import fs from 'fs';
import { Db } from 'mongodb';
import { Image } from '../../models';
import sharp from 'sharp';

const outputDir = process.env.OUTPUT_DIR || './';
const imageLocation = (album_name: string, image_id: string) => `${outputDir}/${album_name}/${image_id}.png`;
const thumbLocation = (album_name: string, image_id: string) => `${outputDir}/${album_name}/thumb_cache/${image_id}.thumb`;
const metaLocation = (album_name: string, image_id: string) => `${outputDir}/${album_name}/metadata/${image_id}.meta`;

export function ImageRouter(db: Db): express.Router {
    const router = express.Router();

    router.post('/', async (req, res) => {
        const { album_name } = req.params as { album_name: string };
        const { 'x-username': username } = req.headers as { 'x-username': string };
        const { base64 } = req.body as { base64: string };
        const image = new Image({ author: username, album_name });

        let imageFile, thumbFile, metaFile, result;
        try {
            [imageFile, thumbFile, metaFile, result] = await Promise.all([
                saveImage({ base64, location: imageLocation(album_name, image.image_id) }),
                saveThumbnail({ base64, location: thumbLocation(album_name, image.image_id) }),
                saveMetadata({ image, location: metaLocation(album_name, image.image_id) }),
                db.collection('images').insertOne(image)
            ]);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'an unknown error has occurred';
            return res.status(500).send({ error: 'error creating image', message });
        }

        if (!imageFile || !thumbFile || !metaFile || !result.insertedId) {
            res.status(500).send({ error: 'error creating image' });
            let deleted = false;
            let attempts = 0;
            while (deleted === false && attempts < 10) {
                await new Promise<void>(resolve => setTimeout(resolve, 250 * attempts ** 2)); // exponential backoff
                deleted = await deleteImage({ image_id: image.image_id, album_name });
                attempts++;
            }
            return;
        }

        return res.status(201).send({ image });
    });

    router.get('/:image_id', async (req, res) => {
        const { album_name, image_id } = req.params as { album_name: string, image_id: string };
        const file = imageLocation(album_name, image_id);
        if (!fs.existsSync(file)) return res.status(404).send({ error: 'image not found' });
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Encoding': 'base64'
        });
        return fs.createReadStream(file, 'base64').pipe(res);
    });

    router.delete('/:image_id', async (req, res) => {
        const { album_name, image_id } = req.params as { album_name: string, image_id: string };
        const file = imageLocation(album_name, image_id);
        let result;
        try {
            result = await db.collection('images').deleteOne({ image_id })
        } catch (error) {
            const message = error instanceof Error ? error.message : 'an unknown error has occurred';
            return res.status(500).send({ error: 'error deleting image', message, deleted: false });
        }

        if (!result.acknowledged) return res.status(500).send({ error: 'error deleting image', deleted: false });
        if (!fs.existsSync(file)) return res.status(200).send({ deleted: true });
        const deleted = await deleteImage({ album_name, image_id });
        if (deleted) return res.status(200).send({ deleted: true });
        return res.status(500).send({ error: 'error deleting image', deleted: false });
    });

    return router;
};

export function saveImage({ base64, location }: { base64: string, location: string }): Promise<string> {
    if (!base64?.length) throw new Error('data not supplied');
    if (fs.existsSync(location)) throw new Error('file already exists');
    return new Promise<string>((resolve, reject) => {
        fs.writeFile(location, base64, 'base64', (error) => {
            if (error) reject(error);
            resolve(location);
        });
    });
};

export function saveThumbnail({ base64, location }: { base64: string, location: string }): Promise<string> {
    if (!base64?.length) throw new Error('data not supplied');
    if (fs.existsSync(location)) throw new Error('file already exists');
    return new Promise<string>((resolve, reject) => {
        const image = Buffer.from(base64, 'base64');
        sharp(image)
            .resize(128, 128, { fit: 'cover' })
            .toBuffer()
            .then(resizedImageBuffer => {
                fs.writeFile(location, resizedImageBuffer, (error) => {
                    if (error) reject(error);
                    resolve(location);
                });
            })
            .catch(error => reject(error));
    });
};

export function saveMetadata({ location, image }: { location: string, image: Image }): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        fs.writeFile(location, JSON.stringify(image), (error) => {
            if (error) reject(error);
            resolve(location);
        });
    });
};

export function deleteImage({ image_id, album_name }: { image_id: string, album_name: string }): Promise<boolean> {
    return new Promise<boolean>(resolve => {
        try {
            fs.unlinkSync(imageLocation(album_name, image_id));
            fs.unlinkSync(thumbLocation(album_name, image_id));
            fs.unlinkSync(metaLocation(album_name, image_id));
        } catch (error) {
            return resolve(false);
        }
        return resolve(true);
    });
};