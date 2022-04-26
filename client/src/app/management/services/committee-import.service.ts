import { Injectable } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { ORGANIZATION_ID } from 'app/core/core-services/organization.service';
import {
    SearchUsersByNameOrEmailPresenterScope,
    SearchUsersByNameOrEmailPresenterService
} from 'app/core/core-services/presenters/search-users-by-name-or-email-presenter.service';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { User } from 'app/shared/models/users/user';
import { ImportModel } from 'app/shared/utils/import/import-model';
import { ImportStepPhase } from 'app/shared/utils/import/import-step';
import { toBoolean } from 'app/shared/utils/parser';

import { OperatorService } from '../../core/core-services/operator.service';
import { CML } from '../../core/core-services/organization-permission';
import { CommitteeRepositoryService } from '../../core/repositories/management/committee-repository.service';
import { MeetingRepositoryService } from '../../core/repositories/management/meeting-repository.service';
import { OrganizationTagRepositoryService } from '../../core/repositories/management/organization-tag-repository.service';
import { UserRepositoryService } from '../../core/repositories/users/user-repository.service';
import { BaseImportService, CsvMapping, ImportConfig } from '../../core/ui-services/base-import.service';
import { CsvExportService } from '../../core/ui-services/csv-export.service';
import { ImportServiceCollector } from '../../core/ui-services/import-service-collector';
import { Committee } from '../../shared/models/event-management/committee';
import {
    COMMITTEE_PORT_HEADERS_AND_VERBOSE_NAMES,
    CommitteeCsvPort,
    FORWARD_TO_COMMITTEE_IDS,
    MANAGER_IDS,
    MEETING,
    MEETING_ADMIN_IDS,
    MEETING_END_DATE,
    MEETING_START_DATE,
    MEETING_TEMPLATE_ID,
    NAME,
    ORGANIZATION_TAG_IDS
} from '../../shared/models/event-management/committee.constants';
import { UserImportHelper, UserSearchService } from '../../site/motions/import/user-import-helper';
import { COMMITTEE_CSV_EXPORT_EXAMPLE } from '../export/committee-csv-export-example';

const COMMITTEE_SHARED_MODELS_KEY = `mapNameModels`;

class CommitteeUserSearchService implements UserSearchService {
    public constructor(private readonly presenter: SearchUsersByNameOrEmailPresenterService) {}

    public async getDuplicates(users: Partial<User>[]): Promise<{ [username: string]: Partial<User>[] }> {
        return await this.presenter.call({
            searchCriteria: users.map(user => {
                const username = this.getUsername(user);
                return { username, email: user.email };
            }),
            permissionRelatedId: ORGANIZATION_ID,
            permissionScope: SearchUsersByNameOrEmailPresenterScope.ORGANIZATION
        });
    }

    private getUsername(user: Partial<User>): string | undefined {
        if (user.username) {
            return user.username;
        } else {
            let username = ``;
            if (user.first_name) {
                username += user.first_name;
            }
            if (user.last_name) {
                username += user.last_name;
            }
            return !!username ? username : undefined;
        }
    }
}

@Injectable({
    providedIn: `root`
})
export class CommitteeImportService extends BaseImportService<CommitteeCsvPort> {
    public errorList = {
        Duplicates: _(`This committee already exists`)
    };

    public requiredHeaderLength = 1;

