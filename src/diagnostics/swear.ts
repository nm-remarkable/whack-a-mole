import { DiagnosticSeverity, Range, TextDocument } from 'vscode';
import { FakeDiagnostic, FakeDiagnosticBuilder } from './interface';

export class SwearDiagnostic extends FakeDiagnostic {
    static create(document: TextDocument) {
        const text = document.getText();
        const swears = Array.from(text.matchAll(/cum|anal|\sn\s/gi));
        if (swears) {
            const swear = swears[Math.floor(Math.random() * swears.length)];
            const index = text.indexOf(swear[0]);
            const position = document.positionAt(index);
            const builder = new FakeDiagnosticBuilder();
            builder
                .setRange(
                    new Range(position, position.translate(0, swear[0].length))
                )
                .setMessage('Profanity detected, opinion rejected')
                .setSeverity(DiagnosticSeverity.Information)
                .setTimer(500, 500);
            return builder.build();
        }
        return undefined;
    }
}
