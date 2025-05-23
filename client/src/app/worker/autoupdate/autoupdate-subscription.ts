import { FieldDescriptor, Fields, HasFields, ModelRequest } from 'src/app/domain/interfaces/model-request';

import { AutoupdateStream } from './autoupdate-stream';
import { AutoupdateReceiveData, AutoupdateReceiveError, AutoupdateSetStreamId } from './interfaces-autoupdate';

export class AutoupdateSubscription {
    /**
     * The stream handling this subscription
     */
    public stream: AutoupdateStream;

    public get request(): ModelRequest {
        return this._request;
    }

    public constructor(
        public id: number,
        public url: string,
        public requestHash: string,
        private _request: ModelRequest,
        public description: string,
        public ports: MessagePort[]
    ) {
        this.id = this.id || Math.floor(Math.random() * (900000000 - 1) + 100000000);

        for (const port of ports) {
            this.publishSubscriptionId(port);
        }
    }

    /**
     * Sends the id of the subscription to the given MessagePort
     *
     * @param port The MessagePort the id should be send to
     */
    public publishSubscriptionId(port: MessagePort, requestHash?: string): void {
        port.postMessage({
            sender: `autoupdate`,
            action: `set-streamid`,
            content: {
                description: this.description,
                requestHash: requestHash || this.requestHash,
                streamId: this.id
            }
        } as AutoupdateSetStreamId);
    }

    /**
     * Sends the given data to all registered MessagePorts.
     *
     * @param data The data to be processed
     */
    public updateData(data: any): void {
        for (const port of this.ports) {
            port.postMessage({
                sender: `autoupdate`,
                action: `receive-data`,
                content: {
                    streamIdDescriptions: { [this.id]: this.description },
                    data: data
                }
            } as AutoupdateReceiveData);
        }
    }

    /**
     * Informs the subscribers that a error occured in stream
     *
     * @param data The error data
     */
    public sendError(data: any): void {
        for (const port of this.ports) {
            port.postMessage({
                sender: `autoupdate`,
                action: `receive-error`,
                content: {
                    streamIdDescriptions: { [this.id]: this.description },
                    data: data
                }
            } as AutoupdateReceiveError);
        }
    }

    /**
     * Adds a MessagePort to the subscription and sends
     * the latest internal data to it
     *
     * @param port The port to be registered
     */
    public addPort(port: MessagePort, requestHash?: string): void {
        this.ports.push(port);
        this.publishSubscriptionId(port, requestHash);
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
    public closePort(port: MessagePort): void {
        const portIdx = this.ports.indexOf(port);
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
    public resendTo(port: MessagePort): void {
        if (this.stream && this.stream.currentData !== null) {
            port.postMessage({
                sender: `autoupdate`,
                action: `receive-data`,
                content: {
                    streamIdDescriptions: { [this.id]: this.description },
                    data: this.stream.currentData
                }
            } as AutoupdateReceiveData);
        }
    }

    /**
     * Checks if a model request can be fulfulled by this subscription
     *
     * @param url The url for the request
     * @param request The request to be checked
     */
    public fulfills(url: string, request: ModelRequest): boolean {
        // The url needs to match
        if (this.url !== url) {
            return false;
        }

        // Without context about relations also the requested collection
        // and its ids have to match
        if (request.collection !== this.request.collection || request.ids.toString() !== this.request.ids.toString()) {
            return false;
        }

        const simpleFulfillment = JSON.stringify(this.request.fields) === JSON.stringify(request.fields);
        if (simpleFulfillment) {
            return true;
        }

        const checkRelation = (relation: FieldDescriptor, existingRelation: FieldDescriptor): boolean => {
            if (relation?.type !== existingRelation?.type) {
                return false;
            }

            if (
                (relation.type === `relation` && existingRelation.type === `relation`) ||
                (relation.type === `relation-list` && existingRelation.type === `relation-list`)
            ) {
                if (relation.collection !== existingRelation.collection) {
                    return false;
                }
            }

            return checkFieldsExisting((relation as HasFields).fields, (existingRelation as HasFields).fields);
        };

        const checkFieldsExisting = (fields: Fields, existingFields: Fields): boolean => {
            for (const fieldKey of Object.keys(fields)) {
                const field = fields[fieldKey];
                const existing = existingFields[fieldKey];
                if (field === existing) {
                    continue;
                } else if (existing === undefined) {
                    return false;
                }

                if (!checkRelation(field, existing)) {
                    return false;
                }
            }

            return true;
        };

        return checkFieldsExisting(request.fields, this.request.fields);
    }
}
