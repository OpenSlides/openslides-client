# HTML Diff and LineNumbering

This package includes algorithms helpers for the line numbering and diff of motions in OpenSlides.

## Building

Install the dependencies:

```
npm install
```

Build the package:

```
npm run build
```

## Building in OpenSlides dev setup

Attach to client container

```
docker compose -f dev/docker/docker-compose.dev.yml exec client sh
```

Go into package directory:

```
cd ../packages/openslides-motion-diff
```

Build package

```
npm run build
```

The same commands as one call:

```
docker compose -f dev/docker/docker-compose.dev.yml exec client sh -c 'cd ../packages/openslides-motion-diff && npm run build'
```

## Running test

```
npm run test
```

To get coverage reports:

```
npm run coverage
```

## Development

We recommend test driven development on this package.
For pull requests changing behaviour of the diff or line numbering to get approved tests are manditory.

The package consists of two parts:

### Motion diff algorithm (`src/diff/`)

Algorithm for calculating a diff of html text and other things specific to the motion texts.

### Line numbering algorithm (`src/line-numbering/`)

Algorithm to add line numbers to a text.
