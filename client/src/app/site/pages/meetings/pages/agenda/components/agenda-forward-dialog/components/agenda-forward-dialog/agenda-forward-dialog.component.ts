import { Component, Inject, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';
import { Id, Ids } from 'src/app/domain/definitions/key-types';
import { GetForwardingMeetingsPresenter, GetForwardingMeetingsPresenterMeeting } from 'src/app/gateways/presenter';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';

import { ViewAgendaItem } from '../../../../view-models';

export interface AgendaForwardDialogReturnData {
    meetingIds: Ids;
    withModeratorNotes: boolean;
    withSpeakers: boolean;
    withAttachments: boolean;
}

@Component({
    selector: 'os-agenda-forward-dialog',
    templateUrl: './agenda-forward-dialog.component.html',
    styleUrl: './agenda-forward-dialog.component.scss',
    standalone: false
})
export class AgendaForwardDialogComponent implements OnInit {
    public get committeesObservable(): Observable<GetForwardingMeetingsPresenter[]> {
        return this.committeesSubject;
    }

    public readonly checkboxStateMap: Record<string, boolean> = {};
    public selectedMeetings = new Set<Id>();

    public get activeMeetingCommitteeName(): string {
        return this.activeMeeting.meeting?.committee?.name;
    }

    public withModeratorNotes = false;
    public withSpeakers = false;
    public withAttachments = false;

    public get tableRows(): string[] {
        if (
            this.data.agenda.length > 1 ||
            (this.data.agenda.length === 1 &&
                this.data.agenda[0].content_object?.attachment_meeting_mediafile_ids?.length)
        ) {
            return [`speakers`, `moderator_notes`, `attachments`, `meeting`];
        } else {
            return [`speakers`, `moderator_notes`, `meeting`];
        }
    }

    private readonly committeesSubject = new BehaviorSubject<GetForwardingMeetingsPresenter[]>([]);

    public constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: { agenda: ViewAgendaItem[]; forwardingMeetings: GetForwardingMeetingsPresenter[] },
        private dialogRef: MatDialogRef<AgendaForwardDialogComponent, AgendaForwardDialogReturnData>,
        private activeMeeting: ActiveMeetingService
    ) {}

    public async ngOnInit(): Promise<void> {
        for (const committee of this.data.forwardingMeetings) {
            committee.meetings = this.getMeetingsSorted(committee);
        }
        this.committeesSubject.next(this.data.forwardingMeetings);
        this.selectedMeetings = new Set();
        this.initStateMap();
    }

    private getMeetingsSorted(committee: GetForwardingMeetingsPresenter): GetForwardingMeetingsPresenterMeeting[] {
        return committee.meetings.sort((a, b) => {
            const end_time = b.end_time - a.end_time;
            if (Number.isNaN(end_time)) {
                if (b.end_time) {
                    return b.end_time;
                } else if (a.end_time) {
                    return -a.end_time;
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
            withModeratorNotes: this.withModeratorNotes,
            withSpeakers: this.withSpeakers,
            withAttachments: this.withAttachments
        });
    }

    public onChangeCheckbox({ source, checked }: MatCheckboxChange): void {
        const fn = checked ? `add` : `delete`;
        this.selectedMeetings[fn](+source.value);
    }

    public isActiveMeeting(meeting: GetForwardingMeetingsPresenterMeeting): boolean {
        return +meeting.id === this.activeMeeting.meetingId;
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
