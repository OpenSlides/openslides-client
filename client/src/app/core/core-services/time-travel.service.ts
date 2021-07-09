import { Injectable } from '@angular/core';

import { environment } from 'environments/environment';

import { BaseModel } from 'app/shared/models/base/base-model';
import { History } from 'app/shared/models/core/history';
import { CollectionMapperService } from './collection-mapper.service';
import { DataStoreService, DataStoreUpdateManagerService } from './data-store.service';
import { HistoryService } from './history.service';
import { HttpService } from './http.service';
import { LifecycleService } from './lifecycle.service';

interface HistoryData {
    [collection: string]: BaseModel[];
}

/**
 * Service to enable browsing OpenSlides in a previous version.
 *
 * This should stop auto updates, save the current ChangeID and overwrite the DataStore with old Values
 * from the servers History.
 *
 * Restoring is nor possible yet. Simply reload
 */
@Injectable({
    providedIn: 'root'
})
export class TimeTravelService {
    public constructor(
        private httpService: HttpService,
        private modelMapperService: CollectionMapperService,
        private DS: DataStoreService,
        private historyService: HistoryService,
        private lifecycleService: LifecycleService,
        private DSUpdateManager: DataStoreUpdateManagerService
    ) {}

    /**
     * Main entry point to set OpenSlides to another history point.
     *
     * @param history the desired point in the history of OpenSlides
     */
    public async loadHistoryPoint(history: History): Promise<void> {
        const updateSlot = await this.DSUpdateManager.getNewUpdateSlot(this.DS);

        await this.stopTime(history);
        const historyData: HistoryData = await this.getHistoryData(history);

        const allModels = [];
        Object.keys(historyData).forEach(collection => {
            const targetClass = this.modelMapperService.getModelConstructor(collection);
            historyData[collection].forEach(model => {
                allModels.push(new targetClass(model));
            });
        });
        // await this.DS.set(allModels, 0);

        this.DSUpdateManager.commit(updateSlot);
    }

    /**
     * Leaves the history mode. Just restart OpenSlides:
     * The active user is checked, a new WS connection established and
     * all missed auto updates are requested.
     */
    public async resumeTime(): Promise<void> {
        this.historyService.leaveHistoryMode();
        await this.DS.set();
        await this.lifecycleService.reboot();
    }

    /**
     * Read the history on a given time
     *
     * @param date the Date object
     * @returns the full history on the given date
     */
    private async getHistoryData(history: History): Promise<HistoryData> {
        const queryParams = { timestamp: Math.ceil(history.timestamp) };
        return await this.httpService.get<HistoryData>(
            `${environment.urlPrefix}/core/history/data/`,
            null,
            queryParams
        );
    }

    /**
     * Clears the DataStore and stops the WebSocket connection
     */
    private async stopTime(history: History): Promise<void> {
        // await this.webSocketService.close();
        await this.DS.set(); // Same as clear, but not persistent.
        this.historyService.enterHistoryMode(history);
    }
}
