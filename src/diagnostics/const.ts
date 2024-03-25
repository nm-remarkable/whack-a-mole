import { Range, TextDocument, DiagnosticSeverity } from 'vscode';
import { FakeDiagnostic, FakeDiagnosticBuilder } from './interface';

export class ConstDiagnostic extends FakeDiagnostic {
    static create(document: TextDocument) {
        const text = document.getText();
        const cosntAwareness = text.match(/const|var|let|mut/gi);
        if (cosntAwareness) {
            const index = text.indexOf(cosntAwareness[0]);
            const position = document.positionAt(index);
            const builder = new FakeDiagnosticBuilder();
            builder
                .setRange(
                    new Range(
                        position,
                        position.translate(0, cosntAwareness[0].length)
                    )
                )
                .setMessage('Predator missile inbound')
                .setSeverity(DiagnosticSeverity.Warning)
                .setTimer(1500, 500);
            return builder.build();
        }
    }
}
