import { Component, Input, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ORGANIZATION_ID } from 'app/core/core-services/organization.service';
import { CML } from 'app/core/core-services/organization-permission';
import { MeetingRepositoryService } from 'app/core/repositories/management/meeting-repository.service';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { ViewMeeting } from 'app/management/models/view-meeting';

import { OperatorService } from '../../../core/core-services/operator.service';
import { OML } from '../../../core/core-services/organization-permission';
import { ViewCommittee } from '../../models/view-committee';
import { MeetingService } from '../../services/meeting.service';

@Component({
    selector: `os-meeting-preview`,
    templateUrl: `./meeting-preview.component.html`,
    styleUrls: [`./meeting-preview.component.scss`],
    encapsulation: ViewEncapsulation.None
})
export class MeetingPreviewComponent {
    public readonly CML = CML;
    public readonly OML = OML;

    @Input() public meeting: ViewMeeting = null;
    @Input() public committee: ViewCommittee | null = null;

    public get title(): string {
        return this.meeting?.name || ``;
    }

    public get location(): string {
        return this.meeting?.location || ``;
    }

    public get description(): string {
        return this.meeting?.description || ``;
    }

    public get userAmount(): number {
        return this.meeting?.user_ids?.length || 0;
    }

    public get showUserAmount(): boolean {
        return (this.userAmount > 0 && this.userAmount < 1000) || false;
    }

    public get isTemplateMeeting(): boolean {
        return this.meeting.template_for_organization_id === ORGANIZATION_ID;
    }

    public get canEnter(): boolean {
        return this.operator.isInMeetingIds(this.meeting.id);
    }

    public constructor(
        protected translate: TranslateService,
        private meetingRepo: MeetingRepositoryService,
        private promptService: PromptService,
        private meetingService: MeetingService,
        private operator: OperatorService
    ) {}

    public async onArchive(): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to archive this meeting?`);
        const content = this.translate.instant(`Attention: You can NOT be undone this action!`);

        const confirmed = await this.promptService.open(title, content);
        if (confirmed) {
            await this.meetingRepo.archive(this.meeting);
        }
    }

    public async onUnarchive(): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to activate this meeting?`);
        const content = this.title;

        const confirmed = await this.promptService.open(title, content);
        if (confirmed) {
            await this.meetingRepo.unarchive(this.meeting);
        }
    }

    public async onDuplicate(): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to duplicate this meeting?`);
        const content = this.title;

        const confirmed = await this.promptService.open(title, content);
        if (confirmed) {
            await this.meetingRepo.duplicate(this.meeting).resolve();
        }
    }

    public async onDeleteMeeting(): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to delete this meeting?`);
        const content = this.title;

        const confirmed = await this.promptService.open(title, content);
        if (confirmed) {
            await this.meetingRepo.delete(this.meeting);
        }
    }

    public async toggleTemplateMeeting(): Promise<void> {
        if (this.isTemplateMeeting) {
            await this.meetingRepo.update({ set_as_template: false }, this.meeting);
        } else {
            await this.meetingRepo.update({ set_as_template: true }, this.meeting);
        }
    }

    public changeToMeetingUsers(): void {
        this.meetingService.navigateToMeetingUsers(this.meeting);
    }
}
