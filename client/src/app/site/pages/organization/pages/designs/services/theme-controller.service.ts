import { Injectable } from '@angular/core';
import { ViewTheme } from '../view-models';
import { ThemeRepositoryService } from 'src/app/gateways/repositories/themes/theme-repository.service';
import { BaseController } from 'src/app/site/base/base-controller';
import { Theme } from 'src/app/domain/models/theme/theme';
import { ControllerServiceCollectorService } from 'src/app/site/services/controller-service-collector.service';
import { Identifiable } from 'src/app/domain/interfaces';
import { Id } from 'src/app/domain/definitions/key-types';
import { ThemeCommonServiceModule } from './theme-common-service.module';
import { OrganizationControllerService } from 'src/app/site/pages/organization/services/organization-controller.service';

@Injectable({
    providedIn: ThemeCommonServiceModule
})
export class ThemeControllerService extends BaseController<ViewTheme, Theme> {
    public constructor(
        controllerServiceCollector: ControllerServiceCollectorService,
        protected override repo: ThemeRepositoryService,
        private orgaRepo: OrganizationControllerService
    ) {
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
