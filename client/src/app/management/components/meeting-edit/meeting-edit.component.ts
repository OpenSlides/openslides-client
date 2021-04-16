import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { MeetingAction } from 'app/core/actions/meeting-action';
import { OperatorService } from 'app/core/core-services/operator.service';
import { MeetingRepositoryService } from 'app/core/repositories/event-management/meeting-repository.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewCommittee } from 'app/site/event-management/models/view-committee';
import { ViewMeeting } from 'app/site/event-management/models/view-meeting';
import { ViewUser } from 'app/site/users/models/view-user';

const AddMeetingLabel = _('Create Meeting');
const EditMeetingLabel = _('Edit Meeting');

@Component({
    selector: 'os-meeting-edit',
    templateUrl: './meeting-edit.component.html',
    styleUrls: ['./meeting-edit.component.scss']
})
export class MeetingEditComponent extends BaseModelContextComponent implements OnInit {
    public addMeetingLabel = AddMeetingLabel;
    public editMeetingLabel = EditMeetingLabel;

    public isCreateView: boolean;

    public meetingForm: FormGroup;

    private meetingId: number;
    private editMeeting: ViewMeeting;
    private committeeId: number;

    public allUsers: Observable<ViewUser[]>;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private route: ActivatedRoute,
        private location: Location,
        private formBuilder: FormBuilder,
        private meetingRepo: MeetingRepositoryService,
        private userRepo: UserRepositoryService,
        private operator: OperatorService
    ) {
        super(componentServiceCollector);
        this.createForm();
        this.createOrEdit();
        this.getRouteParams();
        this.setAllUsers();

        if (this.isCreateView) {
            super.setTitle(AddMeetingLabel);
        } else {
            super.setTitle(EditMeetingLabel);
        }
    }

    public ngOnInit(): void {
        this.requestUpdates();
    }

    private createOrEdit(): void {
        if (this.route.snapshot.url[0] && this.route.snapshot.url[0].path === 'create') {
            this.isCreateView = true;
        } else {
            this.isCreateView = false;
        }
    }

    private getRouteParams(): void {
        this.subscriptions.push(
            this.route.params.subscribe(async params => {
                this.committeeId = Number(params.committeeId);
                this.meetingId = Number(params.meetingId);

                if (this.meetingId) {
                    this.loadMeeting(this.meetingId);
                }
            })
        );
    }

    private loadMeeting(id: number): void {
        this.requestModels({
            viewModelCtor: ViewMeeting,
            ids: [id],
            fieldset: 'edit'
        });
        this.subscriptions.push(
            this.meetingRepo.getViewModelObservable(id).subscribe(newMeeting => {
                if (newMeeting) {
                    this.editMeeting = newMeeting;
                    this.updateForm(this.editMeeting);
                }
            })
        );
    }

    private createForm(): void {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        this.meetingForm = this.formBuilder.group({
            name: ['', Validators.required],
            welcome_title: ['', Validators.required],
            // server bug
            // set_as_template: [false],
            welcome_text: [''],
            description: [''],
            location: [''],
            start_time: [currentDate],
            end_time: [currentDate],
            enable_anonymous: [false],
            guest_ids: [[]]
        });
    }

    private updateForm(meeting: ViewMeeting): void {
        const patchMeeting: any = meeting.meeting;
        patchMeeting.start_time = meeting.start_time ? new Date(meeting.start_time * 1000) : undefined;
        patchMeeting.end_time = meeting.end_time ? new Date(meeting.end_time * 1000) : undefined;
        this.meetingForm.patchValue(patchMeeting);
    }

    private async requestUpdates(): Promise<void> {
        /**
         * Requires orga members
         */
        this.requestModels({
            viewModelCtor: ViewCommittee,
            ids: [this.committeeId],
            follow: [{ idField: 'member_ids', fieldset: 'shortName' }],
            fieldset: 'list'
        });
    }

    private setAllUsers(): void {
        const alreadyPresentUsers = this.editMeeting?.meeting?.user_ids || [this.operator.operatorId];
        this.allUsers = this.userRepo
            .getViewModelListObservable()
            .pipe(map(users => users.filter(user => !alreadyPresentUsers.includes(user.id))));
    }

    public onSubmit(): void {
        if (this.isCreateView) {
            const payload: MeetingAction.CreatePayload = {
                committee_id: this.committeeId,
                ...this.meetingForm.value
            };

            this.meetingRepo
                .create(payload)
                .then(() => {
                    this.location.back();
                })
                .catch(this.raiseError);
        } else {
            const payload: MeetingAction.UpdatePayload = this.meetingForm.value;
            this.meetingRepo
                .update(payload, this.editMeeting)
                .then(() => {
                    this.location.back();
                })
                .catch(this.raiseError);
        }
    }

    public onCancel(): void {
        this.location.back();
    }
}
