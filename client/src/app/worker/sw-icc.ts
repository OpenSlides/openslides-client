import { AutoupdateSetEndpointParams } from './autoupdate/interfaces-autoupdate';
import { ICCStreamPool } from './icc/icc-stream-pool';

const iccPool = new ICCStreamPool({
    url: `/system/icc`,
    healthUrl: `/system/icc/health`,
    method: `get`
} as AutoupdateSetEndpointParams);

export function initIccSw(broadcast: (s: string, a: string, c?: any) => void): void {
    iccPool.registerBroadcast(broadcast);
}

export function iccMessageHandler(_ctx: any, e: any): void {
    const msg = e.data?.msg;
    const params = msg?.params;
    const action = msg?.action;
    switch (action) {
        case `connect`:
            iccPool.openNewStream(params);
            break;
        case `disconnect`:
            iccPool.closeStream(params);
            break;
    }
}
