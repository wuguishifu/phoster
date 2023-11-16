# Phoster

My friends and I have a lot of pictures that we've taken over the past decade or so, and there aren't a ton of realistic options for hosting the images online. We've tried Google Drive and S3, but it costs too much (or is too difficult to work with). I run a Plex server for my friends and family, and I could add photos to that, but I wanted to make something that would be easier for other people to add photos to.

## Architecture

The main architecture for this project is a frontend that I can host on S3 or locally that will connect to my local server. The server will consist of a RAID array of storage containers to hold the actual images. I'm going to try to make it so images are organized in a folder structure like this:

```text
.
└── phoster/
    ├── 2020/
    │   ├── march/
    │   │   └── beach/
    │   │       └── image-01.png
    │   │       └── thumb_cache
    │   │           └── image-01-thumb.png
```

This will allow me to go in and add or remove pictures easily, as well as exporting entire albums. And in general, I like this storage format.

## Database

I will also have a MongoDB database running to store the location of the images on disk. On request, a custom middleware will serve the image from the disk. I want to have the option to add other cloud-hosted db services like S3 or Google Drive or Firestore, but this isn't a priority as the main purpose of this is to not be cloud reliant.

When an image is uploaded, a thumbnail will be generated and added to the album's respective thumb_cache.

Finally, MongoDB will also include user authentication so that users can be granted access to specific (or all) albums. This way, I can host albums with different groups of people on the same server and not worry about cross contamination.

## Frontend

In the frontend, I will display albums you can see in a grid. Upon clicking on an album, thumbnails of the images will be shown in a grid. This is for fast image load time. Upon opening an image, the actual image will be served to the client.

I also will include upload and download options for each album.

The frontend will be built in ~~React~~ Next.js and Tailwind CSS ~~using the Vite tooling~~ with shadcn/ui as the main component template library.

## Project

I plan on making this open source so other developers can contribute features, and can use it to host their own libraries. In the future, if multiple people are hosting libraries, I would like to make a secondary client system that allows users to view albums from multiple people's hosted servers (like in Plex).
