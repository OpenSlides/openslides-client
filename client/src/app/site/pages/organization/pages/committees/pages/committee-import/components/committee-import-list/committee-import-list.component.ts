import { Component, OnInit } from '@angular/core';
import {
    CommitteeCsvPort,
    COMMITTEE_PORT_HEADERS_AND_VERBOSE_NAMES,
    MEETING_ADMIN_IDS,
    MEETING_TEMPLATE_ID
} from 'src/app/domain/models/comittees/committee.constants';
import { ImportListHeaderDefinition } from 'src/app/ui/modules/import-list';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { ImportStepPhase } from 'src/app/infrastructure/utils/import/import-step';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { TranslateService } from '@ngx-translate/core';
import { CommitteeImportService } from '../../services/committee-import.service/committee-import.service';
import { BaseImportListComponent } from 'src/app/site/base/base-import-list.component';
import { Committee } from 'src/app/domain/models/comittees/committee';

@Component({
    selector: 'os-committee-import-list',
    templateUrl: './committee-import-list.component.html',
    styleUrls: ['./committee-import-list.component.scss']
})
export class CommitteeImportListComponent extends BaseImportListComponent<CommitteeCsvPort> implements OnInit {
    public possibleFields: string[] = Object.values(COMMITTEE_PORT_HEADERS_AND_VERBOSE_NAMES) as string[];

    public columns: ImportListHeaderDefinition[] = [
        {
            prop: `newEntry.name`,
            minWidth: 250,
            label: _(`Title`),
            isRequired: true,
            isTableColumn: true
        },
        {
            prop: `newEntry.forward_to_committee_ids`,
            minWidth: 250,
            label: _(`Can forward motions to committee`),
            isTableColumn: true
        },
        {
            prop: `manager_ids`,
            minWidth: 250,
            label: _(`Committee management`),
            isTableColumn: true
        },
        {
            prop: `meeting`,
            minWidth: 250,
            label: _(`Meeting`),
            isTableColumn: true
        },
        {
            prop: `organization_tag_ids`,
            label: _(`Tags`)
        },
        {
            prop: `meeting_start_date`,
            label: _(`Start date`)
        },
        {
            prop: `meeting_end_date`,
            label: _(`End date`)
        },
        {
            prop: MEETING_ADMIN_IDS,
            label: _(`Meeting administrator`),
            isTableColumn: true,
            minWidth: 250
        },
        {
            prop: MEETING_TEMPLATE_ID,
            label: _(`Meeting template`),
            isTableColumn: true,
            minWidth: 250
        }
    ];

    public get isImportValid(): boolean {
        return this._isImportValid;
    }

    public get isImportStarted(): boolean {
        return this._currentImportPhase !== ImportStepPhase.ENQUEUED;
    }

    private _currentImportPhase: ImportStepPhase = ImportStepPhase.ENQUEUED;
    private _isImportValid: boolean = false;

    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        translate: TranslateService,
        public override importer: CommitteeImportService
    ) {
        super(componentServiceCollector, translate, importer);
    }

    public override ngOnInit(): void {
        super.ngOnInit();
        this.subscriptions.push(
            this.importer.currentImportPhaseObservable.subscribe(phase => (this._currentImportPhase = phase)),
            this.importer.isImportValidObservable.subscribe(isValid => (this._isImportValid = isValid))
        );
    }

    public getForwardingTooltip(committees: Committee[] = []): string {
        return committees.map(committee => committee.name).join(`, `);
    }

    public getDate(dateString: string): number {
        if (dateString.length === 8) {
            // Assuming, that it is in the format "YYYYMMDD"
            const toDate = `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-${dateString.slice(6)}`;
            return new Date(toDate).getTime() / 1000;
        } else if (!!dateString) {
            return new Date(dateString).getTime() / 1000;
        }
        return 0;
    }
}
