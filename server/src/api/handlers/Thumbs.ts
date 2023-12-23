import express from 'express';
import fs from 'fs';
import { Db } from 'mongodb';

const outputDir = process.env.OUTPUT_DIR || './';
const thumbLocation = (album_name: string, image_id: string) => `${outputDir}/${album_name}/thumb_cache/${image_id}.thumb`;

export function ThumbRouter(db: Db): express.Router {
    const router = express.Router();

    router.get('/:image_id', async (req, res) => {
        const { album_name, image_id } = req.params as { album_name: string, image_id: string };
        const file = thumbLocation(album_name, image_id);
        if (!fs.existsSync(file)) return res.status(404).send({ error: 'thumbnail not found' });
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Encoding': 'base64'
        });
        return fs.createReadStream(file, 'base64').pipe(res);
    });

    return router;
};