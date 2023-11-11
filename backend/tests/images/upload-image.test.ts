import { describe, beforeAll, afterAll, expect, it } from '@jest/globals';
const inputPath = './tests/res/input.png';
import child_process from 'child_process';
import fs from 'fs';
import { ChildProcessWithoutNullStreams } from 'child_process';

describe('uploadImage', () => {
    let input: string;
    let __INTEG_TEST_CHILD__: ChildProcessWithoutNullStreams;

    beforeAll(async () => {
        return Promise.all([
            new Promise<void>((resolve) => {
                __INTEG_TEST_CHILD__ = child_process.spawn(
                    'node dist/server.js',
                    ['--port', '8080'],
                    { env: { ...process.env, NODE_ENV: 'development' }, shell: true }
                );
                __INTEG_TEST_CHILD__.stdout.on('data', (data) => {
                    const str = data.toString();
                    console.log('[server]', str);
                    if (str.includes('running')) {
                        resolve();
                    }
                });
            }),
            new Promise<void>((resolve, reject) => {
                fs.readFile(inputPath, (err, data) => {
                    if (err) reject(err);
                    input = Buffer.from(data).toString('base64');
                    resolve();
                });
            })
        ]);
    });

    afterAll(async () => {
        if (process.platform === 'win32') {
            child_process.exec('taskkill /pid ' + __INTEG_TEST_CHILD__.pid + ' /T /F');
        } else {
            __INTEG_TEST_CHILD__.kill('SIGTERM');
        }
    });

    it('should respond with 200 {\"message\": \"pong\"} when pinged', async () => {
        const response = await fetch('http://localhost:8080/api/images/ping');
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toEqual({ message: 'pong' });
    });
});