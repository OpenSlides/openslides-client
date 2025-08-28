import { Injectable } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { MeetingUser } from 'src/app/domain/models/meeting-users/meeting-user';
import { toDecimal } from 'src/app/infrastructure/utils';
import { ViewMeetingUser } from 'src/app/site/pages/meetings/view-models/view-meeting-user';
import { DEFAULT_FIELDSET, Fieldsets, TypedFieldset } from 'src/app/site/services/model-request-builder';

import { BaseMeetingRelatedRepository } from '../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../repository-meeting-service-collector.service';

export type MeetingUserPatchFn =
    | { [key in keyof MeetingUser]?: any }
    | ((user: ViewMeetingUser) => { [key in keyof MeetingUser]?: any });

@Injectable({
    providedIn: `root`
})
export class MeetingUserRepositoryService extends BaseMeetingRelatedRepository<ViewMeetingUser, MeetingUser> {
    public override readonly resetOnMeetingChange = false;

    private meetingUserIdMap = new Map<Id, Map<Id, Id>>();

    public constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, MeetingUser);
    }

    public override getFieldsets(): Fieldsets<MeetingUser> {
        const groupFields: TypedFieldset<MeetingUser> = [`group_ids`, `meeting_id`, `user_id`];
        const participantListFieldsMinimal: TypedFieldset<MeetingUser> = groupFields.concat([
            `vote_delegated_to_id`,
            `vote_delegations_from_ids`,
            `structure_level_ids`,
            `vote_weight`,
            `comment`,
            `user_id`,
            `number`,
            `locked_out`
        ]);

        const detailFields: TypedFieldset<MeetingUser> = [`about_me`, `user_id`, `meeting_id`];

        return {
            [DEFAULT_FIELDSET]: detailFields,
            groups: groupFields,
            participantListMinimal: participantListFieldsMinimal,
            all: detailFields.concat(participantListFieldsMinimal)
        };
    }

    public getBaseUserPayload(partialUser: Partial<MeetingUser>): any {
        if (partialUser.meeting_id || this.activeMeetingId) {
            const partialPayload: Partial<MeetingUser> = {
                meeting_id: partialUser.meeting_id ?? this.activeMeetingId,
                number: partialUser.number,
                about_me: partialUser.about_me,
                vote_weight: toDecimal(partialUser.vote_weight, false) as any,
                comment: partialUser.comment,
                vote_delegated_to_id: partialUser.vote_delegated_to_id,
                vote_delegations_from_ids: partialUser.vote_delegations_from_ids,
                structure_level_ids: partialUser.structure_level_ids,
                group_ids: partialUser.group_ids,
                locked_out: partialUser.locked_out
            };

            if (Object.values(partialPayload).filter(val => val !== undefined).length > 1 && partialPayload.meeting_id)
                return partialPayload;
        }
        return {};
    }

    public getTitle = (viewUser: ViewMeetingUser): string => viewUser.user?.getTitle() ?? `Unknown`;

    public getVerboseName = (plural = false): string => this.translate.instant(plural ? `Participants` : `Participant`);

    public getMeetingUserId(userId: Id, meetingId: Id): Id | null {
        if (this.meetingUserIdMap.has(userId) && this.meetingUserIdMap.get(userId).has(meetingId)) {
            return this.meetingUserIdMap.get(userId).get(meetingId);
        }

        return null;
    }

    public getActiveMeetingId(): number {
        return this.activeMeetingId;
    }

    public override deleteModels(ids: Id[]): void {
        ids.forEach(id => {
            const user = this.viewModelStore[id];
            if (user && user.user_id && user.meeting_id) {
                const meetingUserId = this.meetingUserIdMap.get(user.user_id)?.get(user.meeting_id);
                if (meetingUserId === user.id) {
                    this.meetingUserIdMap.get(user.user_id).delete(user.meeting_id);
                }
            }
        });
        super.deleteModels(ids);
    }

    protected override clearViewModelStore(): void {
        super.clearViewModelStore();
        this.meetingUserIdMap = new Map();
    }

    protected override onCreateViewModel(meetingUser: ViewMeetingUser): void {
        if (meetingUser.user_id && meetingUser.meeting_id) {
            if (!this.meetingUserIdMap.has(meetingUser.user_id)) {
                this.meetingUserIdMap.set(meetingUser.user_id, new Map());
            }

            this.meetingUserIdMap.get(meetingUser.user_id).set(meetingUser.meeting_id, meetingUser.id);
        }
    }
}
