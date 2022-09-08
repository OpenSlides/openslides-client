import { environment } from 'src/environments/environment';

import { AutoupdateStream } from './autoupdate-stream';
import { AutoupdateSubscription } from './autoupdate-subscription';

const endpoint = {
    url: `/system/autoupdate`,
    healthUrl: `/system/autoupdate/health`,
    method: `post`
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

function handleStreamResolve(stream: AutoupdateStream): (result: any) => void {
    return ({ stopReason }) => {
        if (stopReason === `unused` || stopReason === `resolved`) {
            removeStream(stream);
        }
    };
}

async function openConnection(
    ctx: MessagePort,
    { streamId, authToken, queryParams = ``, request, requestHash, description }
) {
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

        const autoupdateStream = new AutoupdateStream(queue, endpoint.url + queryParams, endpoint.method, authToken);
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
            }
        }
    });
}
