import { Id } from 'src/app/domain/definitions/key-types';
import { ErrorType } from 'src/app/gateways/http-stream/stream-utils';

import { WorkerHttpAuth } from '../http/auth';
import { HTTP_POOL_CONFIG, HttpStreamPool } from '../http/http-stream-pool';
import { ICCStream } from './icc-stream';

export class ICCStreamPool extends HttpStreamPool<ICCStream> {
    protected readonly messageSenderName: string = `icc`;

    public async openNewStream(config: { type: string; meetingId: Id }): Promise<ICCStream> {
        let stream = this.streams.find(s => JSON.stringify(s.config) === JSON.stringify(config));
        if (!stream) {
            stream = new ICCStream(
                data => this.handleData(config.meetingId, config.type, data),
                config,
                {
                    ...this.endpoint,
                    url: this.endpoint.url + `/${config.type}`
                },
                await WorkerHttpAuth.currentToken()
            );
            this.connectStream(stream);
        } else {
            stream.addUser();
            if (!stream.active) {
                this.connectStream(stream);
            }
        }

        return stream;
    }

    public closeStream(config: { type: string; meetingId: Id }): void {
        const stream = this.streams.find(s => JSON.stringify(s.config) === JSON.stringify(config));
        if (stream) {
            stream.removeUser();
        }
    }

    protected async connectStream(stream: ICCStream, force?: boolean): Promise<void> {
        if (WorkerHttpAuth.updating()) {
            await WorkerHttpAuth.updating();
        }

        const { stopReason, error } = await stream.start(force);

        if (stopReason === `error`) {
            await this.handleError(stream, error);
        } else if (stopReason === `resolved`) {
            await this.handleResolve(stream);
        }
        this.removeStream(stream);
    }

    private async handleResolve(stream: ICCStream): Promise<void> {
        if (stream.failedConnects >= HTTP_POOL_CONFIG.RETRY_AMOUNT) {
            this.sendToAll(`closed`, stream.config);
        } else if (await this.waitUntilEndpointHealthy()) {
            await this.connectStream(stream);
        } else if (await WorkerHttpAuth.update()) {
            stream.failedCounter++;
            await this.connectStream(stream);
        } else {
            this.sendToAll(`closed`, stream.config);
        }
    }

    private async handleError(stream: ICCStream, error: any): Promise<void> {
        if (error?.error.content?.type !== `auth`) {
            await this.waitUntilEndpointHealthy();
        }

        if (stream.failedConnects <= HTTP_POOL_CONFIG.RETRY_AMOUNT && error?.type !== ErrorType.CLIENT) {
            if (error?.error.content?.type === `auth`) {
                await WorkerHttpAuth.update();
            }

            await this.connectStream(stream);
        } else if (stream.failedConnects <= HTTP_POOL_CONFIG.RETRY_AMOUNT && error?.error.content?.type === `auth`) {
            if (await WorkerHttpAuth.update()) {
                await this.connectStream(stream);
            } else {
                this.sendToAll(`closed`, stream.config);
            }
        } else {
            this.sendToAll(`closed`, stream.config);
        }
    }

    private async handleData(meeting: Id, type: string, data: any) {
        this.sendToAll(`receive-data`, {
            type,
            meeting_id: meeting,
            data
        });
    }
}
