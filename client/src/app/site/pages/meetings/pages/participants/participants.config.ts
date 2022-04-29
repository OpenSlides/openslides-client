import { Permission } from 'src/app/domain/definitions/permission';
import { Group } from 'src/app/domain/models/users/group';
import { User } from 'src/app/domain/models/users/user';
import { GroupRepositoryService } from 'src/app/gateways/repositories/groups';
import { UserRepositoryService } from 'src/app/gateways/repositories/users';
import { AppConfig } from 'src/app/infrastructure/definitions/app-config';
import { ViewUser } from '../../view-models/view-user';
import { ViewGroup } from './modules';

export const ParticipantsAppConfig: AppConfig = {
    name: `users`,
    models: [
        {
            model: User,
            viewModel: ViewUser,
            repository: UserRepositoryService
        },
        { model: Group, viewModel: ViewGroup, repository: GroupRepositoryService }
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
