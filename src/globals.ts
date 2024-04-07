import { NukeDiagnostic } from './diagnostics/nuke';
import { ConstDiagnostic } from './diagnostics/const';
import { TypoDiagnostic } from './diagnostics/typo';
import { LoggingDiagnostic } from './diagnostics/logging';

export const maxFakeDiagnostics = 1;
export const diagnosticTypes = [
    NukeDiagnostic,
    //ConstDiagnostic,
    TypoDiagnostic,
    LoggingDiagnostic,
];
