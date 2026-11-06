import { Pipe, PipeTransform } from '@angular/core';
import { KeyedTranslations } from '@app/domain/translations';
import { TranslatePipe } from '@ngx-translate/core';

@Pipe({
    name: `translateKey`
})
export class TranslateKeyPipe extends TranslatePipe implements PipeTransform {
    public override transform(query: string | undefined | null, prefix?: string, ...args: any[]): any {
        if (prefix) {
            query = `${prefix}.${query}`;
        }

        return super.transform(KeyedTranslations[query] ?? query, ...args);
    }
}
