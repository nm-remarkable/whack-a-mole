import * as vscode from 'vscode';
import { updateInterval } from '../globals';

export class FakeDiagnosticBuilder {
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

    setExecute(
        execute: (document: vscode.TextDocument) => void
    ): FakeDiagnosticBuilder {
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
    execute(instance: FakeDiagnostic, document: TextDocument): void {}
    update(instance: FakeDiagnostic): void {}
}
