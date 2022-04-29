import { Permission } from 'src/app/domain/definitions/permission';
import { AgendaItem } from 'src/app/domain/models/agenda/agenda-item';
import { ListOfSpeakers } from 'src/app/domain/models/list-of-speakers/list-of-speakers';
import { Speaker } from 'src/app/domain/models/speakers/speaker';
import { Topic } from 'src/app/domain/models/topics/topic';
import { AgendaItemRepositoryService } from 'src/app/gateways/repositories/agenda';
import { ListOfSpeakersRepositoryService } from 'src/app/gateways/repositories/list-of-speakers/list-of-speakers-repository.service';
import { SpeakerRepositoryService } from 'src/app/gateways/repositories/speakers/speaker-repository.service';
import { TopicRepositoryService } from 'src/app/gateways/repositories/topics/topic-repository.service';
import { AppConfig } from 'src/app/infrastructure/definitions/app-config';
import { ViewListOfSpeakers, ViewSpeaker, ViewTopic } from './modules';
import { ViewAgendaItem } from './view-models';

export const AgendaAppConfig: AppConfig = {
    name: `agenda`,
    models: [
        { model: AgendaItem, viewModel: ViewAgendaItem, repository: AgendaItemRepositoryService },
        {
            model: Topic,
            viewModel: ViewTopic,
            repository: TopicRepositoryService
        },
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
    meetingMenuMentries: [
        {
            route: `agenda`,
            displayName: `Agenda`,
            icon: `today`, // 'calendar_today' aligns wrong!
            weight: 200,
            permission: Permission.agendaItemCanSee
        }
    ]
};
