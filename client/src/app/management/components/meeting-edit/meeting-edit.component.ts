import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

import { MeetingAction } from 'app/core/actions/meeting-action';
import { OperatorService } from 'app/core/core-services/operator.service';
import { CML, OML } from 'app/core/core-services/organization-permission';
import { Id } from 'app/core/definitions/key-types';
import { CommitteeRepositoryService } from 'app/core/repositories/management/committee-repository.service';
import {
    MeetingRepositoryService,
    MeetingUserModifiedFields
} from 'app/core/repositories/management/meeting-repository.service';
import { OrganizationTagRepositoryService } from 'app/core/repositories/management/organization-tag-repository.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ColorService } from 'app/core/ui-services/color.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { ViewCommittee } from 'app/management/models/view-committee';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewUser } from 'app/site/users/models/view-user';
import { FormGroupGeneratorService } from '../../../core/ui-services/form-group-generator.service';

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
        return Array.from(new Set((this.committee?.users || []).concat(this.editMeeting?.users || [])));
    }

    private get isJitsiManipulationAllowed(): boolean {
        return !this.isCreateView && this.operator.isSuperAdmin;
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
        private colorService: ColorService,
        private operator: OperatorService,
        private userRepo: UserRepositoryService,
        private formgroupGenerator: FormGroupGeneratorService
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
            const payload: MeetingAction.UpdatePayload = { ...this.meetingForm.value };
            delete (payload as any).user_ids; // do not send them to the server.
            delete (payload as any).admin_ids; // do not send them to the server.
            this.meetingRepo
                .update(payload, this.editMeeting, this.getUsersToUpdateForMeetingObject())
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
                follow: [
                    { idField: 'user_ids', fieldset: 'shortName', follow: ['group_$_ids'] },
                    {
                        idField: 'admin_group_id',
                        follow: [{ idField: 'user_ids', fieldset: 'shortName', follow: ['group_$_ids'] }]
                    },
                    {
                        idField: 'default_group_id',
                        follow: [{ idField: 'user_ids', fieldset: 'shortName', follow: ['group_$_ids'] }]
                    }
                ],
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
                follow: [{ idField: 'user_ids', fieldset: 'shortName', follow: ['group_$_ids'] }],
                fieldset: 'list'
            },
            'committee'
        );
        this.subscriptions.push(
            this.committeeRepo.getViewModelObservable(this.committeeId).subscribe(committee => {
                if (committee) {
                    this.committee = committee;
                    this.updateFormByCommittee();
                }
            })
        );
    }

    private createForm(): void {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        const action = this.isCreateView ? MeetingAction.CREATE : MeetingAction.UPDATE;
        const additionalFormControls = { admin_ids: [[], Validators.minLength(1)] };
        const rawForm = this.formgroupGenerator.generateFormGroup(action, additionalFormControls, {
            start_time: { defaultValue: currentDate },
            end_time: { defaultValue: currentDate }
        });
        console.log('createForm', rawForm);
        // const rawForm: { [key: string]: any } = {
        //     name: ['', Validators.required],
        //     // server bug
        //     // set_as_template: [false],
        //     description: [''],
        //     location: [''],
        //     start_time: [currentDate],
        //     end_time: [currentDate],
        //     user_ids: [[]],
        //     admin_ids: [[], Validators.minLength(1)],
        //     organization_tag_ids: [[]]
        // };

        // if (this.isJitsiManipulationAllowed) {
        //     rawForm.jitsi_domain = [''];
        //     rawForm.jitsi_room_name = [''];
        //     rawForm.jitsi_room_password = [''];
        // }

        this.meetingForm = this.formBuilder.group(rawForm);
        this.meetingForm.valueChanges.subscribe(() => {
            console.log('meetingForm', this.meetingForm);
        });
    }

    private updateForm(meeting: ViewMeeting): void {
        const patchMeeting: any = meeting.getUpdatedModelData({
            start_time: meeting.start_time ? new Date(meeting.start_time * 1000) : undefined,
            end_time: meeting.end_time ? new Date(meeting.end_time * 1000) : undefined,
            user_ids: [...(meeting.default_group?.user_ids || [])],
            admin_ids: [...(meeting.admin_group?.user_ids || [])]
        } as any);
        this.meetingForm.patchValue(patchMeeting);
    }

    private updateFormByCommittee(): void {
        if (this.isCreateView && (this.committee?.user_ids || []).includes(this.operator.operatorId)) {
            this.meetingForm.patchValue({
                admin_ids: [this.operator.operatorId]
            });
        }
    }

    /**
     * Creates an object containing added and removed participant-user-ids as well as
     * added and removed admin-user-ids for the current editted meeting.
     *
     * @returns A `MeetingUserModifiedFields`-object containing the keys `addedUsers`, `removedUsers`, `addedAdmins`
     * and `removedAdmins`
     */
    private getUsersToUpdateForMeetingObject(): MeetingUserModifiedFields {
        const nextUserIds = this.meetingForm.value.user_ids as Id[];
        const previousUserIds = this.editMeeting.default_group.user_ids || [];
        const addedUserIds = (nextUserIds || []).difference(previousUserIds);
        const removedUserIds = previousUserIds.difference(nextUserIds);
        const nextAdminIds = this.meetingForm.value.admin_ids as Id[];
        const previousAdminIds = this.editMeeting.admin_group.user_ids || [];
        const addedAdminIds = (nextAdminIds || []).difference(previousAdminIds);
        const removedAdminIds = previousAdminIds.difference(nextAdminIds);

        return {
            addedUsers: addedUserIds.map(id => this.userRepo.getViewModel(id)),
            removedUsers: removedUserIds.map(id => this.userRepo.getViewModel(id)),
            addedAdmins: addedAdminIds.map(id => this.userRepo.getViewModel(id)),
            removedAdmins: removedAdminIds.map(id => this.userRepo.getViewModel(id))
        };
    }
}
