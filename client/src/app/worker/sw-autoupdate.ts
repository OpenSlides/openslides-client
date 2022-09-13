import { environment } from 'src/environments/environment';

import { ErrorDescription } from '../gateways/http-stream/stream-utils';
import { AutoupdateStream } from './autoupdate-stream';
import { AutoupdateStreamPool } from './autoupdate-stream-pool';
import { AutoupdateSubscription } from './autoupdate-subscription';

const autoupdatePool = new AutoupdateStreamPool({
    url: `/system/autoupdate`,
    healthUrl: `/system/autoupdate/health`,
    method: `post`,
    authToken: null
});

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
        console.log(`subscriptionQueue\n`, subscriptionQueues);
        console.log(`pool\n`, autoupdatePool);
    };
}

let healthCheckInterval = 0;
let healthCheck: Promise<void>;
function handleError(stream: AutoupdateStream, error: any | ErrorDescription) {
    /*
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
        */
}

function handleStreamResolve(stream: AutoupdateStream): (result: any) => void {
    return ({ stopReason, error }) => {
        if (stopReason === `unused`) {
            // removeStream(stream);
        } else if (stopReason === `error`) {
            handleError(stream, error);
        } else if (stopReason === `resolved`) {
            handleError(stream, undefined);
        }
    };
}

function openConnection(ctx: MessagePort, { streamId, queryParams = ``, request, requestHash, description }) {
    function getRequestCategory(description: string, _request: Object): 'misc' | 'other' {
        if (
            [`theme_list:subscription`, `operator:subscription`, `organization:subscription`].indexOf(description) !==
            -1
        ) {
            return `misc`;
        }

        return `other`;
    }

    const existingSubscription = autoupdatePool.getMatchingSubscription(queryParams, request);
    if (existingSubscription) {
        existingSubscription.addPort(ctx);
        return;
    }

    const category = getRequestCategory(description, request);
    const subscription = new AutoupdateSubscription(streamId, queryParams, requestHash, request, description, [ctx]);
    subscriptionQueues[category].push(subscription);

    clearTimeout(openTimeouts[category]);
    openTimeouts[category] = setTimeout(() => {
        const queue = subscriptionQueues[category];
        subscriptionQueues[category] = [];
        openTimeouts[category] = undefined;

        autoupdatePool.openNewStream(queue, queryParams);
    }, 5);
}

function closeConnection(ctx: MessagePort, { streamId }) {
    const subscription = autoupdatePool.getSubscriptionById(streamId);
    if (!subscription) {
        return;
    }

    subscription.closePort(ctx);
}

let currentlyOnline = navigator.onLine;
function updateOnlineStatus() {
    if (currentlyOnline === navigator.onLine) {
        return;
    }

    currentlyOnline = navigator.onLine;
    autoupdatePool.updateOnlineStatus(currentlyOnline);
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
                autoupdatePool.setEndpoint(params);
            } else if (action === `set-connection-status`) {
                updateOnlineStatus();
            } else if (action === `reconnect-inactive`) {
                autoupdatePool.reconnectAll(true);
            }
        }
    });
}
