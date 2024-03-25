import { Position, Range, TextDocument, window } from 'vscode';
import { FakeDiagnostic, FakeDiagnosticBuilder } from './interface';

const typoMap = {
    cum: '💦',
    max: 'marx',
    marx: '☭',
    pc: 'peace',
    peace: '☮',
    regex: 'regulatoryexplanatory',
    ulius: '🏛️',
    //ass: '( ㅅ )',
    anal: 'εつ▄█▀█●',
};
const typoRegex = new RegExp(Object.keys(typoMap).join('|'), 'gi');

export class TypoDiagnostic extends FakeDiagnostic {
    static create(document: TextDocument) {
        const text = document.getText();
        const typos = Array.from(text.matchAll(typoRegex));
        if (typos) {
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
    if (typos) {
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
    document: TextDocument,
    offset: number
): boolean {
    const newRange = new Range(
        instance.range.start.translate(offset, 0),
        instance.range.end.translate(offset, 0)
    );
    const text = document.getText(newRange);
    const typos = Array.from(text.matchAll(typoRegex));
    if (typos) {
        instance.range = newRange;
        return true;
    }
    return false;
}
