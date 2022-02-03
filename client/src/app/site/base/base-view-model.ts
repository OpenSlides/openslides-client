import { Fqid, Id } from 'app/core/definitions/key-types';
import { BaseModel } from 'app/shared/models/base/base-model';
import { HasCollection } from 'app/shared/models/base/collection';

import { Identifiable } from '../../shared/models/base/identifiable';
import { DetailNavigable } from './detail-navigable';
import { Displayable } from './displayable';

export interface ViewModelConstructor<T extends BaseViewModel> {
    COLLECTION: string;
    new (...args: any[]): T;
}

/**
 * Base class for view models.
 */
export abstract class BaseViewModel<M extends BaseModel = any> implements DetailNavigable {
    public get fqid(): Fqid {
        return this.getModel().fqid;
    }

    /**
     * @param collection
     * @param model
     */
    public constructor(protected _model: M) {}

    /**
     * @returns the main underlying model of the view model
     */
    public getModel(): M {
        return this._model;
    }
    public toString(): string {
        return this.getTitle();
    }
    public toJSON(): M {
        return this.getModel();
    }
    public getUpdatedModelData(update: Partial<M>): object {
        return this.getModel().getUpdatedData(update);
    }
    public canAccess(): boolean {
        return true;
    }
    /**
     * Override in children
     */
    public getDetailStateUrl(): string | null {
        return ``;
    }
}
export interface BaseViewModel<M extends BaseModel = any> extends Displayable, Identifiable, HasCollection {
    getTitle: () => string;
    getListTitle: () => string;

    /**
     * Returns the verbose name.
     *
     * @param plural If the name should be plural
     * @returns the verbose name of the model
     */
    getVerboseName: (plural?: boolean) => string;
    getActiveMeetingId: () => Id;
}
