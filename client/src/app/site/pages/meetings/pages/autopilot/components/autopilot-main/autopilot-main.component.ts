import { Component } from '@angular/core';
import { distinctUntilChanged, map } from 'rxjs';
import { ProjectorRepositoryService } from 'src/app/gateways/repositories/projectors/projector-repository.service';
import { collectionFromFqid, idFromFqid } from 'src/app/infrastructure/utils/transform-functions';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';
import { CollectionMapperService } from 'src/app/site/services/collection-mapper.service';

import { getAutopilotContentSubscriptionConfig, getAutopilotSubscriptionConfig } from '../../autopilot.subscription';

@Component({
    selector: `os-autopilot-main`,
    templateUrl: `./autopilot-main.component.html`,
    styleUrls: [`./autopilot-main.component.scss`]
})
export class AutopilotMainComponent extends BaseModelRequestHandlerComponent {
    public constructor(
        private projectorRepo: ProjectorRepositoryService,
        private collectionMapper: CollectionMapperService
    ) {
        super();

        this.projectorRepo
            .getReferenceProjectorObservable()
            .pipe(
                map(projector => projector.current_projections.map(projection => projection.content_object_id)),
                map(fqids => [...new Set(fqids)]),
                map(fqids =>
                    fqids.filter(
                        fqid =>
                            collectionFromFqid(fqid) !== `meeting` &&
                            this.collectionMapper
                                .getModelConstructor(collectionFromFqid(fqid))
                                ?.REQUESTABLE_FIELDS.indexOf(`poll_ids`) !== -1
                    )
                ),
                distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
            )
            .subscribe(fqids => {
                for (let fqid of fqids) {
                    this.updateSubscribeTo(
                        getAutopilotContentSubscriptionConfig(
                            this.collectionMapper.getModelConstructor(collectionFromFqid(fqid)),
                            idFromFqid(fqid)
                        ),
                        {
                            hideWhenDestroyed: true
                        }
                    );
                }
            });
    }

    protected override onNextMeetingId(id: number | null): void {
        if (id) {
            this.subscribeTo(getAutopilotSubscriptionConfig(id), {
                hideWhenMeetingChanged: true
            });
        }
    }
}
