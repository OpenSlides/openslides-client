import { Id } from '../../definitions/key-types';
import { BaseModel } from '../base/base-model';

export abstract class BasePollConfigModel<T = any> extends BaseModel<T> {
    public poll_id!: Id;
}
