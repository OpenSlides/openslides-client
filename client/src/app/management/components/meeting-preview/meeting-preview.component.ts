import { Component, Input, ViewEncapsulation } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { CML } from 'app/core/core-services/organization-permission';
import { MeetingRepositoryService } from 'app/core/repositories/management/meeting-repository.service';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { CommitteeRepositoryService } from '../../../core/repositories/management/committee-repository.service';
import { ViewCommittee } from '../../models/view-committee';
import { OML } from '../../../core/core-services/organization-permission';

@Component({
    selector: 'os-meeting-preview',
    templateUrl: './meeting-preview.component.html',
    styleUrls: ['./meeting-preview.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class MeetingPreviewComponent {
    public readonly CML = CML;
    public readonly OML = OML;

    @Input() public meeting: ViewMeeting = null;
    @Input() public committee: ViewCommittee | null = null;

    public get title(): string {
        return this.meeting?.name || '';
    }

    public get location(): string {
        return this.meeting?.location || '';
    }

    public get description(): string {
        return this.meeting?.description || '';
    }

    public get userAmount(): number {
        return this.meeting?.user_ids?.length || 0;
    }

    public get showUserAmount(): boolean {
        return (this.userAmount > 0 && this.userAmount < 1000) || false;
    }

    public get isDefaultMeeting(): boolean {
        return this.meeting.id === this.committee.default_meeting_id;
    }

    public constructor(
        private translate: TranslateService,
        private meetingRepo: MeetingRepositoryService,
        private committeeRepo: CommitteeRepositoryService,
        private promptService: PromptService
    ) {}

    public async onArchive(): Promise<void> {
        const title = this.translate.instant('Are you sure you want to archive this meeting?');
        const content = this.title;

        const confirmed = await this.promptService.open(title, content);
        if (confirmed) {
            await this.meetingRepo.archive(this.meeting);
        }
    }

    public async onUnarchive(): Promise<void> {
        const title = this.translate.instant('Are you sure you want to activate this meeting?');
        const content = this.title;

        const confirmed = await this.promptService.open(title, content);
        if (confirmed) {
            await this.meetingRepo.unarchive(this.meeting);
        }
    }

    public async onDuplicate(): Promise<void> {
        const title = this.translate.instant('Are you sure you want to duplicate this meeting?');
        const content = this.title;

        const confirmed = await this.promptService.open(title, content);
        if (confirmed) {
            await this.meetingRepo.duplicate(this.meeting);
        }
    }

    public async onDeleteMeeting(): Promise<void> {
        const title = this.translate.instant('Are you sure you want to delete this meeting?');
        const content = this.title;

        const confirmed = await this.promptService.open(title, content);
        if (confirmed) {
            await this.meetingRepo.delete(this.meeting);
        }
    }

    public async toggleDefaultMeeting(): Promise<void> {
        if (this.isDefaultMeeting) {
            await this.committeeRepo.update({ default_meeting_id: null }, this.committee);
        } else {
            await this.committeeRepo.update({ default_meeting_id: this.meeting.id }, this.committee);
        }
    }
}
