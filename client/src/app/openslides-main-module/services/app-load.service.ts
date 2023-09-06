import { Injectable, Injector, Type } from '@angular/core';
import { ActionWorkerAppConfig } from 'src/app/gateways/repositories/action-worker/action-worker.config';
import { BaseRepository } from 'src/app/gateways/repositories/base-repository';
import { MeetingUserAppConfig } from 'src/app/gateways/repositories/meeting_user/meeting-user-config';
import { AppConfig } from 'src/app/infrastructure/definitions/app-config';
import { OnAfterAppsLoaded } from 'src/app/infrastructure/definitions/hooks/after-apps-loaded';
import { OpenSlidesInjector } from 'src/app/infrastructure/utils/di/openslides-injector';
import { AgendaAppConfig } from 'src/app/site/pages/meetings/pages/agenda/agenda.config';
import { AssignmentsAppConfig } from 'src/app/site/pages/meetings/pages/assignments/assignments.config';
import { ChatAppConfig } from 'src/app/site/pages/meetings/pages/chat/chat.config';
import { HistoryAppConfig } from 'src/app/site/pages/meetings/pages/history/history.config';
import { HomeAppConfig } from 'src/app/site/pages/meetings/pages/home/home.config';
import { MediafileAppConfig } from 'src/app/site/pages/meetings/pages/mediafiles/mediafiles.config';
import { MeetingSettingsAppConfig } from 'src/app/site/pages/meetings/pages/meeting-settings/meeting-settings.config';
import { MotionsAppConfig } from 'src/app/site/pages/meetings/pages/motions';
import { PollsAppConfig } from 'src/app/site/pages/meetings/pages/polls/polls.config';
import { ProjectorAppConfig } from 'src/app/site/pages/meetings/pages/projectors/projector.config';
import { MainMenuService } from 'src/app/site/pages/meetings/services/main-menu.service';
import { CollectionMapperService } from 'src/app/site/services/collection-mapper.service';
import { FallbackRoutesService } from 'src/app/site/services/fallback-routes.service';
import { ModelRequestBuilderService } from 'src/app/site/services/model-request-builder';

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
    ProjectorAppConfig,
    AutopilotAppConfig,
    MeetingSettingsAppConfig,
    ChatAppConfig,
    ActionWorkerAppConfig,
    MeetingUserAppConfig
];

@Injectable({
    providedIn: `root`
})
export class AppLoadService {
    public constructor(
        private injector: Injector,
        private modelMapper: CollectionMapperService,
        private mainMenuService: MainMenuService,
        private fallbackRoutesService: FallbackRoutesService
    ) {
        OpenSlidesInjector.setInjector(injector);
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
