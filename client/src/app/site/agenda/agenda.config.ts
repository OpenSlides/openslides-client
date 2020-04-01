import { AgendaItem } from '../../shared/models/agenda/agenda-item';
import { AppConfig } from '../../core/definitions/app-config';
import { Permission } from 'app/core/core-services/operator.service';
import { AgendaItemRepositoryService } from 'app/core/repositories/agenda/agenda-item-repository.service';
import { ListOfSpeakersRepositoryService } from 'app/core/repositories/agenda/list-of-speakers-repository.service';
import { ListOfSpeakers } from 'app/shared/models/agenda/list-of-speakers';
import { ViewAgendaItem } from './models/view-agenda-item';
import { ViewListOfSpeakers } from './models/view-list-of-speakers';

export const AgendaAppConfig: AppConfig = {
    name: 'agenda',
    models: [
        { model: AgendaItem, viewModel: ViewAgendaItem, repository: AgendaItemRepositoryService },
        {
            model: ListOfSpeakers,
            viewModel: ViewListOfSpeakers,
            repository: ListOfSpeakersRepositoryService
        }
    ],
    mainMenuEntries: [
        {
            route: '/agenda',
            displayName: 'Agenda',
            icon: 'today', // 'calendar_today' aligns wrong!
            weight: 200,
            permission: Permission.agendaCanSee
        }
    ]
};
