import { Committee } from '../../../../../domain/models/comittees/committee';
import { CommitteeRepositoryService } from '../../../../../gateways/repositories/committee-repository.service';
import { AppConfig } from '../../../../../infrastructure/definitions/app-config';
import { ViewCommittee } from './view-models/view-committee';
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
