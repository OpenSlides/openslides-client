import { Component, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, map, Observable, Subscription } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { CML, OML } from 'src/app/domain/definitions/organization-permission';
import { Committee } from 'src/app/domain/models/comittees/committee';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { OrganizationSettingsService } from 'src/app/site/pages/organization/services/organization-settings.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';
import { ListComponent } from 'src/app/ui/modules/list';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { CommitteeControllerService } from '../../../../../../services/committee-controller.service';
import { ViewCommittee } from '../../../../../../view-models/view-committee';
import { CommitteeFilterService } from '../../../../../committee-list/services/committee-list-filter.service/committee-filter.service';
import { CommitteeSortService } from '../../../../../committee-list/services/committee-list-sort.service/committee-sort.service';

@Component({
    selector: `os-committee-detail-view`,
    templateUrl: `./committee-detail-view.component.html`,
    styleUrls: [`./committee-detail-view.component.scss`],
    standalone: false
})
export class CommitteeDetailViewComponent extends BaseUiComponent implements OnDestroy {
    @ViewChild(`subcommittees`)
    private readonly _subcommitteeList: ListComponent<ViewCommittee> | undefined;

    public readonly OML = OML;

    public committeeId: Id | null = null;

    public currentCommitteeObservable: Observable<ViewCommittee | null> | null = null;

    public receiveExpanded = false;
    public forwardingExpanded = false;
    public requireDuplicateFrom = false;

    public get canManageCommittee(): boolean {
        return this.operator.hasCommitteePermissions(this.committeeId, CML.can_manage);
    }

    public accountNumber = 0;
    public accountActiveNumber = 0;
    public accountHomeCommitteeNumber = 0;
    public accountGuestNumber = 0;
    public committeeAccounts = 0;

    public childCommitteesObservable: Observable<ViewCommittee[]>;

    private _numberSubscription: Subscription | null = null;

    public constructor(
        private translate: TranslateService,
        private route: ActivatedRoute,
        private router: Router,
        private operator: OperatorService,
        public committeeRepo: CommitteeControllerService,
        private promptService: PromptService,
        private orgaSettings: OrganizationSettingsService,
        public filterService: CommitteeFilterService,
        public sortService: CommitteeSortService
    ) {
        super();
        this.subscriptions.push(
            this.route.params.subscribe(params => {
                if (params) {
                    this.committeeId = Number(params[`committeeId`]);
                    this.currentCommitteeObservable = this.committeeRepo.getViewModelObservable(this.committeeId);
                    this.childCommitteesObservable = this.committeeRepo
                        .getViewModelListObservable()
                        .pipe(
                            map(arr =>
                                arr
                                    .filter(comm => comm.parent?.id === this.committeeId)
                                    .sort((a, b) => a.name.localeCompare(b.name))
                            )
                        );
                    if (this._numberSubscription) {
                        this._numberSubscription.unsubscribe();
                    }
                    this._numberSubscription = combineLatest(
                        this.committeeRepo.getViewModelListObservable(),
                        this.currentCommitteeObservable
                    )
                        .pipe(
                            map(([commRepo, currentComm]) =>
                                commRepo.filter(
                                    comm => currentComm?.all_child_ids?.includes(comm.id) || currentComm?.id === comm.id
                                )
                            )
                        )
                        .subscribe(committees => {
                            this.accountNumber = this.calculateIds(committees, this.calcAccountIds);
                            this.accountActiveNumber = this.calculateIds(committees, this.calcAccountActiveIds);
                            this.accountHomeCommitteeNumber = this.calculateIds(committees, this.calcHomeComitteeIds);
                            this.accountGuestNumber = this.calculateIds(committees, this.calcGuestIds);
                        });
                    this._subcommitteeList?.clearSearchField();
                }
            })
        );
        this.subscriptions.push(
            this.orgaSettings.get(`require_duplicate_from`).subscribe(value => (this.requireDuplicateFrom = value))
        );
    }

