import { HasAgendaItemId } from 'src/app/domain/interfaces';
import { BaseModel, ModelConstructor } from 'src/app/domain/models/base/base-model';
import { AppInjector } from 'src/app/openslides-main-module/services/app-injector.service';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { AgendaListTitle, HasAgendaItem } from 'src/app/site/pages/meetings/pages/agenda';

import { AgendaItemRepositoryService } from './agenda';
import { BaseMeetingRelatedRepository } from './base-meeting-related-repository';

export function isAgendaItemContentObjectRepository(obj: any): obj is BaseAgendaItemContentObjectRepository<any, any> {
    const repo = obj as BaseAgendaItemContentObjectRepository<any, any>;
    return !!obj && repo.getAgendaSlideTitle !== undefined && repo.getAgendaListTitle !== undefined;
}

/**
 * Describes a base repository which objects do have an assigned agenda item.
 */
export interface AgendaItemContentObjectRepository<
    V extends BaseViewModel & HasAgendaItem,
    M extends BaseModel & HasAgendaItemId
> extends BaseMeetingRelatedRepository<V, M> {
    getAgendaListTitle: (viewModel: V) => AgendaListTitle;
    getAgendaSlideTitle: (viewModel: V) => string;
}

/**
 * The base repository for objects with an agenda item.
 */
export abstract class BaseAgendaItemContentObjectRepository<
        V extends BaseViewModel & HasAgendaItem,
        M extends BaseModel & HasAgendaItemId
    >
    extends BaseMeetingRelatedRepository<V, M>
    implements AgendaItemContentObjectRepository<V, M>
{
    protected agendaItemRepo: AgendaItemRepositoryService;

    public constructor(baseModelCtor: ModelConstructor<M>) {
        super(baseModelCtor);
        const injector = AppInjector.getInjector();
        this.agendaItemRepo = injector.get(AgendaItemRepositoryService);
    }

    /**
     * @returns the agenda title for the agenda item list. Should
     * be `<item number> · <title> (<type>)`. E.g. `7 · the is an election (Election)`.
     */
    public getAgendaListTitle(viewModel: V): AgendaListTitle {
        // Return the agenda title with the model's verbose name appended
        const numberPrefix = this.agendaItemRepo.getItemNumberPrefix(viewModel);
        const title = numberPrefix + this.getTitle(viewModel) + ` (` + this.getVerboseName() + `)`;
        return { title };
    }

    /**
     * @returns the agenda title for the item slides
     */
    public getAgendaSlideTitle(viewModel: V): string {
        return this.getTitle(viewModel);
    }

    /**
     * Adds the agenda titles to the viewmodel.
     */
    protected override createViewModel(model: M): V {
        const viewModel = super.createViewModel(model);
        viewModel.getAgendaListTitle = () => this.getAgendaListTitle(viewModel);
        viewModel.getAgendaSlideTitle = () => this.getAgendaSlideTitle(viewModel);
        return viewModel;
    }
}
