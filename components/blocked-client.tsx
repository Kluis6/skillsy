'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { UserService } from '@/services/user-service';
import { BLOCK_APPEAL_DAYS } from '@skillsy/shared/terms';
import { toast } from 'sonner';

const DAY_MS = 24 * 60 * 60 * 1000;

function toDate(value: unknown) {
  const seconds =
    value && typeof value === 'object' && 'seconds' in value ? Number(value.seconds) : NaN;
  return Number.isFinite(seconds) ? new Date(seconds * 1000) : null;
}

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(date);

export function BlockedClient() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [now] = useState(() => Date.now());

  const blockedAt = toDate(profile?.blockedAt);
  const deadline = blockedAt ? new Date(blockedAt.getTime() + BLOCK_APPEAL_DAYS * DAY_MS) : null;
  // Accounts blocked before reasons were recorded have no date: they can
  // still ask for a review.
  const canAppeal = !deadline || now <= deadline.getTime();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/');
    } catch {
      toast.error('Erro ao sair');
    }
  };

  // The request lands in Painel → Mensagens, like the site's "Fale conosco".
  const sendAppeal = async () => {
    setSending(true);
    try {
      await UserService.submitSupportMessage({
        name: profile?.name || user?.displayName || 'Membro Skillsy',
        email: profile?.email || user?.email || '',
        message: `[Pedido de revisão de bloqueio]\n${message.trim()}`.slice(0, 1000),
      });
      setSent(true);
    } catch {
      toast.error('Não foi possível enviar. Tente de novo.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-card p-8 md:p-10 shadow-lg border border-border-subtle">
        <div className="w-20 h-20 bg-destructive/10 flex items-center justify-center mx-auto mb-8">
          <ShieldAlert size={40} className="text-destructive" />
        </div>

        <h1 className="text-3xl font-bold text-text-main font-heading mb-4 text-center">
          Conta bloqueada
        </h1>

        <p className="text-text-muted mb-6 leading-relaxed text-center">
          Sua conta foi bloqueada por descumprir os{' '}
          <Link href="/termos" className="font-semibold text-primary hover:underline">
            Termos de uso
          </Link>
          {blockedAt ? ` em ${formatDate(blockedAt)}` : ''}. Enquanto isso, seu perfil não aparece
          nas buscas.
        </p>

        {profile?.blockedReason ? (
          <div className="mb-6 border border-border-subtle bg-surface p-4 text-sm leading-relaxed">
            <p className="font-semibold text-text-main">Motivo</p>
            <p className="mt-1 whitespace-pre-wrap text-text-muted">{profile.blockedReason}</p>
          </div>
        ) : null}

        {sent ? (
          <div className="mb-8 flex items-start gap-3 border border-success/30 bg-success/10 p-4 text-sm text-text-main">
            <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-success" />
            <p>Pedido enviado. A equipe vai analisar e responder pelo seu e-mail.</p>
          </div>
        ) : canAppeal ? (
          <div className="mb-8 space-y-3">
            <p className="text-sm font-semibold text-text-main">
              Pedir revisão
              {deadline ? (
                <span className="font-normal text-text-muted"> · até {formatDate(deadline)}</span>
              ) : null}
            </p>
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={900}
              placeholder="Explique o que aconteceu e por que o bloqueio deve ser revisto."
              className="min-h-28"
            />
            <Button
              type="button"
              className="w-full h-12 font-bold"
              disabled={message.trim().length < 20 || sending}
              onClick={sendAppeal}
            >
              {sending ? 'Enviando...' : 'Enviar pedido de revisão'}
            </Button>
          </div>
        ) : (
          <p className="mb-8 border border-border-subtle bg-surface p-4 text-sm text-text-muted">
            O prazo de {BLOCK_APPEAL_DAYS} dias para pedir revisão terminou em{' '}
            {deadline ? formatDate(deadline) : ''}.
          </p>
        )}

        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full h-12 font-bold text-text-muted hover:text-primary"
        >
          Sair da conta
        </Button>
      </div>
    </div>
  );
}
