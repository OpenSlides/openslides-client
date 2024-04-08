import { Id } from '../domain/definitions/key-types';
import { WorkerHttpAuth } from './http/auth';

export function initAuthWorker(broadcast: (s: string, a: string, c?: any) => void): void {
    WorkerHttpAuth.subscribe(`auth`, (token, uid?) => onAuthUpdate(token, uid));

    function onAuthUpdate(token: string, userId?: Id): void {
        if (userId !== undefined) {
            broadcast(`auth`, `new-user`, {
                user: userId,
                token
            });
        } else {
            broadcast(`auth`, `new-token`, {
                user: userId,
                token
            });
        }
    }
}

export function authMessageHandler(ctx: any, e: any): void {
    const msg = e.data?.msg;
    const action = msg?.action;
    switch (action) {
        case `stop-refresh`:
            WorkerHttpAuth.stopRefresh();
            break;
        case `update`:
            WorkerHttpAuth.update();
            break;
        case `get-current-auth`:
            Promise.all([WorkerHttpAuth.currentUser(), WorkerHttpAuth.currentToken()]).then(([user, token]) => {
                ctx.postMessage({
                    sender: `auth`,
                    action: `new-user`,
                    content: {
                        user,
                        token
                    }
                });
            });
            break;
    }
}
