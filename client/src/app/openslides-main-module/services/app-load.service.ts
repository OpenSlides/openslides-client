import { inject, Injector, Service, Type } from '@angular/core';
import { ActionWorkerAppConfig } from '@app/gateways/repositories/action-worker/action-worker.config';
import { BaseRepository } from '@app/gateways/repositories/base-repository';
import { MeetingUserAppConfig } from '@app/gateways/repositories/meeting_user/meeting-user-config';
import { AppConfig } from '@app/infrastructure/definitions/app-config';
import { OnAfterAppsLoaded } from '@app/infrastructure/definitions/hooks/after-apps-loaded';
import { OpenSlidesInjector } from '@app/infrastructure/utils/di/openslides-injector';
import { AgendaAppConfig } from '@app/site/pages/meetings/pages/agenda/agenda.config';
import { AssignmentsAppConfig } from '@app/site/pages/meetings/pages/assignments/assignments.config';
import { ChatAppConfig } from '@app/site/pages/meetings/pages/chat/chat.config';
import { HistoryAppConfig } from '@app/site/pages/meetings/pages/history/history.config';
import { HomeAppConfig } from '@app/site/pages/meetings/pages/home/home.config';
import { MediafileAppConfig } from '@app/site/pages/meetings/pages/mediafiles/mediafiles.config';
import { MeetingMediafileAppConfig } from '@app/site/pages/meetings/pages/mediafiles/meeting-mediafiles.config';
import { MeetingSettingsAppConfig } from '@app/site/pages/meetings/pages/meeting-settings/meeting-settings.config';
import { MotionsAppConfig } from '@app/site/pages/meetings/pages/motions';
import { PollsAppConfig } from '@app/site/pages/meetings/pages/polls/polls.config';
import { ProjectorAppConfig } from '@app/site/pages/meetings/pages/projectors/projector.config';
import { MainMenuService } from '@app/site/pages/meetings/services/main-menu.service';
import { GendersAppConfig } from '@app/site/pages/organization/pages/accounts/pages/gender/genders.config';
import { CollectionMapperService } from '@app/site/services/collection-mapper.service';
import { FallbackRoutesService } from '@app/site/services/fallback-routes.service';
import { ModelRequestBuilderService } from '@app/site/services/model-request-builder';

import { HasOnAfterAppsLoaded } from '../../infrastructure/definitions/hooks/after-apps-loaded';
import { MeetingsAppConfig } from '../../site/pages/meetings/meetings.config';
import { AutopilotAppConfig } from '../../site/pages/meetings/pages/autopilot/autopilot.config';
import { ParticipantsAppConfig } from '../../site/pages/meetings/pages/participants/participants.config';
import { OrganizationAppConfig } from '../../site/pages/organization/organization.config';
import { CommitteesAppConfig } from '../../site/pages/organization/pages/committees/committees.config';
import { DesignsAppConfig } from '../../site/pages/organization/pages/designs/designs.config';
import { OrganizationTagsAppConfig } from '../../site/pages/organization/pages/organization-tags/organization-tags.config';

const servicesOnAppsLoaded: Type<OnAfterAppsLoaded>[] = [ModelRequestBuilderService];

/**
 * A list of all app configurations of all delivered apps.
 */
const appConfigs: AppConfig[] = [
    OrganizationAppConfig,
    MeetingsAppConfig,
    CommitteesAppConfig,
    OrganizationTagsAppConfig,
    DesignsAppConfig,
    HomeAppConfig,
    AgendaAppConfig,
    AssignmentsAppConfig,
    MotionsAppConfig,
    HistoryAppConfig,
    ParticipantsAppConfig,
    PollsAppConfig,
    MediafileAppConfig,
    MeetingMediafileAppConfig,
    ProjectorAppConfig,
    AutopilotAppConfig,
    MeetingSettingsAppConfig,
    ChatAppConfig,
    ActionWorkerAppConfig,
    MeetingUserAppConfig,
    GendersAppConfig
];

@Service()
export class AppLoadService {
    private injector = inject(Injector);
    private modelMapper = inject(CollectionMapperService);
    private mainMenuService = inject(MainMenuService);
    private fallbackRoutesService = inject(FallbackRoutesService);

    public constructor() {
        OpenSlidesInjector.setInjector(this.injector);
    }

    public async loadApps(): Promise<void> {
        const repositories: OnAfterAppsLoaded[] = [];
        appConfigs.forEach((config: AppConfig) => {
            if (config.models) {
                config.models.forEach(entry => {
                    let repository: BaseRepository<any, any> | null = null;
                    repository = this.injector.get(entry.repository);
                    if (HasOnAfterAppsLoaded(repository)) {
                        repositories.push(repository);
                    }
                    this.modelMapper.registerCollectionElement(entry.model, entry.viewModel, repository);
                });
            }
            if (config.meetingMenuMentries) {
                this.mainMenuService.registerEntries(config.meetingMenuMentries);
                this.fallbackRoutesService.registerFallbackEntries(config.meetingMenuMentries);
            }
        });

        // Collect all services to notify for the OnAfterAppsLoadedHook
        const onAfterAppsLoadedItems = servicesOnAppsLoaded
            .map(service => this.injector.get(service))
            .concat(repositories);

        // Notify them.
        onAfterAppsLoadedItems.forEach(repo => {
            repo.onAfterAppsLoaded();
        });
    }
}
