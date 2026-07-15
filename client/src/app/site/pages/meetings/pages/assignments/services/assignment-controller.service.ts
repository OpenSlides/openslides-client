import { Injectable } from '@angular/core';
import { Assignment } from '@app/domain/models/assignments/assignment';
import { AssignmentRepositoryService } from '@app/gateways/repositories/assignments/assignment-repository.service';
import { CreateResponse } from '@app/gateways/repositories/base-repository';
import { BaseMeetingControllerService } from '@app/site/pages/meetings/base/base-meeting-controller.service';
import { ViewAssignment } from '@app/site/pages/meetings/pages/assignments';
import { MeetingControllerServiceCollectorService } from '@app/site/pages/meetings/services/meeting-controller-service-collector.service';

@Injectable({ providedIn: 'root' })
export class AssignmentControllerService extends BaseMeetingControllerService<ViewAssignment, Assignment> {
    public constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: AssignmentRepositoryService
    ) {
        super(controllerServiceCollector, Assignment, repo);
    }

    public create(assignment: any): Promise<CreateResponse> {
        return this.repo.create(assignment);
    }

    public update(update: any, assignment: ViewAssignment): Promise<void> {
        return this.repo.update(update, assignment);
    }

    public delete(...assignments: ViewAssignment[]): Promise<void> {
        return this.repo.delete(...assignments);
    }
}
