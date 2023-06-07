import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, ViewEncapsulation } from '@angular/core';
import { distinctUntilChanged, map } from 'rxjs';
import { ProjectorControllerService } from 'src/app/site/pages/meetings/pages/projectors/services/projector-controller.service';
import { BaseProjectableViewModel } from 'src/app/site/pages/meetings/view-models';

@Component({
    selector: `os-projectable-title`,
    templateUrl: `./projectable-title.component.html`,
    styleUrls: [`./projectable-title.component.scss`],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectableTitleComponent {
    @Input()
    public model: BaseProjectableViewModel;

    @Input()
    public getTitleFn: (model: BaseProjectableViewModel) => string = model => model.getTitle();

    @Input()
    public titleStyle: `h1` | `h2` = `h1`;

    public isProjectedObservable = this.projectorService.getViewModelListObservable().pipe(
        distinctUntilChanged(),
        map(_ => this.isBeingProjected())
    );

    constructor(private projectorService: ProjectorControllerService, private cd: ChangeDetectorRef) {}

    public isBeingProjected(): boolean {
        if (!this.model) {
            return false;
        }

        return this.projectorService.isProjected(this.model);
    }

    public update(): void {
        this.cd.markForCheck();
    }
}
