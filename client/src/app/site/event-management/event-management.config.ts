import { AppConfig } from '../../core/definitions/app-config';
import { CommitteeRepositoryService } from 'app/core/repositories/event-management/committee-repository.service';
import { MeetingRepositoryService } from 'app/core/repositories/event-management/meeting-repository.service';
import { OrganisationRepositoryService } from 'app/core/repositories/event-management/organisation-repository.service';
import { ResourceRepositoryService } from 'app/core/repositories/event-management/resource-repository.service';
import { RoleRepositoryService } from 'app/core/repositories/event-management/role-repository.service';
import { Committee } from 'app/shared/models/event-management/committee';
import { Meeting } from 'app/shared/models/event-management/meeting';
import { Organisation } from 'app/shared/models/event-management/organisation';
import { Resource } from 'app/shared/models/event-management/resource';
import { Role } from 'app/shared/models/event-management/role';
import { ViewCommittee } from './models/view-committee';
import { ViewMeeting } from './models/view-meeting';
import { ViewOrganisation } from './models/view-organisation';
import { ViewResource } from './models/view-resource';
import { ViewRole } from './models/view-role';

export const EventManagementAppConfig: AppConfig = {
    name: 'event-management',
    models: [
        {
            model: Meeting,
            viewModel: ViewMeeting,
            repository: MeetingRepositoryService
        },
        {
            model: Organisation,
            viewModel: ViewOrganisation,
            repository: OrganisationRepositoryService
        },
        {
            model: Role,
            viewModel: ViewRole,
            repository: RoleRepositoryService
        },
        {
            model: Committee,
            viewModel: ViewCommittee,
            repository: CommitteeRepositoryService
        },
        {
            model: Resource,
            viewModel: ViewResource,
            repository: ResourceRepositoryService
        }
    ]
};
