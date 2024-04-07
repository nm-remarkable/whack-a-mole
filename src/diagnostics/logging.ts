import { DiagnosticSeverity, Range, TextDocument, window } from 'vscode';
import { FakeDiagnostic, FakeDiagnosticBuilder } from './interface';

const logMap: Map<string, string[]> = new Map();

logMap.set('py', ['.debug', '.info', '.warning', '.critical']);
logMap.set('cpp', [
    '::debug',
    '::info',
    '::warning',
    '::critical',
    'qCDebug',
    'qCWarning',
    'qCInfo',
]);
logMap.set('js', ['console.log', 'console.warn']);
logMap.set('ts', ['console.log', 'console.warn']);
logMap.set('go', ['.Debug', '.Info', '.Warning', '.Critical']);
logMap.set('rs', ['debug!', 'info!', 'warn!', 'error!']);

function getLogType(document: TextDocument): string[] {
    const fileExtension = document.uri.fsPath.split('.').pop();
    if (!fileExtension) {
        return [];
    }
    const logTypes = logMap.get(fileExtension);
    if (!logTypes) {
        return [];
    }
    return logTypes;
}

export class LoggingDiagnostic extends FakeDiagnostic {
    static create(document: TextDocument) {
        const logTypes = getLogType(document);
        const text = document.getText();
        const logStatements = Array.from(
            text.matchAll(new RegExp(logTypes.join('|'), 'gi'))
        );
        if (logStatements) {
            const randomAccess = Math.floor(
                Math.random() * logStatements.length
            );
            const log = logStatements[randomAccess];
            if (!!log.index) {
                const position = document.positionAt(log.index);
                const builder = new FakeDiagnosticBuilder();

                return builder
                    .setMessage('Spy plane ready to be deployed')
                    .setStillApplies(stillApplies)
                    .build(
                        LoggingDiagnostic.name,
                        new Range(
                            position,
                            position.translate(0, log[0].length)
                        ),
                        execute
                    );
            }
        }
        return undefined;
    }
}

function execute(instance: FakeDiagnostic, document: TextDocument) {
    const logTypes = getLogType(document);
    const text = document.getText(instance.range);
    const logStatements = Array.from(
        text.matchAll(new RegExp(logTypes.join('|'), 'gi'))
    );
    if (logStatements) {
        const stmt = logStatements[0][0];
        const index = logTypes.indexOf(stmt);
        if (index > -1) {
            logTypes.splice(index, 1);
        }
        const randomAccess = Math.floor(Math.random() * logTypes.length);
        const newLog = logTypes[randomAccess];
        window.activeTextEditor?.edit((editor) => {
            editor.replace(instance.range, newLog);
        });
    }
}

function stillApplies(
    instance: FakeDiagnostic,
    document: TextDocument,
    offset: number
): boolean {
    const logTypes = getLogType(document);
    const newRange = new Range(
        instance.range.start.translate(offset, 0),
        instance.range.end.translate(offset, 0)
    );
    const text = document.getText(newRange);
    const logStatements = Array.from(
        text.matchAll(new RegExp(logTypes.join('|'), 'gi'))
    );
    if (logStatements) {
        instance.range = newRange;
        return true;
    }
    return false;
}
