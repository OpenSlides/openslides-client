import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { Action } from 'src/app/gateways/actions';
import { BaseListViewComponent } from 'src/app/site/base/base-list-view.component';
import { SpinnerService } from 'src/app/site/modules/global-spinner';
import { MeetingControllerService } from 'src/app/site/pages/meetings/services/meeting-controller.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ChoiceAnswer } from 'src/app/ui/modules/choice-dialog/definitions';
import { ChoiceService } from 'src/app/ui/modules/choice-dialog/services/choice.service';

import { ViewOrganizationTag } from '../../../../../organization-tags';
import { OrganizationTagControllerService } from '../../../../../organization-tags/services/organization-tag-controller.service';
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
    private get messageForSpinner(): string {
        return this.translate.instant(`Agenda items are in process. Please wait ...`);
    }

    protected override translate = inject(TranslateService);
    public committeeController = inject(CommitteeControllerService);
    public operator = inject(OperatorService);
    public filterService = inject(CommitteeFilterService);
    public sortService = inject(CommitteeSortService);
    private csvService = inject(CommitteeExportService);
    private route = inject(ActivatedRoute);
    private choiceService = inject(ChoiceService);
    private meetingRepo = inject(MeetingControllerService);
    private tagRepo = inject(OrganizationTagControllerService);
    private spinnerService = inject(SpinnerService);

    public constructor() {
        super();
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

    public async editTags(): Promise<void> {
        const committees = this.selectedRows;
        const title = this.translate.instant(
            `This will add or remove the following tags for all selected agenda items:`
        );
        const ADD = this.translate.instant(`Add`);
        const REMOVE = this.translate.instant(`Remove`);
        const actions = [ADD, REMOVE];
        const selectedChoice = await this.choiceService.open({
            title,
            choices: this.tagRepo.getViewModelListObservable(),
            multiSelect: true,
            actions,
            clearChoiceOption: this.translate.instant(`Clear tags`)
        });

        if (selectedChoice) {
            const requestData: Promise<void>[] = [];
            if (selectedChoice.action === ADD) {
                this.addTags(committees, selectedChoice);
            } else if (selectedChoice.action === REMOVE) {
                this.removeTags(committees, selectedChoice);
            } else {
                this.clearTags(committees);
            }

            const message = `${committees.length} ` + this.translate.instant(this.messageForSpinner);
            this.spinnerService.show(message, {
                hideAfterPromiseResolved: async () => {
                    for (const request of requestData) {
                        await request;
                    }
                }
            });
        }
    }

    private async addTags(
        committees: ViewCommittee[],
        selectedChoice: ChoiceAnswer<ViewOrganizationTag>
    ): Promise<void | void[]> {
        return await Action.from(
            ...committees.map(committee => {
                const tagIds = new Set((committee.organization_tag_ids || []).concat(selectedChoice.ids));
                return this.committeeController.update({ organization_tag_ids: Array.from(tagIds) }, committee);
            })
        ).resolve();
    }

    private async removeTags(
        committees: ViewCommittee[],
        selectedChoice: ChoiceAnswer<ViewOrganizationTag>
    ): Promise<void | void[]> {
        return Action.from(
            ...committees.map(committee => {
                const remainingTagIds = new Set(
                    committee.organization_tag_ids.filter(tagId => selectedChoice.ids.indexOf(tagId) === -1)
                );
                return this.committeeController.update(
                    { organization_tag_ids: Array.from(remainingTagIds) },
                    committee
                );
            })
        ).resolve();
    }

    private async clearTags(committees: ViewCommittee[]): Promise<void | void[]> {
        return Action.from(
            ...committees.map(committee => this.committeeController.update({ organization_tag_ids: [] }, committee))
        ).resolve();
    }
}
