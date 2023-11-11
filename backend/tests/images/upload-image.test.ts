import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import child_process, { ChildProcessWithoutNullStreams } from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import sizeOf from 'image-size';
import { Db, MongoClient } from 'mongodb';
import path from 'path';
import mongodbConfig from '../../src/config/mongodb-config.json';

const inputPath = './tests/res/input.png';
const outputDir = './tests/images/albums';

describe('uploadImage', () => {
    let input: string;
    let inputHash: string;

    let client: MongoClient;
    let db: Db;

    let __INTEG_TEST_CHILD__: ChildProcessWithoutNullStreams;

    beforeAll(async () => {
        return Promise.all([
            // run the server
            new Promise<void>((resolve) => {
                __INTEG_TEST_CHILD__ = child_process.spawn(
                    'node dist/server.js',
                    [],
                    {
                        env: {
                            ...process.env,
                            NODE_ENV: 'development',
                            PORT: '3801',
                            OUTPUT_DIR: outputDir
                        },
                        shell: true
                    }
                );
                __INTEG_TEST_CHILD__.stdout.on('data', (data) => {
                    const str = data.toString();
                    console.log('[server]', str);
                    if (str.includes('running')) {
                        resolve();
                    }
                });
                __INTEG_TEST_CHILD__.stderr.on('data', (data) => {
                    const str = data.toString();
                    console.error('[server]', str);
                });
            }),
            // connect to the database
            new Promise<void>((resolve, reject) => {
                client = new MongoClient(`${mongodbConfig.development.ip}/?${Object.entries(mongodbConfig.development.options).map(([key, value]) => `${key}=${value}`).join('&')}`);
                db = client.db(mongodbConfig.development.db);
                client.connect().then(() => {
                    console.log('connected to mongodb db');
                    resolve();
                }).catch(err => reject(err));
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
            // make the test output album directory
            new Promise<void>((resolve, reject) => {
                fs.mkdir(`${outputDir}/test-album/thumb_cache`, { recursive: true }, (err) => {
                    if (err) reject(err);
                    resolve();
                });
            }),
        ]);
    });

    afterAll(() => {
        rmdir(`${outputDir}`);
        if (process.platform === 'win32') {
            child_process.exec('taskkill /pid ' + __INTEG_TEST_CHILD__.pid + ' /T /F');
        } else {
            __INTEG_TEST_CHILD__.kill('SIGTERM');
        }
    });

    it('should respond with 200 {\"message\": \"pong\"} when pinged', async () => {
        const response = await fetch('http://localhost:3801/api/images/ping');
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toEqual({ message: 'pong' });
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
        console.log(body);

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
            fs.readFile(`${outputDir}/${body.image.album_id}/${body.image.image_id}/thumb_cache`, (err, data) => {
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
            _id: expect.any(String),
            image_id: expect.any(String),
            album_id: 'test-album',
            author: 'test-user',
            uploaded_at: expect.any(String),
        }));
    });
});

function rmdir(dirPath: string) {
    const list = fs.readdirSync(dirPath);
    for (let i = 0; i < list.length; i++) {
        const filename = path.join(dirPath, list[i]);
        const stat = fs.statSync(filename);
        if (filename === '.' || filename === '..') {

        } else if (stat.isDirectory()) {
            rmdir(filename);
        } else {
            fs.unlinkSync(filename);
        }
    }
    fs.rmdirSync(dirPath);
}