import { Gender } from 'src/app/domain/models/gender/gender';
import { BaseViewModel, ViewModelRelations } from 'src/app/site/base/base-view-model';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { ViewOrganization } from 'src/app/site/pages/organization/view-models/view-organization';

export class ViewGender extends BaseViewModel<Gender> {
    public static readonly COLLECTION = Gender.COLLECTION;
    protected _collection = Gender.COLLECTION;

    public get gender(): Gender {
        return this._model;
    }

    public get isPredefined(): boolean {
        return [`male`, `female`, `diverse`, `non-binary`].includes(this.name);
    }
}

interface IGenderRelations {
    organization: ViewOrganization;
    users: ViewUser[];
}
export interface ViewGender extends Gender, ViewModelRelations<IGenderRelations> {}
