import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { MatTableModule } from '@angular/material/table';
import { TranslatePipe } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Id, Ids } from 'src/app/domain/definitions/key-types';
import { SpeechState } from 'src/app/domain/models/speakers/speech-state';
import { GetForwardingMeetingsPresenter, GetForwardingMeetingsPresenterMeeting } from 'src/app/gateways/presenter';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
import { MeetingTimeComponent } from 'src/app/ui/modules/meeting-time/meeting-time.component';

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
    imports: [
        CommonModule,
        MatCheckboxModule,
        MatDialogModule,
        MatButtonModule,
        MatRadioModule,
        MatTableModule,
        FormsModule,
        MeetingTimeComponent,
        TranslatePipe
    ],
    standalone: true
})
export class AgendaForwardDialogComponent implements OnInit {
    public get committeeObservable(): Observable<GetForwardingMeetingsPresenter> {
        return this.committeeSubject;
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
        const rows: string[] = [];
        if (this.data.is_single && this.data.agenda.length === 1) {
            const topic = this.data.agenda[0].content_object;
            if (topic.list_of_speakers.speaker_ids?.length) {
                rows.push(`speakers`);
            }
            if (topic.list_of_speakers.moderator_notes) {
                rows.push(`moderator_notes`);
            }
            if (topic.attachment_meeting_mediafile_ids?.length) {
                rows.push(`attachments`);
            }
            return [...rows, `meeting`];
        } else {
            return [`speakers`, `moderator_notes`, `attachments`, `meeting`];
        }
    }

    public showParentNotIncludedWarning = false;
    public showChildrenNotIncludedWarning = false;
    public showNotTopicWarning = false;

    public speakerAmount: number;
    public hasForbiddenSpeakers: boolean;
    public participantAmount: number;

    private readonly committeeSubject = new BehaviorSubject<GetForwardingMeetingsPresenter>(undefined);

    public constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: {
            agenda: ViewAgendaItem[];
            forwardingMeeting: GetForwardingMeetingsPresenter;
            is_single?: boolean;
            showSkippedItemWarning: boolean;
        },
        private dialogRef: MatDialogRef<AgendaForwardDialogComponent, AgendaForwardDialogReturnData>,
        private activeMeeting: ActiveMeetingService
    ) {
        const agendaItemIds = new Set(this.data.agenda.map(item => item.id));
        this.showParentNotIncludedWarning = this.data.agenda.some(
            item => item.parent_id && !agendaItemIds.has(item.parent_id)
        );
        this.showChildrenNotIncludedWarning = this.data.agenda.some(
            item => item.child_ids && item.child_ids.some(child_id => !agendaItemIds.has(child_id))
        );
        this.showNotTopicWarning = this.data.showSkippedItemWarning;
        this.speakerAmount = this.data.agenda.reduce(
            (sum, item) => sum + (item.content_object?.list_of_speakers?.speaker_ids?.length ?? 0),
            0
        );
        this.hasForbiddenSpeakers = this.data.agenda.some(item =>
            item.content_object?.list_of_speakers?.speakers?.some(
                speaker =>
                    !speaker?.end_time &&
                    (speaker?.speech_state === SpeechState.INTERVENTION ||
                        speaker?.point_of_order ||
                        speaker?.begin_time)
            )
        );
        this.participantAmount = Array.from(
            new Set(
                this.data.agenda
                    .flatMap(item =>
                        item.content_object?.list_of_speakers?.speakers?.map(speaker => speaker.meeting_user_id)
                    )
                    .filter(val => !!val)
            )
        ).length;
    }

    public async ngOnInit(): Promise<void> {
        this.data.forwardingMeeting.meetings = this.getMeetingsSorted(this.data.forwardingMeeting);
        this.committeeSubject.next(this.data.forwardingMeeting);
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

    public showActiveMeetingName(): string {
        return this.activeMeeting?.meeting?.name;
    }

    private initStateMap(): void {
        const meetings = this.committeeSubject.value.meetings!;
        for (const meeting of meetings) {
            this.checkboxStateMap[meeting!.id] = this.selectedMeetings.has(+meeting!.id);
        }
    }
}
