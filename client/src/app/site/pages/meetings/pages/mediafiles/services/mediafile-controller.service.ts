import { inject, Service } from '@angular/core';
import { Id } from '@app/domain/definitions/key-types';
import { Identifiable } from '@app/domain/interfaces';
import { Mediafile } from '@app/domain/models/mediafiles/mediafile';
import { MediafileRepositoryService } from '@app/gateways/repositories/mediafiles/mediafile-repository.service';
import { BaseController } from '@app/site/base/base-controller';
import { MeetingControllerServiceCollectorService } from '@app/site/pages/meetings/services/meeting-controller-service-collector.service';
import { ORGANIZATION_ID } from '@app/site/pages/organization/services/organization.service';
import { OperatorService } from '@app/site/services/operator.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ActiveMeetingService } from '../../../services/active-meeting.service';
import { ViewMediafile } from '../view-models';

@Service()
export class MediafileControllerService extends BaseController<ViewMediafile, Mediafile> {
    protected override controllerServiceCollector: MeetingControllerServiceCollectorService;
    protected override repo: MediafileRepositoryService;
    private operator = inject(OperatorService);
    private activeMeeting = inject(ActiveMeetingService);

    public constructor() {
        const controllerServiceCollector = inject(MeetingControllerServiceCollectorService);
        const repo = inject(MediafileRepositoryService);
        super(controllerServiceCollector, Mediafile, repo);
        this.controllerServiceCollector = controllerServiceCollector;
        this.repo = repo;
    }

    public move(files: Identifiable[], directoryId: Id | null): Promise<void> {
        return this.repo.move(files, directoryId);
    }

    public publish(file: Identifiable, publish: boolean): Promise<void> {
        return this.repo.publish(file, publish);
    }

    public createDirectory(mediafile: Partial<Mediafile> & { access_group_ids: Id[] }): Promise<Identifiable> {
        return this.repo.createDirectory(mediafile);
    }

    public createFile(mediafile: any): Promise<Identifiable> {
        return this.repo.uploadFile(mediafile);
    }

    public update(update: any, mediafile: Identifiable): Promise<void> {
        return this.repo.update(update, mediafile);
    }

    public delete(...files: Identifiable[]): Promise<void> {
        return this.repo.delete(...files);
    }

    public getDirectoryObservable(parentId: Id | null): Observable<ViewMediafile[]> {
        return this.getViewModelListObservable().pipe(
            map(mediafiles =>
                mediafiles.filter(mediafile => {
                    const meetingMediafile = this.repo.getMeetingMediafile(mediafile, this.activeMeeting.meetingId);
                    if (meetingMediafile) {
                        if (
                            (meetingMediafile?.access_group_ids?.length &&
                                !this.operator.isInGroupIds(...meetingMediafile.access_group_ids)) ||
                            (meetingMediafile?.inherited_access_group_ids?.length &&
                                !this.operator.isInGroupIds(...meetingMediafile.inherited_access_group_ids))
                        ) {
                            return false;
                        }
                    } else if (
                        this.activeMeeting.meetingId &&
                        (mediafile.published_to_meetings_in_organization_id !== ORGANIZATION_ID ||
                            !(
                                this.operator.isMeetingAdmin ||
                                this.operator.isOrgaManager ||
                                this.operator.isCommitteeManager
                            ))
                    ) {
                        return false;
                    }

                    // instead of being null or undefined, for the root dir
                    // mediafile.parent_id is simply not the in object
                    if (!mediafile.parent_id && !parentId) {
                        return true;
                    } else {
                        return mediafile.parent_id === parentId;
                    }
                })
            )
        );
    }

    public getDirectoryList(): ViewMediafile[] {
        return this.getViewModelList().filter(file => file.is_directory);
    }

    public getDirectoryListObservable(): Observable<ViewMediafile[]> {
        return this.getViewModelListObservable().pipe(map(files => files.filter(file => file.is_directory)));
    }
}
