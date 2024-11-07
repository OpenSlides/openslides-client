import { Observable } from 'rxjs';
import { Collection } from 'src/app/domain/definitions/key-types';

import { Fqid, Id } from '../../domain/definitions/key-types';
import { DetailNavigable } from '../../domain/interfaces/detail-navigable';
import { Displayable } from '../../domain/interfaces/displayable';
import { HasCollection } from '../../domain/interfaces/has-collection';
import { Identifiable } from '../../domain/interfaces/identifiable';
import { BaseModel } from '../../domain/models/base/base-model';

export type ViewModelRelations<T> = {
    [R in keyof T]: T[R];
} & {
    [R in keyof T as `${string & R}$`]: Observable<T[R]>;
};

export interface ViewModelConstructor<T extends BaseViewModel> {
    COLLECTION: string;
    new (...args: any[]): T;
}

/**
 * Base class for view models.
 */
export abstract class BaseViewModel<M extends BaseModel = any> implements DetailNavigable {
    public viewModelUpdateTimestamp = Date.now();

    public get fqid(): Fqid {
        return this.getModel().fqid;
    }

    public get COLLECTION(): Collection {
        return this.getModel().collection;
    }

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
    public getDetailStateUrl(): string {
        return ``;
    }
}

export interface BaseViewModel extends Displayable, Identifiable, HasCollection {
    getTitle: () => string;
    getListTitle: () => string;
    getDelegationSettingEnabled: () => boolean;
    isSelfVotingAllowedDespiteDelegation: () => boolean;

    /**
     * Returns the verbose name.
     *
     * @param plural If the name should be plural
     * @returns the verbose name of the model
     */
    getVerboseName: (plural?: boolean) => string;
    getActiveMeetingId: () => Id | null;
}
