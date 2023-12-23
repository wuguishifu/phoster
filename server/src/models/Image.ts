import { v4 } from 'uuid';

export type ImageProps = {
    author: string;
    album_name: string;
};

export class Image {
    readonly image_id: string;
    readonly album_name: string;
    readonly author: string;
    readonly uploaded_at: Date;
    constructor({ author, album_name }: ImageProps) {
        this.author = author;
        this.image_id = v4();
        this.album_name = album_name;
        this.uploaded_at = new Date();
    }
};