import child_process, { ChildProcessWithoutNullStreams } from 'child_process';
import fs from 'fs';
import path from 'path';
import 'tsconfig-paths/register'; // force register typescript module paths

declare global {
    var __INTEG_TEST_CHILD__: ChildProcessWithoutNullStreams;
}

import { outputDir } from './test.config';

const teardown = async (): Promise<void> => {
    rmdir(outputDir);
    if (process.platform === 'win32') {
        child_process.exec('taskkill /pid ' + global.__INTEG_TEST_CHILD__.pid + ' /T /F');
    } else {
        global.__INTEG_TEST_CHILD__.kill('SIGTERM');
    }
};

export default teardown;

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