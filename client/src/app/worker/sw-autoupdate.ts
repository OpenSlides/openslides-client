import { environment } from 'src/environments/environment';

import { AutoupdateStream } from './autoupdate-stream';
import { AutoupdateSubscription } from './autoupdate-subscription';

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

function removeStream(streamSubscriptions: AutoupdateSubscription[], stream: AutoupdateStream) {
    for (let subscription of streamSubscriptions) {
        if (subscriptions[subscription.id]) {
            delete subscriptions[subscription.id];
        }
    }

    const idx = streams.indexOf(stream);
    if (idx !== -1) {
        streams.splice(idx, 1);
    }
}

async function openConnection(
    ctx: MessagePort,
    { streamId, authToken, method, url, request, requestHash, description }
) {
    const existingSubscription = searchRequest(url, request);
    if (existingSubscription) {
        subscriptions[existingSubscription].addPort(ctx);
        return;
    }

    const category = getRequestCategory(description, request);
    const subscription = new AutoupdateSubscription(streamId, url, requestHash, request, description, [ctx]);
    subscriptions[subscription.id] = subscription;
    subscriptionQueues[category].push(subscription);

    clearTimeout(openTimeouts[category]);
    openTimeouts[category] = setTimeout(async () => {
        const queue = subscriptionQueues[category];
        subscriptionQueues[category] = [];
        openTimeouts[category] = undefined;

        const autoupdateStream = new AutoupdateStream(queue, url, method, authToken);
        streams.push(autoupdateStream);

        try {
            await autoupdateStream.start();
            removeStream(queue, autoupdateStream);
        } catch (e) {
            if (e.name !== `AbortError`) {
                console.error(e);
            } else {
                removeStream(queue, autoupdateStream);
            }
        }
    }, 5);
}

async function closeConnection(ctx: MessagePort, { streamId }) {
    if (!subscriptions[streamId]) {
        return;
    }

    subscriptions[streamId].closePort(ctx);
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
            }
        }
    });
}
