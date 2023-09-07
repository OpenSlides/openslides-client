import { Collection } from 'src/app/domain/definitions/key-types';
import { AgendaItem, ItemTypeChoices } from 'src/app/domain/models/agenda/agenda-item';
import { Projection } from 'src/app/domain/models/projector/projection';
import { ProjectiondefaultValue } from 'src/app/domain/models/projector/projection-default';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { HasAgendaItem, ViewListOfSpeakers } from 'src/app/site/pages/meetings/pages/agenda';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { BaseProjectableViewModel, isProjectable } from 'src/app/site/pages/meetings/view-models';
import { ProjectionBuildDescriptor } from 'src/app/site/pages/meetings/view-models/projection-build-descriptor';
import { ViewMeeting } from 'src/app/site/pages/meetings/view-models/view-meeting';

import { HasTags } from '../../motions';

export class ViewAgendaItem extends BaseProjectableViewModel<AgendaItem> {
    public static COLLECTION = AgendaItem.COLLECTION;
    protected _collection = AgendaItem.COLLECTION;

    public get item(): AgendaItem {
        return this._model;
    }

    public getSubtitle!: () => string | null;

    /**
     * Gets the string representation of the item type
     * @returns The visibility for this item, as defined in {@link itemVisibilityChoices}
     */
    public get verboseType(): string {
        if (!this.type) {
            return ``;
        }
        const type = ItemTypeChoices.find(choice => choice.key === this.type);
        return type ? type.name : ``;
    }

    public override getProjectorTitle = (_projection: Projection) => {
        const subtitle = this.item.comment || undefined;
        return { title: this.getTitle(), subtitle };
    };

    public override getProjectionBuildDescriptor(
        meetingSettingsService?: MeetingSettingsService
    ): ProjectionBuildDescriptor | null {
        if (!this.content_object) {
            return null;
        }
        if (!isProjectable(this.content_object)) {
            throw new Error(`Content object must be projectable`);
        }
        return this.content_object.getProjectionBuildDescriptor(meetingSettingsService);
    }

    public getProjectiondefault(): ProjectiondefaultValue | null {
        return null;
    }

    /**
     * Necessary for agenda item filter
     */
    public getContentObjectCollection(): Collection | undefined {
        return this.content_object?.collection;
    }

    /**
     * Gets a shortened string for CSV export
     * @returns empty string if it is a public item, 'internal' or 'hidden' otherwise
     */
    public get verboseCsvType(): string {
        if (!this.type) {
            return ``;
        }
        const type = ItemTypeChoices.find(choice => choice.key === this.type);
        return type ? type.csvName : ``;
    }

    public override canAccess(): boolean {
        return !!this.content_object || this.child_ids?.length > 0;
    }
}
interface AgendaItemRelations<C extends BaseViewModel & HasAgendaItem> {
    content_object?: C;
    parent?: ViewAgendaItem;
    children: ViewAgendaItem[];
    meeting?: ViewMeeting;
    list_of_speakers: ViewListOfSpeakers;
}
export interface ViewAgendaItem<C extends BaseViewModel & HasAgendaItem = any>
    extends AgendaItem,
        AgendaItemRelations<C>,
        HasTags {}
