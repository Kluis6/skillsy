'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import Link from '@/lib/i18n/navigation';
import { useT, useValidationMessage } from '@/lib/i18n/provider';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

/** The fallback is a function component so it can read the page's language. */
function ErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  const t = useT();
  const tv = useValidationMessage();
  let errorMessage = t('errors.boundaryText');
  let isFirestoreError = false;

  try {
    if (error?.message) {
      const parsed = JSON.parse(error.message);
      if (parsed.error && parsed.operationType) {
        isFirestoreError = true;
        errorMessage = t('errors.boundaryDatabase', { error: parsed.error });
        if (parsed.error.includes('Missing or insufficient permissions')) {
          errorMessage = t('errors.boundaryPermission');
        }
      }
    }
  } catch {
    // Not a JSON error, use default or message
    errorMessage = error?.message ? tv(error.message) : errorMessage;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6">
      <div className="max-w-md w-full bg-card p-8 md:p-10 shadow-lg text-center border border-border-subtle">
        <div className="w-20 h-20 bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={40} className="text-destructive" />
        </div>
        <h2 className="text-2xl font-bold text-text-main mb-4 font-heading">{t('errors.boundaryTitle')}</h2>
        <p className="text-text-muted mb-8 text-sm leading-relaxed">
          {errorMessage}
        </p>
        <div className="flex flex-col gap-3">
          <Button
            onClick={onReset}
            className="w-full bg-primary text-primary-foreground font-bold h-12 hover:bg-primary/90"
          >
            <RefreshCcw size={18} className="mr-2" /> {t('errors.boundaryRetry')}
          </Button>
          <Link href="/" className="w-full">
            <Button
              variant="outline"
              className="w-full border-border-subtle text-text-main font-bold h-12"
            >
              <Home size={18} className="mr-2" /> {t('errors.boundaryHome')}
            </Button>
          </Link>
        </div>
        {isFirestoreError && (
          <p className="mt-6 text-xs text-text-muted/70 font-mono break-all">
            {t('errors.boundaryId', { id: `${error?.message.substring(0, 50)}...` })}
          </p>
        )}
      </div>
    </div>
  );
}
