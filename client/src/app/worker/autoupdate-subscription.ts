import { AutoupdateStream } from './autoupdate-stream';

export class AutoupdateSubscription {
    public currentData: Object | null = null;
    public stream: AutoupdateStream;

    constructor(
        public id: number,
        public requestHash: string,
        public request: Object,
        public description: string,
        public ports: MessagePort[]
    ) {
        this.id = this.id || Math.floor(Math.random() * (900000 - 1) + 100000);

        for (let port of ports) {
            this.publishSubscriptionId(port);
        }
    }

    public publishSubscriptionId(port: MessagePort) {
        port.postMessage(
            JSON.stringify({
                sender: `autoupdate`,
                action: `set-streamid`,
                content: {
                    requestHash: this.requestHash,
                    streamId: this.id
                }
            })
        );
    }

    public updateData(data: Object) {
        if (this.currentData === null) {
            this.currentData = data;
        } else {
            this.currentData = Object.assign(this.currentData, data);
        }

        for (let port of this.ports) {
            port.postMessage(
                JSON.stringify({
                    sender: `autoupdate`,
                    action: `receive-data`,
                    content: {
                        streamId: this.id,
                        data: data,
                        description: this.description
                    }
                })
            );
        }
    }

    public addPort(port: MessagePort) {
        this.ports.push(port);
        this.publishSubscriptionId(port);
        this.resendTo(port);

        this.stream?.notifySubscriptionUsed(this);
    }

    public closePort(port: MessagePort) {
        let portIdx = this.ports.indexOf(port);
        if (portIdx !== -1) {
            this.ports.splice(portIdx, 1);
        }

        if (!this.ports.length) {
            this.stream?.notifySubscriptionEmpty(this);
        }
    }

    public resendTo(port: MessagePort) {
        if (this.currentData !== null) {
            port.postMessage(
                JSON.stringify({
                    sender: `autoupdate`,
                    action: `receive-data`,
                    content: {
                        streamId: this.id,
                        data: this.currentData,
                        description: this.description
                    }
                })
            );
        }
    }

    public fulfills(request: Object): boolean {
        return JSON.stringify(this.request) === JSON.stringify(request);
    }
}
