var ctx;

onconnect = (e) => {
    const port = e.ports[0];

    ctx = port;
    importScripts("sw-autoupdate.js");
    port.start();
};
