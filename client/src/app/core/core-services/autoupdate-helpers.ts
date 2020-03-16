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
export const KEYSEPERATOR = '/';

export function fqfieldFromCollectionIdField(collection: string, id: number | string, field: string): string {
    return `${collection}${KEYSEPERATOR}${id}${KEYSEPERATOR}${field}`;
}

export function collectionIdFieldFromFqfield(fqfield: string): [string, string, string] {
    const parts = fqfield.split(KEYSEPERATOR);
    if (parts.length !== 3) {
        throw new Error(`The given fqfield "${fqfield}" is not valid.`);
    }
    return parts as [string, string, string];
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
            modelData[collection][id] = { id: +id }; // Inject the id into the model
        }
        modelData[collection][id][field] = data[fqfield];
    }
    return modelData;
}
