import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

import { MeetingAction } from 'app/core/actions/meeting-action';
import { CML, OML } from 'app/core/core-services/organization-permission';
import { Id } from 'app/core/definitions/key-types';
import { CommitteeRepositoryService } from 'app/core/repositories/management/committee-repository.service';
import { MeetingRepositoryService } from 'app/core/repositories/management/meeting-repository.service';
import { OrganizationTagRepositoryService } from 'app/core/repositories/management/organization-tag-repository.service';
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
    public readonly CML = CML;
    public readonly OML = OML;

    public get availableUsers(): ViewUser[] {
        return (this.committee?.users || []).concat(this.editMeeting?.users || []);
    }

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
        public orgaTagRepo: OrganizationTagRepositoryService,
        private colorService: ColorService
    ) {
        super(componentServiceCollector);
        this.createOrEdit();
        this.createForm();
        this.getRouteParams();

        if (this.isCreateView) {
            super.setTitle(AddMeetingLabel);
        } else {
            super.setTitle(EditMeetingLabel);
        }
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
            const userIds = this.meetingForm.value.user_ids as Id[];
            const addedUsers = userIds.difference(this.editMeeting.user_ids);
            const removedUsers = this.editMeeting.user_ids.difference(userIds);

            const payload: MeetingAction.UpdatePayload = this.meetingForm.value;
            delete (payload as any).user_ids; // do not send them to the server.
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
        const currentValue: Id[] = this.meetingForm.get('organization_tag_ids').value || [];
        this.meetingForm.patchValue({ organization_tag_ids: currentValue.concat(id) });
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
                follow: [{ idField: 'user_ids', fieldset: 'shortName' }],
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
                follow: [{ idField: 'user_ids', fieldset: 'shortName' }],
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

        const rawForm: any = {
            name: ['', Validators.required],
            // server bug
            // set_as_template: [false],
            description: [''],
            location: [''],
            start_time: [currentDate],
            end_time: [currentDate],
            user_ids: [[]],
            organization_tag_ids: [[]]
        };

        if (!this.isCreateView) {
            rawForm.jitsi_domain = [[]];
            rawForm.jitsi_room_name = [[]];
            rawForm.jitsi_room_password = [[]];
        }

        this.meetingForm = this.formBuilder.group(rawForm);
    }

    private updateForm(meeting: ViewMeeting): void {
        const patchMeeting: any = meeting.getUpdatedModelData({
            start_time: meeting.start_time ? new Date(meeting.start_time * 1000) : undefined,
            end_time: meeting.end_time ? new Date(meeting.end_time * 1000) : undefined,
            user_ids: [...meeting.user_ids]
        } as any);
        this.meetingForm.patchValue(patchMeeting);
    }
}
