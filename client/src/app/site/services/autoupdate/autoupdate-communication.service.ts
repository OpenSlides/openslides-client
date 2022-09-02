import { Injectable } from '@angular/core';
import { filter, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { HttpStreamEndpointService } from 'src/app/gateways/http-stream';
import { formatQueryParams } from 'src/app/infrastructure/definitions/http';
import { SharedWorkerService } from 'src/app/openslides-main-module/services/shared-worker.service';

import { AuthTokenService } from '../auth-token.service';
import { ModelRequest } from './autoupdate.service';

const AUTOUPDATE_DEFAULT_ENDPOINT = `autoupdate`;

@Injectable({
    providedIn: `root`
})
export class AutoupdateCommunicationService {
    public constructor(
        private authTokenService: AuthTokenService,
        private sharedWorker: SharedWorkerService,
        private endpointService: HttpStreamEndpointService
    ) {}

    public open(streamId: Id, request: ModelRequest, params = {}): Promise<Id> {
        const configuration = this.endpointService.getEndpoint(AUTOUPDATE_DEFAULT_ENDPOINT);

        return new Promise(resolve => {
            this.sharedWorker.sendMessage(`autoupdate`, {
                action: `open`,
                params: {
                    id: streamId,
                    ...configuration,
                    url: configuration.url + formatQueryParams(params),
                    authToken: this.authTokenService.rawAccessToken,
                    body: [request]
                }
            });

            resolve(streamId ?? 1);
        });
    }

    public close(streamId: Id, request: ModelRequest) {}

    public listen(): Observable<any> {
        return this.sharedWorker.listenTo(`autoupdate`).pipe(filter(data => data?.action === `receive-data`));
    }
}