    public override ngOnDestroy(): void {
        super.ngOnDestroy();
        if (this._numberSubscription) {
            this._numberSubscription.unsubscribe();
            this._numberSubscription = null;
        }
    }

    public onCreateMeeting(): void {
        this.router.navigate([`meeting`, `create`], { relativeTo: this.route });
    }

    public async onDeleteCommittee(committee: ViewCommittee): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to delete this committee?`);
        const content = committee.name;

        const confirmed = await this.promptService.open(title, content);
        if (confirmed) {
            await this.committeeRepo.delete(committee);
            this.router.navigate([`./committees/`]);
        }
    }

    public isOrgaAdmin(): boolean {
        return this.operator.isOrgaManager || this.operator.hasCommitteePermissions(this.committeeId, CML.can_manage);
    }

    public isSuperAdmin(): boolean {
        return this.operator.isSuperAdmin;
    }

    public isCMandRequireDuplicateFrom(): boolean {
        return this.requireDuplicateFrom && !this.isOrgaAdmin();
    }

    public canAccessCommittee(committee: Committee): boolean {
        return (
            this.operator.hasCommitteePermissions(committee.id, CML.can_manage) ||
            this.operator.isInCommittees(committee)
        );
    }

    public getMeetingsSorted(committee: ViewCommittee): ViewMeeting[] {
        return committee.meetings.sort((a, b) => {
            const end_time = b.end_time - a.end_time;
            if (Number.isNaN(end_time)) {
                if (b.end_time) {
                    return b.end_time;
                } else if (a.end_time) {
                    return -a.end_time;
                }
                return a.name.localeCompare(b.name);
            } else if (end_time === 0) {
                return a.name.localeCompare(b.name);
            }
            return end_time;
        });
    }

    public getNavbarCommittees(committee: ViewCommittee): ViewCommittee[] {
        return [...committee.all_parents.sort((a, b) => a.all_parents.length - b.all_parents.length), committee];
    }

    public toggleForwardingList(): void {
        this.forwardingExpanded = !this.forwardingExpanded;
    }

    public toggleReceiveList(): void {
        this.receiveExpanded = !this.receiveExpanded;
    }

    public sortCommitteesByName(committees: ViewCommittee[]): ViewCommittee[] {
        return committees.sort((a, b) => (a.name > b.name ? 1 : -1));
    }

    public isChildCommittee(committee: ViewCommittee): boolean {
        return committee.all_parent_ids?.includes(this.committeeId);
    }

    public getIndex(committee: ViewCommittee): number {
        return committee.meetings.length > 0 || (committee.meetings.length === 0 && committee.all_childs.length === 0)
            ? 1
            : 0;
    }

    private calculateIds(
        committees: ViewCommittee[],
        perCommitteeFct: (commitee: ViewCommittee) => Set<number>
    ): number {
        const result = new Set<number>([]);
        for (const c of committees) {
            result.update(perCommitteeFct(c));
        }
        return result.size;
    }

    private calcAccountIds(committee: ViewCommittee): Set<number> {
        const result = new Set<number>(committee.manager_ids);
        result.update(new Set(committee.user_ids));
        return result;
    }

    private calcAccountActiveIds(committee: ViewCommittee): Set<number> {
        const result = new Set<number>();
        for (const user of committee.managers ?? []) {
            if (user.is_active) {
                result.add(user.id);
            }
        }
        for (const user of committee.users ?? []) {
            if (user.is_active) {
                result.add(user.id);
            }
        }
        return result;
    }

    private calcHomeComitteeIds(committee: ViewCommittee): Set<number> {
        const result = new Set<number>([]);
        result.update(new Set(committee.native_user_ids));
        return result;
    }

    private calcGuestIds(committee: ViewCommittee): Set<number> {
        const result = new Set<number>([]);
        for (const user of committee.users) {
            if (user.external) {
                result.add(user.id);
            }
        }
        return result;
    }

    public hasCommitteeChildren(committee: ViewCommittee): boolean {
        return committee.all_childs.length > 0;
    }
}
