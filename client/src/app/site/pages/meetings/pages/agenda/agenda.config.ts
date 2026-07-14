import { Permission } from '@app/domain/definitions/permission';
import { AgendaItem } from '@app/domain/models/agenda/agenda-item';
import { ListOfSpeakers } from '@app/domain/models/list-of-speakers/list-of-speakers';
import { PointOfOrderCategory } from '@app/domain/models/point-of-order-category/point-of-order-category';
import { Speaker } from '@app/domain/models/speakers/speaker';
import { StructureLevelListOfSpeakers } from '@app/domain/models/structure-levels/structure-level-list-of-speakers';
import { Topic } from '@app/domain/models/topics/topic';
import { AgendaItemRepositoryService } from '@app/gateways/repositories/agenda';
import { ListOfSpeakersRepositoryService } from '@app/gateways/repositories/list-of-speakers/list-of-speakers-repository.service';
import { PointOfOrderCategoryRepositoryService } from '@app/gateways/repositories/point-of-order-category/point-of-order-category-repository.service';
import { SpeakerRepositoryService } from '@app/gateways/repositories/speakers/speaker-repository.service';
import { StructureLevelListOfSpeakersRepositoryService } from '@app/gateways/repositories/structure-level-list-of-speakers';
import { TopicRepositoryService } from '@app/gateways/repositories/topics/topic-repository.service';
import { AppConfig } from '@app/infrastructure/definitions/app-config';

import { ViewStructureLevelListOfSpeakers } from '../participants/pages/structure-levels/view-models';
import { ViewListOfSpeakers, ViewSpeaker, ViewTopic } from './modules';
import { ViewPointOfOrderCategory } from './modules/list-of-speakers/view-models/view-point-of-order-category';
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
            model: StructureLevelListOfSpeakers,
            viewModel: ViewStructureLevelListOfSpeakers,
            repository: StructureLevelListOfSpeakersRepositoryService
        },
        {
            model: Speaker,
            viewModel: ViewSpeaker,
            repository: SpeakerRepositoryService
        },
        {
            model: PointOfOrderCategory,
            viewModel: ViewPointOfOrderCategory,
            repository: PointOfOrderCategoryRepositoryService
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
