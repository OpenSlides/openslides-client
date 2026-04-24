import { Pipe, PipeTransform } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { KeyedTranslations } from 'src/app/domain/translations';

@Pipe({
    name: `translateKey`
})
export class TranslateKeyPipe extends TranslatePipe implements PipeTransform {
    public override transform(query: string | undefined | null, ...args: any[]): any {
        return super.transform(KeyedTranslations[query] ?? query, ...args);
    }
}
