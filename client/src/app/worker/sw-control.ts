export function controlMessageHandler(ctx: any, e: any, broadcast: (s: string, a: string, c?: any) => void): void {
    const msg = e.data?.msg;
    const params = msg?.params;
    const action = msg?.action;
    switch (action) {
        case `terminate`:
            broadcast(`control`, `terminating`);
            if (!((<any>self).Window && self instanceof (<any>self).Window)) {
                (<any>self).close();
            }
            break;
        case `ping`:
            ctx.postMessage({ sender: `control`, action: `pong`, content: params });
            break;
    }
}
