import { AutoupdateStream } from './autoupdate-stream';
import { AutoupdateSubscription } from './autoupdate-subscription';

let subscriptions: AutoupdateSubscription[] = [];

function searchRequest(request: Object): null | number {
    for (let i of Object.keys(subscriptions)) {
        if (subscriptions[i].fulfills(request)) {
            return +i;
        }
    }

    return null;
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

    const autoupdateStream = new AutoupdateStream([subscription], [request], url, method, authToken);
    try {
        await autoupdateStream.start();
    } catch (e) {
        if (e.name !== `AbortError`) {
            console.error(e);
        }
    }
}

async function closeConnection(ctx: MessagePort, { streamId }) {
    if (!subscriptions[streamId]) {
        return;
    }

    subscriptions[streamId].closePort(ctx);

    if (!subscriptions[streamId].ports.length) {
        delete subscriptions[streamId];
    }
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
