import { Injectable } from '@angular/core';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { ThemeAction } from '../../actions/theme-action';
import { BaseRepository } from '../base-repository';
import { Theme } from '../../../shared/models/theme/theme';
import { ViewTheme } from '../../../management/models/view-theme';
import { Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { Id } from 'app/core/definitions/key-types';
import { DEFAULT_FIELDSET } from '../../core-services/model-request-builder.service';
import { RepositoryServiceCollector } from '../repository-service-collector';

@Injectable({ providedIn: 'root' })
export class ThemeRepositoryService extends BaseRepository<ViewTheme, Theme> {
    public constructor(serviceCollector: RepositoryServiceCollector) {
        super(serviceCollector, Theme);
    }

    public getVerboseName = (plural?: boolean): string => (plural ? 'Themes' : 'Theme');
    public getTitle = (viewModel: ViewTheme): string => viewModel.name;
    public getFieldsets(): Fieldsets<any> {
        const baseFields: (keyof Theme)[] = ['theme_for_organization_id'];
        const requiredFields: (keyof Theme)[] = baseFields.concat(['name', 'primary_500', 'accent_500', 'warn_500']);
        const primaryFields: (keyof Theme)[] = [
            'primary_50',
            'primary_100',
            'primary_200',
            'primary_300',
            'primary_400',
            'primary_500',
            'primary_600',
            'primary_700',
            'primary_800',
            'primary_900',
            'primary_A100',
            'primary_A200',
            'primary_A400',
            'primary_A700'
        ];
        const accentFields: (keyof Theme)[] = [
            'accent_50',
            'accent_100',
            'accent_200',
            'accent_300',
            'accent_400',
            'accent_500',
            'accent_600',
            'accent_700',
            'accent_800',
            'accent_900',
            'accent_A100',
            'accent_A200',
            'accent_A400',
            'accent_A700'
        ];
        const warnFields: (keyof Theme)[] = [
            'warn_50',
            'warn_100',
            'warn_200',
            'warn_300',
            'warn_400',
            'warn_500',
            'warn_600',
            'warn_700',
            'warn_800',
            'warn_900',
            'warn_A100',
            'warn_A200',
            'warn_A400',
            'warn_A700'
        ];
        const allFields: (keyof Theme)[] = requiredFields.concat(primaryFields, accentFields, warnFields);
        return {
            required: requiredFields,
            primary: primaryFields,
            accent: accentFields,
            warn: warnFields,
            [DEFAULT_FIELDSET]: allFields
        };
    }
    public create(...themes: ThemeAction.CreatePayload[]): Promise<Identifiable[]> {
        const payload: ThemeAction.CreatePayload[] = themes;
        return this.sendBulkActionToBackend(ThemeAction.CREATE, payload);
    }
    public update(update: Partial<ThemeAction.UpdatePayload>, id: Id): Promise<void> {
        const payload: ThemeAction.UpdatePayload = {
            id,
            ...update
        };
        return this.sendActionToBackend(ThemeAction.UPDATE, payload);
    }
    public delete(...ids: Id[]): Promise<void> {
        const payload: ThemeAction.DeletePayload[] = ids.map(id => ({ id }));
        return this.sendBulkActionToBackend(ThemeAction.DELETE, payload);
    }
}
