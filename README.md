# OpenSlides Client

Web client for OpenSlides 4+ which serves as the users main interaction point while using the OpenSlides system.
Delivers a responsive web application written in Angular Material, serving web browsers on both desktop systems,
smartphones and tablet PCs.
The client can be installed as a Progressive Web App (PWA).

Sends requests to the [OpenSlides Backend](https://github.com/OpenSlides/openslides-backend) and receives live
data from the [OpenSlides Autoupdate Service](https://github.com/OpenSlides/openslides-autoupdate-service).
Interchanges information and data with surrounding OpenSlides clients using the
[OpenSlides Inter-Client-Communication service](https://github.com/OpenSlides/openslides-icc-service).


# Building the client

## Using Docker

Get the code:

`git clone https://github.com/OpenSlides/openslides-client.git`

Change into openslides-client:

`cd openslides-client`

Build the client using docker:

`make build-prod`

Once done, run the docker image:

`docker run -d -p 8080:80 openslides-client`

You should now have the client up and running in docker using nginx on http://localhost:8080/

If you want to inspect the files you just build:

`docker run -it openslides-client bash`

## Using npm

Get the code:

`git clone https://github.com/OpenSlides/openslides-client.git`

Change into the client:

`cd openslides-client/client`

Install the dependencies:

`npm install`

Build the client in production mode:

`npm run build`

The static files will be build in `openslides-client/client/dist`.

# Developing the client

For further information about developing the OpenSlides client, refer to
[the development readme](https://github.com/OpenSlides/openslides-client/blob/main/DEVELOPMENT.md).

# For contributors

Generally, please work in your own fork, make branches and make a pull request if you want to see your changes in the OpenSlides Client. A pull requests should have exactly one commit. Contributors should add themselves to the [AUTHORS](https://github.com/OpenSlides/OpenSlides/blob/main/AUTHORS) file on the [OpenSlides main repository](https://github.com/OpenSlides/OpenSlides).

## Commit messages

See https://github.com/OpenSlides/OpenSlides/wiki/Development-organization#pull-request-titles-and-commit-messages.

## Code alignment

Please respect the code-style defined in `.editorconfig`, `eslint.config.json` and `.pretierrc`.
Adjust your editor to the `.editorconfig` to avoid surprises.
See https://editorconfig.org/ for details.

Code can be cleaned and aligned automatically using `npm run-cleanup`.
This will take care of code alignment, import sorting and quotation marks.
To execute this inside the docker container, you can either use `make run-cleanup` while the client
container is already running or `make run-cleanup-standalone` if it's not.

## Running tests

We are using karma tests for some parts of our application. You can run them using: 

`make run-karma-tests`

For development you can use:

`npm run test-live`

Note that you need Chromium installed for that. To use another browser refer to `package.json` and
adjust the parameters accordingly. 

Generally while unit tests are always appreciated we require tests only for changes on low level parts of the application
like connection handling with the autoupdate (everything in the `src/app/worker/` directory) or utility functions
(e.g. `src/app/infrastructure/utils/`).
Also changes to regression prone code like the motion diff and line numbering (`line-numbering.service.spec.ts` and
`motion-diff.service.ts`) should always contain tests for your changes. 

## Running integration tests

To test the full setup we include playwright integration tests. These mainly fulfill the purpose to test if 
all parts of the client are working together with the other services and tests essential parts like
the authentication processes, general connectivity to backend and autoupdate and some ui interactions. 

These tests require the [full setup](https://github.com/OpenSlides/OpenSlides) to be running either 
using a clean [dev setup](https://github.com/OpenSlides/OpenSlides/blob/main/DEVELOPMENT.md#before-starting-the-development)
or [local prod setup](https://github.com/OpenSlides/OpenSlides/tree/main/dev/localprod#local-production-setup).

With the setup running you can start the integraton tests with:

`make run-playwright`

## Translation

We are using [ngx-translate](https://github.com/ngx-translate/core) for translation purposes. The command:

`npm run extract`

Will extract strings and update elements an with translation functions.
Language files can be found in `client/src/assets/i18n`.
The offical translation of OpenSlides can be found in [transifex](https://www.transifex.com/openslides/openslides/).

Grep the code for `| translate` and `this.translate` to find examples.

# Used software

The software used can be found in `client/package.json`. To get a list of the dependencies licenses you can use 
[license-report](https://www.npmjs.com/package/license-report).
