import { NukeDiagnostic } from './diagnostics/nuke';
import { ConstDiagnostic } from './diagnostics/const';
import { TypoDiagnostic } from './diagnostics/typo';
import { LoggingDiagnostic } from './diagnostics/logging';

export const maxFakeDiagnostics = 1;
const dTypes = [
    {
        value: NukeDiagnostic,
        weight: 1,
    },
    /*{
        value: ConstDiagnostic,
        weight: 30,
    },*/
    {
        value: TypoDiagnostic,
        weight: 30,
    },
    {
        value: LoggingDiagnostic,
        weight: 40,
    },
];

// Returns a random diagnostic based on the weight of each type
export function weightedDiagnosticType() {
    const weights = dTypes.reduce((acc, item, i) => {
        acc.push(item.weight + (acc[i - 1] || 0));
        return acc;
    }, [] as number[]);
    const random = Math.random() * weights[weights.length - 1];
    return dTypes[weights.findIndex((weight) => weight > random)].value;
}