    public constructor(
        serviceCollector: ImportServiceCollector,
        private exporter: CsvExportService,
        private repo: CommitteeRepositoryService,
        organizationTagRepo: OrganizationTagRepositoryService,
        userRepo: UserRepositoryService,
        meetingRepo: MeetingRepositoryService,
        operator: OperatorService,
        presenter: SearchUsersByNameOrEmailPresenterService
    ) {
        super(serviceCollector);
        const userSearchService = new CommitteeUserSearchService(presenter);
        this.registerBeforeImportHandler(ORGANIZATION_TAG_IDS, {
            repo: organizationTagRepo,
            idProperty: ORGANIZATION_TAG_IDS,
            nameDelimiter: `;`
        });
        this.registerBeforeImportHandler(
            MANAGER_IDS,
            new UserImportHelper({
                repo: userRepo,
                verboseName: _(`Committee management`),
                property: MANAGER_IDS,
                useDefault: [operator.operatorId],
                searchService: userSearchService,
                mapPropertyToFn: (committee, ids) => (committee.user_$_management_level = { [CML.can_manage]: ids })
            })
        );
        this.registerBeforeImportHandler(
            MEETING_ADMIN_IDS,
            new UserImportHelper({
                repo: userRepo,
                verboseName: _(`Meeting administrator`),
                property: MEETING_ADMIN_IDS,
                useDefault: [operator.operatorId],
                searchService: userSearchService
            })
        );
        this.registerAfterImportHandler(
            FORWARD_TO_COMMITTEE_IDS,
            {
                repo,
                nameDelimiter: `;`,
                findFn: name => this.repo.getViewModelList().find(committee => committee.name === name),
                labelFn: phase => {
                    switch (phase) {
                        case ImportStepPhase.FINISHED:
                            return `additional committees have been created, because they are mentioned in the forwardings`;
                        case ImportStepPhase.ERROR:
                            return `additional committees could not be created`;
                        default:
                            return `additional committees will be created, because they are mentioned in the forwardings`;
                    }
                },
                shouldCreateModelFn: (pseudoModel, rawData) => {
                    return !rawData.find(committee => committee.name === pseudoModel.name);
                }
            },
            [
                {
                    pipeSideModelsFn: (sideModels, context) => {
                        const mapNameModels = context.getData(COMMITTEE_SHARED_MODELS_KEY) as {
                            [committeeName: string]: Committee;
                        };
                        this.addToMap(mapNameModels, sideModels);
                        context.setData(COMMITTEE_SHARED_MODELS_KEY, mapNameModels);
                    },
                    transformFn: (_sideModels, mainModels) => mainModels,
                    doImportFn: async (models: Committee[], context) => {
                        const mapNameModels = context.getData(COMMITTEE_SHARED_MODELS_KEY) as {
                            [committeeName: string]: Committee;
                        };
                        const updates = models
                            .map(committee => {
                                const forwardings = committee.forward_to_committee_ids
                                    .map((value: any) => mapNameModels[value.name].id)
                                    .filter(value => !!value);
                                return {
                                    id: committee.id,
                                    [FORWARD_TO_COMMITTEE_IDS]: Array.from(new Set(forwardings))
                                };
                            })
                            .filter(update => !!update.id);
                        return await this.repo.update(null, ...(updates as any));
                    },
                    labelFn: (phase, plural) => {
                        const verboseName = plural ? _(`Forwardings`) : _(`Forwarding`);
                        let description = ``;
                        switch (phase) {
                            case ImportStepPhase.FINISHED:
                                description = _(`${plural ? `were` : `was`} defined`);
                                break;
                            case ImportStepPhase.ERROR:
                                description = _(`could not be defined`);
                                break;
                            default:
                                description = _(`will be defined`);
                        }
                        return `${verboseName} ${description}`;
                    },
                    pipeModelsFn: (models, context) => {
                        const _models = models.map(({ model }) => model);
                        const _dictionary = {};
                        this.addToMap(_dictionary, _models);
                        this.addToMap(_dictionary, this.repo.getViewModelList());
                        context.setData(COMMITTEE_SHARED_MODELS_KEY, _dictionary);
                    },
                    getModelsToCreateAmountFn: (models: ImportModel<CommitteeCsvPort>[]) => {
                        const forwardings = models.flatMap(model => {
                            if (model.errors.length > 0) {
                                return [];
                            }
                            return model.model[FORWARD_TO_COMMITTEE_IDS];
                        }) as any;
                        return forwardings.length;
                    },
                    getModelsImportedAmountFn: (nextChunk: CommitteeCsvPort[], oldValue) =>
                        oldValue + nextChunk.flatMap(model => model[FORWARD_TO_COMMITTEE_IDS]).length
                }
            ]
        );
        this.registerAfterImportHandler(MEETING, {
            useArray: true,
            fixedChunkSize: 1,
            verboseNameFn: plural => meetingRepo.getVerboseName(plural),
            findFn: (name, committee) => ({ name: name === `1` ? committee.name : name }),
            transformFn: (_entries, originalEntries: any[]) => {
                let meetingPayload = [];
                for (const committee of originalEntries) {
                    if (committee.meeting && committee.meeting.length > 0) {
                        const templateId = meetingRepo
                            .getViewModelList()
                            .find(_meeting => _meeting.name === committee[MEETING_TEMPLATE_ID])?.id;
                        const adminIds = committee[MEETING_ADMIN_IDS].map((account: Identifiable) => account.id);
                        meetingPayload = meetingPayload.concat(
                            committee.meeting.map((meeting: CsvMapping) => ({
                                name: toBoolean(meeting.name) ? `${committee.name}` : meeting.name,
                                committee_id: committee.id,
                                start_time: committee[MEETING_START_DATE],
                                end_time: committee[MEETING_END_DATE],
                                admin_ids: adminIds,
                                meeting_id: templateId
                            }))
                        );
                    }
                }
                return meetingPayload;
            },
            createFn: (entries: any[]) => {
                const toCreate = entries.filter(entry => !entry.meeting_id);
                const toClone = entries.filter(entry => !!entry.meeting_id);
                return meetingRepo
                    .create(...toCreate)
                    .concat(meetingRepo.duplicate(...toClone))
                    .resolve() as Promise<Identifiable[]>;
            }
        });
    }

