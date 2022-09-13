import { environment } from 'src/environments/environment';

import {
    ErrorDescription,
    ErrorType,
    isCommunicationError,
    isCommunicationErrorWrapper
} from '../gateways/http-stream/stream-utils';
import { AutoupdateStream } from './autoupdate-stream';
import { AutoupdateSubscription } from './autoupdate-subscription';

const endpoint = {
    url: `/system/autoupdate`,
    healthUrl: `/system/autoupdate/health`,
    method: `post`,
    authToken: null
};
let subscriptions: { [key: number]: AutoupdateSubscription } = {};
let streams: AutoupdateStream[] = [];
let subscriptionQueues: { [key: string]: AutoupdateSubscription[] } = {
    misc: [],
    other: []
};
let openTimeouts = {
    misc: null,
    other: null
};

if (!environment.production) {
    (<any>self).printAutoupdateState = function () {
        console.log(`subscriptions\n`, subscriptions);
        console.log(`subscriptionQueue\n`, subscriptionQueues);
        console.log(`streams\n`, streams);
        console.log(`endpoint\n`, endpoint);
    };
}

function getRequestCategory(description: string, _request: Object): 'misc' | 'other' {
    if ([`theme_list:subscription`, `operator:subscription`, `organization:subscription`].indexOf(description) !== -1) {
        return `misc`;
    }

    return `other`;
}

function searchRequest(url: string, request: Object): null | number {
    for (let i of Object.keys(subscriptions)) {
        if (subscriptions[i].fulfills(url, request)) {
            return +i;
        }
    }

    return null;
}

function removeStream(stream: AutoupdateStream) {
    for (let subscription of stream.subscriptions) {
        if (subscriptions[subscription.id]) {
            delete subscriptions[subscription.id];
        }
    }

    const idx = streams.indexOf(stream);
    if (idx !== -1) {
        streams.splice(idx, 1);
    }
}

let healthCheckInterval = 0;
let healthCheck: Promise<void>;
function handleError(stream: AutoupdateStream, error: any | ErrorDescription) {
    if (!healthCheck) {
        healthCheck = new Promise((resolve, reject) => {
            fetch(endpoint.healthUrl)
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    }

                    return { healthy: false };
                })
                .then(data => {
                    if (data.healthy) {
                        resolve();
                    } else {
                        reject();
                    }
                })
                .finally(() => {
                    healthCheck = null;
                });
        });
    }

    healthCheck
        .then(() => {
            healthCheckInterval = 0;
            if (stream.failedConnects <= 3 && error?.reason !== ErrorType.CLIENT) {
                stream.start().then(handleStreamResolve(stream));
            } else if (
                stream.failedConnects === 4 &&
                !(error instanceof ErrorDescription) &&
                (isCommunicationError(error) || isCommunicationErrorWrapper(error)) &&
                stream.subscriptions.length > 1
            ) {
                splitStream(stream);
            } else {
                for (let subscription of stream.subscriptions) {
                    subscription.sendError({
                        reason: `Repeated failure or client error`,
                        terminate: true
                    });
                }
            }
        })
        .catch(() => {
            // increase healthCheckInterval up to 10 seconds on repeated failure
            healthCheckInterval = Math.min(healthCheckInterval + 1000, 10000);
            setTimeout(() => {
                handleError(stream, error);
            }, healthCheckInterval);
        });
}

function splitStream(stream: AutoupdateStream) {
    const idx = streams.indexOf(stream);
    if (idx !== -1) {
        streams.splice(idx, 1);
    }

    console.warn(`Splitting stream`, stream);
    for (let subscription of stream.subscriptions) {
        const autoupdateStream = stream.cloneWithSubscriptions([subscription]);
        streams.push(autoupdateStream);

        autoupdateStream.failedCounter = 3;
        autoupdateStream.start().then(handleStreamResolve(autoupdateStream));
    }
}

function handleStreamResolve(stream: AutoupdateStream): (result: any) => void {
    return ({ stopReason, error }) => {
        if (stopReason === `unused`) {
            removeStream(stream);
        } else if (stopReason === `error`) {
            handleError(stream, error);
        } else if (stopReason === `resolved`) {
            handleError(stream, undefined);
        }
    };
}

async function openConnection(ctx: MessagePort, { streamId, queryParams = ``, request, requestHash, description }) {
    const existingSubscription = searchRequest(queryParams, request);
    if (existingSubscription) {
        subscriptions[existingSubscription].addPort(ctx);
        return;
    }

    const category = getRequestCategory(description, request);
    const subscription = new AutoupdateSubscription(streamId, queryParams, requestHash, request, description, [ctx]);
    subscriptions[subscription.id] = subscription;
    subscriptionQueues[category].push(subscription);

    clearTimeout(openTimeouts[category]);
    openTimeouts[category] = setTimeout(async () => {
        const queue = subscriptionQueues[category];
        subscriptionQueues[category] = [];
        openTimeouts[category] = undefined;

        const autoupdateStream = new AutoupdateStream(queue, queryParams, endpoint);
        streams.push(autoupdateStream);

        autoupdateStream.start().then(handleStreamResolve(autoupdateStream));
    }, 5);
}

async function closeConnection(ctx: MessagePort, { streamId }) {
    if (!subscriptions[streamId]) {
        return;
    }

    subscriptions[streamId].closePort(ctx);
}

function setEndpoint(data: any) {
    endpoint.method = data?.method;
    endpoint.url = data?.url;
    endpoint.healthUrl = data?.healthUrl;
    endpoint.authToken = data?.authToken;

    for (let stream of streams) {
        stream.updateEndpoint(endpoint);
    }
}

/**
 * Reconnects inactive streams and resets fail counters
 */
function reconnectInactive() {
    for (let stream of streams) {
        if (stream.failedCounter >= 3) {
            stream.failedCounter = 0;
        }

        stream.start().then(handleStreamResolve(stream));
    }
}

let currentlyOnline = navigator.onLine;
let abortStreamStopTimeout = null;
function updateOnlineStatus() {
    if (currentlyOnline === navigator.onLine) {
        return;
    }
    currentlyOnline = navigator.onLine;

    if (navigator.onLine) {
        clearTimeout(abortStreamStopTimeout);
        for (let stream of streams) {
            stream.start().then(handleStreamResolve(stream));
        }
    } else {
        abortStreamStopTimeout = setTimeout(() => {
            for (let stream of streams) {
                stream.abort();
            }
        }, 10000);
    }
}

export function addAutoupdateListener(context: any) {
    context.addEventListener(`message`, e => {
        const receiver = e.data?.receiver;
        if (!receiver) {
            return;
        }

        const msg = e.data?.msg;
        const action = msg?.action;
        const params = msg?.params;
        if (receiver === `autoupdate`) {
            if (action === `open`) {
                openConnection(context, params);
            } else if (action === `close`) {
                closeConnection(context, params);
            } else if (action === `set-endpoint`) {
                setEndpoint(params);
            } else if (action === `set-connection-status`) {
                updateOnlineStatus();
            } else if (action === `reconnect-inactive`) {
                reconnectInactive();
            }
        }
    });
}
