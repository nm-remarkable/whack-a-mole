import { NukeDiagnostic } from './diagnostics/nuke';
import { ConstDiagnostic } from './diagnostics/const';
import { SwearDiagnostic } from './diagnostics/swear';
import { LoggingDiagnostic } from './diagnostics/logging';

export const updateInterval = 300;
export const maxFakeDiagnostics = 1;
export const diagnosticTypes = [
    NukeDiagnostic,
    ConstDiagnostic,
    SwearDiagnostic,
    LoggingDiagnostic,
];
