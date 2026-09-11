# Music Image Cue Generator - version 3

## New in version 3

- Pressing Start no longer shows the first image immediately.
- It chooses a random opening delay between 10 and 45 seconds.
- A large central countdown is shown before the first image.
- While each image is displayed, a small top-right countdown shows the time until the next image.
- The final image stays visible with no countdown.

## Changing countdown settings

Open `config.js`.

The opening countdown is controlled by:

    initialDelayMin: 10,
    initialDelayMax: 45,

The delay between images is set separately for each part, for example:

    { name: "Violin 1", slug: "violin-1", intervalMin: 8, intervalMax: 12 },

All times are in seconds and are chosen as random whole numbers, inclusive of the minimum and maximum.

## Folder structure

Put images inside:

    images/
      violin-1/
        1/
        2/
        3/
        ...
      flute/
        1/
        2/
        ...

Each numbered folder can contain any number of supported images.

Supported formats:
- JPG / JPEG
- PNG
- WebP
- GIF
- SVG

## What happens during a cycle

If Violin 1 has folders 1-7:

1. The seven folders are shuffled.
2. One random image is selected from each folder.
3. Start is pressed.
4. A random 10-45 second central countdown runs.
5. The first selected image appears.
6. A new random interval is chosen for the next image; its countdown appears in the top-right.
7. This continues until one image from every numbered folder has been shown.
8. The final image remains visible.
9. Press Start again for a fresh shuffle, fresh image choices, and a fresh opening countdown.

## Changing the number of groups

You do not need to edit JavaScript to change 1-7 to another range.
Only numbered folders that contain supported image files are used.

## GitHub Pages

This version includes a GitHub Actions workflow.

On GitHub:
1. Upload the whole project to the repository.
2. Go to Settings -> Pages.
3. Under Build and deployment -> Source, choose **GitHub Actions**.
4. Every push to `main` rebuilds the image list and publishes the site.

## Demo files

`images/violin-1/1` through `/7` contain three simple SVG demo images each.
Delete those demo SVG files and replace them with your real images.
