export type AlbumProps = {
    album_name: string;
    author: string;
}

export class Album {
    readonly album_name: string;
    readonly author: string;
    readonly created_at: Date;
    constructor({ album_name, author }: AlbumProps) {
        this.album_name = album_name;
        this.author = author;
        this.created_at = new Date();
    }
}