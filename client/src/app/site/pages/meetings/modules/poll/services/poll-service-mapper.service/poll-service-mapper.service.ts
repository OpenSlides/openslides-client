import { Injectable } from '@angular/core';

import { PollService } from '../poll.service/poll.service';

@Injectable({ providedIn: 'root' })
export class PollServiceMapperService {
    private _registry: Record<string, PollService> = {};

    public registerService(collection: string, service: PollService): void {
        this._registry[collection] = service;
    }

    public getService(collection?: string): PollService | null {
        if (!collection || !this._registry[collection]) {
            return null;
        }
        return this._registry[collection];
    }
}
