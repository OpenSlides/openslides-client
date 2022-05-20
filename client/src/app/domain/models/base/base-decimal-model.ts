import { fillTemplateValueInTemplateField } from '../../../infrastructure/utils/transform-functions';
import { BaseModel } from './base-model';

export abstract class BaseDecimalModel<T = any> extends BaseModel<T> {
    protected abstract getDecimalFields(): (keyof T)[];

    public override deserialize(input: any): void {
        if (!input || typeof input !== `object`) {
            return;
        }
        for (const field of this.getDecimalFields()) {
            if (!input[field]) {
                continue;
            }
            this.parseDecimalFields(input, field);
        }
        super.deserialize(input);
    }

    private parseDecimalFields(input: T, field: keyof T): void {
        if (Array.isArray(input[field])) {
            // Assuming that field is a template-field.
            for (const replacement of input[field] as any) {
                this.parseDecimalFields(
                    input,
                    fillTemplateValueInTemplateField(field as string, replacement) as keyof T
                );
            }
        } else {
            input[field] = parseFloat(input[field] as any) as any;
        }
    }
}
