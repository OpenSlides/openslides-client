import { AgendaListTitle } from 'app/core/repositories/agenda/agenda-item-repository.service';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { AgendaItem, ItemTypeChoices } from 'app/shared/models/agenda/agenda-item';
import { HasAgendaItemId } from 'app/shared/models/base/has-agenda-item-id';
import { Projection } from 'app/shared/models/projector/projection';
import { Projectiondefault } from 'app/shared/models/projector/projector';
import { BaseProjectableViewModel } from 'app/site/base/base-projectable-view-model';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { DetailNavigable } from 'app/site/base/detail-navigable';
import { isProjectable } from 'app/site/base/projectable';
import { ProjectionBuildDescriptor } from 'app/site/base/projection-build-descriptor';
import { HasTags } from 'app/site/tags/models/view-tag';

import { Collection } from '../../../core/definitions/key-types';

export interface HasAgendaItem extends DetailNavigable, HasAgendaItemId {
    agenda_item?: ViewAgendaItem;

    /**
     * @returns the agenda title
     */
    getAgendaSlideTitle: () => string;

    /**
     * @return the agenda title with the verbose name of the content object
     */
    getAgendaListTitle: () => AgendaListTitle;

    /**
     * @returns the (optional) descriptive text to be exported in the CSV.
     * May be overridden by inheriting classes
     */
    getCSVExportText: () => string;
}

export class ViewAgendaItem extends BaseProjectableViewModel<AgendaItem> {
    public static COLLECTION = AgendaItem.COLLECTION;
    protected _collection = AgendaItem.COLLECTION;

    public get item(): AgendaItem {
        return this._model;
    }

    public getSubtitle: () => string | null;

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

    public getProjectorTitle = (projection: Projection) => {
        const subtitle = this.item.comment || null;
        return { title: this.getTitle(), subtitle };
    };

    public getProjectionBuildDescriptor(meetingSettingsService?: MeetingSettingsService): ProjectionBuildDescriptor {
        if (!this.content_object) {
            return null;
        }
        if (!isProjectable(this.content_object)) {
            throw new Error(`Content object must be projectable`);
        }
        return this.content_object.getProjectionBuildDescriptor(meetingSettingsService);
    }

    public getProjectiondefault(): Projectiondefault {
        return null;
    }

    /**
     * Necessary for agenda item filter
     */
    public getContentObjectCollection(): Collection {
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

    public canAccess(): boolean {
        return !!this.content_object || this.child_ids?.length > 0;
    }
}
interface IAgendaItemRelations {
    content_object?: BaseViewModel & HasAgendaItem;
    parent?: ViewAgendaItem;
    children: ViewAgendaItem[];
    meeting?: ViewMeeting;
}
export interface ViewAgendaItem extends AgendaItem, IAgendaItemRelations, HasTags {}
