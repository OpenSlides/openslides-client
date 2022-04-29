import { Injectable } from '@angular/core';
import { GlobalAccountServiceModule } from '../global-account-service.module';
import { ParticipantRepositoryService } from 'src/app/gateways/repositories/participants/participant-repository.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';

@Injectable({
    providedIn: GlobalAccountServiceModule
})
export class GlobalAccountService {
    public constructor(private participantRepo: ParticipantRepositoryService) {}

    public async setPresent(isPresent: boolean, user: ViewUser): Promise<void> {
        await this.participantRepo.setPresent(isPresent, user).resolve();
    }
}
