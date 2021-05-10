import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { Observable, OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';

import { MemberService } from 'app/core/core-services/member.service';
import { CommitteeRepositoryService } from 'app/core/repositories/management/committee-repository.service';
import { MeetingRepositoryService } from 'app/core/repositories/management/meeting-repository.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { ViewCommittee } from 'app/management/models/view-committee';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { ViewOrganisation } from 'app/management/models/view-organisation';
import { Committee } from 'app/shared/models/event-management/committee';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewUser } from 'app/site/users/models/view-user';

const AddCommitteeLabel = _('New committee');
const EditCommitteeLabel = _('Edit committee');

@Component({
    selector: 'os-committee-edit',
    templateUrl: './committee-edit.component.html',
    styleUrls: ['./committee-edit.component.scss']
})
export class CommitteeEditComponent extends BaseModelContextComponent implements OnInit {
    public addCommitteeLabel = AddCommitteeLabel;
    public editCommitteeLabel = EditCommitteeLabel;

    public isCreateView: boolean;
    public committeeForm: FormGroup;
    public members: Observable<ViewUser[]>;
    public meetingsObservable: Observable<ViewMeeting[]>;

    private editCommittee: ViewCommittee;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private formBuilder: FormBuilder,
        private memberService: MemberService,
        private userRepo: UserRepositoryService,
        public committeeRepo: CommitteeRepositoryService,
        private meetingRepo: MeetingRepositoryService,
        private router: Router,
        private route: ActivatedRoute,
        private location: Location
    ) {
        super(componentServiceCollector);
        this.createForm();
        this.getCommitteeByUrl();

        if (this.isCreateView) {
            super.setTitle(AddCommitteeLabel);
        } else {
            super.setTitle(EditCommitteeLabel);
        }
        this.members = this.memberService.getMemberListObservable();
        this.meetingsObservable = this.meetingRepo.getViewModelListObservable();
    }

    public async ngOnInit(): Promise<void> {
        this.requestUpdates();
        await this.fetchUsers();
    }

    public getPipeFilterFn(): OperatorFunction<ViewCommittee[], ViewCommittee[]> {
        return map((committees: ViewCommittee[]) =>
            committees.filter(committee => committee.id !== this.editCommittee.id)
        );
    }

    public onSubmit(): void {
        const value = this.committeeForm.value as Committee;

        if (this.isCreateView) {
            this.committeeRepo
                .create(value)
                .then(() => {
                    this.location.back();
                })
                .catch(this.raiseError);
        } else {
            this.committeeRepo
                .update(value, this.editCommittee)
                .then(() => {
                    this.location.back();
                })
                .catch(this.raiseError);
        }
    }

    public onCancel(): void {
        this.location.back();
    }

    private getCommitteeByUrl(): void {
        if (this.route.snapshot.url[0] && this.route.snapshot.url[0].path === 'create') {
            this.isCreateView = true;
        } else {
            this.isCreateView = false;
            this.subscriptions.push(
                this.route.params.subscribe(async params => {
                    const committeeId: number = Number(params.committeeId);
                    this.loadCommittee(committeeId);
                })
            );
        }
    }

    private loadCommittee(id?: number): void {
        this.requestModels(
            {
                viewModelCtor: ViewCommittee,
                ids: [id],
                fieldset: 'edit',
                follow: [{ idField: 'forward_to_committee_ids' }, { idField: 'meeting_ids' }]
            },
            'loadCommittee'
        );
        this.subscriptions.push(
            this.committeeRepo.getViewModelObservable(id).subscribe(newCommittee => {
                if (newCommittee) {
                    this.editCommittee = newCommittee;
                    this.updateForm(this.editCommittee);
                }
            })
        );
    }

    private createForm(): void {
        let partialForm: any = {
            name: ['', Validators.required],
            description: [''],
            manager_ids: [[]],
            member_ids: [[]]
        };
        if (!this.isCreateView) {
            partialForm = {
                ...partialForm,
                // template_meeting_id: [null], // TODO: Not yet
                default_meeting_id: [null],
                forward_to_committee_ids: [[]]
                // organisation_tag_ids: [[]] // TODO: Wait for backend
            };
        }
        this.committeeForm = this.formBuilder.group(partialForm);
    }

    private updateForm(committee: ViewCommittee): void {
        this.committeeForm.patchValue(committee.committee);
    }

    private requestUpdates(): void {
        this.requestModels(
            {
                viewModelCtor: ViewOrganisation,
                ids: [1],
                follow: [
                    {
                        idField: 'committee_ids',
                        fieldset: 'list'
                    }
                ],
                fieldset: []
            },
            'loadOrganization'
        );
    }

    private async fetchUsers(): Promise<void> {
        const userIds = await this.memberService.fetchAllOrgaUsers();
        this.requestModels(
            {
                viewModelCtor: ViewUser,
                ids: userIds,
                fieldset: 'list'
            },
            'loadUsers'
        );
    }
}
