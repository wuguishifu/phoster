import { v4 } from 'uuid';

export type ImageProps = {
    author: string;
    album_id: string;
}

export default class Image {
    readonly image_id: string;
    readonly album_id: string;
    readonly author: string;

    readonly uploaded_at: Date;

    constructor({ author, album_id }: ImageProps) {
        this.author = author;
        this.image_id = v4();
        this.album_id = album_id;

        this.uploaded_at = new Date();
    }
}