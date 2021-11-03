import { Permission } from 'app/core/core-services/permission';
import { AgendaItemRepositoryService } from 'app/core/repositories/agenda/agenda-item-repository.service';
import { ListOfSpeakersRepositoryService } from 'app/core/repositories/agenda/list-of-speakers-repository.service';
import { SpeakerRepositoryService } from 'app/core/repositories/agenda/speaker-repository.service';
import { ListOfSpeakers } from 'app/shared/models/agenda/list-of-speakers';
import { Speaker } from 'app/shared/models/agenda/speaker';

import { AppConfig } from '../../core/definitions/app-config';
import { AgendaItem } from '../../shared/models/agenda/agenda-item';
import { ViewAgendaItem } from './models/view-agenda-item';
import { ViewListOfSpeakers } from './models/view-list-of-speakers';
import { ViewSpeaker } from './models/view-speaker';

export const AgendaAppConfig: AppConfig = {
    name: `agenda`,
    models: [
        { model: AgendaItem, viewModel: ViewAgendaItem, repository: AgendaItemRepositoryService },
        {
            model: ListOfSpeakers,
            viewModel: ViewListOfSpeakers,
            repository: ListOfSpeakersRepositoryService
        },
        {
            model: Speaker,
            viewModel: ViewSpeaker,
            repository: SpeakerRepositoryService
        }
    ],
    mainMenuEntries: [
        {
            route: `agenda`,
            displayName: `Agenda`,
            icon: `today`, // 'calendar_today' aligns wrong!
            weight: 200,
            permission: Permission.agendaItemCanSee
        }
    ]
};
