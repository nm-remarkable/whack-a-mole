import { DiagnosticSeverity, Range, TextDocument } from 'vscode';
import { FakeDiagnostic, FakeDiagnosticBuilder } from './interface';

export class LoggingDiagnostic extends FakeDiagnostic {
    static create(document: TextDocument) {
        const logTypes = ['critical', 'warning', 'info', 'debug'];
        const text = document.getText();
        const matches = Array.from(
            text.matchAll(new RegExp(logTypes.join('|'), 'gi'))
        );
        if (matches) {
            const log = matches[Math.floor(Math.random() * matches.length)];
            const index = text.indexOf(log[0]);
            const position = document.positionAt(index);
            const builder = new FakeDiagnosticBuilder();

            builder
                .setRange(
                    new Range(position, position.translate(0, log[0].length))
                )
                .setMessage('Spy plane ready to be deployed');
            return builder.build();
        }
        return undefined;
    }
}
