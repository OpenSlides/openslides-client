import { fillTemplateValueInTemplateField } from 'app/core/core-services/key-transforms';

import { BaseModel } from './base-model';

export abstract class BaseDecimalModel<T = any> extends BaseModel<T> {
    protected abstract getDecimalFields(): (keyof T)[];

    public deserialize(input: any): void {
        if (!input || typeof input !== `object`) {
            return;
        }
        for (const field of this.getDecimalFields()) {
            if (!input[field]) {
                continue;
            }
            this.parseDecimalFields(input, field as string);
        }
        super.deserialize(input);
    }

    private parseDecimalFields(input: object, field: string): void {
        if (Array.isArray(input[field])) {
            // Assuming that field is a template-field.
            for (const replacement of input[field]) {
                this.parseDecimalFields(input, fillTemplateValueInTemplateField(field, replacement));
            }
        } else {
            input[field] = parseFloat(input[field]);
        }
    }
}
