import { KeyValue } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { getOmlVerboseName, OML, OMLMapping } from 'src/app/domain/definitions/organization-permission';
import { BaseComponent } from 'src/app/site/base/base.component';
import { UserDetailViewComponent } from 'src/app/site/modules/user-components';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { OpenSlidesRouterService } from 'src/app/site/services/openslides-router.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { ViewCommittee } from '../../../../../committees';
import { getCommitteeListMinimalSubscriptionConfig } from '../../../../../committees/committees.subscription';
import { CommitteeControllerService } from '../../../../../committees/services/committee-controller.service';
import { AccountControllerService } from '../../../../services/common/account-controller.service';

interface ParticipationTableData {
    [committee_id: Id]: ParticipationTableDataRow;
}
type ParticipationTableDataRow = {
    committee_name?: string;
    is_manager?: boolean;
    meetings: { [meeting_id: Id]: ParticipationTableMeetingDataRow };
};
type ParticipationTableMeetingDataRow = { meeting_name: string; group_names: string[] };

@Component({
    selector: `os-account-detail`,
    templateUrl: `./account-detail.component.html`,
    styleUrls: [`./account-detail.component.scss`]
})
export class AccountDetailComponent extends BaseComponent implements OnInit {
    public get organizationManagementLevels(): string[] {
        return Object.values(OML).filter(
            (level: OML) =>
                this.operator.hasOrganizationPermissions(level) &&
                !(this.orgaManagementLevelChangeDisabled && level !== this.user.organization_management_level)
        );
    }

    public get orgaManagementLevelChangeDisabled(): boolean {
        return this.user?.id === this.operator.operatorId && this.operator.isSuperAdmin;
    }

    @ViewChild(UserDetailViewComponent, { static: false })
    public set userDetailView(userDetailView: UserDetailViewComponent | undefined) {
        userDetailView?.markAsPristine();
    }

    public readonly additionalFormControls = {
        default_structure_level: [``],
        default_number: [``],
        default_vote_weight: [``],
        organization_management_level: [],
        committee_management_ids: []
    };

    public isFormValid = false;
    public personalInfoFormValue: any = {};
    public formErrors: { [name: string]: boolean } | null = null;

    public isEditingUser = false;
    public user: ViewUser | null = null;
    public isNewUser = false;
    public committeeSubscriptionConfig = getCommitteeListMinimalSubscriptionConfig();

    public get tableData(): ParticipationTableData {
        return this._tableData;
    }

    public get canSeeParticipationTable(): boolean {
        return (
            this.operator.hasOrganizationPermissions(OML.can_manage_organization) &&
            (!!this.user.committee_ids?.length || !!this.user.meeting_ids?.length)
        );
    }

    public get comitteeAdministrationAmount(): number {
        return Object.values(this._tableData).filter(row => row[`is_manager`] === true).length;
    }

    public tableDataAscOrderCompare = <T extends unknown>(a: KeyValue<string, T>, b: KeyValue<string, T>) => {
        const aName = a.value[`committee_name`] ?? a.value[`meeting_name`] ?? ``;
        const bName = b.value[`committee_name`] ?? b.value[`meeting_name`] ?? ``;
        return aName.localeCompare(bName);
    };

