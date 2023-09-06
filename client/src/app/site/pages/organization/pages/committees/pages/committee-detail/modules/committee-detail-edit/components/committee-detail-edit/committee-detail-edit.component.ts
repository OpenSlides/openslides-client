import { Component, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { map, OperatorFunction } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { Selectable } from 'src/app/domain/interfaces/selectable';
import { BaseComponent } from 'src/app/site/base/base.component';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { OrganizationTagControllerService } from 'src/app/site/pages/organization/pages/organization-tags/services/organization-tag-controller.service';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { OsOptionSelectionChanged } from 'src/app/ui/modules/search-selector';

import { CommitteeControllerService } from '../../../../../../services/committee-controller.service';
import { ViewCommittee } from '../../../../../../view-models';
import { NAVIGATION_FROM_LIST } from '../../../../../committee-list/components/committee-list/committee-list.component';

const CREATE_COMMITTEE_LABEL = _(`New committee`);
const EDIT_COMMITTEE_LABEL = _(`Edit committee`);
const RECEIVE_FORWARDING_DISABLED_TOOLTIP = _(`You can change this option only in the forwarding section.`);

@Component({
    selector: `os-committee-detail-edit`,
    templateUrl: `./committee-detail-edit.component.html`,
    styleUrls: [`./committee-detail-edit.component.scss`]
})
export class CommitteeDetailEditComponent extends BaseComponent implements OnInit {
    private committeeId: number | null = null;

    public addCommitteeLabel = CREATE_COMMITTEE_LABEL;
    public editCommitteeLabel = EDIT_COMMITTEE_LABEL;

    public isCreateView = false;
    public committeeForm!: UntypedFormGroup;

    public editCommittee!: ViewCommittee;

    private get managerIdCtrl(): AbstractControl {
        return this.committeeForm.get(`manager_ids`)!;
    }

    private navigatedFrom: string | undefined;

    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        protected override translate: TranslateService,
        private formBuilder: UntypedFormBuilder,
        public committeeRepo: CommitteeControllerService,
        public orgaTagRepo: OrganizationTagControllerService,
        private route: ActivatedRoute,
        private operator: OperatorService
    ) {
        super(componentServiceCollector, translate);
        this.createForm();
        this.getCommitteeByUrl();

        if (this.isCreateView) {
            super.setTitle(CREATE_COMMITTEE_LABEL);
        } else {
            super.setTitle(EDIT_COMMITTEE_LABEL);
        }
    }

    public ngOnInit(): void {
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
    public getDisableOptionWhenFn(): (value: Selectable) => boolean {
        return value => value.id === this.committeeId;
    }

    /**
     * Returns a function to get a tooltip if the option which contains this committee is rendered
     * in the `receive_forwardings_from_committee_ids`-control
     *
     * @returns A function that will return a tooltip
     */
    public getTooltipFn(): (value: Selectable) => string {
        return value => {
            if (value.id === this.committeeId) {
                return RECEIVE_FORWARDING_DISABLED_TOOLTIP;
            } else {
                return ``;
            }
        };
    }

    public getSaveAction(): () => Promise<void> {
        return () => this.onSubmit();
    }

    public async onSubmit(): Promise<void> {
        const value = this.committeeForm.value as ViewCommittee;
        let id: Id | null = null;

        if (this.isCreateView) {
            const identifiable = (await this.committeeRepo.create(value))[0];
            id = identifiable.id;
        } else {
            await this.committeeRepo.update(value, this.editCommittee).resolve();
            id = this.committeeId;
        }
        this.navigateBack(id);
    }

    public onCancel(): void {
        this.navigateBack(this.committeeId!);
    }

    /**
     * Function to automatically unselect a user from the manager-array. If the user remains as committee-manager,
     * then the backend would remain them as manager and remain them as user, too. If a user would only be added as
     * committee-manager, then they would be automatically added as committee-user to always have committee-managers
     * as a subset of committee-users.
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
     */
    public onForwardingSelectionChanged({ value: committee, selected }: OsOptionSelectionChanged): void {
        if (committee.id === this.committeeId) {
            const formControlName = `receive_forwardings_from_committee_ids`;
            const previousValue: Set<Id> = new Set(this.committeeForm.get(formControlName)!.value || []);
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
        const currentValue: Id[] = this.committeeForm.get(`organization_tag_ids`)?.value || [];
        this.committeeForm.patchValue({ organization_tag_ids: currentValue.concat(id) });
    }

    private navigateBack(id: Id | null): void {
        const navigationCommands = [`/`, `committees`];
        if (this.navigatedFrom !== NAVIGATION_FROM_LIST && id) {
            navigationCommands.push(id.toString());
        }
        this.router.navigate(navigationCommands);
    }

    private getCommitteeByUrl(): void {
        if (this.route.snapshot.queryParams?.[`committeeId`]) {
            this.isCreateView = false;
            this.subscriptions.push(
                this.route.queryParams.subscribe(queryParams => {
                    this.navigatedFrom = queryParams[`from`];
                    this.committeeId = Number(queryParams[`committeeId`]);
                    this.loadCommittee(this.committeeId);
                })
            );
        } else {
            this.isCreateView = true;
        }
    }

    private loadCommittee(id: number): void {
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
            manager_ids: [[]],
            forward_to_committee_ids: [[]],
            receive_forwardings_from_committee_ids: [[]],
            external_id: [``]
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
}
