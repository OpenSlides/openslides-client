import { Identifiable } from '../../shared/models/base/identifiable';
import { ThemeOptionalValues, ThemeRequiredValues } from '../../shared/models/theme/theme';

export namespace ThemeAction {
    export const CREATE = `theme.create`;
    export const UPDATE = `theme.update`;
    export const DELETE = `theme.delete`;

    export interface CreatePayload extends ThemeRequiredValues, ThemeOptionalValues {}

    export interface UpdatePayload extends Identifiable, Partial<ThemeRequiredValues>, ThemeOptionalValues {}

    export interface DeletePayload extends Identifiable {}
}
