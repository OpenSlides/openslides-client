import { Permission } from 'src/app/domain/definitions/permission';
import { Assignment } from 'src/app/domain/models/assignments/assignment';
import { AssignmentCandidate } from 'src/app/domain/models/assignments/assignment-candidate';
import { AssignmentCandidateRepositoryService } from 'src/app/gateways/repositories/assignments/assignment-candidate-repository.service';
import { AssignmentRepositoryService } from 'src/app/gateways/repositories/assignments/assignment-repository.service';
import { AppConfig } from 'src/app/infrastructure/definitions/app-config';
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
