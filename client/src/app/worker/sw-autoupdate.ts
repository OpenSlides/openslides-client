import { environment } from 'src/environments/environment';
import { AutoupdateStream } from './autoupdate-stream';
import { AutoupdateSubscription } from './autoupdate-subscription';

let subscriptions: { [key: number]: AutoupdateSubscription } = {};
let subscriptionQueue: AutoupdateSubscription[] = [];
let streams: AutoupdateStream[] = [];
let openTimeout = undefined;

if (!environment.production) {
    (<any> self).printAutoupdateState = function () {
        console.log(`subscriptions\n`, subscriptions);
        console.log(`subscriptionQueue\n`, subscriptionQueue);
        console.log(`streams\n`, streams);
    }
}

function searchRequest(request: Object): null | number {
    for (let i of Object.keys(subscriptions)) {
        if (subscriptions[i].fulfills(request)) {
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
        streams.splice(idx);
    }
}

async function openConnection(
    ctx: MessagePort,
    { streamId, authToken, method, url, request, requestHash, description }
) {
    const existingSubscription = searchRequest(request);
    if (existingSubscription) {
        subscriptions[existingSubscription].addPort(ctx);
        return;
    }

    const subscription = new AutoupdateSubscription(streamId, requestHash, request, description, [ctx]);
    subscriptions[subscription.id] = subscription;
    subscriptionQueue.push(subscription);

    if (!openTimeout) {
        openTimeout = setTimeout(async () => {
            const queue = subscriptionQueue;
            subscriptionQueue = [];
            openTimeout = undefined;

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
        }, 8);
    }
}

async function closeConnection(ctx: MessagePort, { streamId }) {
    if (!subscriptions[streamId]) {
        return;
    }

    subscriptions[streamId].closePort(ctx);
}

export function addAutoupdateListener(context: any) {
    context.addEventListener(`message`, e => {
        try {
            const data = JSON.parse(e.data);
            const msg = data.msg;
            const action = msg?.action;
            const params = msg?.params;
            if (data.receiver === `autoupdate`) {
                if (action === `open`) {
                    openConnection(context, params);
                } else if (action === `close`) {
                    closeConnection(context, params);
                }
            }
        } catch (e) {}
    });
}
