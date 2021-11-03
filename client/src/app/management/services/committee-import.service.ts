import { Injectable } from '@angular/core';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

import { OperatorService } from '../../core/core-services/operator.service';
import { CommitteeRepositoryService } from '../../core/repositories/management/committee-repository.service';
import { MeetingRepositoryService } from '../../core/repositories/management/meeting-repository.service';
import { OrganizationTagRepositoryService } from '../../core/repositories/management/organization-tag-repository.service';
import { UserRepositoryService } from '../../core/repositories/users/user-repository.service';
import { BaseImportService, CsvMapping, ImportConfig } from '../../core/ui-services/base-import.service';
import { CsvExportService } from '../../core/ui-services/csv-export.service';
import { ImportServiceCollector } from '../../core/ui-services/import-service-collector';
import {
    COMMITTEE_PORT_HEADERS_AND_VERBOSE_NAMES,
    CommitteeCsvPort
} from '../../shared/models/event-management/committee.constants';
import { UserImportHelper } from '../../site/motions/import/user-import-helper';
import { COMMITTEE_CSV_EXPORT_EXAMPLE } from '../export/committee-csv-export-example';

const ORGANIZATION_TAG_PROPERTY = `organization_tag_ids`;
const CAN_FORWARD_MOTIONS_TO_COMMITTEE_PROPERTY = `forward_to_committee_ids`;
const MANAGER_PROPERTY = `manager_ids`;
const MEETING_PROPERTY = `meeting`;

@Injectable({
    providedIn: `root`
})
export class CommitteeImportService extends BaseImportService<CommitteeCsvPort> {
    public errorList = {
        Duplicates: marker(`This committee already exists`)
    };

    public requiredHeaderLength = 1;

    public constructor(
        serviceCollector: ImportServiceCollector,
        private exporter: CsvExportService,
        private repo: CommitteeRepositoryService,
        organizationTagRepo: OrganizationTagRepositoryService,
        userRepo: UserRepositoryService,
        meetingRepo: MeetingRepositoryService,
        operator: OperatorService
    ) {
        super(serviceCollector);
        this.registerBeforeImportHelper(ORGANIZATION_TAG_PROPERTY, {
            repo: organizationTagRepo,
            idProperty: `organization_tag_ids`,
            verboseNameFn: plural => (plural ? `Tags` : `Tag`)
        });
        this.registerBeforeImportHelper(CAN_FORWARD_MOTIONS_TO_COMMITTEE_PROPERTY, {
            repo,
            idProperty: `forward_to_committee_ids`,
            verboseNameFn: plural => (plural ? `Forwardings` : `Forwarding`),
            nameDelimiter: `;`,
            afterCreateUnresolvedEntriesFn: (modelsCreated, originalEntries) => {
                for (const model of modelsCreated) {
                    const originalOne = originalEntries.find(entry => entry.name === model.name);
                    if (originalOne) {
                        originalOne.id = model.id;
                    }
                }
            }
        });
        this.registerBeforeImportHelper(
            MANAGER_PROPERTY,
            new UserImportHelper({
                repo: userRepo,
                verboseName: `Committee managers`,
                property: `manager_ids`,
                useDefault: [operator.operatorId]
            })
        );
        this.registerAfterImportHandler(MEETING_PROPERTY, {
            repo: meetingRepo,
            useArray: true,
            fixedChunkSize: 1,
            findFn: (name, committee) => ({ name: name === `1` ? committee.name : name }),
            transformFn: (_, originalEntries: any[]) => {
                let meetingPayload = [];
                for (const committee of originalEntries) {
                    if (committee.meeting && committee.meeting.length > 0) {
                        meetingPayload = meetingPayload.concat(
                            committee.meeting.map((meeting: CsvMapping) => ({
                                name: meeting.name === `1` ? `${committee.name}` : meeting.name,
                                committee_id: committee.id,
                                start_time: committee.meeting_start_date,
                                end_time: committee.meeting_end_date
                            }))
                        );
                    }
                }
                return meetingPayload;
            }
        });
    }

    public downloadCsvExample(): void {
        this.exporter.dummyCSVExport(
            COMMITTEE_PORT_HEADERS_AND_VERBOSE_NAMES,
            COMMITTEE_CSV_EXPORT_EXAMPLE,
            `${this.translate.instant(`committee-example`)}.csv`
        );
    }

    protected pipeParseValue(value: string, header: keyof CommitteeCsvPort): any {
        if (header === `meeting_start_date` || header === `meeting_end_date`) {
            return this.getDate(value);
        }
    }

    protected getConfig(): ImportConfig<CommitteeCsvPort> {
        return {
            modelHeadersAndVerboseNames: COMMITTEE_PORT_HEADERS_AND_VERBOSE_NAMES,
            verboseNameFn: plural => this.repo.getVerboseName(plural),
            hasDuplicatesFn: (entry: Partial<CommitteeCsvPort>) =>
                this.repo.getViewModelList().some(committee => committee.name === entry.name),
            createFn: entries => this.repo.create(...(entries as any)),
            updateFn: entries => this.repo.update(null, ...(entries as any)),
            requiredFields: [`name`]
        };
    }

    private getDate(dateString: string): number {
        if (dateString.length === 8) {
            // Assuming, that it is in the format "YYYYMMDD"
            const toDate = `${dateString.slice(0, 4)}-${dateString.slice(4, 6)}-${dateString.slice(6)}`;
            return new Date(toDate).getTime() / 1000;
        } else if (!!dateString) {
            return new Date(dateString).getTime() / 1000;
        }
    }
}
