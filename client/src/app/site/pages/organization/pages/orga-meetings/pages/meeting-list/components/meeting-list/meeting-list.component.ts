import { ChangeDetectionStrategy, Component } from '@angular/core';
import { _ } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { OML } from 'src/app/domain/definitions/organization-permission';
import { BaseListViewComponent } from 'src/app/site/base/base-list-view.component';
import { MeetingControllerService } from 'src/app/site/pages/meetings/services/meeting-controller.service';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ColumnRestriction } from 'src/app/ui/modules/list';
import { PromptService } from 'src/app/ui/modules/prompt-dialog/services/prompt.service';

import { MeetingCsvExportService } from '../../services/meeting-export.service';
import { MeetingListFilterService } from '../../services/meeting-list-filter/meeting-list-filter.service';
import { MeetingListSortService } from '../../services/meeting-list-sort/meeting-list-sort.service';

const MEETING_LIST_STORAGE_INDEX = `meeting_list`;

@Component({
    selector: `os-meeting-list`,
    templateUrl: `./meeting-list.component.html`,
    styleUrls: [`./meeting-list.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MeetingListComponent extends BaseListViewComponent<ViewMeeting> {
    public restrictedColumns: ColumnRestriction<OML>[] = [
        {
            columnName: `menu`,
            permission: OML.can_manage_organization
        }
    ];

    public toRestrictFn = (restriction: ColumnRestriction<OML>): boolean =>
        !this.operator.hasOrganizationPermissions(restriction.permission);

    public constructor(
        protected override translate: TranslateService,
        public meetingController: MeetingControllerService,
        public operator: OperatorService,
        public filterService: MeetingListFilterService,
        public sortService: MeetingListSortService,
        private csvExport: MeetingCsvExportService,
        private promptService: PromptService
    ) {
        super();
        super.setTitle(`Meetings`);
        this.canMultiSelect = true;
        this.listStorageIndex = MEETING_LIST_STORAGE_INDEX;
    }

    public editSingle(meeting: ViewMeeting): void {
        this.router.navigate([`/committees`, meeting.committee_id, `meeting`, `edit`, meeting.id]);
    }

    public getMeetingUrl(meeting: ViewMeeting): string | null {
        return `/` + meeting.id + ``;
    }

    public getCommitteeForMeetingUrl(meeting: ViewMeeting): string | null {
        return `/committees/` + meeting.committee_id + ``;
    }

    public csvExportMeetingList(): void {
        this.csvExport.export(this.listComponent.source);
    }

    public async doDelete(meeting?: ViewMeeting): Promise<void> {
        const toDelete = meeting ? [meeting] : this.selectedRows;
        const toTranslate = meeting
            ? _(`Are you sure you want to delete this meeting?`)
            : _(`Are you sure you want to delete all selected meetings?`);
        const title = this.translate.instant(toTranslate);
        const content = meeting?.name ?? ``;
        const confirm = this.translate.instant(`Yes, delete`);
        const decline = ``;
        const deletion = true;

        const answer = await this.promptService.open(title, content, confirm, decline, deletion);
        if (answer) {
            await this.meetingController.delete(...toDelete);
        }
    }

    public ariaLabel(meeting: ViewMeeting, isCommittee?: boolean): string {
        if (isCommittee) {
            return this.translate.instant(`Navigate to committee detail view from `) + meeting.committeeName;
        }
        return this.translate.instant(`Navigate to meeting `) + meeting.name;
    }
}
