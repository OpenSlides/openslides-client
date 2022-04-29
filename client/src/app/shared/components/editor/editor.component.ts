import { AfterViewInit, Component, Input, ViewEncapsulation } from '@angular/core';
import { EditorComponent } from '@tinymce/tinymce-angular';

@Component({
    selector: `os-editor`,
    templateUrl: `./editor.component.html`,
    encapsulation: ViewEncapsulation.None
})
export class OsEditorComponent extends EditorComponent implements AfterViewInit {
    public initialized = false;

    @Input()
    public _formControlName: string;

    @Input()
    public init: Map<string, any>;

    @Input()
    public required: boolean;

    public ngAfterViewInit(): void {
        this.initialized = true;
    }
}
