# HTML Diff and LineNumbering

This package includes algorithms helpers for the line numbering and diff of motions in OpenSlides. 

## Building

Install the dependencies:

`npm install`

Build the package:

`npm run build`

## Building in OpenSlides dev setup

Attach to client container

`docker compose -f dev/docker/docker-compose.dev.yml exec client sh`

Go into package directory:

`cd ../packages/openslides-motion-diff`

Build package

`npm run build`

## Running test

`npm run test`

To get coverage reports:

`npm run coverage`

## Development

We recommend test driven development on this package. 
For pull requests changing behaviour of the diff or line numbering to get approved tests are manditory. 

The package consists of three parts:

### Motion diff algorithm (`src/diff/`)

Algorithm for calculating a diff of html text and other things specific to the motion texts.

### Line numbering algorithm (`src/line-numbering/`)

Algorithm to add line numbers to a text.

### Compatibility library (`src/compat/`)

Wrapper to make texts created with lower versions of the alogithms compatible. 
This is needed for example when making changes to the line numbering algorithm that result in inputs getting different line numberings than before.

To create a migration add a new file to `src/compat/migrations/vX.X.X.ts` with `X.X.X` being the target version number. 
Then add the migartion to the `migrations` array in `src/compat/index.ts`.

Most of the time there will be three ways to migrate a motion text:

1. keeping the resulting html and changing line numbers
1. changing the resulting html
1. skipping a change to the diff algorithm.
