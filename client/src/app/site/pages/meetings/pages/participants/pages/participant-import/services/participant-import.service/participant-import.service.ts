import { Injectable } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { map } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { User } from 'src/app/domain/models/users/user';
import { SearchUsersByNameOrEmailPresenterService } from 'src/app/gateways/presenter/search-users-by-name-or-email-presenter.service';
import { ImportModel } from 'src/app/infrastructure/utils/import/import-model';
import { ImportStepPhase } from 'src/app/infrastructure/utils/import/import-step';
import { ImportConfig } from 'src/app/infrastructure/utils/import/import-utils';
import { copy } from 'src/app/infrastructure/utils/transform-functions';
import { BaseUserImportService } from 'src/app/site/base/base-user-import.service';
import { ParticipantControllerService } from 'src/app/site/pages/meetings/pages/participants/services/common/participant-controller.service/participant-controller.service';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
import { ActiveMeetingIdService } from 'src/app/site/pages/meetings/services/active-meeting-id.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { ImportServiceCollectorService } from 'src/app/site/services/import-service-collector.service';

import { ParticipantCsvExportService } from '../../../../export/participant-csv-export.service/participant-csv-export.service';
import { GroupControllerService } from '../../../../modules';
import { participantHeadersAndVerboseNames } from '../../definitions';
import { ParticipantImportServiceModule } from '../participant-import-service.module';

const GROUP_PROPERTY = `group_ids`;

const MEETING_SPECIFIC_USER_PROPERTIES: (keyof User)[] = [
    `about_me`,
    `group_ids`,
    `comment`,
    `structure_level`,
    `number`,
    `vote_weight`,
    `vote_delegated_to_id`,
    `vote_delegations_from_ids`
];

@Injectable({
    providedIn: ParticipantImportServiceModule
})
export class ParticipantImportService extends BaseUserImportService {
    /**
     * List of possible errors and their verbose explanation
     */
    public override errorList = {
        Group: `Group cannot be resolved`,
        Duplicates: `This user already exists in this meeting`,
        NoName: `Entry has no valid name`,
        DuplicateImport: `Entry cannot be imported twice. This line will be ommitted`,
        ParsingErrors: `Some csv values could not be read correctly.`,
        FailedImport: `Imported user could not be imported.`,
        vote_weight: `The vote weight has too many decimal places (max.: 6).`
    };

    private get activeMeetingId(): Id {
        return this.activeMeetingIdService.meetingId!;
    }

    private _existingUserMap: { [userEmailUsername: string]: Partial<User>[] } = {};

    public constructor(
        importServiceCollector: ImportServiceCollectorService,
        private repo: ParticipantControllerService,
        private groupRepo: GroupControllerService,
        private activeMeetingIdService: ActiveMeetingIdService,
        private activeMeetingService: ActiveMeetingService,
        private exporter: ParticipantCsvExportService,
        private presenter: SearchUsersByNameOrEmailPresenterService
    ) {
        super(importServiceCollector);

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
        this.registerBeforeImportHandler(GROUP_PROPERTY, {
            idProperty: GROUP_PROPERTY,
            repo: this.groupRepo as any,
            useDefault: [activeMeetingService.meeting.default_group_id],
            useDefaultObservable: this.activeMeetingService.meetingObservable.pipe(
                map(meeting => (meeting?.default_group_id ? [meeting.default_group_id] : undefined))
            )
        });
    }

    /**
     * Triggers an example csv download
     */
    public downloadCsvExample(): void {
        this.exporter.exportCsvExample();
    }

    protected getConfig(): ImportConfig<User> {
        return {
            modelHeadersAndVerboseNames: participantHeadersAndVerboseNames,
            verboseNameFn: plural => this.repo.getVerboseName(plural),
            createFn: (entries: any[]) => this.createUsers(entries),
            shouldCreateModelFn: user => user.status === `new`
        };
    }

    protected override async onBeforeCreatingImportModels(_entries: User[]): Promise<void> {
        this._existingUserMap = await this.getDuplicates(_entries);
    }

    protected override async onCreateImportModel({
        input,
        importTrackId
    }: {
        input: any;
        importTrackId: number;
    }): Promise<ImportModel<User>> {
        const username = input.username ? input.username : `${input.first_name} ${input.last_name}`;
        const userEmailUsername = `${username}/${input.email}`;
        const duplicates = this._existingUserMap[userEmailUsername] ?? [];
        const newEntry = duplicates.length === 1 ? { ...duplicates[0], ...input } : input;
        const hasDuplicates =
            duplicates.length > 1 ||
            !!this.repo.getViewModelList().find(existingUser => existingUser.username === username);
        const status = !hasDuplicates && duplicates.length === 1 ? `merge` : `new`;
        return new ImportModel<User>({ model: newEntry, importTrackId, duplicates, hasDuplicates, status });
    }

    private async getDuplicates(entries: Partial<User>[]): Promise<{ [userEmailUsername: string]: Partial<User>[] }> {
        const result = await this.presenter.call({
            permissionRelatedId: this.activeMeetingId,
            searchCriteria: entries.map(entry => {
                if (entry.username) {
                    return { username: entry.username };
                }

                return { username: `${entry.first_name} ${entry.last_name}`, email: entry.email };
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

    private async updateUsers(users: any[]): Promise<void> {
        const updates = users.map(user => copy(user, MEETING_SPECIFIC_USER_PROPERTIES.concat(`id`)));
        await this.repo.update((user: ViewUser) => user, ...updates).resolve();
    }
}
