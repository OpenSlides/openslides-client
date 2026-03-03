import { Component, Inject, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Id, Ids } from 'src/app/domain/definitions/key-types';
import { GetForwardingMeetingsPresenter, GetForwardingMeetingsPresenterMeeting } from 'src/app/gateways/presenter';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
import { OrganizationSettingsService } from 'src/app/site/pages/organization/services/organization-settings.service';

import { ViewMotion } from '../../../../view-models';

export interface MotionForwardDialogReturnData {
    meetingIds: Ids;
    useOriginalSubmitter: boolean;
    useOriginalNumber: boolean;
    useOriginalVersion: boolean;
    withAttachments: boolean;
    markAmendmentsAsForwarded: boolean;
}

@Component({
    selector: `os-motion-forward-dialog`,
    templateUrl: `./motion-forward-dialog.component.html`,
    styleUrls: [`./motion-forward-dialog.component.scss`],
    standalone: false
})
export class MotionForwardDialogComponent implements OnInit {
    public get committeesObservable(): Observable<GetForwardingMeetingsPresenter[]> {
        return this.committeesSubject;
    }

    public readonly checkboxStateMap: Record<string, boolean> = {};
    public selectedMeetings = new Set<Id>();

    public get activeMeetingCommitteeName(): string {
        return this.activeMeeting.meeting?.committee?.name;
    }

    public useOriginalSubmitter = false;
    public useOriginalNumber = false;
    public useOriginalVersion = false;
    public withAttachments = false;
    public markAmendmentsAsForwarded = false;
    public disableForwardWithAttachments = false;

    public get numAmendments(): number {
        return this.data.motion.reduce((acc, curr) => acc + (curr.amendment_ids?.length || 0), 0);
    }

    public get tableRows(): string[] {
        if (
            !this.disableForwardWithAttachments &&
            (this.data.motion.length > 1 || (this.data.motion.length === 1 && this.data.motion[0].hasAttachments()))
        ) {
            return [`motion_version`, `submitter`, `identifier`, `attachments`, `meeting`];
        } else {
            return [`motion_version`, `submitter`, `identifier`, `meeting`];
        }
    }

    private readonly committeesSubject = new BehaviorSubject<GetForwardingMeetingsPresenter[]>([]);

    public constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: { motion: ViewMotion[]; forwardingMeetings: GetForwardingMeetingsPresenter[] },
        private dialogRef: MatDialogRef<MotionForwardDialogComponent, MotionForwardDialogReturnData>,
        private activeMeeting: ActiveMeetingService,
        private organisationSettings: OrganizationSettingsService,
        private translate: TranslateService
    ) {}

    public async ngOnInit(): Promise<void> {
        for (const committee of this.data.forwardingMeetings) {
            committee.meetings = this.getMeetingsSorted(committee);
        }
        this.committeesSubject.next(this.data.forwardingMeetings);
        this.selectedMeetings = new Set();
        this.initStateMap();
        this.disableForwardWithAttachments = this.organisationSettings.instant(`disable_forward_with_attachments`);
    }

    private getMeetingsSorted(committee: GetForwardingMeetingsPresenter): GetForwardingMeetingsPresenterMeeting[] {
        return committee.meetings.sort((a, b) => {
            const a_end_time = Date.parse(a.end_time);
            const b_end_time = Date.parse(b.end_time);
            const end_time = b_end_time - a_end_time;
            if (Number.isNaN(end_time)) {
                if (b_end_time) {
                    return b_end_time;
                } else if (a_end_time) {
                    return -a_end_time;
                }
                return a.name.localeCompare(b.name);
            } else if (end_time === 0) {
                return a.name.localeCompare(b.name);
            }
            return end_time;
        });
    }

    public onSaveClicked(): void {
        this.dialogRef.close({
            meetingIds: Array.from(this.selectedMeetings),
            useOriginalSubmitter: this.useOriginalSubmitter,
            useOriginalNumber: this.useOriginalNumber,
            useOriginalVersion: this.useOriginalVersion,
            withAttachments: this.disableForwardWithAttachments ? undefined : this.withAttachments,
            markAmendmentsAsForwarded: this.markAmendmentsAsForwarded && this.useOriginalVersion
        });
    }

    public onChangeCheckbox({ source, checked }: MatCheckboxChange): void {
        const fn = checked ? `add` : `delete`;
        this.selectedMeetings[fn](+source.value);
    }

    public isActiveMeeting(meeting: GetForwardingMeetingsPresenterMeeting): boolean {
        return +meeting.id === this.activeMeeting.meetingId;
    }

    public hasAlreadyBeenForwardedTo(meeting: GetForwardingMeetingsPresenterMeeting): boolean {
        if (this.data.motion.length === 1) {
            return this.data.motion[0].derived_motions?.map(motion => motion.meeting_id).includes(+meeting.id) ?? false;
        }
        return false;
    }

    public showActiveMeetingName(): string {
        return this.activeMeeting?.meeting?.name;
    }

    private initStateMap(): void {
        const meetings = this.committeesSubject.value.flatMap(committee => committee.meetings)!;
        for (const meeting of meetings) {
            this.checkboxStateMap[meeting!.id] = this.selectedMeetings.has(+meeting!.id);
        }
    }

    public amendmentNumber(): number {
        return this.data.motion.filter(motion => !!motion.isAmendment()).length;
    }

    public hasAnyAmendment(): boolean {
        const hasAmend: (element: ViewMotion) => boolean = element => element.amendments.length > 0;
        return this.data.motion.some(hasAmend);
    }

    public getSubmitterOrDeletedUser(submitter: string): string {
        return submitter ?? this.translate.instant(`Deleted user`);
    }
}
