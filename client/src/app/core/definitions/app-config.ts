import { Type } from '@angular/core';
import { BaseViewModel, ViewModelConstructor } from 'app/site/base/base-view-model';

import { BaseModel, ModelConstructor } from '../../shared/models/base/base-model';
import { Searchable } from '../../site/base/searchable';
import { MainMenuEntry } from '../core-services/main-menu.service';
import { BaseRepository } from '../repositories/base-repository';

interface BaseModelEntry {
    repository: Type<BaseRepository<any, any>>;
    model: ModelConstructor<BaseModel>;
}

export interface ModelEntry extends BaseModelEntry {
    viewModel: ViewModelConstructor<BaseViewModel>;
}

export interface SearchableModelEntry extends BaseModelEntry {
    viewModel: ViewModelConstructor<BaseViewModel & Searchable>;
    searchOrder: number;
    openInNewTab?: boolean;
}

/**
 * The configuration of an app.
 */
export interface AppConfig {
    /**
     * The name.
     */
    name: string;

    /**
     * All models, that should be registered.
     */
    models?: (ModelEntry | SearchableModelEntry)[];

    /**
     * Main menu entries.
     */
    mainMenuEntries?: MainMenuEntry[];
}
