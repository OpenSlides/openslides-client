import { Observable } from 'rxjs';
import { Ids } from 'src/app/domain/definitions/key-types';

import { SideImportHandlerConfig } from './side-import-handler-config';

export interface StaticBeforeImportConfig<ToCreate = any, ToImport = any>
    extends SideImportHandlerConfig<ToCreate, ToImport> {
    /**
     * The property of the models, which are created, models created by this helper are linked to
     */
    idProperty: keyof ToCreate;
    /**
     * If none value is given, this value will be inserted
     */
    useDefault?: Ids;
    useDefaultObservable?: Observable<Ids>;
}
