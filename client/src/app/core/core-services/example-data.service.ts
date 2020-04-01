import { Injectable } from '@angular/core';

import { ModelData } from './autoupdate-helpers';
import { AutoupdateService } from './autoupdate.service';
import { HttpService } from './http.service';
import { collectionIdFromFqid } from './key-transforms';

export interface JSONModelData {
    [collection: string]: {
        [field: string]: any;
    }[];
}

/**
 * Handles the initial update and automatic updates using the {@link WebsocketService}
 * Incoming objects, usually BaseModels, will be saved in the dataStore (`this.DS`)
 * This service usually creates all models
 */
@Injectable({
    providedIn: 'root'
})
export class ExampleDataService {
    public data: ModelData;

    public constructor(private http: HttpService, private autoupdateService: AutoupdateService) {
        this.setup();
    }

    private async setup(): Promise<void> {
        await this.loadData();
        // this.inject('meeting/1', 'motion/1', 'motion_category/1', 'motion_category/2', 'user/1');
        this.injectAll();
    }

    private async loadData(): Promise<void> {
        const data = await this.http.get<JSONModelData>('/assets/json/example-data.json');
        this.data = {};
        for (const collection of Object.keys(data)) {
            if (this.data[collection] === undefined) {
                this.data[collection] = {};
            }
            for (const model of data[collection]) {
                this.data[collection][model.id] = model;
            }
        }
    }

    private inject(...fqids): void {
        const selectionOfData: ModelData = {};
        for (const fqid of fqids) {
            let collection, id;
            [collection, id] = collectionIdFromFqid(fqid);
            if (selectionOfData[collection] === undefined) {
                selectionOfData[collection] = {};
            }
            selectionOfData[collection][id] = this.data[collection][id];
        }
        this.autoupdateService.handleAutoupdate(selectionOfData);
    }

    private injectAll(): void {
        this.autoupdateService.handleAutoupdate(this.data);
    }
}
