import { AutoupdateStream } from './autoupdate-stream';

export class AutoupdateSubscription {
    /**
     * Full data object received by autoupdate
     */
    public currentData: Object | null = null;

    /**
     * The stream handling this subscription
     */
    public stream: AutoupdateStream;

    public get request(): Object {
        return this._request;
    }

    constructor(
        public id: number,
        public url: string,
        public requestHash: string,
        private _request: any,
        public description: string,
        public ports: MessagePort[]
    ) {
        this.id = this.id || Math.floor(Math.random() * (900000 - 1) + 100000);

        for (let port of ports) {
            this.publishSubscriptionId(port);
        }
    }

    /**
     * Sends the id of the subscription to the given MessagePort
     *
     * @param port The MessagePort the id should be send to
     */
    public publishSubscriptionId(port: MessagePort) {
        port.postMessage({
            sender: `autoupdate`,
            action: `set-streamid`,
            content: {
                requestHash: this.requestHash,
                streamId: this.id
            }
        });
    }

    /**
     * Updates the internal data state and sends the given data
     * to all registered MessagePorts.
     *
     * @param data The data to be processed
     */
    public updateData(data: Object) {
        if (this.currentData === null) {
            this.currentData = data;
        } else {
            this.currentData = Object.assign(this.currentData, data);
        }

        for (let port of this.ports) {
            port.postMessage({
                sender: `autoupdate`,
                action: `receive-data`,
                content: {
                    streamId: this.id,
                    data: data,
                    description: this.description
                }
            });
        }
    }

    /**
     * Informs the subscribers that a error occured in stream
     *
     * @param data The error data
     */
    public sendError(data: Object) {
        for (let port of this.ports) {
            port.postMessage({
                sender: `autoupdate`,
                action: `receive-error`,
                content: {
                    streamId: this.id,
                    data: data,
                    description: this.description
                }
            });
        }
    }

    /**
     * Adds a MessagePort to the subscription and sends
     * the latest internal data to it
     *
     * @param port The port to be registered
     */
    public addPort(port: MessagePort) {
        this.ports.push(port);
        this.publishSubscriptionId(port);
        this.resendTo(port);

        this.stream?.notifySubscriptionUsed(this);
    }

    /**
     * Removes a MessagePort from the subscription and
     * notifies the stream if no more MessagePorts remaining
     * in this subscription
     *
     * @param port The port to be removed
     */
    public closePort(port: MessagePort) {
        let portIdx = this.ports.indexOf(port);
        if (portIdx !== -1) {
            this.ports.splice(portIdx, 1);
        }

        if (!this.ports.length) {
            this.stream?.notifySubscriptionEmpty(this);
        }
    }

    /**
     * Sends the latest data of the subscription to the
     * given MessagePort
     *
     * @param port The MessagePort the data should be send to
     */
    public resendTo(port: MessagePort) {
        if (this.currentData !== null) {
            port.postMessage({
                sender: `autoupdate`,
                action: `receive-data`,
                content: {
                    streamId: this.id,
                    data: this.currentData,
                    description: this.description
                }
            });
        }
    }

    /**
     * Checks if a model request can be fulfulled by this subscription
     *
     * @param url The url for the request
     * @param request The request to be checked
     */
    public fulfills(url: string, request: Object): boolean {
        return this.url === url && JSON.stringify(this.request) === JSON.stringify(request);
    }
}
