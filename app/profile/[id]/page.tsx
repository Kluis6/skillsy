'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { UserService } from '@/services/user-service';
import { UserProfile } from '@/models/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  UserPlus, 
  UserMinus, 
  MapPin, 
  Briefcase, 
  Star, 
  MessageCircle, 
  ShieldCheck,
  Calendar,
  Info,
  Lock
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';

export default function PublicProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, profile: currentUserProfile, toggleContact } = useAuth();
  const [targetProfile, setTargetProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      try {
        const p = await UserService.getProfile(id as string);
        setTargetProfile(p);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const isContact = currentUserProfile?.contacts?.includes(id as string);

  const handleToggleContact = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para adicionar contatos', {
        description: 'Faça login para criar sua rede de confiança.',
        action: {
          label: 'Login',
          onClick: () => router.push('/')
        }
      });
      return;
    }

    try {
      await toggleContact(id as string);
      toast.success(isContact ? 'Removido dos contatos' : 'Adicionado aos contatos');
    } catch (error) {
      toast.error('Erro ao atualizar contatos');
    }
  };

  const handleRate = async (score: number) => {
    if (!user) {
      toast.error('Login necessário', {
        description: 'Você precisa estar logado para avaliar serviços.'
      });
      return;
    }

    if (user.uid === id) {
      toast.error('Ação inválida', {
        description: 'Você não pode avaliar seu próprio perfil.'
      });
      return;
    }

    setSubmittingRating(true);
    try {
      await UserService.submitRating(user.uid, id as string, score);
      setUserRating(score);
      toast.success('Avaliação enviada!', {
        description: 'Obrigado por compartilhar sua experiência.'
      });
      // Refresh profile to show new rating
      const updated = await UserService.getProfile(id as string);
      setTargetProfile(updated);
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Erro ao enviar avaliação');
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-24 h-24 bg-border-subtle rounded-full" />
          <div className="h-4 w-32 bg-border-subtle rounded" />
        </div>
      </div>
    );
  }

  if (!targetProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-surface">
        <Info size={64} className="text-text-muted mb-6" />
        <h1 className="text-3xl font-bold mb-4">Perfil não encontrado</h1>
        <p className="text-text-muted mb-8">O usuário que você procura não existe ou o link está incorreto.</p>
        <Link href="/">
          <Button className="bg-primary text-white font-bold rounded-xl px-8">Voltar para Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border-subtle px-6 md:px-10 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-surface"
            onClick={() => router.back()}
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-lg font-bold text-text-main font-heading">Perfil do Membro</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 mt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Hero Profile Card */}
          <Card className="rounded-[3rem] border-none shadow-2xl shadow-primary/5 overflow-hidden bg-white">
            <div className="h-32 bg-gradient-to-r from-primary/10 to-accent/10" />
            <CardContent className="px-8 pb-10 -mt-16">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
                <Avatar className="w-32 h-32 border-4 border-white shadow-xl">
                  <AvatarImage src={targetProfile.photoURL} />
                  <AvatarFallback className="bg-surface text-primary font-bold text-4xl">
                    {targetProfile.name[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-grow text-center md:text-left mb-2">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <h2 className="text-3xl font-bold text-text-main font-heading">{targetProfile.name}</h2>
                    {targetProfile.verifiedMember && (
                      <ShieldCheck size={24} className="text-primary" />
                    )}
                  </div>
                  <p className="text-text-muted flex items-center justify-center md:justify-start gap-2">
                    <MapPin size={16} /> {targetProfile.location || 'Localização não informada'}
                  </p>
                </div>

                <div className="flex gap-3">
                  {user?.uid !== targetProfile.uid && (
                    <Button 
                      onClick={handleToggleContact}
                      variant={isContact ? "outline" : "default"}
                      className={`rounded-2xl h-12 px-6 font-bold transition-all ${
                        isContact 
                          ? 'border-primary text-primary hover:bg-primary/5' 
                          : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'
                      }`}
                    >
                      {isContact ? (
                        <><UserMinus size={20} className="mr-2" /> Remover</>
                      ) : (
                        <><UserPlus size={20} className="mr-2" /> Adicionar aos Contatos</>
                      )}
                    </Button>
                  )}
                  <Button className="rounded-2xl h-12 px-6 bg-green-500 text-white hover:bg-green-600 font-bold shadow-lg shadow-green-200">
                    <MessageCircle size={20} className="mr-2" /> WhatsApp
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-border-subtle">
                <div className="text-center md:text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Especialidade</p>
                  <p className="font-bold text-primary">{targetProfile.serviceType || targetProfile.category || 'Membro'}</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Experiência</p>
                  <p className="font-bold text-text-main">{targetProfile.experienceYears || 0} anos</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Avaliação</p>
                  <div className="flex items-center justify-center md:justify-start gap-1 font-bold text-highlight">
                    <Star size={16} fill="currentColor" /> {targetProfile.rating || '0.0'} ({targetProfile.reviewCount || 0})
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Membro desde</p>
                  <p className="font-bold text-text-main">2024</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio & Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-border-subtle">
                <h3 className="text-xl font-bold mb-4 font-heading flex items-center gap-2">
                  <Info size={20} className="text-primary" /> Sobre o Profissional
                </h3>
                <p className="text-text-muted leading-relaxed whitespace-pre-wrap">
                  {targetProfile.bio || 'Este membro ainda não adicionou uma descrição detalhada ao seu perfil.'}
                </p>
              </section>

              {targetProfile.isProvider && (
                <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-border-subtle">
                  <h3 className="text-xl font-bold mb-4 font-heading flex items-center gap-2">
                    <Briefcase size={20} className="text-primary" /> Serviços Oferecidos
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(targetProfile.serviceType || 'Serviços Gerais').split(',').map((s, i) => (
                      <Badge key={i} variant="secondary" className="bg-surface text-text-main px-4 py-2 rounded-xl border-none font-medium">
                        {s.trim()}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}

              {targetProfile.isProvider && (
                <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-border-subtle">
                  <h3 className="text-xl font-bold mb-4 font-heading flex items-center gap-2">
                    <Star size={20} className="text-highlight" /> Avaliar este Profissional
                  </h3>
                  <p className="text-text-muted text-sm mb-6">
                    Sua avaliação ajuda outros membros da comunidade a encontrarem os melhores serviços.
                  </p>
                  
                  <div className="flex items-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        disabled={submittingRating || user?.uid === targetProfile.uid}
                        onMouseEnter={() => setRatingHover(star)}
                        onMouseLeave={() => setRatingHover(0)}
                        onClick={() => handleRate(star)}
                        className={`transition-all transform hover:scale-110 ${
                          (ratingHover || userRating || 0) >= star 
                            ? 'text-highlight' 
                            : 'text-border-subtle'
                        } ${(submittingRating || user?.uid === targetProfile.uid) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                      >
                        <Star 
                          size={32} 
                          fill={(ratingHover || userRating || 0) >= star ? "currentColor" : "none"} 
                        />
                      </button>
                    ))}
                  </div>
                  
                  {!user && (
                    <p className="text-xs text-text-muted italic">
                      * Você precisa estar logado para avaliar.
                    </p>
                  )}
                  {user?.uid === targetProfile.uid && (
                    <p className="text-xs text-text-muted italic">
                      * Você não pode avaliar seu próprio perfil.
                    </p>
                  )}
                </section>
              )}
            </div>

            <div className="space-y-8">
              <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-border-subtle">
                <h3 className="text-lg font-bold mb-6 font-heading">Informações</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center text-primary shrink-0">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Status</p>
                      <p className="text-sm font-bold text-text-main">Membro Verificado</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center text-primary shrink-0">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Disponibilidade</p>
                      <p className="text-sm font-bold text-text-main">Segunda a Sexta</p>
                    </div>
                  </div>
                </div>
              </section>

              {!user && (
                <section className="bg-primary/5 rounded-[2.5rem] p-8 border border-primary/10">
                  <div className="flex items-center gap-3 mb-4 text-primary">
                    <Lock size={20} />
                    <h3 className="font-bold">Acesso Restrito</h3>
                  </div>
                  <p className="text-sm text-text-muted mb-6">
                    Faça login para adicionar este profissional aos seus contatos e ver mais detalhes.
                  </p>
                  <Button 
                    onClick={() => router.push('/')}
                    className="w-full bg-primary text-white rounded-xl font-bold h-11"
                  >
                    Fazer Login
                  </Button>
                </section>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
