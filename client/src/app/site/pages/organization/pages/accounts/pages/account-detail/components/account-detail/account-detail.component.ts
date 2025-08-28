import { KeyValue } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { CML, getOmlVerboseName, OML, OMLMapping } from 'src/app/domain/definitions/organization-permission';
import { GetUserScopePresenterService } from 'src/app/gateways/presenter';
import { BaseComponent } from 'src/app/site/base/base.component';
import { UserDetailViewComponent } from 'src/app/site/modules/user-components';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { OpenSlidesRouterService } from 'src/app/site/services/openslides-router.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { ViewCommittee } from '../../../../../committees';
import { getCommitteeListMinimalSubscriptionConfig } from '../../../../../committees/committees.subscription';
import { CommitteeSortService } from '../../../../../committees/pages/committee-list/services/committee-list-sort.service/committee-sort.service';
import { CommitteeControllerService } from '../../../../../committees/services/committee-controller.service';
import { AccountControllerService } from '../../../../services/common/account-controller.service';

type ParticipationTableData = Record<Id, ParticipationTableDataRow>;
interface ParticipationTableDataRow {
    committee_name?: string;
    is_manager?: boolean;
    meetings: Record<Id, ParticipationTableMeetingDataRow>;
}
interface ParticipationTableMeetingDataRow {
    meeting_name: string;
    group_names: string[];
    is_public: boolean;
    is_closed: boolean;
    is_archieved: boolean;
    is_accessible: boolean;
}

@Component({
    selector: `os-account-detail`,
    templateUrl: `./account-detail.component.html`,
    styleUrls: [`./account-detail.component.scss`],
    standalone: false
})
export class AccountDetailComponent extends BaseComponent implements OnInit {
    public get organizationManagementLevels(): string[] {
        return Object.values(OML).filter(
            (level: OML) =>
                this.operator.hasOrganizationPermissions(level) &&
                !(this.orgaManagementLevelChangeDisabled && level !== this.user.organization_management_level)
        );
    }

    public get operatorHasEqualOrHigherOML(): boolean {
        const userOML = this.user?.organization_management_level;
        return userOML ? this.operator.hasOrganizationPermissions(userOML as OML) : true;
    }

    public get orgaManagementLevelChangeDisabled(): boolean {
        return (
            this.user?.id === this.operator.operatorId &&
            (this.operator.isSuperAdmin || this.operator.isOrgaManager || this.operator.isAccountAdmin)
        );
    }

    @ViewChild(UserDetailViewComponent, { static: false })
    public set userDetailView(userDetailView: UserDetailViewComponent | undefined) {
        this._detailView = userDetailView;
        this._detailView?.markAsPristine();
    }

    private _detailView: UserDetailViewComponent;

    public additionalFormControls = {
        default_vote_weight: [``, Validators.min(0.000001)],
        organization_management_level: [],
        committee_management_ids: [],
        home_committee_id: [],
        external: []
    };

    public isFormValid = false;
    public personalInfoFormValue: any = {};
    public formErrors: Record<string, boolean> | null = null;

    public isEditingUser = false;
    public user: ViewUser | null = null;
    public isNewUser = false;
    public committeeSubscriptionConfig = getCommitteeListMinimalSubscriptionConfig();
    public home_committee_id: number = undefined;

    public get numCommittees(): number {
        return this._numCommittees;
    }

    public get tableData(): ParticipationTableData {
        return this._tableData;
    }

    public get canSeeParticipationTable(): boolean {
        return (
            (this.operator.hasOrganizationPermissions(OML.can_manage_organization) ||
                this.operator.isAnyCommitteeManager) &&
            (!!this.user.committee_ids?.length || !!this.user.meeting_ids?.length)
        );
    }

    public get canManageHomeCommittee(): boolean {
        return this.home_committee_id
            ? this.operator.hasCommitteePermissions(this.home_committee_id, CML.can_manage)
            : this.operator.hasOrganizationPermissions(OML.can_manage_users) || this.operator.isAnyCommitteeManager;
    }

    public get comitteeAdministrationAmount(): number {
        return Object.values(this._tableData).filter(row => row[`is_manager`] === true).length;
    }

    public get userOML(): OML {
        return this.user?.organization_management_level as OML;
    }

    public get canEdit(): boolean {
        if (!this.userOML) {
            return true;
        }
        return this.operator.hasOrganizationPermissions(this.userOML);
    }

