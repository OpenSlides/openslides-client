import { Injectable } from '@angular/core';
import { Fqid } from '@app/domain/definitions/key-types';
import { PollRepositoryService } from '@app/gateways/repositories/polls/poll-repository.service';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls';

@Injectable({
    providedIn: `root`
})
export class MotionPollControllerService {
    public constructor(private repo: PollRepositoryService) {}

    public getViewModelList(): ViewPoll[] {
        return this.repo.getViewModelList().filter(poll => poll.isMotionPoll);
    }

    public getViewModelListByContentObject(fqid: Fqid): ViewPoll[] {
        return this.getViewModelList().filter(poll => poll.content_object_id === fqid);
    }
}
