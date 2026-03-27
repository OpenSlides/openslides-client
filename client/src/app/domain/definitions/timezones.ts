export const availableTimezones = Intl.supportedValuesOf('timeZone').filter(value => !value.startsWith(`Etc`));
