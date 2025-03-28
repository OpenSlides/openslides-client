import { Component, Inject, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';
import { Id, Ids } from 'src/app/domain/definitions/key-types';
import { GetForwardingMeetingsPresenter, GetForwardingMeetingsPresenterMeeting } from 'src/app/gateways/presenter';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';

import { ViewMotion } from '../../../../view-models';

export interface MotionForwardDialogReturnData {
    meetingIds: Ids;
    useOriginalSubmitter: boolean;
    useOriginalNumber: boolean;
    useOriginalVersion: boolean;
}

@Component({
    selector: `os-motion-forward-dialog`,
    templateUrl: `./motion-forward-dialog.component.html`,
    styleUrls: [`./motion-forward-dialog.component.scss`]
})
export class MotionForwardDialogComponent implements OnInit {
    public get committeesObservable(): Observable<GetForwardingMeetingsPresenter[]> {
        return this.committeesSubject;
    }

    public readonly checkboxStateMap: { [id: string]: boolean } = {};
    public selectedMeetings: Set<Id> = new Set();

    public get activeMeetingCommitteeName(): string {
        return this.activeMeeting.meeting?.committee?.name;
    }

    public useOriginalSubmitter = true;
    public useOriginalNumber = true;
    public useOriginalVersion = true;

    public get numAmendments(): number {
        return this.data.motion.reduce((acc, curr) => acc + (curr.amendment_ids?.length || 0), 0);
    }

    private readonly committeesSubject = new BehaviorSubject<GetForwardingMeetingsPresenter[]>([]);

    public constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: { motion: ViewMotion[]; forwardingMeetings: GetForwardingMeetingsPresenter[] },
        private dialogRef: MatDialogRef<MotionForwardDialogComponent, MotionForwardDialogReturnData>,
        private activeMeeting: ActiveMeetingService
    ) {}

    public async ngOnInit(): Promise<void> {
        this.committeesSubject.next(this.data.forwardingMeetings);
        this.selectedMeetings = new Set();
        this.initStateMap();
    }

    public onSaveClicked(): void {
        this.dialogRef.close({
            meetingIds: Array.from(this.selectedMeetings),
            useOriginalSubmitter: this.useOriginalSubmitter,
            useOriginalNumber: this.useOriginalNumber,
            useOriginalVersion: this.useOriginalVersion
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
}
