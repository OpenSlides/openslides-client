import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { CML, OML } from 'src/app/domain/definitions/organization-permission';
import { Permission } from 'src/app/domain/definitions/permission';
import { Committee } from 'src/app/domain/models/comittees/committee';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { OrganizationSettingsService } from 'src/app/site/pages/organization/services/organization-settings.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { CommitteeControllerService } from '../../../../../../services/committee-controller.service';
import { ViewCommittee } from '../../../../../../view-models/view-committee';

@Component({
    selector: `os-committee-detail-view`,
    templateUrl: `./committee-detail-view.component.html`,
    styleUrls: [`./committee-detail-view.component.scss`]
})
export class CommitteeDetailViewComponent extends BaseUiComponent {
    public readonly OML = OML;

    public committeeId: Id | null = null;

    public currentCommitteeObservable: Observable<ViewCommittee | null> | null = null;

    public receiveExpanded = false;
    public forwardingExpanded = false;
    public requireDuplicateFrom = false;

    public get canManageMeetingsInCommittee(): boolean {
        return this.operator.hasCommitteePermissionsNonAdminCheck(this.committeeId, CML.can_manage);
    }

    public get canManageCommittee(): boolean {
        return this.operator.hasCommitteePermissions(this.committeeId, CML.can_manage);
    }

    public canSeeParticipantAmount(meeting: ViewMeeting): boolean {
        return (
            this.operator.isOrgaManager ||
            this.canManageCommittee ||
            this.operator.hasPermsInMeeting(meeting.id, Permission.userCanSee)
        );
    }

    public constructor(
        private translate: TranslateService,
        private route: ActivatedRoute,
        private router: Router,
        private operator: OperatorService,
        private committeeRepo: CommitteeControllerService,
        private promptService: PromptService,
        private orgaSettings: OrganizationSettingsService
    ) {
        super();
        this.subscriptions.push(
            this.route.params.subscribe(params => {
                if (params) {
                    this.committeeId = Number(params[`committeeId`]);
                    this.currentCommitteeObservable = this.committeeRepo.getViewModelObservable(this.committeeId);
                }
            })
        );
        this.subscriptions.push(
            this.orgaSettings.get(`require_duplicate_from`).subscribe(value => (this.requireDuplicateFrom = value))
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
        return this.operator.isOrgaManager;
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
        return committee.meetings.sort((a, b) => b.end_time - a.end_time);
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
}
