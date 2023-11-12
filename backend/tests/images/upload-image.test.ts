import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import crypto from 'crypto';
import fs from 'fs';
import { sizeOf } from '../../src/utils/png';
import { Db, MongoClient, ObjectId } from 'mongodb';
import mongodbConfig from '../../src/config/mongodb-config.json';

import { outputDir } from '../test.config';
const inputPath = './tests/res/input.png';

describe('uploadImage', () => {
    let input: string;
    let inputHash: string;

    let client: MongoClient;
    let db: Db;
    let image_id: string;

    beforeAll(async () => {
        return Promise.all([
            // connect to the database
            new Promise<void>((resolve, reject) => {
                client = new MongoClient(`${mongodbConfig.development.ip}/?${Object.entries(mongodbConfig.development.options).map(([key, value]) => `${key}=${value}`).join('&')}`);
                db = client.db(mongodbConfig.development.db);
                client.connect().then(() => resolve()).catch(err => reject(err));
            }),
            // load the image
            new Promise<void>((resolve, reject) => {
                fs.readFile(inputPath, (err, data) => {
                    if (err) reject(err);
                    input = Buffer.from(data).toString('base64');
                    inputHash = crypto.createHash('MD5').update(input).digest('hex');
                    resolve();
                });
            }),
        ]);
    });

    afterAll(async () => {
        await db.collection('images').deleteOne({ image_id });
        await client.close();
    });

    it('should save the base64 encoded image to disk, save a thumbnail to disk, and add an image to the database', async () => {
        const response = await fetch('http://localhost:3801/api/images/image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                album_id: 'test-album',
                user_id: 'test-user',
                base64: input
            })
        });
        const body = await response.json();

        // test for correct response
        expect(response.status).toBe(201);
        expect(body.image).toEqual(expect.objectContaining({
            _id: expect.any(String),
            image_id: expect.any(String),
            album_id: 'test-album',
            author: 'test-user',
            uploaded_at: expect.any(String),
        }));

        let output: string | null = null;
        let outputHash: string | null = null;
        await new Promise<void>((resolve) => {
            fs.readFile(`${outputDir}/${body.image.album_id}/${body.image.image_id}`, (err, data) => {
                if (err) return resolve();
                output = Buffer.from(data).toString('base64');
                outputHash = crypto.createHash('MD5').update(output).digest('hex');
                resolve();
            });
        });

        expect(output).not.toBeNull();
        expect(outputHash).not.toBeNull();
        expect(outputHash).toEqual(inputHash);

        let thumb: string | null = null;
        await new Promise<void>((resolve) => {
            fs.readFile(`${outputDir}/${body.image.album_id}/thumb_cache/${body.image.image_id}.thumb`, (err, data) => {
                if (err) return resolve();
                thumb = Buffer.from(data).toString('base64');
                resolve();
            });
        });

        expect(thumb).not.toBeNull();
        const dimensions = sizeOf(Buffer.from(thumb!, 'base64'));

        expect(dimensions.width).toBe(128);
        expect(dimensions.height).toBe(128);

        const stored = await db.collection('images').findOne({ image_id: body.image.image_id });
        expect(stored).toEqual(expect.objectContaining({
            _id: expect.any(ObjectId),
            image_id: expect.any(String),
            album_id: 'test-album',
            author: 'test-user',
            uploaded_at: expect.any(Date),
        }));

        image_id = body.image.image_id;
    });
});