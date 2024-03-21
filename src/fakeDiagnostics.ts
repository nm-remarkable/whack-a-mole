import * as vscode from 'vscode';

export const updateInterval = 300;

class FakeDiagnosticBuilder {
    private range?: vscode.Range;
    private message: string = '';
    private severity: vscode.DiagnosticSeverity =
        vscode.DiagnosticSeverity.Information;
    private minimumTime: number = 1500;
    private timerRange: number = 1000;
    private hidden: boolean = false;
    private update: (instance: FakeDiagnostic) => void = (instance) => {
        instance.timer -= updateInterval;
    };
    private execute: any;

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

    setHidden(hidden: boolean): FakeDiagnosticBuilder {
        this.hidden = hidden;
        return this;
    }

    setUpdate(
        update: (instance: FakeDiagnostic) => void
    ): FakeDiagnosticBuilder {
        this.update = update;
        return this;
    }

    setExecute(execute: any): FakeDiagnosticBuilder {
        this.execute = execute;
        return this;
    }

    build(): FakeDiagnostic {
        return new FakeDiagnostic(
            this.range ?? new vscode.Range(0, 0, 0, 0),
            this.message,
            this.severity,
            Math.floor(Math.random() * this.timerRange) + this.minimumTime,
            this.hidden,
            this.execute,
            this.update
        );
    }
}

export class FakeDiagnostic {
    range: vscode.Range;
    message: string;
    severity: vscode.DiagnosticSeverity;
    timer: number;
    hidden: boolean;
    constructor(
        range: vscode.Range,
        message: string,
        severity: vscode.DiagnosticSeverity,
        timer: number,
        hidden: boolean,
        execute: any,
        update: (instance: FakeDiagnostic) => void
    ) {
        this.range = range;
        this.message = message;
        this.severity = severity;
        this.timer = timer;
        this.hidden = hidden;
        this.execute = execute;
        this.update = update;
    }
    transform(): vscode.Diagnostic {
        return new vscode.Diagnostic(this.range, this.message, this.severity);
    }
    execute(any: any): void {}
    update(instance: FakeDiagnostic): void {}
}

export class ConstDiagnostic extends FakeDiagnostic {
    static create(document: vscode.TextDocument) {
        const text = document.getText();
        const cosntAwareness = text.match(/const|var|let|mut/gi);
        if (cosntAwareness) {
            const index = text.indexOf(cosntAwareness[0]);
            const position = document.positionAt(index);
            const builder = new FakeDiagnosticBuilder();
            builder
                .setRange(
                    new vscode.Range(
                        position,
                        position.translate(0, cosntAwareness[0].length)
                    )
                )
                .setMessage('Predator missile inbound')
                .setSeverity(vscode.DiagnosticSeverity.Warning)
                .setTimer(1500, 500);
            return builder.build();
        }
    }
}

export class NukeDiagnostic extends FakeDiagnostic {
    static create(document: vscode.TextDocument) {
        const builder = new FakeDiagnosticBuilder();
        // An empty document is not worth nuking
        if (document.lineCount <= 2) {
            return undefined;
        }
        builder
            // Show an warning in the ENTIRE document
            .setRange(new vscode.Range(0, 0, document.lineCount, 200))
            .setMessage(
                'WARNING! WARNING! NUCLEAR WARHEAD INCOMING! WARNING! WARNING!'
            )
            .setSeverity(vscode.DiagnosticSeverity.Error)
            .setTimer(7000, 5000)
            .setExecute(NukeDiagnostic.execute)
            .setUpdate((instance: FakeDiagnostic) => {
                instance.timer -= updateInterval;
                instance.hidden = !instance.hidden;
            });
        return builder.build();
    }

    static execute(document: any) {
        // Delete all text in the document
        let fullTextRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(document.getText().length)
        );
        vscode.window.activeTextEditor?.edit((editBuilder) => {
            editBuilder.delete(fullTextRange);
        });
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
            builder
                .setRange(
                    new vscode.Range(
                        position,
                        position.translate(0, swear[0].length)
                    )
                )
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
                    new vscode.Range(
                        position,
                        position.translate(0, log[0].length)
                    )
                )
                .setMessage('Spy plane ready to be deployed')
                .setSeverity(vscode.DiagnosticSeverity.Error);
            return builder.build();
        }
        return undefined;
    }
}
