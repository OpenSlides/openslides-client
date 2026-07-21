import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
    name: `time`,
    pure: false,
    standalone: false
})
export class TimePipe implements PipeTransform {
    private translate = inject(TranslateService);

    public transform(timestamp: number): string {
        return new Date(timestamp * 1000).toLocaleString(this.translate.getCurrentLang());
    }
}
