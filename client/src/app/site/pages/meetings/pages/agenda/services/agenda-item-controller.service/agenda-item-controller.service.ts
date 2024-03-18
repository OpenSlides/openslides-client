import { Injectable } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { AgendaItem, AgendaItemType } from 'src/app/domain/models/agenda/agenda-item';
import { Action } from 'src/app/gateways/actions';
import { AgendaItemRepositoryService } from 'src/app/gateways/repositories/agenda';
import { TreeIdNode } from 'src/app/infrastructure/definitions/tree';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { HasAgendaItem } from 'src/app/site/pages/meetings/pages/agenda';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';

import { ViewAgendaItem } from '../../view-models';
import { AgendaItemCommonServiceModule } from '../agenda-item-common-service.module';

@Injectable({
    providedIn: AgendaItemCommonServiceModule
})
export class AgendaItemControllerService extends BaseMeetingControllerService<ViewAgendaItem, AgendaItem> {
    public constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: AgendaItemRepositoryService
    ) {
        super(controllerServiceCollector, AgendaItem, repo);
    }

    public update(update: any, item: ViewAgendaItem): Promise<void> {
        return this.repo.update(update, item);
    }

    public autoNumbering(): Promise<void> {
        return this.repo.autoNumbering();
    }

    public assignToParent(content: any, meetingId: number = this.activeMeetingIdService.meetingId!): Action<void> {
        return this.repo.assignToParents(content, meetingId);
    }

    public addToAgenda(data: any, ...items: (BaseViewModel & HasAgendaItem)[]): Action<Identifiable[]> {
        return this.repo.addToAgenda(data, ...items);
    }

    public removeFromAgenda(...items: (Identifiable | Id)[]): Promise<void> {
        return this.repo.removeFromAgenda(...items);
    }

    public bulkOpenItems(items: ViewAgendaItem[]): Promise<void> {
        return this.repo.bulkOpenItems(items);
    }

    public bulkCloseItems(items: ViewAgendaItem[]): Promise<void> {
        return this.repo.bulkCloseItems(items);
    }

    public bulkSetAgendaType(items: ViewAgendaItem[], agendaType: AgendaItemType): Promise<void> {
        return this.repo.bulkSetAgendaType(items, agendaType);
    }

    public sortItems(tree: TreeIdNode[]): Promise<void> {
        return this.repo.sortItems(tree);
    }

    /**
     * Calculates the estimated end time based on the configured start and the
     * sum of durations of all agenda items
     *
     * @returns a Date object or null
     */
    public calculateEndTime(): Date | null {
        const startTime = this.meetingSettingsService.instant(`start_time`); // a timestamp
        const duration = this.calculateDuration();
        if (!startTime || !duration) {
            return null;
        }
        const durationTime = duration * 60 * 1000; // minutes to miliseconds
        return new Date(startTime + durationTime);
    }

    /**
     * get the sum of durations of all agenda items
     *
     * @returns a numerical value representing item durations (currently minutes)
     */
    public calculateDuration(): number {
        let duration = 0;
        this.getViewModelList().forEach(item => {
            if (item.duration) {
                duration += item.duration;
            }
        });
        return duration;
    }
}
