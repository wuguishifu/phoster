import sharp from 'sharp';

export async function generateThumbnail(base64: string): Promise<Buffer> {
    if (!base64?.length) throw new Error('no image data');
    return new Promise<Buffer>((resolve, reject) => {
        const image = Buffer.from(base64, 'base64');
        sharp(image)
            .resize(128, 128, { fit: 'cover' })
            .toBuffer()
            .then(resizedImageBuffer => resolve(resizedImageBuffer))
            .catch(error => reject(error));
    });
};