import { Range, TextDocument, DiagnosticSeverity, window } from 'vscode';
import { FakeDiagnostic, FakeDiagnosticBuilder } from './interface';
import { updateInterval } from '../globals';

export class NukeDiagnostic extends FakeDiagnostic {
    static create(document: TextDocument) {
        const builder = new FakeDiagnosticBuilder();
        // An empty document is not worth nuking
        if (document.lineCount <= 2) {
            return undefined;
        }
        builder
            // Show an warning in the ENTIRE document
            .setRange(new Range(0, 0, document.lineCount, 200))
            .setMessage(
                'WARNING! WARNING! NUCLEAR WARHEAD INCOMING! WARNING! WARNING!'
            )
            .setSeverity(DiagnosticSeverity.Error)
            .setTimer(7000, 5000)
            .setExecute(NukeDiagnostic.execute)
            .setUpdate((instance: FakeDiagnostic) => {
                instance.timer -= updateInterval;
                instance.hidden = !instance.hidden;
            });
        return builder.build();
    }

    static execute(document: TextDocument) {
        // Delete all text in the document
        let fullTextRange = new Range(
            document.positionAt(0),
            document.positionAt(document.getText().length)
        );
        window.activeTextEditor?.edit((editBuilder) => {
            editBuilder.delete(fullTextRange);
        });
    }
}
