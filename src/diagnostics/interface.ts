import { Range, DiagnosticSeverity, TextDocument, Diagnostic } from 'vscode';

export const baseDiagnosticTime = 5000;
export const updateInterval = 300;

export class FakeDiagnosticBuilder {
    private range?: Range;
    private message: string = '';
    private severity: DiagnosticSeverity = DiagnosticSeverity.Information;
    private timer: number = baseDiagnosticTime;
    private hidden: boolean = false;
    private update: (instance: FakeDiagnostic) => void = (instance) => {
        instance.timer -= updateInterval;
    };
    private execute: any;

    setRange(range: Range): FakeDiagnosticBuilder {
        this.range = range;
        return this;
    }

    setMessage(message: string): FakeDiagnosticBuilder {
        this.message = message;
        return this;
    }

    setSeverity(severity: DiagnosticSeverity): FakeDiagnosticBuilder {
        this.severity = severity;
        return this;
    }

    setTimer(timer: number): FakeDiagnosticBuilder {
        this.timer = timer;
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
        execute: (instance: FakeDiagnostic, document: TextDocument) => void
    ): FakeDiagnosticBuilder {
        this.execute = execute;
        return this;
    }

    build(): FakeDiagnostic {
        return new FakeDiagnostic(
            this.range ?? new Range(0, 0, 0, 0),
            this.message,
            this.severity,
            this.timer,
            this.hidden,
            this.execute,
            this.update
        );
    }
}

export class FakeDiagnostic {
    range: Range;
    message: string;
    severity: DiagnosticSeverity;
    timer: number;
    hidden: boolean;
    constructor(
        range: Range,
        message: string,
        severity: DiagnosticSeverity,
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
    transform(): Diagnostic {
        return new Diagnostic(this.range, this.message, this.severity);
    }
    execute(instance: FakeDiagnostic, document: TextDocument): void {}
    update(instance: FakeDiagnostic): void {}
}
