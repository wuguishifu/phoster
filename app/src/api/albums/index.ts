import { v4 } from 'uuid';
import path from 'path';
import express from 'express';
import fs from 'fs';
import { Db } from '../../lib/db';
import { Album } from '../../models';
import { app } from 'electron';

export function AlbumRouter(db: Db) {
    const router = express.Router();

    const location = (album_name: string) => `${app.getPath('pictures')}/${album_name}`;

    router.post('/', async (req, res) => {
        const user = req.user;
        if (!user) return res.status(401).send({ error: 'unauthorized' });

        const { album_name } = req.body as { album_name: string };
        if (!album_name) return res.status(400).send({ error: 'album_name is required' });

        try {
            fs.mkdir(path.join(location(album_name), '.thumb_cache'), { recursive: true }, async (error, path) => {
                if (error) {
                    if (error.code === 'EEXIST') return res.status(409).send({ error: 'album already exists' });
                    else return res.status(500).send({ error: 'error creating album', message: error.message });
                }

                if (path == null) {
                    return res.status(409).send({ error: 'album already exists' });
                }

                const album_id = v4();
                db.run(`INSERT INTO albums (id, name) VALUES (?, ?)`, [album_id, album_name], (error) => {
                    if (error) return res.status(500).send({ error: 'error creating album', message: error.message });
                    return res.status(201).send({ album_id, album_name });
                });
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'an unknown error has occurred';
            return res.status(500).send({ error: 'error creating album', message });
        }
    });

    router.get('/', async (req, res) => {
        const user = req.user;
        if (!user) return res.status(401).send({ error: 'unauthorized' });

        db.all<Album>(`SELECT * FROM albums`, undefined, (error, rows) => {
            if (error) return res.status(500).send({ error: 'error fetching albums' });
            return res.status(200).send(rows);
        });
    });

    router.get('/:album_name', async (req, res) => {
        return res.status(503).send({ message: 'not implemented' });
    });

    router.delete('/:album_name', async (req, res) => {
        return res.status(503).send({ message: 'not implemented' });
    });

    return router;
};