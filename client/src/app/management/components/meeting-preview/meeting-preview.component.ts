import { Component, Input, ViewEncapsulation } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { CML } from 'app/core/core-services/organization-permission';
import { MeetingRepositoryService } from 'app/core/repositories/management/meeting-repository.service';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { ViewMeeting } from 'app/management/models/view-meeting';

@Component({
    selector: 'os-meeting-preview',
    templateUrl: './meeting-preview.component.html',
    styleUrls: ['./meeting-preview.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class MeetingPreviewComponent {
    public readonly CML = CML;

    @Input() public meeting: ViewMeeting = null;
    @Input() public committeeId: number = null;

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
        return this.meeting?.user_ids.length;
    }

    public get showUserAmount(): boolean {
        return (this.userAmount > 0 && this.userAmount < 1000) || false;
    }

    public constructor(
        private translate: TranslateService,
        private meetingRepo: MeetingRepositoryService,
        private promptService: PromptService
    ) {}

    public async onArchive(): Promise<void> {
        const title = `${this.translate.instant('Archive meeting')} "${this.title}"`;
        const content = this.translate.instant('Are you sure you want to archive this meeting?');

        const confirmed = await this.promptService.open(title, content);
        if (confirmed) {
            /**
             * seems archive was not yet implemented
             */
            // await this.meetingRepo.archive(this.meeting);
        }
    }

    public async onDuplicate(): Promise<void> {
        const title = `${this.translate.instant('Duplicate meeting')} "${this.title}"`;
        const content = this.translate.instant('Are you sure you want to duplicate this meeting?');

        const confirmed = await this.promptService.open(title, content);
        if (confirmed) {
            /**
             * seems duplicate was not yet implemented
             */
            // await this.meetingRepo.duplicate(this.meeting);
        }
    }

    public async onDeleteMeeting(): Promise<void> {
        const title = `${this.translate.instant('Delete meeting')} "${this.title}"`;
        const content = this.translate.instant('Are you sure you want to delete this meeting?');

        const confirmed = await this.promptService.open(title, content);
        if (confirmed) {
            await this.meetingRepo.delete(this.meeting);
        }
    }
}
