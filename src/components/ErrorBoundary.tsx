import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error("[ErrorBoundary]", error, info);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;
            return (
                <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-3 text-center p-6 rounded-2xl border border-red-500/20 bg-red-500/5">
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                    <div>
                        <p className="font-semibold text-sm text-foreground">Failed to load component</p>
                        <p className="text-xs text-muted-foreground mt-1">{this.state.error?.message ?? "An unexpected error occurred."}</p>
                    </div>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg px-3 py-1.5 hover:bg-red-500/10 transition-colors">
                        <RefreshCw className="w-3 h-3" /> Try Again
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
