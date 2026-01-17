import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { HiExclamationCircle, HiRefresh, HiHome, HiSupport } from 'react-icons/hi';

/**
 * ErrorBoundary Component
 * 
 * ARCHITECTURAL PATTERN: Catches JavaScript errors anywhere in the child component tree,
 * logs errors, and displays a fallback UI instead of a white screen.
 * 
 * This prevents the entire application from crashing when a single component fails.
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            eventId: null
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render shows the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error to console in development
        if (import.meta.env.DEV) {
            console.error('ErrorBoundary caught an error:', error);
            console.error('Component stack:', errorInfo.componentStack);
        }

        // Store error details for display
        this.setState({
            error: error,
            errorInfo: errorInfo,
            eventId: `ERR-${Date.now().toString(36).toUpperCase()}`
        });

        // TODO: Log to external error tracking service (e.g., Sentry)
        // if (import.meta.env.PROD) {
        //   Sentry.captureException(error, { extra: errorInfo });
        // }
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoBack = () => {
        window.history.back();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
                    <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-8 sm:p-12 text-center border border-slate-100">

                        {/* Error Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-red-100 rounded-full scale-150 opacity-40"></div>
                                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center relative z-10 shadow-lg">
                                    <HiExclamationCircle className="text-white text-4xl" />
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
                            Something went wrong
                        </h1>
                        <p className="text-slate-500 mb-6 leading-relaxed">
                            We're sorry, but something unexpected happened. Our team has been notified and is working on a fix.
                        </p>

                        {/* Error ID (for support reference) */}
                        {this.state.eventId && (
                            <div className="bg-slate-50 rounded-xl p-4 mb-6 text-sm">
                                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Error Reference</p>
                                <code className="text-slate-600 font-mono font-bold">{this.state.eventId}</code>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-8">
                            <button
                                onClick={this.handleReload}
                                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                            >
                                <HiRefresh className="w-5 h-5" />
                                Try Again
                            </button>

                            <Link
                                to="/"
                                className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-bold py-3.5 rounded-xl hover:bg-slate-200 transition-all"
                            >
                                <HiHome className="w-5 h-5" />
                                Go Home
                            </Link>
                        </div>

                        {/* Support Link */}
                        <p className="text-sm text-slate-400">
                            Need help?{' '}
                            <Link to="/contact-us" className="text-indigo-600 font-semibold hover:underline inline-flex items-center gap-1">
                                <HiSupport className="w-4 h-4" />
                                Contact Support
                            </Link>
                        </p>

                        {/* Development Error Details */}
                        {import.meta.env.DEV && this.state.error && (
                            <div className="mt-8 text-left bg-red-50 rounded-xl p-4 border border-red-200">
                                <p className="text-xs font-bold text-red-600 uppercase mb-2">
                                    🔧 Development Error Details
                                </p>
                                <pre className="text-xs text-red-700 overflow-auto max-h-40 whitespace-pre-wrap">
                                    {this.state.error.toString()}
                                </pre>
                                {this.state.errorInfo && (
                                    <details className="mt-2">
                                        <summary className="text-xs text-red-600 cursor-pointer hover:underline">
                                            Component Stack
                                        </summary>
                                        <pre className="text-xs text-red-600 mt-2 overflow-auto max-h-40 whitespace-pre-wrap">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
