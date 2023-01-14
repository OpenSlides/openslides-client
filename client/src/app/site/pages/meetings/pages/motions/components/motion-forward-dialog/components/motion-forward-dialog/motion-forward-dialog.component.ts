import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyCheckboxChange as MatCheckboxChange } from '@angular/material/legacy-checkbox';
import {
    MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
    MatLegacyDialogRef as MatDialogRef
} from '@angular/material/legacy-dialog';
import { BehaviorSubject, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { GetForwardingMeetingsPresenter, GetForwardingMeetingsPresenterMeeting } from 'src/app/gateways/presenter';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';

import { ViewMotion } from '../../../../view-models';

@Component({
    selector: `os-motion-forward-dialog`,
    templateUrl: `./motion-forward-dialog.component.html`,
    styleUrls: [`./motion-forward-dialog.component.scss`]
})
export class MotionForwardDialogComponent implements OnInit {
    public get committeesObservable(): Observable<GetForwardingMeetingsPresenter[]> {
        return this.committeesSubject.asObservable();
    }

    public readonly checkboxStateMap: { [id: string]: boolean } = {};
    public selectedMeetings: Set<Id> = new Set();

    public get activeMeetingCommitteeName(): string {
        return this.activeMeeting.meeting?.committee?.name;
    }

    private readonly committeesSubject = new BehaviorSubject<GetForwardingMeetingsPresenter[]>([]);

    public constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: { motion: ViewMotion[]; forwardingMeetings: GetForwardingMeetingsPresenter[] },
        private dialogRef: MatDialogRef<MotionForwardDialogComponent, Id[]>,
        private activeMeeting: ActiveMeetingService
    ) {}

    public async ngOnInit(): Promise<void> {
        this.committeesSubject.next(this.data.forwardingMeetings);
        this.selectedMeetings = new Set();
        this.initStateMap();
    }

    public onSaveClicked(): void {
        this.dialogRef.close(Array.from(this.selectedMeetings));
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

    private initStateMap(): void {
        const meetings = this.committeesSubject.value.flatMap(committee => committee.meetings)!;
        for (const meeting of meetings) {
            this.checkboxStateMap[meeting!.id] = this.selectedMeetings.has(+meeting!.id);
        }
    }
}
