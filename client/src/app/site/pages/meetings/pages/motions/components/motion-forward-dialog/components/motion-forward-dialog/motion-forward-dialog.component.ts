import { Component, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import {
    GetForwardingMeetingsPresenter,
    GetForwardingMeetingsPresenterMeeting,
    GetForwardingMeetingsPresenterService
} from 'src/app/gateways/presenter';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
import { MeetingControllerService } from 'src/app/site/pages/meetings/services/meeting-controller.service';

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

    private readonly committeesSubject = new BehaviorSubject<GetForwardingMeetingsPresenter[]>([]);

    public constructor(
        private dialogRef: MatDialogRef<MotionForwardDialogComponent, Id[]>,
        private presenter: GetForwardingMeetingsPresenterService,
        private activeMeeting: ActiveMeetingService,
        private meetingController: MeetingControllerService
    ) {}

    public async ngOnInit(): Promise<void> {
        const result = await this.presenter.call({ meeting_id: this.activeMeeting.meetingId! });
        this.committeesSubject.next(result);
        this.selectedMeetings = new Set(this.getDefaultMeetingsIds());
        this.initStateMap();
    }

    public onSaveClicked(): void {
        this.dialogRef.close(Array.from(this.selectedMeetings));
    }

    public onChangeCheckbox({ source, checked }: MatCheckboxChange): void {
        const fn = checked ? `add` : `delete`;
        this.selectedMeetings[fn](+source.value);
    }

    public isDefaultMeetingFor(
        meeting: GetForwardingMeetingsPresenterMeeting,
        committee: GetForwardingMeetingsPresenter
    ): boolean {
        return +meeting.id === committee.default_meeting_id;
    }

    public isActiveMeeting(meeting: GetForwardingMeetingsPresenterMeeting): boolean {
        return +meeting.id === this.activeMeeting.meetingId;
    }

    private initStateMap(): void {
        const meetings = this.committeesSubject.value.flatMap(committee => committee.meetings)!;
        for (const meeting of meetings) {
            this.checkboxStateMap[meeting!.id] = this.selectedMeetings.has(+meeting!.id);
        }
    }

    private getDefaultMeetingsIds(): Id[] {
        const committees = this.committeesSubject.value;
        return committees
            .filter(
                committee =>
                    committee.default_meeting_id && committee.default_meeting_id !== this.activeMeeting.meetingId
            )
            .map(committee => committee.default_meeting_id!);
    }
}
