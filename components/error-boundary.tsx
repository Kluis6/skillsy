'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

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
      let errorMessage = 'Ocorreu um erro inesperado na aplicação.';
      let isFirestoreError = false;

      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.operationType) {
            isFirestoreError = true;
            errorMessage = `Erro de Banco de Dados: ${parsed.error}`;
            if (parsed.error.includes('Missing or insufficient permissions')) {
              errorMessage = 'Você não tem permissão para realizar esta ação ou os dados enviados são inválidos.';
            }
          }
        }
      } catch (e) {
        // Not a JSON error, use default or message
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-surface p-6">
          <div className="max-w-md w-full bg-card rounded-[2.5rem] p-10 shadow-2xl shadow-primary/5 text-center border border-border-subtle">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-text-main mb-4 font-heading">Ops! Algo deu errado</h2>
            <p className="text-text-muted mb-8 text-sm leading-relaxed">
              {errorMessage}
            </p>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={this.handleReset}
                className="w-full bg-primary text-white font-bold h-12 rounded-2xl shadow-lg shadow-primary/20"
              >
                <RefreshCcw size={18} className="mr-2" /> Tentar Novamente
              </Button>
              <Link href="/" className="w-full">
                <Button 
                  variant="outline"
                  className="w-full border-border-subtle text-text-main font-bold h-12 rounded-2xl"
                >
                  <Home size={18} className="mr-2" /> Voltar para o Início
                </Button>
              </Link>
            </div>
            {isFirestoreError && (
              <p className="mt-6 text-[10px] text-text-muted/50 font-mono break-all">
                ID do Erro: {this.state.error?.message.substring(0, 50)}...
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