    public shouldEnableFormControl(): boolean {
        if (
            !this.userOML &&
            (!this.home_committee_id || this.operator.hasCommitteePermissions(this.home_committee_id, CML.can_manage))
        ) {
            return true;
        }
        return this.operator.hasOrganizationPermissions(this.userOML);
    }

    public shouldEnableFormControlFn: (_: string) => boolean = (_: string) => this.shouldEnableFormControl();

    public tableDataAscOrderCompare = <T>(a: KeyValue<string, T>, b: KeyValue<string, T>): number => {
        const aName = a.value[`committee_name`] ?? a.value[`meeting_name`] ?? ``;
        const bName = b.value[`committee_name`] ?? b.value[`meeting_name`] ?? ``;
        return aName.localeCompare(bName);
    };

    private _tableData: ParticipationTableData = {};
    private _numCommittees = 0;

    public constructor(
        protected override translate: TranslateService,
        private route: ActivatedRoute,
        private osRouter: OpenSlidesRouterService,
        private operator: OperatorService,
        public readonly committeeController: CommitteeControllerService,
        public readonly committeeSortService: CommitteeSortService,
        private accountController: AccountControllerService,
        private userController: UserControllerService,
        private promptService: PromptService,
        private scopePresenter: GetUserScopePresenterService
    ) {
        super();
    }

    public ngOnInit(): void {
        this.getUserByUrl();
    }

    public getTransformSetFn(): (value?: string[]) => Id[] {
        return () => (this.user ? this.user.committee_management_ids : []);
    }

    public getTransformSetHomeCommitteeFn(): (value?: string[]) => Id {
        return () => (this.user ? this.user.home_committee_id : null);
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

    public getNumberOfKeys(item: Record<string, any>): number {
        return Object.keys(item).length;
    }

    public get isDefaultVoteWeightError(): boolean {
        return this.personalInfoFormValue.default_vote_weight < 0.000001;
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
                    .sort((a, b) => a.localeCompare(b)),
                is_archieved: meeting.isArchived,
                is_closed: meeting.locked_from_inside,
                is_public: meeting.publicAccessPossible(),
                is_accessible:
                    (meeting.canAccess() && this.operator.isInMeeting(meeting.id)) ||
                    (!meeting.locked_from_inside &&
                        (this.operator.canSkipPermissionCheck ||
                            this.operator.isCommitteeManagerForMeeting(meeting.id)))
            };
        });
        this._tableData = tableData;
        this._numCommittees = Object.keys(this.tableData).length;
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
                        if (user.id !== this.user?.id) {
                            this.home_committee_id = undefined;
                            this.loadHomeCommitteeId(user.id);
                        }
                        this.user = user;
                        this.generateParticipationTableData();
                    } else {
                        this.home_committee_id = undefined;
                    }
                    this._detailView?.update();
                })
            );
        }
    }

    private async loadHomeCommitteeId(userId: number): Promise<void> {
        const presenterResult = await this.scopePresenter.call({ user_ids: [userId] });
        this.home_committee_id = presenterResult[userId].home_committee_id;
        this._detailView?.update();
    }

    private async createOrUpdateUser(): Promise<void> {
        if (this.isNewUser) {
            await this.createUser();
        } else {
            await this.updateUser();
        }
    }

    private async createUser(): Promise<void> {
        const payload = this.getPartialUserPayload(true);
        const identifiable = (await this.userController.create(payload))[0];
        this.router.navigate([`..`, identifiable.id], { relativeTo: this.route });
    }

    private async updateUser(): Promise<void> {
        const payload = this.getPartialUserPayload(false);
        await this.userController.update(payload, this.user!).resolve();
        this.router.navigate([`..`], { relativeTo: this.route });
    }

    private getPartialUserPayload(isCreate: boolean): any {
        const payload = this.personalInfoFormValue;
        if (!this.operator.hasOrganizationPermissions(OML.can_manage_organization)) {
            payload[`committee_management_ids`] = undefined;
            payload[`organization_management_level`] = undefined;
        }
        if (payload.member_number === ``) {
            if (isCreate) {
                delete payload.member_number;
            } else {
                payload.member_number = null;
            }
        }
        if (payload.gender_id === 0) {
            if (isCreate) {
                delete payload.gender_id;
            } else {
                payload.gender_id = null;
            }
        }
        if (payload.home_committee_id === 0) {
            if (isCreate) {
                delete payload.home_committee_id;
            } else {
                payload.home_committee_id = null;
            }
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
