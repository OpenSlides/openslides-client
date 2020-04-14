import { ProjectorMessage } from 'app/shared/models/projector/projector-message';
import { stripHtmlTags } from 'app/shared/utils/strip-html-tags';
import { BaseProjectableViewModel } from 'app/site/base/base-projectable-view-model';
import { ProjectorElementBuildDeskriptor } from 'app/site/base/projectable';
import { ViewMeeting } from 'app/site/event-management/models/view-meeting';

export class ViewProjectorMessage extends BaseProjectableViewModel<ProjectorMessage> {
    public static COLLECTION = ProjectorMessage.COLLECTION;
    protected _collection = ProjectorMessage.COLLECTION;

    public get projectormessage(): ProjectorMessage {
        return this._model;
    }

    public getSlide(): ProjectorElementBuildDeskriptor {
        return {
            getBasicProjectorElement: options => ({
                stable: true,
                name: ProjectorMessage.COLLECTION,
                id: this.id,
                getNumbers: () => ['name', 'id']
            }),
            slideOptions: [],
            projectionDefaultName: 'messages',
            getDialogTitle: () => this.getTitle()
        };
    }

    public getPreview(maxLength: number = 100): string {
        const html = stripHtmlTags(this.message);
        if (html.length > maxLength) {
            return html.substring(0, maxLength) + ' ...';
        } else {
            return html;
        }
    }
}
interface IProjectorMessageRelations {
    meeting: ViewMeeting[];
}
export interface ViewProjectorMessage extends ProjectorMessage, IProjectorMessageRelations {}
