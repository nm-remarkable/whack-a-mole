import { relative } from 'path';
import * as vscode from 'vscode';

class FakeDiagnosticBuilder {
    private range?: vscode.Range;
    private message: string = "";
    private severity: vscode.DiagnosticSeverity = vscode.DiagnosticSeverity.Information;
    private minimumTime: number = 1500;
    private timerRange: number = 1000;

    setRange(range: vscode.Range): FakeDiagnosticBuilder {
        this.range = range;
        return this;
    }

    setMessage(message: string): FakeDiagnosticBuilder {
        this.message = message;
        return this;
    }

    setSeverity(severity: vscode.DiagnosticSeverity): FakeDiagnosticBuilder {
        this.severity = severity;
        return this;
    }

    setTimer(minimumTime: number, timerRange: number): FakeDiagnosticBuilder {
        this.minimumTime = minimumTime;
        this.timerRange = timerRange;
        return this;
    }

    build(): FakeDiagnostic {
        return new FakeDiagnostic(this.range ?? new vscode.Range(0, 0, 0, 0), this.message, this.severity, Math.floor(Math.random() * this.timerRange) + this.minimumTime);
    }
}

export class FakeDiagnostic {
    range: vscode.Range;
    message: string;
    severity: vscode.DiagnosticSeverity;
    timer: number;
    valid: boolean = true;
    constructor(range: vscode.Range, message: string, severity: vscode.DiagnosticSeverity, timer: number) {
        this.range = range;
        this.message = message;
        this.severity = severity;
        this.timer = timer;
        if (this.range === undefined || this.message === undefined) {
            this.valid = false;
        }
    }
    transform(): vscode.Diagnostic {
        return new vscode.Diagnostic(this.range, this.message, this.severity);
    }
}

export class ConstDiagnostic extends FakeDiagnostic {
    static create(document: vscode.TextDocument) {
        const text = document.getText();
        const cosntAwareness = text.match(/const|var|let|mut/gi);
        if (cosntAwareness) {
            const index = text.indexOf(cosntAwareness[0]);
            const position = document.positionAt(index);
            const builder = new FakeDiagnosticBuilder();
            builder.setRange(new vscode.Range(position, position.translate(0, cosntAwareness[0].length)))
                .setMessage('Predator missile inbound')
                .setSeverity(vscode.DiagnosticSeverity.Warning)
                .setTimer(1000, 500);
            return builder.build();
        }
    }
}

export class NukeDiagnostic extends FakeDiagnostic {
    static create(document: vscode.TextDocument) {
        const minimumLines = 5;
        const startingLine = Math.floor(Math.random() * document.lineCount - minimumLines);
        const endLine = startingLine + Math.floor((Math.random() * 5) + minimumLines);
        const builder = new FakeDiagnosticBuilder();
        builder.setRange(new vscode.Range(startingLine, 0, endLine, 120))
            .setMessage('Tactical nuke incoming')
            .setSeverity(vscode.DiagnosticSeverity.Error)
            .setTimer(7000, 5000);
        return builder.build();
    }
}

export class SwearDiagnostic extends FakeDiagnostic {
    static create(document: vscode.TextDocument) {

        const text = document.getText();
        const swears = Array.from(text.matchAll(/cum|anal|\sn\s/gi));
        if (swears) {
            const swear = swears[Math.floor(Math.random() * swears.length)];
            const index = text.indexOf(swear[0]);
            const position = document.positionAt(index);
            const builder = new FakeDiagnosticBuilder();
            builder.setRange(new vscode.Range(position, position.translate(0, swear[0].length)))
                .setMessage('Profanity detected, opinion rejected')
                .setSeverity(vscode.DiagnosticSeverity.Information)
                .setTimer(500, 500);
            return builder.build();
        }
        return undefined;
    }
}

export class LoggingDiagnostic extends FakeDiagnostic {
    static create(document: vscode.TextDocument) {
        const logTypes = ['critical', 'warning', 'info', 'debug'];
        const text = document.getText();
        const matches = Array.from(text.matchAll(new RegExp(logTypes.join('|'), 'gi')));
        if (matches) {
            const log = matches[Math.floor(Math.random() * matches.length)];
            const index = text.indexOf(log[0]);
            const position = document.positionAt(index);
            const builder = new FakeDiagnosticBuilder();

            builder.setRange(new vscode.Range(position, position.translate(0, log[0].length)))
                .setMessage('Spy plane ready to be deployed')
                .setSeverity(vscode.DiagnosticSeverity.Error);
            return builder.build();
        }
        return undefined;
    }
}