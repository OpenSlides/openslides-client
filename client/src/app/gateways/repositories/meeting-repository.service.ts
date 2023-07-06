import { Injectable } from '@angular/core';
import { getUnixTime } from 'date-fns';
import { Action } from 'src/app/gateways/actions';

import { Id } from '../../domain/definitions/key-types';
import { Identifiable } from '../../domain/interfaces/identifiable';
import { Meeting } from '../../domain/models/meetings/meeting';
import { Projection } from '../../domain/models/projector/projection';
import { MeetingSettingsDefinitionService } from '../../site/pages/meetings/services/meeting-settings-definition.service/meeting-settings-definition.service';
import { ViewMeeting } from '../../site/pages/meetings/view-models/view-meeting';
import { ViewUser } from '../../site/pages/meetings/view-models/view-user';
import { Fieldsets } from '../../site/services/model-request-builder';
import { TypedFieldset } from '../../site/services/model-request-builder/model-request-builder.service';
import { ActionRequest } from '../actions/action-utils';
import { BaseRepository } from './base-repository';
import { MeetingAction } from './meetings';
import { RepositoryServiceCollectorService } from './repository-service-collector.service';
import { UserAction } from './users/user-action';

export enum MeetingProjectionType {
    CurrentListOfSpeakers = `current_list_of_speakers`,
    CurrentSpeakerChyron = `current_speaker_chyron`,
    AgendaItemList = `agenda_item_list`
}

export interface ImportMeeting {
    [collection: string]: unknown[];
}

export interface MeetingUserModifiedFields {
    addedUsers?: ViewUser[];
    removedUsers?: ViewUser[];
    addedAdmins?: ViewUser[];
    removedAdmins?: ViewUser[];
}

@Injectable({
    providedIn: `root`
})
export class MeetingRepositoryService extends BaseRepository<ViewMeeting, Meeting> {
    public constructor(
        repositoryServiceCollector: RepositoryServiceCollectorService,
        private meetingSettingsDefinitionProvider: MeetingSettingsDefinitionService
    ) {
        super(repositoryServiceCollector, Meeting);
    }

    public override getFieldsets(): Fieldsets<Meeting> {
        // This field is used to determine, if a user can access a meeting: It is restricted for non-authorized users
        // but always present, if the user is allowed to access the meeting. We have to always query this fields to
        // decide about the accessibility.
        const accessField: TypedFieldset<Meeting> = [ViewMeeting.ACCESSIBILITY_FIELD];

        const sharedFields: TypedFieldset<Meeting> = accessField.concat([
            `name`,
            `start_time`,
            `end_time`,
            `is_active_in_organization_id`,
            `is_archived_organization_id`,
            `template_for_organization_id`,
            `meeting_user_ids`,
            `description`,
            `location`,
            `organization_tag_ids`,
            `motion_ids`
        ]);
        const listFields: TypedFieldset<Meeting> = sharedFields.concat([
            `default_group_id`,
            `admin_group_id`,
            `committee_id`,
            `group_ids`,
            `language`
        ]);
        const detailEditFields: TypedFieldset<Meeting> = [
            `is_template`,
            `default_meeting_for_committee_id`,
            `jitsi_domain`,
            `jitsi_room_name`,
            `jitsi_room_password`,
            `language`
        ];
        const groupFields: TypedFieldset<Meeting> = [`admin_group_id`, `default_group_id`];

        return {
            ...super.getFieldsets(),
            detailEdit: detailEditFields,
            list: listFields,
            settings: this.meetingSettingsDefinitionProvider.getSettingsKeys(),
            group: groupFields
        };
    }

    public getTitle = (viewMeeting: ViewMeeting) => viewMeeting.name;

    public getVerboseName = (plural: boolean = false) => this.translate.instant(plural ? `Meetings` : `Meeting`);

    public getProjectorTitle = (_: ViewMeeting, projection: Projection) => {
        let title: string;

        switch (projection.type as MeetingProjectionType) {
            case MeetingProjectionType.CurrentListOfSpeakers:
                title = this.translate.instant(`Current list of speakers`);
                break;
            case MeetingProjectionType.CurrentSpeakerChyron:
                title = this.translate.instant(`Current speaker chyron`);
                break;
            case MeetingProjectionType.AgendaItemList:
                title = this.translate.instant(`Agenda`);
                break;
            default:
                console.warn(`Unknown slide type for meeting:`, projection.type);
                title = this.translate.instant(`<unknown>`);
                break;
        }

        return { title };
    };

    public create(...meetings: Partial<Meeting>[]): Action<Identifiable[]> {
        const payload = meetings.map(meetingPayload => this.getPartialPayload(meetingPayload));
        return this.actions.create({ action: MeetingAction.CREATE, data: payload });
    }

    public async import(committeeId: Id, meeting: ImportMeeting): Promise<Identifiable | null> {
        const payload: any = {
            committee_id: committeeId,
            meeting: this.sanitizeImportData(meeting)
        };
        return this.sendActionToBackend(MeetingAction.IMPORT, payload);
    }

