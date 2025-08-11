import { Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { CML, OML } from 'src/app/domain/definitions/organization-permission';
import { MeetingControllerService } from 'src/app/site/pages/meetings/services/meeting-controller.service';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { ORGANIZATION_ID } from 'src/app/site/pages/organization/services/organization.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { ViewCommittee } from '../../view-models';
import { MeetingService } from '../services/meeting.service';

@Component({
    selector: `os-committee-meeting-preview`,
    templateUrl: `./committee-meeting-preview.component.html`,
    styleUrls: [`./committee-meeting-preview.component.scss`],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class CommitteeMeetingPreviewComponent implements OnDestroy, OnInit {
    @Input() public meeting!: ViewMeeting;
    @Input() public committee!: ViewCommittee;
    @Input() public isCMAndRequireDuplicateFrom!: boolean;

    public readonly OML = OML;
    public readonly CML = CML;

    public get title(): string {
        return this.meeting?.name || ``;
    }

    public get location(): string {
        return this.meeting?.location || ``;
    }

    public get description(): string {
        return this.meeting?.description || ``;
    }

    public get shouldUseSmallerBadgeText(): boolean {
        return this.userAmount > 9999;
    }

    public get userAmount(): number {
        return this.meeting?.user_ids?.length || 0;
    }

    public get formattedUserAmount(): string {
        return this.userAmount < 1000 ? `${this.userAmount}` : `>${Math.floor(this.userAmount / 1000)}k`;
    }

    public get showUserAmount(): boolean {
        return (this.userAmount > 0 && this.userAmount < 100000) || false;
    }

    public get isTemplateMeeting(): boolean {
        return this.meeting.template_for_organization_id === ORGANIZATION_ID;
    }

    public get canEnter(): boolean {
        return (
            (this.operator.isInMeetingIds(this.meeting.id) && this.meeting.canBeEnteredBy(this.operator.user)) ||
            this.operator.hasCommitteePermissions(this.meeting.committee_id, CML.can_manage)
        );
    }

    public get isLockedFromInside(): boolean {
        return this.meeting?.locked_from_inside;
    }

    public get canEditMeetingSetting(): boolean {
        return this._canEditMeetingSetting;
    }

    private _canEditMeetingSetting = true;
    private _canEditMeetingSubscription: Subscription;

    public constructor(
        private translate: TranslateService,
        private meetingRepo: MeetingControllerService,
        private meetingService: MeetingService,
        private promptService: PromptService,
        public operator: OperatorService
    ) {}

    /**
     * Get the subject
     */
    public ngOnInit(): void {
        this._canEditMeetingSubscription = this.operator.operatorUpdated.subscribe(() => {
            if (this.isLockedFromInside && !this.operator.isSuperAdmin) {
                this._canEditMeetingSetting = this.meeting.canEditMeetingSetting(this.operator.user);
            } else {
                this._canEditMeetingSetting = true;
            }
        });
    }

    /**
     * clear the Subscriptions
     */
    public ngOnDestroy(): void {
        if (this._canEditMeetingSubscription) {
            this._canEditMeetingSubscription.unsubscribe();
            this._canEditMeetingSubscription = null;
        }
    }

    public async onArchive(): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to archive this meeting?`);
        const content = this.translate.instant(`Attention: This action cannot be undone!`);

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
            await this.meetingRepo.duplicate({ meeting_id: this.meeting.id }).resolve();
        }
    }

    public async onDeleteMeeting(): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to delete this meeting?`);
        const content = this.title;
        const confirm = this.translate.instant(`Yes, delete`);
        const decline = ``;
        const deletion = true;

        const confirmed = await this.promptService.open(title, content, confirm, decline, deletion);
        if (confirmed) {
            await this.meetingRepo.delete(this.meeting);
        }
    }

    public async toggleTemplateMeeting(): Promise<void> {
        let content = this.title;

        if (this.isTemplateMeeting) {
            const title = this.translate.instant(
                `Do you really want to stop sharing this meeting as a public template?`
            );

            const confirmed = await this.promptService.open(title, content);
            if (confirmed) {
                await this.meetingRepo.update({ set_as_template: false }, { meeting: this.meeting });
            }
        } else {
            const title = this.translate.instant(
                `Do you really want to make available this meeting as a public template?`
            );
            content = this.translate.instant(
                `Meeting templates and the data they contain are publicly viewable by all committee administrators.`
            );

            const confirmed = await this.promptService.open(title, content);
            if (confirmed) {
                await this.meetingRepo.update({ set_as_template: true }, { meeting: this.meeting });
            }
        }
    }

    public changeToMeetingUsers(): void {
        this.meetingService.navigateToMeetingUsers(this.meeting);
    }

    public exportMeeting(): void {
        this.meetingService.exportMeeting(this.meeting);
    }
}
