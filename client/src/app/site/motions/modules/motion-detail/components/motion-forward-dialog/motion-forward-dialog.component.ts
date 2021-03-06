import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { BehaviorSubject, Observable } from 'rxjs';

import { ActiveMeetingService } from 'app/core/core-services/active-meeting.service';
import { HttpService } from 'app/core/core-services/http.service';
import { Id } from 'app/core/definitions/key-types';

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
    public get availableMeetingsObservable(): Observable<ForwardingPresenter[]> {
        return this.meetingsSubject.asObservable();
    }

    public currentSelectedMeeting: Id | null = null;

    private readonly meetingsSubject = new BehaviorSubject<ForwardingPresenter[]>([]);

    public constructor(
        private dialogRef: MatDialogRef<MotionForwardDialogComponent, number>,
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
        this.meetingsSubject.next(result[0]);
    }

    public onSaveClicked(): void {
        this.dialogRef.close(this.currentSelectedMeeting);
    }
}