    public async update(update: any, meeting?: ViewMeeting, options: MeetingUserModifiedFields = {}): Promise<void> {
        update.start_time = this.anyDateToUnix(update.start_time);
        update.end_time = this.anyDateToUnix(update.end_time);
        if (update.organization_tag_ids === null) {
            update.organization_tag_ids = [];
        }
        if (!update.id && !meeting) {
            throw new Error(`Either a meeting or an update.id has to be given`);
        }
        const actions: ActionRequest[] = [
            {
                action: MeetingAction.UPDATE,
                data: [
                    {
                        ...update,
                        id: update.id || meeting!.id
                    }
                ]
            }
        ];
        /**
         * This is a mapping of user-id -> group-ids for a given meeting
         */
        const userUpdate: { [userId: number]: Id[] } = {};
        const { addedUsers, removedUsers, addedAdmins, removedAdmins }: MeetingUserModifiedFields = options;
        if (addedUsers?.length || removedUsers?.length) {
            if (!meeting?.default_group_id) {
                throw new Error(`A default group is required`);
            }
            this.getNewGroupsForUsers(userUpdate, addedUsers, meeting.id, meeting.default_group_id);
            this.getNewGroupsForUsers(userUpdate, removedUsers, meeting.id, meeting.default_group_id);
        }
        if (addedAdmins?.length || removedAdmins?.length) {
            if (!meeting?.admin_group_id) {
                throw new Error(`An admin group is required`);
            }
            this.getNewGroupsForUsers(userUpdate, addedAdmins, meeting.id, meeting.admin_group_id);
            this.getNewGroupsForUsers(userUpdate, removedAdmins, meeting.id, meeting.admin_group_id);
        }
        if (Object.keys(userUpdate).length) {
            actions.push({
                action: UserAction.UPDATE,
                data: Object.keys(userUpdate).map(userId => ({
                    id: parseInt(userId, 10),
                    meeting_id: meeting!.id,
                    group_ids: userUpdate[parseInt(userId, 10)]
                }))
            });
        }
        return this.sendActionsToBackend(actions);
    }

    public async delete(...meetings: Identifiable[]): Promise<void> {
        const payload: any[] = meetings.map(meeting => ({ id: meeting.id }));
        return this.sendBulkActionToBackend(MeetingAction.DELETE, payload);
    }

    public async deleteAllSpeakersOfAllListsOfSpeakersIn(meetingId: Id): Promise<void> {
        const payload: any = { id: meetingId };
        return this.sendActionToBackend(MeetingAction.DELETE_ALL_SPEAKERS_OF_ALL_LISTS, payload);
    }

    public duplicate(...meetings: (Partial<Meeting> & { meeting_id: Id })[]): Action<Identifiable[]> {
        const payload = meetings.map(meeting => ({
            ...this.getPartialPayload(meeting)
        }));
        return this.actions.create({ action: MeetingAction.CLONE, data: payload });
    }

    public duplicateFrom(
        committeeId: Id,
        ...meetings: (Partial<Meeting> & { meeting_id: Id })[]
    ): Action<Identifiable[]> {
        const payload = meetings.map(meeting => ({
            committee_id: committeeId,
            ...this.getPartialPayload(meeting)
        }));
        return this.actions.create({ action: MeetingAction.CLONE, data: payload });
    }

    public async archive(...meetings: ViewMeeting[]): Promise<void> {
        const payload: any[] = meetings.map(meeting => ({ id: meeting.id }));
        return this.sendBulkActionToBackend(MeetingAction.ARCHIVE, payload);
    }

    public async unarchive(...meetings: ViewMeeting[]): Promise<void> {
        const payload: any[] = meetings.map(meeting => ({ id: meeting.id }));
        return this.sendBulkActionToBackend(MeetingAction.UNARCHIVE, payload);
    }

    protected override createViewModel(model: Meeting): ViewMeeting {
        const viewModel = super.createViewModel(model);
        viewModel.getProjectorTitle = (projection: Projection) => this.getProjectorTitle(viewModel, projection);
        return viewModel;
    }

    private getPartialPayload(meeting: Partial<Meeting>): any {
        return {
            ...meeting,
            start_time: this.anyDateToUnix(meeting.start_time),
            end_time: this.anyDateToUnix(meeting.end_time)
        };
    }

    /**
     * If required again, out into service. Casting dates out of most things
     * DATE
     * simply saving forms will fire an empty "date"
     * NUMBER
     * automatic functions (multi stack actions) will use numbers
     * MOMENT
     * using the date picker will send a moment object
     */
    private anyDateToUnix(date: Date | number | null): number | null {
        if (date instanceof Date) {
            return getUnixTime(date);
        } else if (typeof date === `number`) {
            return date;
        } else if (date === null) {
            return null;
        }
        return undefined;
    }

    /**
     * Removes all empty collections from an import meeting.
     *
     * @param meeting The meeting to import as plain object.
     * @returns The meeting without empty collections.
     */
    private sanitizeImportData(meeting: ImportMeeting): ImportMeeting {
        const temp = { ...meeting };
        for (const key of Object.keys(temp)) {
            if (temp[key].length === 0) {
                delete temp[key];
            }
        }
        return temp;
    }

    /**
     * Maps group-ids for users to their id.
     * If the given groupId is already existing, it will be removed. Otherwise it will be added.
     * @warning This changes the passed `data`-object as a side-effect.
     *
     * @param data An object containing the previous group-ids for users mapped to user-ids
     * @param users An array of users, whose groups for a specific meeting are updated
     * @param meetingId The id of a meeting, users assigned to or removed from
     * @param groupId The id of a group, that is assigned to or removed from a user
     *
     * @returns An object containing user-ids as keys and an array of ids as values, which are the next group-ids
     * for the related user.
     */
    private getNewGroupsForUsers(
        data: { [userId: number]: Id[] },
        users: ViewUser[] = [],
        meetingId: Id,
        groupId: Id
    ): void {
        const getNextGroupIds = (groupIds: Id[]) => {
            const index = groupIds.findIndex(id => groupId === id);
            if (index > -1) {
                groupIds.splice(index, 1);
            } else {
                groupIds = (groupIds || []).concat(groupId);
            }
            return groupIds;
        };
        users.forEach(user => (data[user.id] = getNextGroupIds(data[user.id] || user.group_ids(meetingId))));
    }
}
