import { environment } from 'src/environments/environment';

import { AutoupdateStreamPool } from './autoupdate-stream-pool';
import { AutoupdateSubscription } from './autoupdate-subscription';
import {
    AutoupdateCloseStreamParams,
    AutoupdateOpenStreamParams,
    AutoupdateSetEndpointParams
} from './interfaces-autoupdate';

const autoupdatePool = new AutoupdateStreamPool({
    url: `/system/autoupdate`,
    healthUrl: `/system/autoupdate/health`,
    method: `post`
} as AutoupdateSetEndpointParams);

let subscriptionQueues: { [key: string]: AutoupdateSubscription[] } = {
    required: [],
    sequentialnumbermapping: [],
    other: []
};
let openTimeouts = {
    required: null,
    sequentialnumbermapping: null,
    other: null
};

if (!environment.production) {
    (<any>self).printAutoupdateState = function () {
        console.log(`AU POOL INFO`);
        console.log(`Currently open:`, autoupdatePool.activeStreams.length);
        console.group(`Streams`);
        for (let stream of autoupdatePool.activeStreams) {
            console.groupCollapsed(stream.subscriptions.map(s => s.description).join(`, `));
            console.log(`Current data:`, stream.currentData);
            console.log(`Current data size:`, JSON.stringify(stream.currentData).length);
            console.log(`Current data keys:`, Object.keys(stream.currentData).length);
            console.log(`Query params:`, stream.queryParams);
            console.log(`Failed connects:`, stream.failedConnects);
            console.groupCollapsed(`Subscriptions`);
            for (let subscr of stream.subscriptions) {
                console.group(subscr.description);
                console.log(`ID:`, subscr.id);
                console.log(`Request:`, subscr.request);
                console.log(`Num subscribers:`, subscr.ports.length);
                console.groupEnd();
            }
            console.groupEnd();
            console.groupEnd();
        }
        console.groupEnd();

        console.groupCollapsed(`Raw`);
        console.log(`subscriptionQueue\n`, subscriptionQueues);
        console.log(`Pool\n`, autoupdatePool);
        console.groupEnd();
    };
}

function openConnection(
    ctx: MessagePort,
    { streamId, queryParams = ``, request, requestHash, description }: AutoupdateOpenStreamParams
): void {
    function getRequestCategory(
        description: string,
        _request: Object
    ): 'required' | 'other' | 'sequentialnumbermapping' {
        const required = [`theme_list:subscription`, `operator:subscription`, `organization:subscription`];
        if (required.indexOf(description) !== -1) {
            return `required`;
        }

        if (description === `SequentialNumberMappingService:prepare`) {
            return `sequentialnumbermapping`;
        }

        return `other`;
    }

    for (const queue of Object.keys(subscriptionQueues)) {
        const fulfillingSubscription = subscriptionQueues[queue].find(s => s.fulfills(queryParams, request));
        if (fulfillingSubscription) {
            fulfillingSubscription.addPort(ctx);
            return;
        }
    }

    const existingSubscription = autoupdatePool.getMatchingSubscription(queryParams, request);
    if (existingSubscription) {
        existingSubscription.addPort(ctx);
        if (!existingSubscription.stream.active) {
            autoupdatePool.reconnect(existingSubscription.stream);
        }
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

function closeConnection(ctx: MessagePort, params: AutoupdateCloseStreamParams): void {
    const subscription = autoupdatePool.getSubscriptionById(params.streamId);
    if (!subscription) {
        return;
    }

    subscription.closePort(ctx);
}

let currentlyOnline = navigator.onLine;
function updateOnlineStatus(): void {
    if (currentlyOnline === navigator.onLine) {
        return;
    }

    currentlyOnline = navigator.onLine;
    autoupdatePool.updateOnlineStatus(currentlyOnline);
}

export function addAutoupdateListener(context: any): void {
    context.addEventListener(`message`, e => {
        const receiver = e.data?.receiver;
        if (!receiver || receiver !== `autoupdate`) {
            return;
        }

        const msg = e.data?.msg;
        const params = msg?.params;
        const action = msg?.action;
        switch (action) {
            case `open`:
                openConnection(context, params);
                break;
            case `close`:
                closeConnection(context, params);
                break;
            case `auth-change`:
                autoupdatePool.updateAuthentication();
                break;
            case `set-endpoint`:
                autoupdatePool.setEndpoint(params);
                break;
            case `set-connection-status`:
                updateOnlineStatus();
                break;
            case `reconnect-inactive`:
                autoupdatePool.reconnectAll(true);
                break;
        }
    });
}
