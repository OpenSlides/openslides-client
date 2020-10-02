import { collectionIdFieldFromFqfield, fqfieldFromCollectionIdField } from './key-transforms';

export interface ModelData {
    [collection: string]: {
        [id: number]: {
            [field: string]: any;
        };
    };
}

export interface AutoupdateModelData {
    [fqfield: string]: any;
}

export function modelDataToAutoupdateFormat(models: ModelData): AutoupdateModelData {
    const data = {};
    for (const collection of Object.keys(models)) {
        for (const id of Object.keys(models[collection])) {
            for (const field of Object.keys(models[collection][id])) {
                data[fqfieldFromCollectionIdField(collection, id, field)] = models[collection][id][field];
            }
        }
    }
    return data;
}

export function autoupdateFormatToModelData(data: AutoupdateModelData): ModelData {
    const modelData = {};
    for (const fqfield of Object.keys(data)) {
        let collection, id, field;
        [collection, id, field] = collectionIdFieldFromFqfield(fqfield);
        if (modelData[collection] === undefined) {
            modelData[collection] = {};
        }
        if (modelData[collection][id] === undefined) {
            modelData[collection][id] = {}; // Do not inject the id, to distinguish between update/create and delete id
        }
        modelData[collection][id][field] = data[fqfield];
    }
    return modelData;
}
