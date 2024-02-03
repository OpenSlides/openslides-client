export function iccMessageHandler(ctx: any, e: any, broadcast: (s: string, a: string, c?: any) => void): void {
    const msg = e.data?.msg;
    const params = msg?.params;
    const action = msg?.action;
    switch (action) {
        case `open`:
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
