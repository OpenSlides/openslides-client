import { Injectable } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, filter, firstValueFrom, Observable } from 'rxjs';
import { Ids } from 'src/app/domain/definitions/key-types';
import { Selectable } from 'src/app/domain/interfaces';
import { Topic } from 'src/app/domain/models/topics/topic';
import { GetForwardingMeetingsPresenter, GetForwardingMeetingsPresenterService } from 'src/app/gateways/presenter';
import { mediumDialogSettings } from 'src/app/infrastructure/utils/dialog-settings';
import { ActiveMeetingService } from 'src/app/site/pages/meetings/services/active-meeting.service';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';
import { ViewCommittee } from 'src/app/site/pages/organization/pages/committees';
import { AutoupdateService } from 'src/app/site/services/autoupdate';
import { ModelRequestBuilderService } from 'src/app/site/services/model-request-builder';
import { OperatorService } from 'src/app/site/services/operator.service';
import { BaseDialogService } from 'src/app/ui/base/base-dialog-service';

import { AgendaItemControllerService } from '../../../services';
import { AgendaItemCommonServiceModule } from '../../../services/agenda-item-common-service.module';
import { ViewAgendaItem } from '../../../view-models';
import {
    AgendaForwardDialogComponent,
    AgendaForwardDialogReturnData
} from '../components/agenda-forward-dialog/agenda-forward-dialog.component';

export interface AgendaForwardDialogPayload {
    items: ViewAgendaItem[];
    is_single: boolean;
    showSkippedItemWarning: boolean;
}

@Injectable({
    providedIn: AgendaItemCommonServiceModule
})
export class AgendaForwardDialogService extends BaseDialogService<
    AgendaForwardDialogComponent,
    AgendaForwardDialogPayload,
    AgendaForwardDialogReturnData
> {
    public get forwardingCommitteesObservable(): Observable<(Partial<ViewCommittee> & Selectable)[]> {
        return this._forwardingCommitteesSubject;
    }

    public get forwardingMeetingIds(): number[] {
        return this._forwardingMeetings.flatMap(obj => obj.meetings?.map(m => +m.id));
    }

    private _forwardingCommitteesSubject = new BehaviorSubject<(Partial<ViewCommittee> & Selectable)[]>([]);

    private _forwardingMeetings: GetForwardingMeetingsPresenter[] = [];
    private _forwardingMeetingsUpdateRequired = true;

    public constructor(
        private translate: TranslateService,
        private repo: AgendaItemControllerService,
        private snackbar: MatSnackBar,
        private presenter: GetForwardingMeetingsPresenterService,
        private activeMeeting: ActiveMeetingService,
        private operator: OperatorService,
        private autoupdate: AutoupdateService,
        private modelRequestBuilder: ModelRequestBuilderService
    ) {
        super();

        this.activeMeeting.meetingIdObservable.subscribe(() => {
            this._forwardingMeetingsUpdateRequired = true;
        });
    }

    public async forwardingMeetingsAvailable(): Promise<boolean> {
        await this.updateForwardMeetings();

        return !!this._forwardingMeetings.length;
    }

    public async open(
        data: AgendaForwardDialogPayload
    ): Promise<MatDialogRef<AgendaForwardDialogComponent, AgendaForwardDialogReturnData>> {
        await this.updateForwardMeetings();

        return this.dialog.open(AgendaForwardDialogComponent, {
            ...mediumDialogSettings,
            autoFocus: false,
            data: {
                agenda: data.items,
                forwardingMeetings: this._forwardingMeetings,
                is_single: data.is_single,
                showSkippedItemWarning: data.showSkippedItemWarning
            }
        });
    }

    public async forwardAgendaItemsToMeetings(items: ViewAgendaItem[], is_single = false): Promise<void> {
        const toForward = items.filter(item => item.content_object_id.startsWith(`${Topic.COLLECTION}/`));

        if (toForward.length === 0) {
            this.snackbar.open(this.translate.instant(`None of the selected agenda items can be forwarded.`), `Ok`);
            return;
        }
        const dialogRef = await this.open({
            items: toForward,
            is_single,
            showSkippedItemWarning: items.length !== toForward.length
        });
        const dialogData = (await firstValueFrom(dialogRef.afterClosed())) as AgendaForwardDialogReturnData;
        const toMeetingIds = dialogData?.meetingIds as Ids;
        if (toMeetingIds) {
            try {
                const agendaItemIds = toForward.map(item => item.id);
                await this.repo.forward(
                    toMeetingIds,
                    agendaItemIds,
                    dialogData.withModeratorNotes,
                    dialogData.withSpeakers,
                    dialogData.withAttachments
                );
                this.snackbar.open(
                    (items.length === 1
                        ? this.translate.instant(`The agenda item was successfully forwarded to {} meeting(s)`)
                        : `${toForward.length} ` +
                          this.translate.instant(`of`) +
                          ` ${items.length} ` +
                          this.translate.instant(`agenda items were successfully forwarded to {} meeting(s)`)
                    ).replace(`{}`, `${toMeetingIds.length}`),
                    `Ok`
                );
            } catch (e: any) {
                this.snackbar.open(e.toString(), `Ok`);
            }
        }
    }

    private async updateForwardMeetings(): Promise<void> {
        if (this._forwardingMeetingsUpdateRequired && !this.activeMeeting.meeting.isArchived) {
            const meetingId = await firstValueFrom(
                this.activeMeeting.meetingIdObservable.pipe(filter(id => id !== undefined))
            );
            const response = await this.autoupdate.single(
                await this.modelRequestBuilder.build({
                    ids: [meetingId],
                    viewModelCtor: ViewMeeting,
                    follow: [
                        {
                            idField: `committee_id`,
                            fieldset: [`name`, `id`, `default_meeting_id`],
                            follow: [
                                {
                                    idField: `meeting_ids`,
                                    fieldset: [`id`, `name`, `start_time`, `end_time`, `admin_group_for_meeting_id`]
                                }
                            ]
                        }
                    ]
                }),
                `agenda_copy_meetings`
            );
            if (!response || !response[`meeting`]) {
                throw Error(`Copying not possible: No target meetings`);
            }

            const meetings = Object.values(response[`meeting`])
                .filter(line => {
                    const adminGroupId = line[`admin_group_for_meeting_id`];
                    return this.operator.isInGroupIds(adminGroupId);
                })
                .map(line => ({
                    id: line[`id`],
                    name: line[`name`],
                    start_time: line[`start_time`],
                    end_time: line[`end_time`]
                }));
            this._forwardingMeetings = meetings;
            this._forwardingMeetingsUpdateRequired = false;
            const committeeId = response[`meeting`][meetingId][`committee_id`];
            const committee = response[`committee`][committeeId];
            this._forwardingCommitteesSubject.next([
                {
                    id: committee[`id`],
                    name: committee[`name`],
                    getTitle: (): string => committee[`name`],
                    getListTitle: (): string => ``,
                    toString: (): string => committee[`name`]
                }
            ]);
        }
    }
}
