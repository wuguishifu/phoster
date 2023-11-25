import { saveImage } from '../../../src/routes/images/Images';
import crypto from 'crypto';
import fs from 'fs';

import { describe, beforeAll, afterAll, expect, it } from '@jest/globals';

import { outputDir } from '../../test.config';
const inputPath = './tests/res/input.png';
const outputPath = `${outputDir}/output.png`;

describe('saveImage', () => {
    let input: string;
    let inputHash: string;

    beforeAll(async () => {
        input = await new Promise<string>((resolve, reject) => {
            fs.readFile(inputPath, (err, data) => {
                if (err) reject(err);
                resolve(Buffer.from(data).toString('base64'));
            });
        });
        inputHash = crypto.createHash('MD5').update(input).digest('hex');
    });

    afterAll(async () => {
        await new Promise<void>((resolve, reject) => {
            fs.unlink(outputPath, (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    });

    it('should save a base64 encoded png to disk', async () => {
        let output: string | null;
        let outputHash: string | null = null;

        // save the image
        await saveImage({ base64: input, location: outputPath });

        // read the saved image
        output = await new Promise<string | null>(resolve => {
            fs.readFile(outputPath, (err, data) => {
                if (err) resolve(null);
                resolve(Buffer.from(data).toString('base64'));
            });
        })
        if (output != null) outputHash = crypto.createHash('MD5').update(output).digest('hex');

        expect(output).not.toBeNull();
        expect(outputHash).not.toBeNull();
        expect(outputHash).toEqual(inputHash);
    });

    it('should throw an error if image is not supplied', async () => {
        expect(() => saveImage({ base64: '', location: outputPath })).toThrow();
    });

    it('should throw an error if the output destination already exists', async () => {
        expect(() => saveImage({ base64: input, location: inputPath })).toThrow();
    });
});