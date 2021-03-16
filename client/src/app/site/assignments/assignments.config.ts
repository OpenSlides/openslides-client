import { AppConfig } from '../../core/definitions/app-config';
import { Permission } from 'app/core/core-services/permission';
import { AssignmentCandidateRepositoryService } from 'app/core/repositories/assignments/assignment-candidate-repository.service';
import { AssignmentRepositoryService } from 'app/core/repositories/assignments/assignment-repository.service';
import { AssignmentCandidate } from 'app/shared/models/assignments/assignment-candidate';
import { Assignment } from '../../shared/models/assignments/assignment';
import { ViewAssignment } from './models/view-assignment';
import { ViewAssignmentCandidate } from './models/view-assignment-candidate';

export const AssignmentsAppConfig: AppConfig = {
    name: 'assignments',
    models: [
        {
            model: Assignment,
            viewModel: ViewAssignment,
            searchOrder: 3,
            repository: AssignmentRepositoryService
        },
        {
            model: AssignmentCandidate,
            viewModel: ViewAssignmentCandidate,
            repository: AssignmentCandidateRepositoryService
        }
    ],
    mainMenuEntries: [
        {
            route: '/assignments',
            displayName: 'Elections',
            icon: 'how_to_vote',
            weight: 400,
            permission: Permission.assignmentsCanSee
        }
    ]
};
