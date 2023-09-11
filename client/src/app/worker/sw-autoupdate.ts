import { environment } from 'src/environments/environment';

import { AutoupdateStreamPool } from './autoupdate/autoupdate-stream-pool';
import { AutoupdateSubscription } from './autoupdate/autoupdate-subscription';
import {
    AutoupdateCleanupCacheParams,
    AutoupdateCloseStreamParams,
    AutoupdateOpenStreamParams,
    AutoupdateSetEndpointParams
} from './autoupdate/interfaces-autoupdate';

const autoupdatePool = new AutoupdateStreamPool({
    url: `/system/autoupdate`,
    healthUrl: `/system/autoupdate/health`,
    method: `post`
} as AutoupdateSetEndpointParams);

const subscriptionQueues: { [key: string]: AutoupdateSubscription[] } = {
    required: [],
    requiredMeeting: [],
    sequentialnumbermapping: [],
    other: []
};
const openTimeouts = {
    required: null,
    requiredMeeting: [],
    sequentialnumbermapping: null,
    other: null
};

let debugCommandsRegistered = false;
function registerDebugCommands() {
    if (debugCommandsRegistered) {
        return;
    }

    debugCommandsRegistered = true;
    (<any>self).printAutoupdateState = function () {
        console.log(`AU POOL INFO`);
        console.log(`Currently open:`, autoupdatePool.activeStreams.length);
        console.group(`Streams`);
        for (const stream of autoupdatePool.activeStreams) {
            console.groupCollapsed(stream.subscriptions.map(s => s.description).join(`, `));
            console.log(`Current data:`, stream.currentData);
            console.log(`Current data size:`, JSON.stringify(stream.currentData).length);
            console.log(`Current data keys:`, Object.keys(stream.currentData).length);
            console.log(`Query params:`, stream.queryParams.toString());
            console.log(`Failed connects:`, stream.failedConnects);
            console.groupCollapsed(`Subscriptions`);
            for (const subscr of stream.subscriptions) {
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

    (<any>self).disableAutoupdateCompression = function () {
        autoupdatePool.disableCompression();
    };
}

function openConnection(
    ctx: MessagePort,
    { streamId, queryParams = ``, request, requestHash, description }: AutoupdateOpenStreamParams
): void {
    function getRequestCategory(
        description: string,
        _request: unknown
    ): 'required' | 'requiredMeeting' | 'other' | 'sequentialnumbermapping' {
        const required = [`theme_list:subscription`, `operator:subscription`, `organization:subscription`];
        if (required.indexOf(description) !== -1) {
            return `required`;
        }

        const requiredMeeting = [`active_meeting:subscription`, `active_polls:subscription`];
        if (requiredMeeting.indexOf(description) !== -1) {
            return `requiredMeeting`;
        }

        if (description.startsWith(`SequentialNumberMappingService:prepare`)) {
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
        if (existingSubscription.description !== description) {
            const subscription = new AutoupdateSubscription(streamId, queryParams, requestHash, request, description, [
                ctx
            ]);
            autoupdatePool.addSubscription(subscription, existingSubscription.stream);
            subscription.resendTo(ctx);
        } else {
            existingSubscription.addPort(ctx);
        }

        if (!existingSubscription.stream.active) {
            autoupdatePool.reconnect(existingSubscription.stream, false);
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

function cleanupStream(params: AutoupdateCleanupCacheParams): void {
    const subscription = autoupdatePool.getSubscriptionById(params.streamId);
    if (!subscription) {
        return;
    }

    subscription.stream.removeFqids(params.deletedFqids);
}

let currentlyOnline = navigator.onLine;
function updateOnlineStatus(): void {
    if (currentlyOnline === navigator.onLine) {
        return;
    }

    currentlyOnline = navigator.onLine;
    autoupdatePool.updateOnlineStatus(currentlyOnline);
}

if (!environment.production) {
    registerDebugCommands();
}

export function autoupdateMessageHandler(ctx: any, e: any): void {
    const msg = e.data?.msg;
    const params = msg?.params;
    const action = msg?.action;
    switch (action) {
        case `open`:
            openConnection(ctx, params);
            break;
        case `close`:
            closeConnection(ctx, params);
            break;
        case `cleanup-cache`:
            cleanupStream(params);
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
        case `reconnect-force`:
            autoupdatePool.reconnectAll(false);
            break;
        case `enable-debug`:
            registerDebugCommands();
            break;
    }
}
