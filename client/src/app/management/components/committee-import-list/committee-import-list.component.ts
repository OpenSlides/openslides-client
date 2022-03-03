import { Component, OnInit } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { MemberService } from 'app/core/core-services/member.service';
import { Committee } from 'app/shared/models/event-management/committee';
import { ImportStepPhase } from 'app/shared/utils/import/import-step';

import { SimplifiedModelRequest } from '../../../core/core-services/model-request-builder.service';
import { ORGANIZATION_ID } from '../../../core/core-services/organization.service';
import { ComponentServiceCollector } from '../../../core/ui-services/component-service-collector';
import { ImportListViewHeaderDefinition } from '../../../shared/components/import-list-view/import-list-view.component';
import {
    COMMITTEE_PORT_HEADERS_AND_VERBOSE_NAMES,
    CommitteeCsvPort
} from '../../../shared/models/event-management/committee.constants';
import { BaseImportListComponent } from '../../../site/base/components/base-import-list.component';
import { ViewOrganization } from '../../models/view-organization';
import { CommitteeImportService } from '../../services/committee-import.service';

@Component({
    selector: `os-committee-import-list`,
    templateUrl: `./committee-import-list.component.html`,
    styleUrls: [`./committee-import-list.component.scss`]
})
export class CommitteeImportListComponent extends BaseImportListComponent<CommitteeCsvPort> implements OnInit {
    public possibleFields = Object.values(COMMITTEE_PORT_HEADERS_AND_VERBOSE_NAMES);

    public columns: ImportListViewHeaderDefinition[] = [
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
        }
    ];

    public get isImportValid(): boolean {
        return this._isImportValid;
    }

    public get isImportStarted(): boolean {
        return this._currentImportPhase !== ImportStepPhase.ENQUEUED;
    }

    private _currentImportPhase: ImportStepPhase;
    private _isImportValid: boolean;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        public importer: CommitteeImportService,
        private memberService: MemberService
    ) {
        super(componentServiceCollector, translate, importer);
    }

    public ngOnInit(): void {
        super.ngOnInit();
        this.subscriptions.push(
            this.importer.currentImportPhaseObservable.subscribe(phase => (this._currentImportPhase = phase)),
            this.importer.isImportValidObservable.subscribe(isValid => (this._isImportValid = isValid))
        );
        this.requestExistingUsers();
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
    }

    protected getModelRequest(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewOrganization,
            ids: [ORGANIZATION_ID],
            fieldset: ``,
            follow: [{ idField: `committee_ids` }, { idField: `organization_tag_ids` }]
        };
    }

    private async requestExistingUsers(): Promise<void> {
        const request = await this.memberService.getAllOrgaUsersModelRequest();
        this.subscribe(request);
    }
}
