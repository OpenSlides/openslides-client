import { ChangeDetectorRef, inject, Pipe, PipeTransform } from '@angular/core';
import { Locale } from 'date-fns';
import { DateFnsConfigurationService, DateFnsInputDate, FormatPipe } from 'ngx-date-fns';
import { TimeZoneService } from 'src/app/site/services/time-zone.service';

@Pipe({
    name: `localizedDateRange`,
    pure: false,
    standalone: false
})
export class LocalizedDateRangePipe implements PipeTransform {
    private timeZone = inject(TimeZoneService);
    private cd = inject(ChangeDetectorRef);
    private inputDate = inject(DateFnsConfigurationService);
    public formatter = new FormatPipe(this.inputDate, this.cd);

    public transform(value: any, dateFormat = `PPp`, timezone = ``): any {
        if (!value) {
            return ``;
        }

        if (!value.start && value.start !== 0) {
            if (value.end || value.end === 0) {
                const date = this.timeZone.transformFromTS(value.end, timezone);
                return this.formatter.transform(date, dateFormat);
            }
            return ``;
        } else if (!value.end && value.end !== 0) {
            const date = this.timeZone.transformFromTS(value.start, timezone);
            return this.formatter.transform(date, dateFormat);
        }

        const data = this.generateAndSplitIntervalStrings(value, dateFormat, timezone);

        const fn = this.getDateIntervalAbbreviationFunctionForLocale(this.inputDate?.locale(), dateFormat);
        const result = fn(data.startString, data.startArray, data.endString, data.endArray);
        if (new Intl.DateTimeFormat().resolvedOptions()?.timeZone != timezone) {
            return result + ` ${timezone}`;
        }
        return result;
    }

    private generateAndSplitIntervalStrings(
        interval: { start: DateFnsInputDate; end: DateFnsInputDate },
        dateFormat: string,
        timezone: string
    ): { startString: string; startArray: string[]; endString: string; endArray: string[] } {
        const start =
            typeof interval.start === `number`
                ? this.timeZone.transformFromTS(interval.start, timezone)
                : interval.start;
        const end =
            typeof interval.end === `number` ? this.timeZone.transformFromTS(interval.end, timezone) : interval.end;
        const startString = this.formatter.transform(start, dateFormat);
        const startArray = startString.split(/[\s,]+/);
        const endString = this.formatter.transform(end, dateFormat);
        const endArray = endString.split(/[\s,]+/);
        return { startString, startArray, endString, endArray };
    }

    /**
     * Returns a function that, when given the return values of {@link generateAndSplitIntervalStrings} will return the final formatted string.
     * @param locale The locale for which the corresponding function needs to be returned
     * @param dateFormat The date format that the function must be fit to
     */
    private getDateIntervalAbbreviationFunctionForLocale(
        locale: Locale,
        dateFormat: string
    ): (startString: string, startArray: string[], endString: string, endArray: string[]) => string {
        switch (locale?.code + `#` + dateFormat) {
            case `en-US#PPp`:
            case `de#PPp`:
            case `es#PPp`:
            case `it#PPp`:
            case `cs#PPp`:
                return this.formatPPp;
            case `en-US#PP`:
                return this.formatMDYPPwithCommaNotation;
            case `es#PP`:
            case `it#PP`:
            case `de#PP`:
            case `cs#PP`:
                return this.formatDMYPP;
            default:
                return (startString, _startArray, endString, _endArray) =>
                    this.defaultTransformInterval(startString, endString);
        }
    }

    private defaultTransformInterval(startString: string, endString: string): string {
        return startString === endString ? startString : startString + ` - ` + endString;
    }

    // --------------------------------------------------------------------------------------------------------------
    // Individual formatting functions
    // --------------------------------------------------------------------------------------------------------------

    private formatPPp = (startString: string, startArray: string[], endString: string, endArray: string[]): string => {
        if (startArray[3] !== endArray[3] && startArray.slice(0, 2).every((val, index) => val === endArray[index])) {
            return startString + ` - ` + endArray.slice(3).join(` `);
        }
        return this.defaultTransformInterval(startString, endString);
    };

    private formatMDYPPwithCommaNotation = (
        startString: string,
        startArray: string[],
        endString: string,
        endArray: string[]
    ): string => {
        if (startArray[2] !== endArray[2] || startString === endString) {
            return this.defaultTransformInterval(startString, endString);
        } else if (startArray[0] !== endArray[0]) {
            return startArray[0] + ` ` + startArray[1] + ` - ` + endString;
        }
        return startArray[0] + ` ` + startArray[1] + ` - ` + endArray[1] + `, ` + startArray[2];
    };

    private formatDMYPP = (
        startString: string,
        startArray: string[],
        endString: string,
        endArray: string[]
    ): string => {
        if (startArray[2] !== endArray[2] || startString === endString) {
            return this.defaultTransformInterval(startString, endString);
        } else if (startArray[1] !== endArray[1]) {
            return startArray[0] + ` ` + startArray[1] + ` - ` + endString;
        }
        return startArray[0] + ` - ` + endString;
    };
}
