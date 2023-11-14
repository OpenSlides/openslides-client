import { BaseModel } from '../base/base-model';

/**
 *  Representation of a structure_level
 *  @ignore
 */
export class StructureLevel extends BaseModel<StructureLevel> {
    public static COLLECTION = `structure_level`;

    public name: string;
    public color: string;
    public allow_additional_time: boolean;

    public constructor(input?: Partial<StructureLevel>) {
        super(StructureLevel.COLLECTION, input);
    }

    public static readonly REQUESTABLE_FIELDS: (keyof StructureLevel)[] = [`id`, `name`, `color`, `allow_additional_time`];
}
export interface StructureLevel {}
