import { MotionCsvExport } from '../services/motion-csv-export.service';

export const MotionCsvExportExample: MotionCsvExport[] = [
    {
        number: `A1`,
        title: `Title 1`,
        text: `Text 1`,
        motion_block: `Block A`,
        category: `Category A`,
        submitters: `Submitter a`,
        reason: `Because it is so`
    },
    {
        number: `B2`,
        title: `Title 2`,
        text: `Text 2`,
        motion_block: `Block B`,
        category: `A - Category`,
        submitters: `Submitter A`,
        reason: `Penguins can fly`
    },
    {
        number: `C2`,
        title: `Title 3`,
        text: `Text 3`
    }
];
