import fs from 'fs';

export async function saveImage(image: Buffer, location: string): Promise<string> {
    if (fs.existsSync(location)) throw new Error('file already exists');
    return new Promise<string>((resolve, reject) => {
        fs.writeFile(location, image, (error) => {
            if (error) reject(error);
            resolve(location);
        });
    });
};