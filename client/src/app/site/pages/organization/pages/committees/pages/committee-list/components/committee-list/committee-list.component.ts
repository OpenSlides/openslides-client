import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PblColumnDefinition } from '@pebula/ngrid';
import { BaseListViewComponent } from 'src/app/site/base/base-list-view.component';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ChoiceService } from 'src/app/ui/modules/choice-dialog/services/choice.service';
import { CommitteeControllerService } from '../../../../services/committee-controller.service';
import { CommitteeFilterService } from '../../services/committee-list-filter.service/committee-filter.service';
import { CommitteeSortService } from '../../services/committee-list-sort.service/committee-sort.service';
import { MeetingControllerService } from 'src/app/site/pages/meetings/services/meeting-controller.service';
import { ViewCommittee } from '../../../../view-models';
import { CommitteeExportService } from '../../services/committee-list-export.service/committee-export.service';

export const NAVIGATION_FROM_LIST = `list`;

@Component({
    selector: 'os-committee-list',
    templateUrl: './committee-list.component.html',
    styleUrls: ['./committee-list.component.scss']
})
export class CommitteeListComponent extends BaseListViewComponent<ViewCommittee> {
    public readonly tableColumnDefinition: PblColumnDefinition[] = [
        {
            prop: `name`,
            minWidth: 250,
            width: `100%`
        },
        {
            prop: `forwarding`,
            width: `70px`
        },
        {
            prop: `meta`,
            width: `70px`
        }
    ];

    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        translate: TranslateService,
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
        const content = _(`Set or remove motion forwarding from the selected committees to:`);
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
                this.committeeController.bulkForwardToCommittees(this.selectedRows, selectedChoice.items as number[]);
            } else {
                this.committeeController.bulkUnforwardToCommittees(this.selectedRows, selectedChoice.items as number[]);
            }
        }
    }

    public async doDelete(committee?: ViewCommittee): Promise<void> {
        const toDelete = committee ? [committee] : this.selectedRows;
        const toTranslate = committee
            ? `Are you sure you want to delete this committee?`
            : `Are you sure you want to delete all selected committees?`;
        const title = _(toTranslate);
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
