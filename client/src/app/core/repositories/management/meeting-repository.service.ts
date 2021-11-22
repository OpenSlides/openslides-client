import { Injectable } from '@angular/core';
import { MeetingAction } from 'app/core/actions/meeting-action';
import { UserAction } from 'app/core/actions/user-action';
import { ActionRequest } from 'app/core/core-services/action.service';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { Id } from 'app/core/definitions/key-types';
import { MeetingSettingsDefinitionProvider } from 'app/core/ui-services/meeting-settings-definition-provider.service';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Meeting } from 'app/shared/models/event-management/meeting';
import { Projection } from 'app/shared/models/projector/projection';
import { ViewUser } from 'app/site/users/models/view-user';
import * as moment from 'moment';
import { Moment } from 'moment';

import { BaseRepository } from '../base-repository';
import { RepositoryServiceCollectorWithoutActiveMeetingService } from '../repository-service-collector-without-active-meeting-service';

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
        repositoryServiceCollector: RepositoryServiceCollectorWithoutActiveMeetingService,
        private meetingSettingsDefinitionProvider: MeetingSettingsDefinitionProvider
    ) {
        super(repositoryServiceCollector, Meeting);
    }

    public getFieldsets(): Fieldsets<Meeting> {
        // This field is used to determine, if a user can access a meeting: It is restricted for non-authorized users
        // but always present, if the user is allowed to access the meeting. We have to always query this fields to
        // decide about the accessibility.
        const accessField: (keyof Meeting)[] = [ViewMeeting.ACCESSIBILITY_FIELD];

        const nameFields: (keyof Meeting)[] = accessField.concat([
            `name`,
            `start_time`,
            `end_time`,
            `is_active_in_organization_id`
        ]);
        const listFields: (keyof Meeting)[] = nameFields.concat(`user_ids`, `organization_tag_ids`);
        const editFields: (keyof Meeting)[] = listFields.concat([
            `welcome_title`,
            `description`,
            `location`,
            `url_name`,
            `enable_anonymous`,
            `enable_chat`,
            `is_template`,
            `default_group_id`, // needed for adding users
            `jitsi_domain`,
            `jitsi_room_name`,
            `jitsi_room_password`
        ]);
        const dashboardFields: (keyof Meeting)[] = listFields.concat(`location`);
        const startPageFields: (keyof Meeting)[] = accessField.concat([`welcome_title`, `welcome_text`]);
        const previewFields: (keyof Meeting)[] = nameFields.concat(
            `user_ids`,
            `location`,
            `description`,
            `default_meeting_for_committee_id`
        );

        return {
            [DEFAULT_FIELDSET]: nameFields,
            list: listFields,
            edit: editFields,
            dashboard: dashboardFields,
            settings: this.meetingSettingsDefinitionProvider
                .getSettingsKeys()
                .concat(`jitsi_domain`, `jitsi_room_name`, `jitsi_room_password`, `enable_chat`),
            startPage: startPageFields,
            preview: previewFields
        };
    }

    public getTitle = (viewMeeting: ViewMeeting) => viewMeeting.name;

    public getVerboseName = (plural: boolean = false) => this.translate.instant(plural ? `Meetings` : `Meeting`);

    public getProjectorTitle = (_: ViewMeeting, projection: Projection) => {
        let title: string;

        switch (projection.type as MeetingProjectionType) {
            case MeetingProjectionType.CurrentListOfSpeakers:
                title = `Current list of speakers`;
                break;
            case MeetingProjectionType.CurrentSpeakerChyron:
                title = `Current speaker chyron`;
                break;
            case MeetingProjectionType.AgendaItemList:
                title = `Agenda`;
                break;
            default:
                console.warn(`Unknown slide type for meeting:`, projection.type);
                title = `<unknown>`;
                break;
        }

        return { title };
    };

    public create(...meetings: Partial<MeetingAction.CreatePayload>[]): Promise<Identifiable[]> {
        const payload = meetings.map(meetingPayload => ({
            ...meetingPayload,
            start_time: this.anyDateToUnix(meetingPayload.start_time),
            end_time: this.anyDateToUnix(meetingPayload.end_time)
        }));
        return this.sendBulkActionToBackend(MeetingAction.CREATE, payload);
    }

    public import(committeeId: Id, meeting: ImportMeeting): Promise<Identifiable> {
        const payload: MeetingAction.ImportPayload = {
            committee_id: committeeId,
            meeting: this.sanitizeImportData(meeting)
        };
        return this.sendActionToBackend(MeetingAction.IMPORT, payload);
    }

    public update(
        update: Partial<MeetingAction.UpdatePayload>,
        meeting?: ViewMeeting,
        options: MeetingUserModifiedFields = {}
    ): Promise<void> {
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
                        id: update.id || meeting.id
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
            if (!meeting.default_group_id) {
                throw new Error(`A default group is required`);
            }
            this.getNewGroupsForUsers(userUpdate, addedUsers, meeting.id, meeting.default_group_id);
            this.getNewGroupsForUsers(userUpdate, removedUsers, meeting.id, meeting.default_group_id);
        }
        if (addedAdmins?.length || removedAdmins?.length) {
            if (!meeting.admin_group_id) {
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
                    group_$_ids: { [meeting.id]: userUpdate[userId] }
                }))
            });
        }

        return this.sendActionsToBackend(actions);
    }

    public delete(...meetings: Identifiable[]): Promise<void> {
        const payload: MeetingAction.DeletePayload[] = meetings.map(meeting => ({ id: meeting.id }));
        return this.sendBulkActionToBackend(MeetingAction.DELETE, payload);
    }

    public deleteAllSpeakersOfAllListsOfSpeakersInAMeeting(meetingId: Id): Promise<void> {
        const payload: MeetingAction.DeleteAllSpeakersOfAllListsPayload = {
            id: meetingId
        };
        return this.sendActionToBackend(MeetingAction.DELETE_ALL_SPEAKERS_OF_ALL_LISTS, payload);
    }

    public duplicate(...meetings: ViewMeeting[]): Promise<Identifiable[]> {
        const payload: MeetingAction.ClonePayload[] = meetings.map(meeting => ({ meeting_id: meeting.id }));
        return this.sendBulkActionToBackend(MeetingAction.CLONE, payload);
    }

    public duplicateFrom(committeeId: Id, ...meetings: ViewMeeting[] | Id[]): Promise<Identifiable[]> {
        const payload: MeetingAction.ClonePayload[] = meetings.map((meeting: ViewMeeting | Id) => ({
            meeting_id: typeof meeting === `number` ? meeting : meeting.id,
            committee_id: committeeId
        }));
        return this.sendBulkActionToBackend(MeetingAction.CLONE, payload);
    }

    public archive(...meetings: ViewMeeting[]): Promise<void> {
        const payload: MeetingAction.ArchivePayload[] = meetings.map(meeting => ({ id: meeting.id }));
        return this.sendBulkActionToBackend(MeetingAction.ARCHIVE, payload);
    }

    public unarchive(...meetings: ViewMeeting[]): Promise<void> {
        const payload: MeetingAction.UnarchivePayload[] = meetings.map(meeting => ({ id: meeting.id }));
        return this.sendBulkActionToBackend(MeetingAction.UNARCHIVE, payload);
    }

    public parseUnixToMeetingTime(time?: number): string {
        if (!time) {
            return ``;
        }
        const date = new Date(time);
        const month = date.getMonth() + 1 > 9 ? `${date.getMonth() + 1}` : `0${date.getMonth() + 1}`;
        return `${date.getFullYear()}${month}${date.getDate()}`;
    }

    protected createViewModel(model: Meeting): ViewMeeting {
        const viewModel = super.createViewModel(model);
        viewModel.getProjectorTitle = (projection: Projection) => this.getProjectorTitle(viewModel, projection);
        return viewModel;
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
    private anyDateToUnix(date: Date | Moment | number | null): number | null {
        if (date instanceof Date) {
            return Math.round(date.getTime() / 1000);
        } else if (typeof date === `number`) {
            return date;
        } else if (moment.isMoment(date)) {
            return date.unix();
        } else if (date === null) {
            return null;
        }
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
        users: ViewUser[],
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
