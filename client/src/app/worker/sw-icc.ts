import { AutoupdateSetEndpointParams } from './autoupdate/interfaces-autoupdate';
import { ICCStreamPool } from './icc/icc-stream-pool';

const iccPool = new ICCStreamPool({
    url: `/system/icc`,
    healthUrl: `/system/icc/health`,
    method: `get`
} as AutoupdateSetEndpointParams);

export function iccMessageHandler(_ctx: any, e: any, _broadcast: (s: string, a: string, c?: any) => void): void {
    const msg = e.data?.msg;
    // const params = msg?.params;
    const action = msg?.action;
    switch (action) {
        case `open`:
            iccPool.openNewStream(msg);
            break;
        case `close`:
            break;
        case `send`:
            break;
        case `auth-change`:
            break;
        case `set-endpoint`:
            break;
        case `set-connection-status`:
            break;
    }
}
