import { AutoupdateSetEndpointParams } from './autoupdate/interfaces-autoupdate';
import { ICCStreamPool } from './icc/icc-stream-pool';
import { ICCMessage } from './sw-icc.interfaces';

const iccPool = new ICCStreamPool({
    url: `/system/icc`,
    healthUrl: `/system/icc/health`,
    method: `get`
} as AutoupdateSetEndpointParams);

export function initIccSw(broadcast: (s: string, a: string, c?: any) => void): void {
    iccPool.registerBroadcast(broadcast);
}

export function iccMessageHandler(_ctx: any, e: MessageEvent<ICCMessage>): void {
    const msg = e.data.msg;
    switch (msg.action) {
        case `connect`:
            iccPool.openNewStream(msg.params);
            break;
        case `disconnect`:
            iccPool.closeStream(msg.params);
            break;
    }
}
