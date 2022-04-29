import { AppConfig } from '../../../../../infrastructure/definitions/app-config';
import { Committee } from '../../../../../domain/models/comittees/committee';
import { ViewCommittee } from './view-models/view-committee';
import { CommitteeRepositoryService } from '../../../../../gateways/repositories/committee-repository.service';
export const CommitteesAppConfig: AppConfig = {
    name: `committee`,
    models: [
        {
            model: Committee,
            viewModel: ViewCommittee,
            repository: CommitteeRepositoryService
        }
    ]
};
