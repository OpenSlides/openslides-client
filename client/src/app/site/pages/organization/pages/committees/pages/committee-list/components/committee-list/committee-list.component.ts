import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { BaseListViewComponent } from 'src/app/site/base/base-list-view.component';
import { MeetingControllerService } from 'src/app/site/pages/meetings/services/meeting-controller.service';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ChoiceService } from 'src/app/ui/modules/choice-dialog/services/choice.service';

import { CommitteeControllerService } from '../../../../services/committee-controller.service';
import { ViewCommittee } from '../../../../view-models';
import { CommitteeExportService } from '../../services/committee-list-export.service/committee-export.service';
import { CommitteeFilterService } from '../../services/committee-list-filter.service/committee-filter.service';
import { CommitteeSortService } from '../../services/committee-list-sort.service/committee-sort.service';

export const NAVIGATION_FROM_LIST = `list`;

const COMMITTEE_LIST_STORAGE_INDEX = `committee_list`;

@Component({
    selector: `os-committee-list`,
    templateUrl: `./committee-list.component.html`,
    styleUrls: [`./committee-list.component.scss`]
})
export class CommitteeListComponent extends BaseListViewComponent<ViewCommittee> {
    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        protected override translate: TranslateService,
        public committeeController: CommitteeControllerService,
        public operator: OperatorService,
        public filterService: CommitteeFilterService,
        public sortService: CommitteeSortService,
        private csvService: CommitteeExportService,
        private route: ActivatedRoute,
        private choiceService: ChoiceService,
        private meetingRepo: MeetingControllerService
    ) {
        super(componentServiceCollector, translate);
        super.setTitle(`Committees`);
        this.canMultiSelect = true;
        this.listStorageIndex = COMMITTEE_LIST_STORAGE_INDEX;
    }

    public editSingle(committee: ViewCommittee): void {
        this.router.navigate([`edit-committee`], {
            relativeTo: this.route,
            queryParams: { from: NAVIGATION_FROM_LIST, committeeId: committee.id }
        });
    }

    public createNewCommittee(): void {
        this.router.navigate([`create`], { relativeTo: this.route });
    }

    public async forwardToCommittees(): Promise<void> {
        const content = this.translate.instant(`Set or remove motion forwarding from the selected committees to:`);
        const ADD = _(`Set forward`);
        const REMOVE = _(`Remove forward`);
        const choices = [ADD, REMOVE];
        const selectedChoice = await this.choiceService.open(
            content,
            this.committeeController.getViewModelList(),
            true,
            choices
        );
        if (selectedChoice) {
            if (selectedChoice.action === ADD) {
                this.committeeController.bulkForwardToCommittees(this.selectedRows, selectedChoice.ids as number[]);
            } else {
                this.committeeController.bulkUnforwardToCommittees(this.selectedRows, selectedChoice.ids as number[]);
            }
        }
    }

    public async doDelete(committee?: ViewCommittee): Promise<void> {
        const toDelete = committee ? [committee] : this.selectedRows;
        const toTranslate = committee
            ? `Are you sure you want to delete this committee?`
            : `Are you sure you want to delete all selected committees?`;
        const title = this.translate.instant(toTranslate);
        const content = committee?.name ?? ``;

        const haveMeetings = toDelete.some(committeeDel => !!committeeDel.meeting_ids?.length);
        const YES_WITH_MEETINGS = _(`Yes, inclusive meetings`);
        const YES = _(`Yes`);
        const actions = haveMeetings ? [YES_WITH_MEETINGS] : [YES];

        const answer = await this.choiceService.open({ title, content, actions });
        if (answer) {
            if (answer.action === YES_WITH_MEETINGS) {
                const meetingIdsToDelete = toDelete
                    .flatMap(committeeToDelete => committeeToDelete.meeting_ids)
                    .filter(id => !!id)
                    .map(id => ({ id }));
                await this.meetingRepo.delete(...meetingIdsToDelete);
            }
            await this.committeeController.delete(...toDelete);
        }
    }

    public async exportAsCsv(): Promise<void> {
        const committeesToExport = this.selectedRows.length
            ? this.selectedRows
            : this.committeeController.getViewModelList();
        this.csvService.export(committeesToExport);
    }
}
