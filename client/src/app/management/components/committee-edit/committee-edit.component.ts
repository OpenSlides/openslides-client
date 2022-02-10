import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { MemberService } from 'app/core/core-services/member.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { ORGANIZATION_ID } from 'app/core/core-services/organization.service';
import { CML, OML } from 'app/core/core-services/organization-permission';
import { Id } from 'app/core/definitions/key-types';
import { CommitteeRepositoryService } from 'app/core/repositories/management/committee-repository.service';
import { MeetingRepositoryService } from 'app/core/repositories/management/meeting-repository.service';
import { OrganizationTagRepositoryService } from 'app/core/repositories/management/organization-tag-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { ViewCommittee } from 'app/management/models/view-committee';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { ViewOrganization } from 'app/management/models/view-organization';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Committee } from 'app/shared/models/event-management/committee';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { ViewUser } from 'app/site/users/models/view-user';
import { Observable, OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';

import { UserRepositoryService } from '../../../core/repositories/users/user-repository.service';
import { OsOptionSelectionChanged } from '../../../shared/components/search-selector/base-search-value-selector/base-search-value-selector.component';
import { NAVIGATION_FROM_LIST } from '../committee-list/committee-list.component';

const ADD_COMMITTEE_LABEL = _(`New committee`);
const EDIT_COMMITTEE_LABEL = _(`Edit committee`);
const RECEIVE_FORWARDING_DISABLED_TOOLTIP = _(`You can change this option only in the forwarding section.`);

@Component({
    selector: `os-committee-edit`,
    templateUrl: `./committee-edit.component.html`,
    styleUrls: [`./committee-edit.component.scss`]
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
        return this.committeeForm.get(`user_$_management_level`);
    }

    private navigatedFrom: string | undefined;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        userRepo: UserRepositoryService,
        protected translate: TranslateService,
        private formBuilder: FormBuilder,
        private memberService: MemberService,
        public committeeRepo: CommitteeRepositoryService,
        public orgaTagRepo: OrganizationTagRepositoryService,
        private meetingRepo: MeetingRepositoryService,
        private route: ActivatedRoute,
        private router: Router,
        private operator: OperatorService
    ) {
        super(componentServiceCollector, translate);
        this.createForm();
        this.getCommitteeByUrl();

        if (this.isCreateView) {
            super.setTitle(ADD_COMMITTEE_LABEL);
        } else {
            super.setTitle(EDIT_COMMITTEE_LABEL);
        }
        this.organizationMembers = userRepo.getViewModelListObservable();
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
        return value => value.id === this.committeeId;
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

    public getSaveAction(): () => Promise<void> {
        return () => this.onSubmit();
    }

    public async onSubmit(): Promise<void> {
        const value = this.committeeForm.value as Committee;
        let id: Id | null = null;

        if (this.isCreateView) {
            const identifiable = (await this.committeeRepo.create(value))[0];
            id = identifiable.id;
        } else {
            await this.committeeRepo.update(value, this.editCommittee);
            id = this.committeeId;
        }
        this.navigateBack(id);
    }

    public onCancel(): void {
        this.navigateBack(this.committeeId);
    }

    public getTransformPropagateFn(): (value?: any) => any {
        return value => ({ [CML.can_manage]: value });
    }

    /**
     * Function to automatically unselect a user from the manager-array. If the user remains as committee-manager,
     * then the backend would remain them as manager and remain them as user, too. If a user would only be added as
     * committee-manager, then they would be automatically added as committee-user to always have committee-managers
     * as a subset of committee-users.
     *
     * @param value the user who is selected or unselected
     * @param selected whether the incoming value has been selected or not
     */
    public onUserSelectionChanged({ value: user, selected }: OsOptionSelectionChanged<ViewUser>): void {
        if (selected) {
            return;
        }
        const committeeManagerIds = this.managerIdCtrl.value as Id[];
        const managerIndex = committeeManagerIds.findIndex(managerId => managerId === user.id);
        if (managerIndex > -1) {
            committeeManagerIds.splice(managerIndex, 1);
            this.managerIdCtrl.setValue(committeeManagerIds);
        }
    }

    /**
     * Function to (un-) select the same committee in the `receive_forwardings_from_committee_ids`-control. This
     * enables then the forwarding to the same committee.
     *
     * @param value is the committee that is selected or unselected
     * @param selected whether the incoming value has been selected or not
     */
    public onForwardingSelectionChanged({ value: committee, selected }: OsOptionSelectionChanged): void {
        if (committee.id === this.committeeId) {
            const formControlName = `receive_forwardings_from_committee_ids`;
            const previousValue: Set<Id> = new Set(this.committeeForm.get(formControlName).value || []);
            const fn = selected ? `add` : `delete`;
            previousValue[fn](committee.id);
            this.committeeForm.patchValue({ [formControlName]: Array.from(previousValue) });
        }
    }

    public async onOrgaTagNotFound(orgaTagName: string): Promise<void> {
        const { id }: Identifiable = (
            await this.orgaTagRepo.create({
                name: orgaTagName
            })
        )[0];
        const currentValue: Id[] = this.committeeForm.get(`organization_tag_ids`).value || [];
        this.committeeForm.patchValue({ organization_tag_ids: currentValue.concat(id) });
    }

    private navigateBack(id?: Id): void {
        const navigationCommands = [`..`, `committees`];
        if (this.navigatedFrom !== NAVIGATION_FROM_LIST) {
            navigationCommands.push(id?.toString() ?? ``);
        }
        this.router.navigate(navigationCommands);
    }

    private getCommitteeByUrl(): void {
        if (this.route.snapshot.url[0] && this.route.snapshot.url[0].path === `create`) {
            this.isCreateView = true;
        } else {
            this.isCreateView = false;
            this.subscriptions.push(
                this.route.queryParams.subscribe(queryParams => {
                    this.navigatedFrom = queryParams.from;
                }),
                this.route.params.subscribe(async params => {
                    this.committeeId = Number(params.committeeId);
                    this.loadCommittee(this.committeeId);
                })
            );
        }
    }

    private loadCommittee(id?: number): void {
        this.subscribe(
            {
                viewModelCtor: ViewCommittee,
                ids: [id],
                fieldset: `edit`,
                follow: [{ idField: `forward_to_committee_ids` }, { idField: `meeting_ids` }]
            },
            `loadCommittee`
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
        const partialForm: any = {
            name: [``, Validators.required],
            description: [``],
            organization_tag_ids: [[]],
            user_$_management_level: [[]],
            forward_to_committee_ids: [[]],
            receive_forwardings_from_committee_ids: [[]]
        };
        this.committeeForm = this.formBuilder.group(partialForm);
    }

    private preselectSelfAsManager(): void {
        this.managerIdCtrl.patchValue([this.operator.operatorId]);
    }

    private updateForm(committee: ViewCommittee): void {
        this.committeeForm.patchValue(committee.committee);

        if (this.committeeId && committee.users?.length) {
            const committeeManagers = committee.getManagers();
            this.managerIdCtrl.patchValue(committeeManagers.map(user => user.id));
        }
    }

    private requestUpdates(): void {
        this.subscribe(
            {
                viewModelCtor: ViewOrganization,
                ids: [ORGANIZATION_ID],
                follow: [
                    {
                        idField: `committee_ids`,
                        fieldset: `list`
                    }
                ],
                fieldset: []
            },
            `loadOrganization`
        );
    }

    private async fetchUsers(): Promise<void> {
        const userIds = await this.memberService.fetchAllOrgaUsers();
        await this.subscribe(
            {
                viewModelCtor: ViewUser,
                ids: userIds,
                fieldset: `committeeEdit`
            },
            `loadUsers`
        );
    }
}
