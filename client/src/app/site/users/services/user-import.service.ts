import { Injectable } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { ActiveMeetingIdService } from 'app/core/core-services/active-meeting-id.service';
import { copy } from 'app/core/core-services/key-transforms';
import { SearchUsersByNameOrEmailPresenterService } from 'app/core/core-services/presenters/search-users-by-name-or-email-presenter.service';
import { Id } from 'app/core/definitions/key-types';
import { GroupRepositoryService } from 'app/core/repositories/users/group-repository.service';
import {
    MEETING_SPECIFIC_USER_PROPERTIES,
    UserRepositoryService
} from 'app/core/repositories/users/user-repository.service';
import { ImportConfig } from 'app/core/ui-services/base-import.service';
import { CsvExportService } from 'app/core/ui-services/csv-export.service';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { User } from 'app/shared/models/users/user';
import { BeforeImportHandler } from 'app/shared/utils/import/base-before-import-handler';
import { ImportModel } from 'app/shared/utils/import/import-model';
import { ImportStepPhase } from 'app/shared/utils/import/import-step';

import { ImportServiceCollector } from '../../../core/ui-services/import-service-collector';
import { BaseUserExport } from '../base/base-user-export';
import { BaseUserImportService } from '../base/base-user-import.service';
import { userExportExample } from '../export/user-export-example';
import { GroupImportHelper } from '../import/group-import-helper';
import { userHeadersAndVerboseNames } from '../users.constants';

const GROUP_PROPERTY = `group_ids`;

export interface UserExport extends BaseUserExport {
    comment?: string;
    is_present_in_meeting_ids?: string | boolean;
    group_ids?: string;
}

@Injectable({
    providedIn: `root`
})
export class UserImportService extends BaseUserImportService {
    /**
     * List of possible errors and their verbose explanation
     */
    public errorList = {
        Group: `Group cannot be resolved`,
        Duplicates: `This user already exists in this meeting`,
        NoName: `Entry has no valid name`,
        DuplicateImport: `Entry cannot be imported twice. This line will be ommitted`,
        ParsingErrors: `Some csv values could not be read correctly.`,
        FailedImport: `Imported user could not be imported.`,
        vote_weight: `The vote weight has too many decimal places (max.: 6).`
    };

    private get activeMeetingId(): Id {
        return this.activeMeetingIdService.meetingId;
    }

    private _existingUserMap: { [userEmailUsername: string]: Partial<User>[] } = {};

    /**
     * Constructor. Calls parent and sets the expected header
     *
     * @param repo The User repository
     * @param groupRepo the Group repository
     * @param translate TranslationService
     * @param papa csvParser
     * @param matSnackbar MatSnackBar for displaying error messages
     */
    public constructor(
        importServiceCollector: ImportServiceCollector,
        repo: UserRepositoryService,
        private groupRepo: GroupRepositoryService,
        private activeMeetingIdService: ActiveMeetingIdService,
        private exporter: CsvExportService,
        private presenter: SearchUsersByNameOrEmailPresenterService
    ) {
        super(importServiceCollector, repo);

        this.registerMainImportHandler({
            shouldCreateModelFn: model => model.status === `merge`,
            labelFn: (phase, plural) => {
                const verboseName = this.repo.getVerboseName(plural);
                let description = ``;
                switch (phase) {
                    case ImportStepPhase.FINISHED:
                        description = this.translate.instant(`have been referenced`);
                        break;
                    case ImportStepPhase.ERROR:
                        description = this.translate.instant(`could not be referenced`);
                        break;
                    default:
                        description = this.translate.instant(`will be referenced`);
                }
                return `${verboseName} ${_(description)}`;
            },
            createFn: async () => [],
            updateFn: models => this.updateUsers(models)
        });
    }

    /**
     * Triggers an example csv download
     */
    public downloadCsvExample(): void {
        const rows: UserExport[] = userExportExample;
        this.exporter.dummyCSVExport<UserExport>(
            userHeadersAndVerboseNames,
            rows,
            `${this.translate.instant(`participants-example`)}.csv`
        );
    }

    protected getConfig(): ImportConfig<User> {
        return {
            modelHeadersAndVerboseNames: userHeadersAndVerboseNames,
            verboseNameFn: plural => this.repo.getVerboseName(plural),
            createFn: (entries: any[]) => this.createUsers(entries),
            shouldCreateModelFn: user => user.status === `new`
        };
    }

    protected getBeforeImportHelpers(): { [key: string]: BeforeImportHandler } {
        return {
            [GROUP_PROPERTY]: new GroupImportHelper(this.groupRepo, this.translate)
        };
    }

    protected async onBeforeCreatingImportModels(_entries: User[]): Promise<void> {
        this._existingUserMap = await this.getDuplicates(_entries);
    }

    protected async onCreateImportModel({
        input,
        importTrackId
    }: {
        input: any;
        importTrackId: number;
    }): Promise<ImportModel<User>> {
        const username = input.username ? input.username : `${input.first_name} ${input.last_name}`;
        const userEmailUsername = `${username}/${input.email}`;
        const duplicates = this._existingUserMap[userEmailUsername];
        const newEntry = duplicates.length === 1 ? { ...duplicates[0], ...input } : input;
        const hasDuplicates =
            duplicates.length > 1 ||
            !!this.repo.getViewModelList().find(existingUser => existingUser.username === username);
        const status = !hasDuplicates && duplicates.length === 1 ? `merge` : `new`;
        return new ImportModel<User>({ model: newEntry, importTrackId, duplicates, hasDuplicates, status });
    }

    private async getDuplicates(entries: Partial<User>[]): Promise<{ [userEmailUsername: string]: Partial<User>[] }> {
        const result = await this.presenter.call({
            searchCriteria: entries.map(entry => {
                const username = !!entry.username ? entry.username : `${entry.first_name} ${entry.last_name}`;
                return { username, email: entry.email };
            })
        });
        return result;
    }

    private createUsers(users: any[]): Promise<Identifiable[]> {
        for (const user of users) {
            user.is_present_in_meeting_ids = user.is_present_in_meeting_ids === `1` ? [this.activeMeetingId] : [];
        }
        return this.repo.create(...users);
    }

    private updateUsers(users: any[]): Promise<void> {
        const updates = users.map(user => copy(user, MEETING_SPECIFIC_USER_PROPERTIES.concat(`id`)));
        return this.repo.update(user => user as any, ...updates);
    }
}
