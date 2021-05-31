import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { MeetingAction } from 'app/core/actions/meeting-action';
import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { Id } from 'app/core/definitions/key-types';
import { CommitteeRepositoryService } from 'app/core/repositories/management/committee-repository.service';
import { MeetingRepositoryService } from 'app/core/repositories/management/meeting-repository.service';
import { OrganisationTagRepositoryService } from 'app/core/repositories/management/organisation-tag-repository.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ColorService } from 'app/core/ui-services/color.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { ViewCommittee } from 'app/management/models/view-committee';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewUser } from 'app/site/users/models/view-user';

const AddMeetingLabel = _('New meeting');
const EditMeetingLabel = _('Edit meeting');

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

    public committee: ViewCommittee;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private route: ActivatedRoute,
        private location: Location,
        private formBuilder: FormBuilder,
        private meetingRepo: MeetingRepositoryService,
        private committeeRepo: CommitteeRepositoryService,
        private userRepo: UserRepositoryService,
        private operator: OperatorService,
        public orgaTagRepo: OrganisationTagRepositoryService,
        private colorService: ColorService
    ) {
        super(componentServiceCollector);
        this.createForm();
        this.createOrEdit();
        this.getRouteParams();

        if (this.isCreateView) {
            super.setTitle(AddMeetingLabel);
        } else {
            super.setTitle(EditMeetingLabel);
        }
    }

    public onSubmit(): void {
        if (this.isCreateView) {
            const userIds = this.meetingForm.value.userIds;
            const payload: MeetingAction.CreatePayload = {
                committee_id: this.committeeId,
                ...this.meetingForm.value
            };
            delete (payload as any).userIds; // do not send them to the server.

            this.meetingRepo
                .create(payload, userIds)
                .then(() => {
                    this.location.back();
                })
                .catch(this.raiseError);
        } else {
            const userIds = this.meetingForm.value.userIds;
            // this might be faster when using sets:
            // addedUsers = userIds setminus editMeeting.user_ids
            // removedUsers = (editMeeting.user_ids intersection committee.user_ids) setminus userIds
            // removedUsers must not contain guests or so. We do not want to remove users, that do not belong
            // to the committee.
            const addedUsers = userIds.filter(id => !this.editMeeting.user_ids.includes(id));
            const removedUsers = this.editMeeting.user_ids.filter(
                id => this.committee.member_ids.includes(id) && !userIds.includes(id)
            );

            const payload: MeetingAction.UpdatePayload = this.meetingForm.value;
            delete (payload as any).userIds; // do not send them to the server.
            this.meetingRepo
                .update(payload, this.editMeeting, addedUsers, removedUsers)
                .then(() => {
                    this.location.back();
                })
                .catch(this.raiseError);
        }
    }

    public onCancel(): void {
        this.location.back();
    }

    public async onOrgaTagNotFound(orgaTagName: string): Promise<void> {
        const { id }: Identifiable = await this.orgaTagRepo.create({
            name: orgaTagName,
            color: this.colorService.getRandomHtmlColor()
        });
        const currentValue: Id[] = this.meetingForm.get('organisation_tag_ids').value || [];
        this.meetingForm.patchValue({ organisation_tag_ids: currentValue.concat(id) });
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
                    this.loadMeeting();
                }
                if (this.committeeId) {
                    this.loadCommittee();
                }
            })
        );
    }

    private loadMeeting(): void {
        this.requestModels(
            {
                viewModelCtor: ViewMeeting,
                ids: [this.meetingId],
                fieldset: 'edit'
            },
            'meeting'
        );
        this.subscriptions.push(
            this.meetingRepo.getViewModelObservable(this.meetingId).subscribe(meeting => {
                if (meeting) {
                    this.editMeeting = meeting;
                    this.updateForm(this.editMeeting);
                }
            })
        );
    }

    private loadCommittee(): void {
        this.requestModels(
            {
                viewModelCtor: ViewCommittee,
                ids: [this.committeeId],
                follow: [{ idField: 'member_ids', fieldset: 'shortName' }],
                fieldset: 'list'
            },
            'committee'
        );
        this.subscriptions.push(
            this.committeeRepo.getViewModelObservable(this.committeeId).subscribe(committee => {
                if (committee) {
                    this.committee = committee;
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
            userIds: [[]],
            guest_ids: [[]],
            organisation_tag_ids: [[]]
        });
    }

    private updateForm(meeting: ViewMeeting): void {
        const patchMeeting: any = meeting.getUpdatedModelData({
            start_time: meeting.start_time ? new Date(meeting.start_time * 1000) : undefined,
            end_time: meeting.end_time ? new Date(meeting.end_time * 1000) : undefined,
            userIds: meeting.user_ids
        } as any);
        this.meetingForm.patchValue(patchMeeting);
        console.log('update', meeting, patchMeeting, this.meetingForm.value);
    }
}
