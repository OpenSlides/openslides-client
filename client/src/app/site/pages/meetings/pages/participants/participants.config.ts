import { Permission } from '@app/domain/definitions/permission';
import { StructureLevel } from '@app/domain/models/structure-levels/structure-level';
import { Group } from '@app/domain/models/users/group';
import { User } from '@app/domain/models/users/user';
import { GroupRepositoryService } from '@app/gateways/repositories/groups';
import { StructureLevelRepositoryService } from '@app/gateways/repositories/structure-levels';
import { UserRepositoryService } from '@app/gateways/repositories/users';
import { AppConfig } from '@app/infrastructure/definitions/app-config';

import { ViewUser } from '../../view-models/view-user';
import { ViewGroup } from './modules';
import { ViewStructureLevel } from './pages/structure-levels/view-models';

export const ParticipantsAppConfig: AppConfig = {
    name: `users`,
    models: [
        {
            model: User,
            viewModel: ViewUser,
            repository: UserRepositoryService
        },
        { model: Group, viewModel: ViewGroup, repository: GroupRepositoryService },
        { model: StructureLevel, viewModel: ViewStructureLevel, repository: StructureLevelRepositoryService }
    ],
    meetingMenuMentries: [
        {
            route: `participants`,
            displayName: `Participants`,
            icon: `people`,
            weight: 500,
            permission: Permission.userCanSee
        }
    ]
};
