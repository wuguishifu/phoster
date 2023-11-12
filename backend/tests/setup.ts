import child_process, { ChildProcessWithoutNullStreams } from 'child_process';
import fs from 'fs';
import 'tsconfig-paths/register'; // force register typescript module paths

declare global {
    var __INTEG_TEST_CHILD__: ChildProcessWithoutNullStreams;
}

import { outputDir } from './test.config';

const setup = async (): Promise<void> => {
    await Promise.all([
        // spawn child server process
        new Promise<void>((resolve) => {
            global.__INTEG_TEST_CHILD__ = child_process.spawn(
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

            global.__INTEG_TEST_CHILD__.stdout.on('data', (data) => {
                const str = data.toString();
                console.log('[server]', str);
                if (str.includes('running')) {
                    resolve();
                }
            });

            global.__INTEG_TEST_CHILD__.stderr.on('data', (data) => {
                const str = data.toString();
                console.error('[server]', str);
            });
        }),

        // make test output album directory
        new Promise<void>((resolve, reject) => {
            fs.mkdir(`${outputDir}/test-album/thumb_cache`, { recursive: true }, (err) => {
                if (err) reject(err);
                resolve();
            });
        })
    ]);
};

export default setup;