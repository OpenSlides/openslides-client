import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { MeetingUser } from 'src/app/domain/models/meeting-users/meeting-user';
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
    private changedModelsUserIdsSubject: BehaviorSubject<Id[]> = new BehaviorSubject([]);
    public get changedModelsUserIdsObservable(): Observable<Id[]> {
        return this.changedModelsUserIdsSubject.asObservable();
    }

    public constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, MeetingUser);
    }

    public override changedModels(ids: number[]): void {
        super.changedModels(ids);
        const userIds: Id[] = [];
        ids.forEach(id => {
            const userId = this.getViewModelUnsafe(id).user_id;
            if (userId) {
                userIds.push(userId);
            }
        });
        if (userIds.length) {
            this.changedModelsUserIdsSubject.next(userIds);
        }
    }

    public override getFieldsets(): Fieldsets<MeetingUser> {
        const participantListFieldsMinimal: TypedFieldset<MeetingUser> = [
            `vote_delegated_to_id`,
            `vote_delegations_from_ids`,
            `vote_weight`,
            `structure_level`,
            `number`,
            `comment`,
            `user_id`
        ];

        const detailFields: TypedFieldset<MeetingUser> = [`about_me`, `user_id`];

        return {
            [DEFAULT_FIELDSET]: detailFields,
            participantListMinimal: participantListFieldsMinimal
        };
    }

    public getBaseUserPayload(partialUser: Partial<MeetingUser>): any {
        if (partialUser.meeting_id || this.activeMeetingId) {
            const partialPayload: Partial<MeetingUser> = {
                meeting_id: partialUser.meeting_id ?? this.activeMeetingId,
                structure_level: partialUser.structure_level,
                number: partialUser.number,
                about_me: partialUser.about_me,
                vote_weight: partialUser.vote_weight,
                comment: partialUser.comment,
                vote_delegated_to_id: partialUser.vote_delegated_to_id,
                vote_delegations_from_ids: partialUser.vote_delegations_from_ids
            };

            if (Object.values(partialPayload).filter(val => val !== undefined).length > 1 && partialPayload.meeting_id)
                return partialPayload;
        }
        return {};
    }

    public getTitle = (viewUser: ViewMeetingUser) => viewUser.user?.getTitle() ?? `Unknown`;

    public getVerboseName = (plural: boolean = false): string =>
        this.translate.instant(plural ? `Participants` : `Participant`);

    public isFieldAllowedToBeEmpty(field: string): boolean {
        const fields: string[] = [`comment`, `about_me`, `number`, `structure_level`];
        return fields.includes(field);
    }
}
