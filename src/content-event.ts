import {
    Position,
    Range,
    TextDocument,
    TextDocumentContentChangeEvent,
} from 'vscode';
import { FakeDiagnostic } from './diagnostics/interface';

export function calculateLineDelta(change: TextDocumentContentChangeEvent) {
    if (change.rangeLength > 1) {
        // Undo / Redo / Delete can affect multiple characters and lines
        return change.range.start.line - change.range.end.line;
    }
    if (change.text.includes('\n')) {
        // New lines, content is shifted down
        return change.text.split('\n').length - 1;
    }
    return 0; // Most likely changes to not affect the position of the diagnostic
}

export function calculateCharacterDelta(
    change: TextDocumentContentChangeEvent,
    lineDelta: number
) {
    if (lineDelta !== 0) {
        return 0;
    }
    if (change.rangeLength > 0) {
        return change.rangeLength;
    }
    if (change.text.length > 0) {
        return change.text.length;
    }
    return 0;
}

export function updateMatchRange(
    instance: FakeDiagnostic,
    event: TextDocumentContentChangeEvent,
    document: TextDocument,
    regex: RegExp
): boolean {
    const lineDelta = calculateLineDelta(event);
    const characterDelta = calculateCharacterDelta(event, lineDelta);
    // Expand range by on each side, due to delete and backspace
    const eventRange = new Range(
        instance.range.start.translate(lineDelta, -characterDelta),
        instance.range.end.translate(lineDelta, characterDelta)
    );
    const text = document.getText(eventRange);
    const m = Array.from(text.matchAll(regex))[0];
    if (m && m.index !== undefined) {
        const start = new Position(
            eventRange.start.line,
            instance.range.start.character + m.index - characterDelta
        );
        instance.range = new Range(start, start.translate(0, m[0].length));
        return true;
    }
    return false;
}