    public downloadCsvExample(): void {
        this.exporter.dummyCSVExport(
            COMMITTEE_PORT_HEADERS_AND_VERBOSE_NAMES,
            COMMITTEE_CSV_EXPORT_EXAMPLE,
            `${this.translate.instant(_(`committee-example`))}.csv`
        );
    }

    protected pipeParseValue(value: string, header: keyof CommitteeCsvPort): any {
        if (header === NAME && value.length >= 256) {
            throw new Error(_(`Name exceeds 256 characters`));
        }
        if (header === MEETING_START_DATE || header === MEETING_END_DATE) {
            return this.getDate(value);
        }
    }

    protected async onCreateImportModel({
        input,
        importTrackId
    }: {
        input: CommitteeCsvPort;
        importTrackId: number;
    }): Promise<ImportModel<CommitteeCsvPort>> {
        const existingCommittee = this.repo
            .getViewModelList()
            .find(_committee => _committee.name === input[NAME]) as any;
        const status = !!existingCommittee ? `merge` : `new`;
        return new ImportModel({
            model: input,
            importTrackId,
            status,
            hasDuplicates: false,
            duplicates: [existingCommittee]
        });
    }

    protected getConfig(): ImportConfig<CommitteeCsvPort> {
        return {
            modelHeadersAndVerboseNames: COMMITTEE_PORT_HEADERS_AND_VERBOSE_NAMES,
            verboseNameFn: plural => this.repo.getVerboseName(plural),
            getDuplicatesFn: (entry: Partial<CommitteeCsvPort>) =>
                this.repo.getViewModelList().filter(committee => committee.name === entry.name),
            createFn: entries => this.repo.create(...(entries as any)),
            updateFn: entries => this.repo.update(null, ...(entries as any)),
            requiredFields: [NAME]
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

    /**
     * Adds models a given map by reference.
     */
    private addToMap(mapReference: any, models: any[]): void {
        for (const model of models) {
            if (!mapReference[model[NAME]]) {
                mapReference[model[NAME]] = model;
            } else {
                mapReference[model[NAME]].id = model.id;
            }
        }
    }
}
