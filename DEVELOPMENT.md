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

## Debugging autoupdate connections

Autoupdate connections are running within a [SharedWorker](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker) 
on production setups or if in `environments/environment.ts` the option `autoupdateOnSharedWorker` is set to `true`.

Note that when enabled the shared worker is not running within the tabs context and needs to be accessed via a browser specific page. 
For Chromium for example you can access the worker context on `chrome://inspect/#workers` while for Firefox you find it on
`about:debugging#/runtime/this-firefox`. 

Within the worker you have access to debugging functions which can always be accessed on development setups and need to be 
enabled when `environment.production` is set to `true` by setting the value of the `DEBUG_MODE` local storage key. This 
can be done by calling `window.localStorage.setItem('DEBUG_MODE', 1);`. After that a restart of the worker is required (note that
depending on the browser you are using a page reload might not restart the shared worker). 

### Autoupdate debugging functions
`disableAutoupdateCompression()` closes all currently open autoupdate connections and reopens them without the `compress=1` parameter. 
Also all following connections will be openend without compression. 

`printAutoupdateState()` will output debugging information about the currently open autoupdate connections.
