import {
    Diagnostic,
    DiagnosticSeverity,
    Range,
    TextDocument,
    TextDocumentContentChangeEvent,
} from 'vscode';

export const baseDiagnosticTime = 10000;
export const updateInterval = 350;

export class FakeDiagnosticBuilder {
    private message: string = 'To your dorms children, the troll is coming';
    private severity: DiagnosticSeverity = DiagnosticSeverity.Information;
    private timer: number = baseDiagnosticTime;
    private hidden: boolean = false;
    private update: (instance: FakeDiagnostic) => void = (instance) => {
        instance.timer -= updateInterval;
    };
    private stillApplies = (
        instance: FakeDiagnostic,
        event: TextDocumentContentChangeEvent,
        document: TextDocument
    ) => {
        return true;
    };

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

    setStillApplies(
        stillApplies: (
            instance: FakeDiagnostic,
            event: TextDocumentContentChangeEvent,
            document: TextDocument
        ) => boolean
    ): FakeDiagnosticBuilder {
        this.stillApplies = stillApplies;
        return this;
    }

    build(
        name: string,
        range: Range,
        execute: (instance: FakeDiagnostic, document: TextDocument) => void
    ): FakeDiagnostic {
        return new FakeDiagnostic(
            name,
            range,
            this.message,
            this.severity,
            this.timer,
            this.hidden,
            execute,
            this.update,
            this.stillApplies
        );
    }
}

export class FakeDiagnostic {
    name: string;
    range: Range;
    message: string;
    severity: DiagnosticSeverity;
    timer: number;
    hidden: boolean;
    constructor(
        name: string,
        range: Range,
        message: string,
        severity: DiagnosticSeverity,
        timer: number,
        hidden: boolean,
        execute: any,
        update: (instance: FakeDiagnostic) => void,
        stillApplies: (
            instance: FakeDiagnostic,
            event: TextDocumentContentChangeEvent,
            document: TextDocument
        ) => boolean
    ) {
        this.name = name;
        this.range = range;
        this.message = message;
        this.severity = severity;
        this.timer = timer;
        this.hidden = hidden;
        this.execute = execute;
        this.update = update;
        this.stillApplies = stillApplies;
    }
    transform(): Diagnostic {
        return new Diagnostic(this.range, this.message, this.severity);
    }
    execute(instance: FakeDiagnostic, document: TextDocument): void {}
    update(instance: FakeDiagnostic): void {}
    stillApplies(
        instance: FakeDiagnostic,
        event: TextDocumentContentChangeEvent,
        document: TextDocument
    ): boolean {
        return true;
    }
}
