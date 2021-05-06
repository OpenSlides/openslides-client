import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { BehaviorSubject, Observable } from 'rxjs';

import { ActiveMeetingService } from 'app/core/core-services/active-meeting.service';
import { HttpService } from 'app/core/core-services/http.service';
import { Id } from 'app/core/definitions/key-types';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Displayable } from 'app/site/base/displayable';

interface ForwardDialogItem extends Identifiable, Displayable {
    parent_id: Id;
    origin_id: Id;
}

interface ForwardingPresenter {
    id: Id;
    meetings?: { id: Id; name: string }[];
    name: string;
}

type ForwardingPresenterResult = ForwardingPresenter[][];

@Component({
    selector: 'os-motion-forward-dialog',
    templateUrl: './motion-forward-dialog.component.html',
    styleUrls: ['./motion-forward-dialog.component.scss']
})
export class MotionForwardDialogComponent implements OnInit {
    public get availableMeetingsObservable(): Observable<ForwardDialogItem[]> {
        return this.availableMeetingsSubject.asObservable();
    }

    public currentSelectedMeetings: ForwardDialogItem[] = [];

    private availableMeetingsSubject = new BehaviorSubject<ForwardDialogItem[]>([]);
    private currentTreeItemId = 1;

    public constructor(
        private dialogRef: MatDialogRef<MotionForwardDialogComponent>,
        private http: HttpService,
        private activeMeeting: ActiveMeetingService
    ) {}

    public async ngOnInit(): Promise<void> {
        const payload = [
            {
                presenter: 'get_forwarding_meetings',
                data: {
                    meeting_id: this.activeMeeting.meetingId
                }
            }
        ];
        const result = await this.http.post<ForwardingPresenterResult>('/system/presenter/handle_request', payload);
        this.availableMeetingsSubject.next(this.toTreeNodeItem(result[0]));
    }

    public onSaveClicked(): void {
        this.dialogRef.close(this.currentSelectedMeetings.map(meeting => ({ id: meeting.origin_id })));
    }

    private toTreeNodeItem(items: ForwardingPresenter[], parent_id?: number): ForwardDialogItem[] {
        const result: ForwardDialogItem[] = [];
        for (const item of items) {
            const entry = {
                id: this.currentTreeItemId++, // Ensures, that every node has a unique id...
                origin_id: item.id, // The original id...
                parent_id,
                getTitle: () => item.name,
                getListTitle: () => item.name
            };
            result.push(entry);
            if (item.meetings && item.meetings.length) {
                result.push(...this.toTreeNodeItem(item.meetings, entry.id));
            }
        }
        return result;
    }
}
