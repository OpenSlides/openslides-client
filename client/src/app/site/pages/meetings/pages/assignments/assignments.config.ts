import { Permission } from '@app/domain/definitions/permission';
import { Assignment } from '@app/domain/models/assignments/assignment';
import { AssignmentCandidate } from '@app/domain/models/assignments/assignment-candidate';
import { AssignmentCandidateRepositoryService } from '@app/gateways/repositories/assignments/assignment-candidate-repository.service';
import { AssignmentRepositoryService } from '@app/gateways/repositories/assignments/assignment-repository.service';
import { AppConfig } from '@app/infrastructure/definitions/app-config';

import { ViewAssignment, ViewAssignmentCandidate } from './view-models';

export const AssignmentsAppConfig: AppConfig = {
    name: `assignments`,
    models: [
        {
            model: Assignment,
            viewModel: ViewAssignment,
            repository: AssignmentRepositoryService
        },
        {
            model: AssignmentCandidate,
            viewModel: ViewAssignmentCandidate,
            repository: AssignmentCandidateRepositoryService
        }
    ],
    meetingMenuMentries: [
        {
            route: `assignments`,
            displayName: `Elections`,
            icon: `how_to_vote`,
            weight: 400,
            permission: Permission.assignmentCanSee
        }
    ]
};
