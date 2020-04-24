import { Injectable } from '@angular/core';

import { ModelData } from './autoupdate-helpers';
import { AutoupdateService, FieldDescriptor, HasFields, ModelRequest } from './autoupdate.service';
import { Deferred } from '../promises/deferred';
import { HttpService } from './http.service';
import { collectionIdFromFqid } from './key-transforms';
import { Collection, Id } from '../definitions/key-types';

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
    public loaded = new Deferred();

    public constructor(private http: HttpService) {
        this.setup();
    }

    private async setup(): Promise<void> {
        await this.loadData();
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
        this.loaded.resolve();
    }

    public getModelData(...fqids: string[]): ModelData {
        const selectionOfData: ModelData = {};
        for (const fqid of fqids) {
            let collection, id;
            [collection, id] = collectionIdFromFqid(fqid);
            if (selectionOfData[collection] === undefined) {
                selectionOfData[collection] = {};
            }
            selectionOfData[collection][id] = this.data[collection][id];
        }
        return selectionOfData;
    }

    public getAllModelData(): ModelData {
        return this.data;
    }

    // START MOCK

    public getForRequest(request: ModelRequest): ModelData {
        const data: ModelData = {};
        for (const field of Object.keys(request.fields)) {
            for (const id of request.ids) {
                this.handleNested(request.collection, id, field, request, data);
            }
        }
        return data;
    }

    private copyToData(collection: string, id: number, field: string, data: ModelData): void {
        const fieldData = this.safeGet(collection, id, field);
        this.addToData(collection, id, field, data, fieldData);
    }

    private addToData(collection: string, id: number, field: string, data: ModelData, value: any): void {
        if (value === undefined) {
            return;
        }
        if (data[collection] === undefined) {
            data[collection] = {};
        }
        if (data[collection][id] === undefined) {
            data[collection][id] = {};
        }
        data[collection][id][field] = value;
    }

    private safeGet(collection: string, id: number, field: string): any {
        let r;
        if (this.data[collection] && this.data[collection][id]) {
            r = this.data[collection][id][field];
        } else {
            r = undefined;
        }
        return r;
    }

    private handleNested(collection: string, id: number, field: string, fields: HasFields, data: ModelData): void {
        // console.log('handle nested', collection, id, field, fields, data);
        if (!fields.fields[field]) {
            // plain value
            this.copyToData(collection, id, field, data);
            return;
        }

        const descriptor = fields.fields[field];
        switch (descriptor.type) {
            case 'relation':
                const foreignId = this.safeGet(collection, id, field);
                this.addToData(collection, id, field, data, foreignId);
                if (foreignId) {
                    for (const _field of Object.keys(descriptor.fields)) {
                        this.handleNested(descriptor.collection, foreignId, _field, descriptor, data);
                    }
                }
                break;
            case 'relation-list':
                const foreignIds = this.safeGet(collection, id, field);
                this.addToData(collection, id, field, data, foreignIds);
                if (foreignIds) {
                    for (const _id of foreignIds) {
                        for (const _field of Object.keys(descriptor.fields)) {
                            this.handleNested(descriptor.collection, _id, _field, descriptor, data);
                        }
                    }
                }
                break;
            case 'generic-relation':
                const foreignGenericId = this.safeGet(collection, id, field);
                this.addToData(collection, id, field, data, foreignGenericId);
                if (foreignGenericId) {
                    let foreignCollection: Collection, foreignGenericNumericId: Id;
                    [foreignCollection, foreignGenericNumericId] = collectionIdFromFqid(foreignGenericId);
                    for (const _field of Object.keys(descriptor.fields)) {
                        this.handleNested(foreignCollection, foreignGenericNumericId, _field, descriptor, data);
                    }
                }
                break;
            case 'generic-relation-list':
                const foreignGenericIds = this.safeGet(collection, id, field);
                this.addToData(collection, id, field, data, foreignGenericIds);
                if (foreignGenericIds) {
                    for (const _id of foreignGenericIds) {
                        let foreignCollection: Collection, foreignGenericNumericId: Id;
                        [foreignCollection, foreignGenericNumericId] = collectionIdFromFqid(_id);
                        for (const _field of Object.keys(descriptor.fields)) {
                            this.handleNested(foreignCollection, foreignGenericNumericId, _field, descriptor, data);
                        }
                    }
                }
                break;
            case 'template':
                throw new Error("TODO");
                break;
        }
    }
}
