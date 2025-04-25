import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, map, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { CML, OML } from 'src/app/domain/definitions/organization-permission';
import { Committee } from 'src/app/domain/models/comittees/committee';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { OrganizationSettingsService } from 'src/app/site/pages/organization/services/organization-settings.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';
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
export class CommitteeDetailViewComponent extends BaseUiComponent {
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
    public committeeAccounts = 0;

    public childCommitteesObservable: Observable<ViewCommittee[]>;
    public allSubCommitteesObservable: Observable<ViewCommittee[]>;

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
                    this.childCommitteesObservable = this.committeeRepo.getViewModelListObservable().pipe(map( arr => arr.filter( comm => 
                        comm.parent?.id === this.committeeId
                    )))
                    // subscribe to all sub committees to get aggregated data
                    this.allSubCommitteesObservable = combineLatest(this.committeeRepo.getViewModelListObservable(), this.currentCommitteeObservable).pipe(map(([commRepo, currentComm]) => 
                        commRepo.filter(comm => currentComm?.all_child_ids?.includes(comm.id))
                    ));
                    this.currentCommitteeObservable.subscribe(comm => {
                        this.committeeAccounts = comm?.native_user_ids ? comm?.native_user_ids?.length : 0;
                    });
                    this.allSubCommitteesObservable.pipe(map(committees => committees?.reduce((sum,item) => sum + (item?.native_user_ids?.length ?? 0), 0))
                    )
                    .subscribe(total => {
                        this.accountNumber = (total ? total : 0) + this.committeeAccounts;
                    });
                }
            })
        );
        this.subscriptions.push(
            this.orgaSettings.get(`require_duplicate_from`).subscribe(value => (this.requireDuplicateFrom = value)),
        );
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

    public toggleForwardingList(): void {
        this.forwardingExpanded = !this.forwardingExpanded;
    }

    public toggleReceiveList(): void {
        this.receiveExpanded = !this.receiveExpanded;
    }

    public sortCommitteesByName(committees: ViewCommittee[]): ViewCommittee[] {
        return committees.sort((a, b) => (a.name > b.name ? 1 : -1));
    }

    public ariaLabel(committee: ViewCommittee): string {
        return this.translate.instant(`Navigate to committee detail view from `) + committee.name;
    }

    public isChildCommittee(committee: ViewCommittee): boolean {
        return committee.all_parent_ids?.includes(this.committeeId);
    }

    public getIndex(committee: ViewCommittee): number {
        return committee.meetings.length > 0 || committee.meetings.length === 0 && committee.all_childs.length === 0 ? 1 : 0;
    }
}
