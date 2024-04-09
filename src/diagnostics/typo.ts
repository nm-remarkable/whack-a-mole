import {
    Position,
    Range,
    TextDocument,
    TextDocumentContentChangeEvent,
    window,
} from 'vscode';
import { FakeDiagnostic, FakeDiagnosticBuilder } from './interface';
import { calculateLineDelta, updateMatchRange } from '../content-event';

const typoMap = {
    cum: '💦',
    max: 'marx',
    regex: 'regulatoryexplanatory',
    ass: 'rear',
    anal: 'εつ▄█▀█●',
};
const typoRegex = new RegExp(Object.keys(typoMap).join('|'), 'gi');

export class TypoDiagnostic extends FakeDiagnostic {
    static create(document: TextDocument) {
        const text = document.getText();
        const typos = Array.from(text.matchAll(typoRegex));
        if (typos.length > 0) {
            const randomAccess = Math.floor(Math.random() * typos.length);
            const typo = typos[randomAccess];
            if (!!typo.index) {
                const position = document.positionAt(typo.index);
                const builder = new FakeDiagnosticBuilder();
                builder
                    .setMessage('Profanity detected, opinion rejected')
                    .setStillApplies(stillApplies);
                return builder.build(
                    TypoDiagnostic.name,
                    document.uri,
                    new Range(position, position.translate(0, typo[0].length)),
                    execute
                );
            }
        }
        return undefined;
    }
}

function execute(instance: FakeDiagnostic, document: TextDocument) {
    const typoRange = instance.range;
    const text = document.getText(typoRange);
    const typos = Array.from(text.matchAll(typoRegex));
    if (typos.length > 0) {
        const key = typos[0][0];
        window.activeTextEditor?.edit((editor) => {
            editor.replace(
                instance.range,
                typoMap[key as keyof typeof typoMap]
            );
        });
    }
}

function stillApplies(
    instance: FakeDiagnostic,
    event: TextDocumentContentChangeEvent,
    document: TextDocument
): boolean {
    return updateMatchRange(instance, event, document, typoRegex);
}
