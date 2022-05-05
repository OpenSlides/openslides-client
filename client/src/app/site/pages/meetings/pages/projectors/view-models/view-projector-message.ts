import { ProjectorMessage } from '../../../../../../domain/models/projector/projector-message';
import { HasMeeting } from '../../../view-models/has-meeting';
import { BaseProjectableViewModel } from '../../../view-models/base-projectable-model';
import { Projectiondefault } from '../../../../../../domain/models/projector/projection-default';
import { stripHtmlTags } from '../../../../../../infrastructure/utils';
import { ProjectionBuildDescriptor } from '../../../view-models/projection-build-descriptor';
export class ViewProjectorMessage extends BaseProjectableViewModel<ProjectorMessage> {
    public static COLLECTION = ProjectorMessage.COLLECTION;
    protected _collection = ProjectorMessage.COLLECTION;

    public get projectormessage(): ProjectorMessage {
        return this._model;
    }

    public override getProjectionBuildDescriptor(): ProjectionBuildDescriptor {
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
            return html.substring(0, maxLength) + ` ...`;
        } else {
            return html;
        }
    }
}
interface IProjectorMessageRelations {}
export interface ViewProjectorMessage extends ProjectorMessage, IProjectorMessageRelations, HasMeeting {}
