import { generateThumb } from '../../src/routes/images/Images';
import fs from 'fs';
import sizeOf from 'image-size';

import { describe, beforeAll, afterAll, expect, it } from '@jest/globals';

const inputPath = './tests/res/input.png';
const outputPath = './tests/res/output-thumb.png';

describe('generateThumb', () => {
    let input: string;

    beforeAll(async () => {
        input = await new Promise<string>((resolve, reject) => {
            fs.readFile(inputPath, (err, data) => {
                if (err) reject(err);
                resolve(Buffer.from(data).toString('base64'));
            });
        });
    });

    afterAll(async () => {
        await new Promise<void>((resolve, reject) => {
            fs.unlink(outputPath, (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    });

    it('should save a 128x128 thumbnail of a base64 encoded png to disk', async () => {
        let output: string | null;

        // generate the thumbnail
        await generateThumb({ base64: input, location: outputPath });

        output = await new Promise<string | null>(resolve => {
            fs.readFile(outputPath, (err, data) => {
                if (err) resolve(null);
                resolve(Buffer.from(data).toString('base64'));
            });
        });

        expect(output).not.toBeNull();

        const dimensions = sizeOf(Buffer.from(output!, 'base64'));
        expect(dimensions.width).toBe(128);
        expect(dimensions.height).toBe(128);
    });

    it('should throw an error if image is not supplied', async () => {
        expect(() => generateThumb({ base64: '', location: outputPath })).toThrow();
    });

    it('should throw an error if the output destination already exists', async () => {
        expect(() => generateThumb({ base64: input, location: inputPath })).toThrow();
    });
});
