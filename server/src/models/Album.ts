import { v4 } from 'uuid';

type AlbumProps = {
    title: string;
    creator: string;
}

export default class Album {
    readonly album_id: string;
    readonly title: string;

    readonly creator: string;
    readonly created_at: Date;

    constructor({ title, creator }: AlbumProps) {
        this.album_id = v4();
        this.title = title;

        this.created_at = new Date();
        this.creator = creator;
    }
}