    private _tableData: ParticipationTableData = {};

    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        protected override translate: TranslateService,
        private route: ActivatedRoute,
        private osRouter: OpenSlidesRouterService,
        private operator: OperatorService,
        public readonly committeeController: CommitteeControllerService,
        private accountController: AccountControllerService,
        private userController: UserControllerService,
        private promptService: PromptService
    ) {
        super(componentServiceCollector, translate);
    }

    public ngOnInit(): void {
        this.getUserByUrl();
    }

    public getTransformSetFn(): (value?: string[]) => Id[] {
        return () => (this.user ? this.user.committee_management_ids : []);
    }

    public getTransformPropagateFn(): (value?: Id[]) => any {
        return value => value;
    }

    public getSaveAction(): () => Promise<void> {
        return async () => {
            if (!this.isFormValid) {
                this.checkFormForErrors();
                return;
            }

            try {
                await this.createOrUpdateUser();
            } catch (e) {
                this.raiseError(e);
            }
        };
    }

    public onCancel(): void {
        this.router.navigate([`..`], { relativeTo: this.route });
        if (!this.isNewUser) {
            this.isEditingUser = false;
        }
    }
    /**
     * (Re)- send an invitation email for this user after confirmation
     */
    public async sendInvitationEmail(): Promise<void> {
        const title = this.translate.instant(`Sending an invitation email`);
        const content = this.translate.instant(`Are you sure you want to send an invitation email to the user?`);
        if (await this.promptService.open(title, content)) {
            this.userController.sendInvitationEmails([this.user!]).then(this.raiseError, this.raiseError);
        }
    }

    /**
     * Handler for the generate Password button.
     */
    public getRandomPasswordFn(): () => string {
        return () => this.userController.getRandomPassword();
    }

    public getOmlVerboseName(omlKey: string): string {
        return getOmlVerboseName(omlKey as keyof OMLMapping);
    }

    public editMember(): void {
        this.router.navigate([`edit`], { relativeTo: this.route });
    }

    /**
     * click on the delete user button
     */
    public async deleteUser(): Promise<void> {
        if (await this.accountController.doDeleteOrRemove([this.user!])) {
            this.router.navigate([`./accounts/`]);
        }
    }

    public getUserCommitteeManagementLevels(): ViewCommittee[] {
        const committeesToManage: (ViewCommittee | null)[] = this.user!.committee_management_ids.map(committeeId =>
            this.committeeController.getViewModel(committeeId)
        );
        return committeesToManage.filter(committee => !!committee) as ViewCommittee[];
    }

    public getCellClass(isCommitteeRow: boolean, isLastColumnOfCommitte: boolean, isLastLine: boolean): string {
        if (isLastLine) {
            return ``;
        }
        if (isCommitteeRow) {
            return `committee-underline`;
        }
        return !isLastColumnOfCommitte ? `divider-bottom` : ``;
    }

    public getNumberOfKeys(item: { [key: string]: any }): number {
        return Object.keys(item).length;
    }

    private generateParticipationTableData(): void {
        const tableData: ParticipationTableData = this.user.committees.mapToObject(item => {
            return {
                [item.id]: {
                    committee_name: item.getTitle(),
                    is_manager: item.getManagers().some(manager => manager.id === this.user.id),
                    meetings: {}
                }
            };
        });
        this.user.meetings.forEach(meeting => {
            if (!tableData[meeting.committee_id]) {
                tableData[meeting.committee_id] = { meetings: {} };
            }
            tableData[meeting.committee_id][`meetings`][meeting.id] = {
                meeting_name: meeting.getTitle(),
                group_names: this.user
                    .groups(meeting.id)
                    .map(group => group.getTitle())
                    .sort((a, b) => a.localeCompare(b))
            };
        });
        this._tableData = tableData;
    }

    private getUserByUrl(): void {
        this.subscriptions.push(
            this.osRouter.currentParamMap.subscribe(params => {
                const segments = this.router.url.split(`/`);
                const accountsIndex = segments.indexOf(`accounts`);
                if (
                    params[`id`] ||
                    (accountsIndex !== -1 &&
                        accountsIndex + 1 < segments.length &&
                        !Number.isNaN(+segments[accountsIndex + 1]))
                ) {
                    this.loadUserById(params[`id`] ? +params[`id`] : +segments[accountsIndex + 1]);
                } else if (accountsIndex !== -1) {
                    super.setTitle(`New member`);
                    this.isNewUser = true;
                    this.isEditingUser = true;
                }
            }),
            this.route.url.subscribe(segments => {
                if (segments[0]?.path === `edit`) {
                    this.isEditingUser = true;
                }
            })
        );
    }

    private loadUserById(userId: number | null): void {
        if (userId) {
            this.subscriptions.push(
                this.userController.getViewModelObservable(userId).subscribe(user => {
                    if (user) {
                        const title = user.getTitle();
                        super.setTitle(title);
                        this.user = user;
                        this.generateParticipationTableData();
                    }
                })
            );
        }
    }

    private async createOrUpdateUser(): Promise<void> {
        if (this.isNewUser) {
            await this.createUser();
        } else {
            await this.updateUser();
        }
    }

    private async createUser(): Promise<void> {
        const payload = this.getPartialUserPayload();
        const identifiable = (await this.userController.create(payload))[0];
        this.router.navigate([`..`, identifiable.id], { relativeTo: this.route });
    }

    private async updateUser(): Promise<void> {
        const payload = this.getPartialUserPayload();
        if (
            !(
                this.user.id === this.operator.operatorId &&
                this.operator.user.organization_management_level !== payload.organization_management_level
            ) ||
            (await this.promptService.open(
                _(`This action will diminish your organization management level`),
                _(
                    `This will diminish your ability to do things on the organization level and you will not be able to revert this yourself.`
                )
            ))
        ) {
            await this.userController.update(payload, this.user!).resolve();
            this.router.navigate([`..`], { relativeTo: this.route });
        }
    }

    private getPartialUserPayload(): any {
        const payload = this.personalInfoFormValue;
        if (!this.operator.hasOrganizationPermissions(OML.can_manage_organization)) {
            payload[`committee_management_ids`] = undefined;
        }
        return payload;
    }

    private checkFormForErrors(): void {
        let hint = ``;
        if (this.formErrors && Object.keys(this.formErrors).length) {
            hint = Object.keys(this.formErrors)
                .map(error => this.getErrorHint(error))
                .join(`\n`);
        }
        this.raiseError(hint);
    }

    private getErrorHint(error: string): string {
        let hint = ``;
        switch (error) {
            case `name`:
                hint = `At least one of username, first name or last name has to be set.`;
                break;
            case `management_level`:
                hint = `At least one committee or an organization management-level has to be set.`;
                break;
        }
        return this.translate.instant(hint);
    }
}
