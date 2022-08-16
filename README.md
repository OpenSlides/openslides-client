# OpenSlides Client

Web client for OpenSlides 4+ which serves as the users main interaction point while using the OpenSlides system.
Delivers a responsive web application written in Angular Material, serving web browsers on both desktop systems,
smartphones and tablet PCs.
The client can be installed as a Progressive Web App (PWA).

Sends requests to the [OpenSlides Backend](https://github.com/OpenSlides/openslides-backend) and receives live data from the [OpenSlides Autoupdate Service](https://github.com/OpenSlides/openslides-autoupdate-service).
Interchanges information and data with surrounding OpenSlides clients using the [OpenSlides Inter-Client-Communication service](https://github.com/OpenSlides/openslides-icc-service).

[Demo](https://demo.openslides.org/)

**This software is not yet ready for productive use. You might want to see [OpenSlides](https://github.com/OpenSlides/OpenSlides) instead**

# Building the client

## Using Docker

Get the code:

`git clone https://github.com/OpenSlides/openslides-client.git`

Change into openslides-client:

`cd openslides-client`

Build the client using docker:

`docker build . -t client`

That might take a few minutes. Once done, run the docker image:

`docker run -d -p 8080:80 client`

You should now have the client up and running in docker using nginx on http://localhost:8080/

If you want to inspect the files you just build:

`docker run -it client bash`

## Using npm

Get the code:

`git clone https://github.com/OpenSlides/openslides-client.git`

Change into the client:

`cd openslides-client/client`

Install the dependencies:

`npm install`

Build the client in production mode:

`npm run build`

That might take a few minutes.
The static files will be build in `openslides-client/client/dist`.

# Developing the client

This is an Angular project.
The usage of Angular CLI is highly recommended to create components and services.
See https://angular.io/guide/quickstart for details.

## Building your developing tool chain in docker

Get the code:

`git clone git@github.com:OpenSlides/openslides-client.git` (but you will use your own fork of course)

Change into the client:

`cd openslides-client`

Build the docker image with your tool chain:

`docker build . -f Dockerfile.dev -t client-dev`

Run the developing docker image:

`docker run -it -v ${PWD}/client/src:/app/src -p 4200:4200 --rm client-dev`

You should now have an Angular developing server using docker up and running on http://localhost:4201/.
The app will automatically reload if you change any of the source files.

To run angular and npm commands, you can access the docker image directly using:

`docker run -it client-dev bash`

If your editor likes to have a `node_modules` folder, you might want to copy it from your docker image, or run `npm install` in the clients "client" directory.

## Building your developing tool chain manually

Get the code:

`git clone git@github.com:OpenSlides/openslides-client.git` (but you will use your own fork of course)

Change into the client:

`cd openslides-client/client`

Install the npm dependencies:

`npm install`

Run the angular development server:

`npm start`

You should now have a native Angular development server up and running on http://localhost:4200/.
The app will automatically reload if you change any of the source files.

# For contributors

Generally, please work in your own fork, make branches and make a pull request if you want to see your changes in the OpenSlides Client. A pull requests should have exactly one commit. Contributors should add themselves to the [AUTHORS](https://github.com/OpenSlides/OpenSlides/blob/main/AUTHORS) file on the [OpenSlides main repository](https://github.com/OpenSlides/OpenSlides).

## Commit messages

Write your commit messages like they could appear in a change log.

- Separate subject from body with a blank line
- Limit the subject line to 50 characters
- Capitalize the subject line
- Do not end the subject line with a period
- Use the imperative mood in the subject line
- Wrap the body at 72 characters
- Use the body to explain what and why vs. how

## Code alignment

Please respect the code-style defined in `.editorconfig` and `.pretierrc`.
Adjust your editor to the `.editorconfig` to avoid surprises.
See https://editorconfig.org/ for details.

Code can be cleaned and aligned automatically using `npm run cleanup`.
This will take care of code alignment, import sorting and quotation marks.
To execute this inside the docker container, you can either use `make run-cleanup` while the client
container is already running or `make run-cleanup-standalone` if it's not.

## Translation

We are using [ngx-translate](https://github.com/ngx-translate/core) for translation purposes. The command:

`npm run extract`

Will extract strings and update elements an with translation functions.
Language files can be found in `client/src/assets/i18n`.
The offical translation of OpenSlides can be found in [transifex](https://www.transifex.com/openslides/openslides/).

Grep the code for `| translate` and `this.translate` to find examples.

## Code Documentation

Please document new code using [JSDoc](https://devdocs.io/jsdoc/).

The documentation of the source material can be generated
using [compodoc](https://compodoc.app/) by
running:

`npm run compodoc`.

A new web server will be started on http://localhost:8080/.
Once running, the documentation will be updated automatically.

You can run it on another port by adding your local port after the
command. If no port specified, it will try to use 8080.

See https://compodoc.app/guides/jsdoc-tags.html for details.

## Used software

OpenSlides Client uses the following software or parts of them:

- [@angular/animations@13.2.3](https://github.com/angular/angular), License: MIT
- [@angular/cdk-experimental@13.2.4](https://github.com/angular/components), License: MIT
- [@angular/cdk@13.2.3](https://github.com/angular/components), License: MIT
- [@angular/common@13.2.3](https://github.com/angular/angular), License: MIT
- [@angular/compiler@13.2.3](https://github.com/angular/angular), License: MIT
- [@angular/core@13.2.3](https://github.com/angular/angular), License: MIT
- [@angular/forms@13.2.3](https://github.com/angular/angular), License: MIT
- [@angular/material-moment-adapter@13.2.3](https://github.com/angular/components), License: MIT
- [@angular/material@13.2.3](https://github.com/angular/components), License: MIT
- [@angular/platform-browser-dynamic@13.2.3](https://github.com/angular/angular), License: MIT
- [@angular/platform-browser@13.2.3](https://github.com/angular/angular), License: MIT
- [@angular/router@13.2.3](https://github.com/angular/angular), License: MIT
- [@ngx-pwa/local-storage@13.0.2](https://github.com/cyrilletuzi/angular-async-local-storage), License: MIT
- [@ngx-translate/core@14.0.0](https://github.com/ngx-translate/core), License: MIT
- [@ngx-translate/http-loader@7.0.0](https://github.com/ngx-translate/core), License: MIT
- [@pebula/ngrid-material@4.0.0](undefined), License: UNKNOWN
- [@pebula/ngrid@4.0.0](https://github.com/shlomiassaf/ngrid), License: MIT
- [@pebula/utils@1.0.2](undefined), License: UNKNOWN
- [@tinymce/tinymce-angular@5.0.1](https://github.com/tinymce/tinymce-angular), License: Apache-2.0
- [@videojs/http-streaming@2.13.1](https://github.com/videojs/http-streaming), License: Apache-2.0
- [acorn@8.7.0](https://github.com/acornjs/acorn), License: MIT
- [broadcast-channel@4.10.0](https://github.com/pubkey/broadcast-channel), License: MIT
- [chart.js@3.7.1](https://github.com/chartjs/Chart.js), License: MIT
- [core-js@3.21.1](https://github.com/zloirock/core-js), License: MIT
- [css-element-queries@1.2.3](https://github.com/marcj/css-element-queries), License: MIT
- [exceljs@4.3.0](https://github.com/exceljs/exceljs), License: MIT
- [file-saver@2.0.5](https://github.com/eligrey/FileSaver.js), License: MIT
- [jszip@3.7.1](https://github.com/Stuk/jszip), License: (MIT OR GPL-3.0-or-later)
- [lz4js@0.2.0](https://github.com/Benzinga/lz4js), License: ISC
- [material-design-icons-iconfont@6.4.1](https://github.com/jossef/material-design-icons-iconfont), License: Apache-2.0
- [moment@2.29.2](https://github.com/moment/moment), License: MIT
- [ng-particles@2.41.4](https://github.com/matteobruni/tsparticles), License: MIT
- [ng2-charts@3.0.8](https://github.com/valor-software/ng2-charts), License: ISC
- [ng2-pdf-viewer@8.0.1](git+https://vadimdez@github.com/VadimDez/ng2-pdf-viewer), License: MIT
- [ngx-device-detector@3.0.0](https://github.com/KoderLabs/ngx-device-detector), License: MIT
- [ngx-file-drop@13.0.0](https://github.com/georgipeltekov/ngx-file-drop), License: MIT
- [ngx-mat-select-search@4.0.2](https://github.com/bithost-gmbh/ngx-mat-select-search), License: MIT
- [ngx-material-timepicker@5.5.3](https://github.com/Agranom/ngx-material-timepicker), License: MIT
- [ngx-papaparse@5.0.0](https://github.com/alberthaff/ngx-papaparse), License: MIT
- [pdfmake@0.2.4](https://github.com/bpampuch/pdfmake), License: MIT
- [rxjs@7.5.4](https://github.com/reactivex/rxjs), License: Apache-2.0
- [tinycolor2@1.4.2](https://github.com/bgrins/TinyColor), License: MIT
- [tinymce@5.10.3](https://github.com/tinymce/tinymce), License: LGPL-2.1
- [ts-dedent@2.2.0](https://github.com/tamino-martinius/node-ts-dedent), License: MIT
- [tslib@2.3.1](https://github.com/Microsoft/tslib), License: 0BSD
- [tsparticles@1.41.4](https://github.com/matteobruni/tsparticles), License: MIT
- [video.js@7.17.0](https://github.com/videojs/video.js), License: Apache-2.0
- [zone.js@0.11.4](https://github.com/angular/angular), License: MIT
- [@angular-devkit/build-angular@13.2.4](https://github.com/angular/angular-cli), License: MIT
- [@angular-eslint/builder@13.1.0](https://github.com/angular-eslint/angular-eslint), License: MIT
- [@angular-eslint/eslint-plugin-template@13.1.0](https://github.com/angular-eslint/angular-eslint), License: MIT
- [@angular-eslint/eslint-plugin@13.1.0](https://github.com/angular-eslint/angular-eslint), License: MIT
- [@angular-eslint/schematics@13.1.0](https://github.com/angular-eslint/angular-eslint), License: MIT
- [@angular-eslint/template-parser@13.1.0](https://github.com/angular-eslint/angular-eslint), License: MIT
- [@angular/cli@13.2.4](https://github.com/angular/angular-cli), License: MIT
- [@angular/compiler-cli@13.2.3](https://github.com/angular/angular), License: MIT
- [@biesbjerg/ngx-translate-extract-marker@1.0.0](https://github.com/biesbjerg/ngx-translate-extract-marker), License: MIT
- [@biesbjerg/ngx-translate-extract@7.0.4](https://github.com/biesbjerg/ngx-translate-extract), License: MIT
- [@types/file-saver@2.0.5](https://github.com/DefinitelyTyped/DefinitelyTyped), License: MIT
- [@types/jasmine@3.10.3](https://github.com/DefinitelyTyped/DefinitelyTyped), License: MIT
- [@types/js-yaml@4.0.5](https://github.com/DefinitelyTyped/DefinitelyTyped), License: MIT
- [@types/node@12.20.46](https://github.com/DefinitelyTyped/DefinitelyTyped), License: MIT
- [@types/tinycolor2@1.4.3](https://github.com/DefinitelyTyped/DefinitelyTyped), License: MIT
- [@types/video.js@7.3.33](https://github.com/DefinitelyTyped/DefinitelyTyped), License: MIT
- [@typescript-eslint/eslint-plugin@5.11.0](https://github.com/typescript-eslint/typescript-eslint), License: MIT
- [@typescript-eslint/parser@5.11.0](https://github.com/typescript-eslint/typescript-eslint), License: BSD-2-Clause
- [axios@0.26.0](https://github.com/axios/axios), License: MIT
- [compression-webpack-plugin@9.2.0](https://github.com/webpack-contrib/compression-webpack-plugin), License: MIT
- [eslint@8.9.0](https://github.com/eslint/eslint), License: MIT
- [jasmine-core@4.0.1](https://github.com/jasmine/jasmine), License: MIT
- [js-yaml@4.1.0](https://github.com/nodeca/js-yaml), License: MIT
- [karma-chrome-launcher@3.1.0](https://github.com/karma-runner/karma-chrome-launcher), License: MIT
- [karma-coverage@2.1.1](https://github.com/karma-runner/karma-coverage), License: MIT
- [karma-jasmine-html-reporter@1.7.0](https://github.com/dfederm/karma-jasmine-html-reporter), License: MIT
- [karma-jasmine@4.0.1](https://github.com/karma-runner/karma-jasmine), License: MIT
- [karma@6.3.16](https://github.com/karma-runner/karma), License: MIT
- [npm-license-crawler@0.2.1](http://github.com/mwittig/npm-license-crawler), License: BSD-3-Clause
- [po2json@1.0.0-beta-2](https://github.com/mikeedwards/po2json), License: LGPL-2.0-or-later
- [prettier@2.5.1](https://github.com/prettier/prettier), License: MIT
- [typescript@4.5.5](https://github.com/Microsoft/TypeScript), License: Apache-2.0
- [webpack-bundle-analyzer@4.5.0](https://github.com/webpack-contrib/webpack-bundle-analyzer), License: MIT
