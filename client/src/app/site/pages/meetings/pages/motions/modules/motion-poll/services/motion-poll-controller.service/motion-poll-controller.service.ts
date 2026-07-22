import { inject, Service } from '@angular/core';
import { Fqid } from '@app/domain/definitions/key-types';
import { PollRepositoryService } from '@app/gateways/repositories/polls/poll-repository.service';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls';

@Service()
export class MotionPollControllerService {
    private repo = inject(PollRepositoryService);

    public getViewModelList(): ViewPoll[] {
        return this.repo.getViewModelList().filter(poll => poll.isMotionPoll);
    }

    public getViewModelListByContentObject(fqid: Fqid): ViewPoll[] {
        return this.getViewModelList().filter(poll => poll.content_object_id === fqid);
    }
}
