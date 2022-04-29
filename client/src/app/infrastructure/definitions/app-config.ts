import { Type } from '@angular/core';
import { BaseModel, ModelConstructor } from 'src/app/domain/models/base/base-model';
import { BaseRepository } from 'src/app/gateways/repositories/base-repository';
import { BaseViewModel, ViewModelConstructor } from 'src/app/site/base/base-view-model';
import { MainMenuEntry } from 'src/app/site/pages/meetings/services/main-menu.service';

interface BaseModelEntry {
    repository: Type<BaseRepository<any, any>>;
    model: ModelConstructor<BaseModel>;
}

interface ModelEntry extends BaseModelEntry {
    viewModel: ViewModelConstructor<BaseViewModel>;
}

/**
 * The configuration of a part of the whole application.
 */
export interface AppConfig {
    /**
     * The name.
     */
    name: string;

    /**
     * All models, that should be registered.
     */
    models?: ModelEntry[];

    /**
     * Navigation menu entries within a meeting.
     */
    meetingMenuMentries?: MainMenuEntry[];

    /**
     * Navigation menu entries outside of a meeting.
     */
    organizationMenuEntries?: any[];
}
