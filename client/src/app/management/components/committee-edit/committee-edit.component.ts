import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { Observable, OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';

import { MemberService } from 'app/core/core-services/member.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { CML, OML } from 'app/core/core-services/organization-permission';
import { ORGANIZATION_ID } from 'app/core/core-services/organization.service';
import { Id } from 'app/core/definitions/key-types';
import { CommitteeRepositoryService } from 'app/core/repositories/management/committee-repository.service';
import { MeetingRepositoryService } from 'app/core/repositories/management/meeting-repository.service';
import { OrganizationTagRepositoryService } from 'app/core/repositories/management/organization-tag-repository.service';
import { ColorService } from 'app/core/ui-services/color.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { ViewCommittee } from 'app/management/models/view-committee';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { ViewOrganization } from 'app/management/models/view-organization';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Committee } from 'app/shared/models/event-management/committee';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewUser } from 'app/site/users/models/view-user';
import { OsOptionSelectionChanged } from '../../../shared/components/search-selector/base-search-value-selector/base-search-value-selector.component';

const ADD_COMMITTEE_LABEL = _('New committee');
const EDIT_COMMITTEE_LABEL = _('Edit committee');
const RECEIVE_FORWARDING_DISABLED_TOOLTIP = _('You can change this option only in the forwarding section.');

@Component({
    selector: 'os-committee-edit',
    templateUrl: './committee-edit.component.html',
    styleUrls: ['./committee-edit.component.scss']
})
export class CommitteeEditComponent extends BaseModelContextComponent implements OnInit {
    public readonly OML = OML;
    public readonly CML = CML;

    private committeeId: number = null;

    public addCommitteeLabel = ADD_COMMITTEE_LABEL;
    public editCommitteeLabel = EDIT_COMMITTEE_LABEL;

    public isCreateView: boolean;
    public committeeForm: FormGroup;
    public organizationMembers: Observable<ViewUser[]>;
    public meetingsObservable: Observable<ViewMeeting[]>;

    public editCommittee: ViewCommittee;

    private get managerIdCtrl(): AbstractControl {
        return this.committeeForm.get('manager_ids');
    }

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private formBuilder: FormBuilder,
        private memberService: MemberService,
        public committeeRepo: CommitteeRepositoryService,
        public orgaTagRepo: OrganizationTagRepositoryService,
        private colorService: ColorService,
        private meetingRepo: MeetingRepositoryService,
        private route: ActivatedRoute,
        private location: Location,
        private operator: OperatorService
    ) {
        super(componentServiceCollector);
        this.createForm();
        this.getCommitteeByUrl();

        if (this.isCreateView) {
            super.setTitle(ADD_COMMITTEE_LABEL);
        } else {
            super.setTitle(EDIT_COMMITTEE_LABEL);
        }
        this.organizationMembers = this.memberService.getMemberListObservable();
        this.meetingsObservable = this.meetingRepo.getViewModelListObservable();
    }

    public async ngOnInit(): Promise<void> {
        await this.fetchUsers();
        this.requestUpdates();

        if (this.isCreateView) {
            this.preselectSelfAsManager();
        }
    }

    public getPipeFilterFn(): OperatorFunction<ViewCommittee[], ViewCommittee[]> {
        return map((committees: ViewCommittee[]) =>
            committees.filter(committee => committee.id !== this.editCommittee?.id)
        );
    }

    /**
     * Returns a function to know if the option which contains this committee should be disabled
     * in the `receive_forwardings_from_committee_ids`-control
     *
     * @returns A function that will return a boolean
     */
    public getDisableOptionWhenFn(): (value: ViewCommittee) => boolean {
        return value => {
            return value.id === this.committeeId;
        };
    }

    /**
     * Returns a function to get a tooltip if the option which contains this committee is rendered
     * in the `receive_forwardings_from_committee_ids`-control
     *
     * @returns A function that will return a tooltip
     */
    public getTooltipFn(): (value: ViewCommittee) => string | null {
        return value => {
            if (value.id === this.committeeId) {
                return RECEIVE_FORWARDING_DISABLED_TOOLTIP;
            } else {
                return null;
            }
        };
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

    /**
     * Function to (un-) select the same committee in the `receive_forwardings_from_committee_ids`-control. This
     * enables then the forwarding to the same committee.
     *
     * @param value is the committee that is selected or unselected
     * @param source is the MatOption that emitted the SelectionChanged-event
     */
    public onSelectionChanged({ value, source }: OsOptionSelectionChanged): void {
        if (value.id === this.committeeId) {
            const formControlName = 'receive_forwardings_from_committee_ids';
            const previousValue: Set<Id> = new Set(this.committeeForm.get(formControlName).value || []);
            const fn = source.selected ? 'add' : 'delete';
            previousValue[fn](value.id);
            this.committeeForm.patchValue({ [formControlName]: Array.from(previousValue) });
        }
    }

    public async onOrgaTagNotFound(orgaTagName: string): Promise<void> {
        const { id }: Identifiable = await this.orgaTagRepo.create({
            name: orgaTagName,
            color: this.colorService.getRandomHtmlColor()
        });
        const currentValue: Id[] = this.committeeForm.get('organization_tag_ids').value || [];
        this.committeeForm.patchValue({ organization_tag_ids: currentValue.concat(id) });
    }

    private getCommitteeByUrl(): void {
        if (this.route.snapshot.url[0] && this.route.snapshot.url[0].path === 'create') {
            this.isCreateView = true;
        } else {
            this.isCreateView = false;
            this.subscriptions.push(
                this.route.params.subscribe(async params => {
                    this.committeeId = Number(params.committeeId);
                    this.loadCommittee(this.committeeId);
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
            organization_tag_ids: [[]],
            user_ids: [[]],
            manager_ids: [[]],
            forward_to_committee_ids: [[]],
            receive_forwardings_from_committee_ids: [[]]
        };
        if (!this.isCreateView) {
            partialForm = {
                ...partialForm
                // template_meeting_id: [null], // TODO: Not yet
            };
        }
        this.committeeForm = this.formBuilder.group(partialForm);
    }

    private preselectSelfAsManager(): void {
        this.managerIdCtrl.patchValue([this.operator.operatorId]);
    }

    private updateForm(committee: ViewCommittee): void {
        this.committeeForm.patchValue(committee.committee);

        if (this.committeeId && committee.users?.length) {
            const committeeManagers = committee.users.filter(
                user => user.committee_management_level(this.committeeId) === CML.can_manage
            );
            this.managerIdCtrl.patchValue(committeeManagers.map(user => user.id));
        }
    }

    private requestUpdates(): void {
        this.requestModels(
            {
                viewModelCtor: ViewOrganization,
                ids: [ORGANIZATION_ID],
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
        await this.requestModels(
            {
                viewModelCtor: ViewUser,
                ids: userIds,
                fieldset: 'committeeEdit'
            },
            'loadUsers'
        );
    }
}
