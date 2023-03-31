import { ChangeDetectionStrategy, Component } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { map, Observable } from 'rxjs';
import { OML } from 'src/app/domain/definitions/organization-permission';
import { BaseListViewComponent } from 'src/app/site/base/base-list-view.component';
import { MeetingControllerService } from 'src/app/site/pages/meetings/services/meeting-controller.service';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ChoiceService } from 'src/app/ui/modules/choice-dialog';
import { ColumnRestriction } from 'src/app/ui/modules/list';

import { MeetingListFilterService } from '../../services/meeting-list-filter/meeting-list-filter.service';
import { MeetingListSortService } from '../../services/meeting-list-sort/meeting-list-sort.service';

const MEETING_LIST_STORAGE_INDEX = `committee_list`;

@Component({
    selector: `os-meeting-list`,
    templateUrl: `./meeting-list.component.html`,
    styleUrls: [`./meeting-list.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MeetingListComponent extends BaseListViewComponent<ViewMeeting> {
    public meetingsObservable: Observable<ViewMeeting[]>;

    public restrictedColumns: ColumnRestriction<OML>[] = [
        {
            columnName: `menu`,
            permission: OML.can_manage_organization
        }
    ];

    public toRestrictFn = (restriction: ColumnRestriction<OML>) =>
        !this.operator.hasOrganizationPermissions(restriction.permission);

    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        protected override translate: TranslateService,
        public meetingController: MeetingControllerService,
        public operator: OperatorService,
        public filterService: MeetingListFilterService,
        public sortService: MeetingListSortService,
        private choiceService: ChoiceService
    ) {
        super(componentServiceCollector, translate);
        super.setTitle(`Meetings`);
        this.canMultiSelect = true;
        this.listStorageIndex = MEETING_LIST_STORAGE_INDEX;

        this.meetingsObservable = this.meetingController
            .getViewModelListObservable()
            .pipe(
                map(meetings =>
                    this.operator.isSuperAdmin
                        ? meetings
                        : meetings.filter(meeting => this.operator.isInMeeting(meeting.id))
                )
            );
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

    public async doDelete(meeting?: ViewMeeting): Promise<void> {
        const toDelete = meeting ? [meeting] : this.selectedRows;
        const toTranslate = meeting
            ? _(`Are you sure you want to delete this meeting?`)
            : _(`Are you sure you want to delete all selected meetings?`);
        const title = this.translate.instant(toTranslate);
        const content = meeting?.name ?? ``;

        const answer = await this.choiceService.open({ title, content, actions: [_(`Yes`)] });
        if (answer) {
            await this.meetingController.delete(...toDelete);
        }
    }
}
