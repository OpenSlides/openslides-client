import { inject, Service } from '@angular/core';
import { Id } from '@app/domain/definitions/key-types';
import { Identifiable } from '@app/domain/interfaces';
import { Theme } from '@app/domain/models/theme/theme';
import { ThemeRepositoryService } from '@app/gateways/repositories/themes/theme-repository.service';
import { BaseController } from '@app/site/base/base-controller';
import { OrganizationControllerService } from '@app/site/pages/organization/services/organization-controller.service';
import { ControllerServiceCollectorService } from '@app/site/services/controller-service-collector.service';

import { ViewTheme } from '../view-models';

@Service()
export class ThemeControllerService extends BaseController<ViewTheme, Theme> {
    protected override repo: ThemeRepositoryService;
    private orgaRepo = inject(OrganizationControllerService);

    public constructor() {
        const controllerServiceCollector = inject(ControllerServiceCollectorService);
        const repo = inject(ThemeRepositoryService);
        super(controllerServiceCollector, Theme, repo);
    }

    public create(...themes: any[]): Promise<Identifiable[]> {
        return this.repo.create(...themes);
    }

    public update(update: any, id: Id): Promise<void> {
        return this.repo.update(update, id);
    }

    public delete(...ids: Id[]): Promise<void> {
        return this.repo.delete(...ids);
    }

    public changeCurrentTheme(theme: ViewTheme): void {
        this.orgaRepo.update({ theme_id: theme.id });
    }
}
