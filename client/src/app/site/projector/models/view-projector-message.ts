import { ViewMeeting } from 'app/management/models/view-meeting';
import { Projectiondefault } from 'app/shared/models/projector/projector';
import { ProjectorMessage } from 'app/shared/models/projector/projector-message';
import { stripHtmlTags } from 'app/shared/utils/strip-html-tags';
import { BaseProjectableViewModel } from 'app/site/base/base-projectable-view-model';
import { ProjectionBuildDescriptor } from 'app/site/base/projection-build-descriptor';

export class ViewProjectorMessage extends BaseProjectableViewModel<ProjectorMessage> {
    public static COLLECTION = ProjectorMessage.COLLECTION;
    protected _collection = ProjectorMessage.COLLECTION;

    public get projectormessage(): ProjectorMessage {
        return this._model;
    }

    public getProjectionBuildDescriptor(): ProjectionBuildDescriptor {
        return {
            content_object_id: this.fqid,
            stable: true,
            projectionDefault: this.getProjectiondefault(),
            getDialogTitle: () => this.getTitle()
        };
    }

    public getProjectiondefault(): Projectiondefault {
        return Projectiondefault.projectorMessage;
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
