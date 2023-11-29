import { Component, OnInit } from '@angular/core';
import { marker as _ } from '@colsen1991/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { Committee } from 'src/app/domain/models/comittees/committee';
import {
    COMMITTEE_PORT_HEADERS_AND_VERBOSE_NAMES,
    CommitteeCsvPort,
    MEETING_ADMIN_IDS,
    MEETING_TEMPLATE_ID
} from 'src/app/domain/models/comittees/committee.constants';
import { ImportStepPhase } from 'src/app/infrastructure/utils/import/import-step';
import { BaseImportListComponent } from 'src/app/site/base/base-import-list.component';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { ImportListHeaderDefinition } from 'src/app/ui/modules/import-list';

import { CommitteeImportService } from '../../services/committee-import.service/committee-import.service';

@Component({
    selector: `os-committee-import-list`,
    templateUrl: `./committee-import-list.component.html`,
    styleUrls: [`./committee-import-list.component.scss`]
})
export class CommitteeImportListComponent extends BaseImportListComponent<CommitteeCsvPort> implements OnInit {
    public possibleFields: string[] = Object.values(COMMITTEE_PORT_HEADERS_AND_VERBOSE_NAMES) as string[];

    public columns: ImportListHeaderDefinition[] = [
        {
            property: `newEntry.name`,
            width: 250,
            label: _(`Title`),
            isRequired: true,
            isTableColumn: true
        },
        {
            property: `newEntry.forward_to_committee_ids`,
            width: 250,
            label: _(`Can forward motions to committee`),
            isTableColumn: true
        },
        {
            property: `manager_ids`,
            width: 250,
            label: _(`Committee admin`),
            isTableColumn: true
        },
        {
            property: `meeting`,
            width: 250,
            label: _(`Meeting`),
            isTableColumn: true
        },
        {
            property: `organization_tag_ids`,
            label: _(`Tags`)
        },
        {
            property: `meeting_start_date`,
            label: _(`Start date`)
        },
        {
            property: `meeting_end_date`,
            label: _(`End date`)
        },
        {
            property: MEETING_ADMIN_IDS,
            label: _(`Meeting administrator`),
            isTableColumn: true,
            width: 250
        },
        {
            property: MEETING_TEMPLATE_ID,
            label: _(`Meeting template`),
            isTableColumn: true,
            width: 250
        }
    ];

    public get isImportValid(): boolean {
        return this._isImportValid;
    }

    public get isImportStarted(): boolean {
        return this._currentImportPhase !== ImportStepPhase.ENQUEUED;
    }

    private _currentImportPhase: ImportStepPhase = ImportStepPhase.ENQUEUED;
    private _isImportValid = false;

    public constructor(
        componentServiceCollector: ComponentServiceCollectorService,
        protected override translate: TranslateService,
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
