import { Component } from '@angular/core';
import { distinctUntilChanged, map } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { ProjectorRepositoryService } from 'src/app/gateways/repositories/projectors/projector-repository.service';
import { collectionFromFqid } from 'src/app/infrastructure/utils/transform-functions';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';
import { CollectionMapperService } from 'src/app/site/services/collection-mapper.service';

import {
    AUTOPILOT_CONTENT_SUBSCRIPTION,
    getAutopilotContentSubscriptionConfig,
    getAutopilotSubscriptionConfig
} from '../../autopilot.subscription';

@Component({
    selector: `os-autopilot-main`,
    templateUrl: `./autopilot-main.component.html`,
    styleUrls: [`./autopilot-main.component.scss`]
})
export class AutopilotMainComponent extends BaseModelRequestHandlerComponent {
    private currentSubscriptions: Id[] = [];

    public constructor(
        private projectorRepo: ProjectorRepositoryService,
        private collectionMapper: CollectionMapperService
    ) {
        super();

        this.subscriptions.push(
            this.projectorRepo
                .getReferenceProjectorObservable()
                .pipe(
                    map(projector =>
                        projector?.current_projections
                            ?.filter(projection => {
                                const fqid = projection.content_object_id;

                                return (
                                    collectionFromFqid(fqid) !== `meeting` &&
                                    (this.collectionMapper
                                        .getModelConstructor(collectionFromFqid(fqid))
                                        ?.REQUESTABLE_FIELDS.indexOf(`poll_ids`) !== -1 ||
                                        this.collectionMapper
                                            .getModelConstructor(collectionFromFqid(fqid))
                                            ?.REQUESTABLE_FIELDS.indexOf(`content_object_id`) !== -1 ||
                                        this.collectionMapper
                                            .getModelConstructor(collectionFromFqid(fqid))
                                            ?.REQUESTABLE_FIELDS.indexOf(`list_of_speakers_id`) !== -1)
                                );
                            })
                            .map(p => p.id)
                    ),
                    distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
                )
                .subscribe((projections: Id[]) => {
                    if (!projections) {
                        return;
                    }

                    for (let id of this.currentSubscriptions) {
                        if (projections.indexOf(id) === -1) {
                            this.modelRequestService.closeSubscription(`${AUTOPILOT_CONTENT_SUBSCRIPTION}_${id}`);
                        }
                    }

                    for (let id of projections) {
                        if (this.currentSubscriptions.indexOf(id) === -1) {
                            this.updateSubscribeTo(
                                {
                                    ...getAutopilotContentSubscriptionConfig(id),
                                    subscriptionName: `${AUTOPILOT_CONTENT_SUBSCRIPTION}_${id}`
                                },
                                {
                                    hideWhenDestroyed: true
                                }
                            );
                        }
                    }

                    this.currentSubscriptions = projections;
                })
        );
    }

    protected override onNextMeetingId(id: number | null): void {
        if (id) {
            this.subscribeTo(getAutopilotSubscriptionConfig(id), {
                hideWhenMeetingChanged: true
            });
        }
    }
}
