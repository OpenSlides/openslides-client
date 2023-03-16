import { Injectable } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { Theme } from 'src/app/domain/models/theme/theme';
import { BaseRepository } from 'src/app/gateways/repositories/base-repository';
import { ViewTheme } from 'src/app/site/pages/organization/pages/designs';
import { DEFAULT_FIELDSET, Fieldsets } from 'src/app/site/services/model-request-builder';

import { RepositoryServiceCollectorService } from '../repository-service-collector.service';
import { ThemeAction } from './theme.action';

@Injectable({
    providedIn: `root`
})
export class ThemeRepositoryService extends BaseRepository<ViewTheme, Theme> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollectorService) {
        super(repositoryServiceCollector, Theme);
    }

    public getVerboseName = (plural?: boolean): string => (plural ? `Themes` : `Theme`);
    public getTitle = (viewModel: ViewTheme): string => viewModel.name;
    public override getFieldsets(): Fieldsets<any> {
        const baseFields: (keyof Theme)[] = [`theme_for_organization_id`];
        const requiredFields: (keyof Theme)[] = baseFields.concat([`name`, `primary_500`, `accent_500`, `warn_500`]);
        const primaryFields: (keyof Theme)[] = [
            `primary_50`,
            `primary_100`,
            `primary_200`,
            `primary_300`,
            `primary_400`,
            `primary_500`,
            `primary_600`,
            `primary_700`,
            `primary_800`,
            `primary_900`,
            `primary_a100`,
            `primary_a200`,
            `primary_a400`,
            `primary_a700`
        ];
        const accentFields: (keyof Theme)[] = [
            `accent_50`,
            `accent_100`,
            `accent_200`,
            `accent_300`,
            `accent_400`,
            `accent_500`,
            `accent_600`,
            `accent_700`,
            `accent_800`,
            `accent_900`,
            `accent_a100`,
            `accent_a200`,
            `accent_a400`,
            `accent_a700`
        ];
        const warnFields: (keyof Theme)[] = [
            `warn_50`,
            `warn_100`,
            `warn_200`,
            `warn_300`,
            `warn_400`,
            `warn_500`,
            `warn_600`,
            `warn_700`,
            `warn_800`,
            `warn_900`,
            `warn_a100`,
            `warn_a200`,
            `warn_a400`,
            `warn_a700`
        ];
        return {
            ...super.getFieldsets(),
            required: requiredFields,
            primary: primaryFields,
            accent: accentFields,
            warn: warnFields
        };
    }

    public create(...themes: any[]): Promise<Identifiable[]> {
        const payload = themes;
        return this.sendBulkActionToBackend(ThemeAction.CREATE, payload);
    }
    public update(update: any, id: Id): Promise<void> {
        const payload = {
            id,
            ...update
        };
        return this.sendActionToBackend(ThemeAction.UPDATE, payload);
    }
    public delete(...ids: Id[]): Promise<void> {
        const payload = ids.map(id => ({ id }));
        return this.sendBulkActionToBackend(ThemeAction.DELETE, payload);
    }
}
