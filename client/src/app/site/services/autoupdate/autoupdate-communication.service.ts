import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { HttpStreamEndpointService } from 'src/app/gateways/http-stream';
import { formatQueryParams } from 'src/app/infrastructure/definitions/http';
import { djb2hash } from 'src/app/infrastructure/utils';
import { SharedWorkerService } from 'src/app/openslides-main-module/services/shared-worker.service';

import { AuthTokenService } from '../auth-token.service';
import { ModelRequest } from './autoupdate.service';

const AUTOUPDATE_DEFAULT_ENDPOINT = `autoupdate`;

@Injectable({
    providedIn: `root`
})
export class AutoupdateCommunicationService {
    private autoupdateDataObservable: Observable<any>;
    private openResolvers = new Map<string, (value: number | PromiseLike<number>) => void>();

    public constructor(
        private authTokenService: AuthTokenService,
        private sharedWorker: SharedWorkerService,
        private endpointService: HttpStreamEndpointService
    ) {
        this.autoupdateDataObservable = new Observable(dataSubscription => {
            this.sharedWorker.listenTo(`autoupdate`).subscribe(data => {
                if (data?.action === `receive-data` && data.content !== undefined) {
                    dataSubscription.next(data.content);
                } else if (data?.action === `set-streamid` && this.openResolvers.has(data?.content?.requestHash)) {
                    this.openResolvers.get(data?.content?.requestHash)(data?.content?.streamId);
                    this.openResolvers.delete(data?.content?.requestHash);
                }
            });
        });
    }

    public open(streamId: Id, description: string, request: ModelRequest, params = {}): Promise<Id> {
        const configuration = this.endpointService.getEndpoint(AUTOUPDATE_DEFAULT_ENDPOINT);

        return new Promise(resolve => {
            const requestHash = djb2hash(JSON.stringify(request));
            this.openResolvers.set(requestHash, resolve);
            this.sharedWorker.sendMessage(`autoupdate`, {
                action: `open`,
                params: {
                    streamId,
                    description,
                    ...configuration,
                    url: configuration.url + formatQueryParams(params),
                    authToken: this.authTokenService.rawAccessToken,
                    requestHash: requestHash,
                    request
                }
            });
        });
    }

    public close(streamId: Id) {
        this.sharedWorker.sendMessage(`autoupdate`, {
            action: `close`,
            params: {
                streamId
            }
        });
    }

    public listen(): Observable<any> {
        return this.autoupdateDataObservable;
    }
}
