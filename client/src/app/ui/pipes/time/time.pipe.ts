import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
    name: `time`,
    pure: false
})
export class TimePipe implements PipeTransform {
    public constructor(private translate: TranslateService) {}

    public transform(timestamp: number): string {
        return new Date(timestamp * 1000).toLocaleString(this.translate.currentLang);
    }
}
