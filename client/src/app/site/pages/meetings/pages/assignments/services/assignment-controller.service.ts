import { Injectable } from '@angular/core';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { ViewAssignment } from 'src/app/site/pages/meetings/pages/assignments';
import { Assignment } from 'src/app/domain/models/assignments/assignment';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';
import { AssignmentRepositoryService } from 'src/app/gateways/repositories/assignments/assignment-repository.service';
import { Identifiable } from 'src/app/domain/interfaces';
import { AssignmentCommonServiceModule } from './assignment-common-service.module';

@Injectable({ providedIn: AssignmentCommonServiceModule })
export class AssignmentControllerService extends BaseMeetingControllerService<ViewAssignment, Assignment> {
    constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: AssignmentRepositoryService
    ) {
        super(controllerServiceCollector, Assignment, repo);
    }

    public create(assignment: any): Promise<Identifiable> {
        return this.repo.create(assignment);
    }

    public update(update: any, assignment: ViewAssignment): Promise<void> {
        return this.repo.update(update, assignment);
    }

    public delete(...assignments: ViewAssignment[]): Promise<void> {
        return this.repo.delete(...assignments);
    }
}
