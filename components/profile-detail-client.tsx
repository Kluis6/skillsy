'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Lock,
  Building2,
  Instagram,
  Facebook,
  Linkedin,
  Globe,
  Phone,
  Church,
  Users
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from "@/components/ui/separator";

interface ProfileDetailClientProps {
  id: string;
}

import Image from 'next/image';
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { ThemeToggle } from '@/components/theme-toggle';

export function ProfileDetailClient({ id }: ProfileDetailClientProps) {
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
        const p = await UserService.getProfile(id);
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

  const isContact = currentUserProfile?.contacts?.includes(id);

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
      await toggleContact(id);
      toast.success(isContact ? 'Removido dos contatos' : 'Adicionado aos contatos');
    } catch (error) {
      toast.error('Erro ao atualizar contatos');
    }
  };

  const formatUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  const handleWhatsApp = () => {
    if (!targetProfile?.whatsapp) {
      toast.error('WhatsApp não informado', {
        description: 'Este profissional ainda não cadastrou um número de contato.'
      });
      return;
    }
    const phone = targetProfile.whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/${phone.startsWith('55') ? phone : `55${phone}`}`, '_blank');
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
      await UserService.submitRating(user.uid, id, score);
      setUserRating(score);
      toast.success('Avaliação enviada!', {
        description: 'Obrigado por compartilhar sua experiência.'
      });
      // Refresh profile to show new rating
      const updated = await UserService.getProfile(id);
      setTargetProfile(updated);
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      
      let message = 'Erro ao enviar avaliação';
      
      // Try to parse the FirestoreErrorInfo or generic error
      try {
        const errorData = JSON.parse(error.message);
        if (errorData.error) {
          if (errorData.error.toLowerCase().includes('permission') || errorData.error.toLowerCase().includes('insufficient')) {
            message = 'Erro de permissão. Verifique se você já avaliou este profissional ou tente novamente mais tarde.';
          } else {
            message = errorData.error;
          }
        }
      } catch {
        // Not JSON, use message directly if it's user-friendly
        if (error.message && !error.message.includes('[object Object]')) {
          message = error.message;
        }
      }

      toast.error(message);
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border-subtle px-6 md:px-10 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-6 w-32 rounded-lg" />
            <ThemeToggle />
          </div>
        </div>
        <main className="max-w-4xl mx-auto px-6 mt-10">
          <Skeleton className="h-[400px] w-full rounded-[3rem] mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <Skeleton className="h-[200px] w-full rounded-[2.5rem]" />
              <Skeleton className="h-[150px] w-full rounded-[2.5rem]" />
            </div>
            <Skeleton className="h-[300px] w-full rounded-[2.5rem]" />
          </div>
        </main>
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
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border-subtle px-6 md:px-10 py-4">
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
          <ThemeToggle />
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 mt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Hero Profile Card (LinkedIn Style) */}
          <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-primary/5 overflow-hidden bg-card">
            <div className="relative h-48 md:h-64 bg-gradient-to-r from-primary/20 to-accent/20">
              {targetProfile.bannerURL && (
                <Image 
                  src={targetProfile.bannerURL} 
                  alt="Banner" 
                  fill 
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
            <CardContent className="px-8 pb-10">
              <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 -mt-20 md:-mt-24 mb-6">
                <Avatar className="w-40 h-40 md:w-48 md:h-48 border-[6px] border-card shadow-xl">
                  <AvatarImage src={targetProfile.photoURL} />
                  <AvatarFallback className="bg-surface text-primary font-bold text-5xl">
                    {targetProfile.name[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-grow text-center md:text-left pb-2">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <h2 className="text-3xl md:text-4xl font-bold text-text-main font-heading tracking-tight">{targetProfile.name}</h2>
                    {targetProfile.verifiedMember && (
                      <ShieldCheck size={28} className="text-primary" />
                    )}
                  </div>
                  
                  {targetProfile.baptismYear && (
                    <div className="flex items-center justify-center md:justify-start gap-1 mb-2 text-primary/70">
                      <Church size={14} />
                      <span className="text-xs font-bold uppercase tracking-wider">Batismo: {targetProfile.baptismYear}</span>
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-1">
                    <p className="text-lg md:text-xl font-medium text-text-main/80">
                      {targetProfile.serviceType || targetProfile.category || 'Membro da Comunidade'}
                    </p>
                    {targetProfile.companyName && (
                      <p className="text-primary font-bold flex items-center justify-center md:justify-start gap-2">
                        <Building2 size={18} /> {targetProfile.companyName}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-sm text-text-muted">
                    <p className="flex items-center gap-1.5">
                      <MapPin size={16} /> {targetProfile.location || 'Localização não informada'}
                    </p>
                    {targetProfile.ward && (
                      <p className="flex items-center gap-1.5">
                        <Church size={16} /> {targetProfile.ward}
                      </p>
                    )}
                    <p className="flex items-center gap-1.5 text-primary font-bold">
                      <Users size={16} /> {targetProfile.contacts?.length || 0} conexões
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-3 mt-4 md:mt-0">
                  {user?.uid !== targetProfile.uid && (
                    <Button 
                      onClick={handleToggleContact}
                      variant={isContact ? "outline" : "default"}
                      className={`rounded-full h-12 px-8 font-bold transition-all ${
                        isContact 
                          ? 'border-primary text-primary hover:bg-primary/5' 
                          : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'
                      }`}
                    >
                      {isContact ? (
                        <><UserMinus size={20} className="mr-2" /> Remover dos Contatos</>
                      ) : (
                        <><UserPlus size={20} className="mr-2" /> Adicionar aos Contatos</>
                      )}
                    </Button>
                  )}
                  <Button 
                    onClick={handleWhatsApp}
                    className="rounded-full h-12 px-8 bg-green-500 text-white hover:bg-green-600 font-bold shadow-lg shadow-green-200"
                  >
                    <MessageCircle size={20} className="mr-2" /> WhatsApp
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-border-subtle w-full">
                  <div className="text-center md:text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Especialidade</p>
                    <p className="font-bold text-primary truncate">{targetProfile.serviceType || targetProfile.category || 'Membro'}</p>
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Avaliação</p>
                    <div className="flex items-center justify-center md:justify-start gap-1 font-bold text-highlight">
                      <Star size={16} fill="currentColor" /> {targetProfile.rating || '0.0'}
                    </div>
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Localização</p>
                    <p className="font-bold text-text-main truncate">{targetProfile.ward || 'Geral'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio & Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <section className="bg-card rounded-[2.5rem] p-8 shadow-sm border border-border-subtle">
                <h3 className="text-xl font-bold mb-4 font-heading flex items-center gap-2">
                  <Info size={20} className="text-primary" /> Sobre o Profissional
                </h3>
                <p className="text-text-muted leading-relaxed whitespace-pre-wrap">
                  {targetProfile.bio || 'Este membro ainda não adicionou uma descrição detalhada ao seu perfil.'}
                </p>
              </section>

              {targetProfile.isProvider && (
                <section className="bg-card rounded-[2.5rem] p-8 shadow-sm border border-border-subtle">
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
                <section className="bg-card rounded-[2.5rem] p-8 shadow-sm border border-border-subtle">
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
              <section className="bg-card rounded-[2.5rem] p-8 shadow-sm border border-border-subtle">
                <h3 className="text-lg font-bold mb-6 font-heading">Informações</h3>
                <div className="space-y-6">
                  {targetProfile.companyName && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center text-primary shrink-0">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Empresa</p>
                        <p className="text-sm font-bold text-text-main">{targetProfile.companyName}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center text-primary shrink-0">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Status</p>
                      <p className="text-sm font-bold text-text-main">
                        {targetProfile.verifiedMember ? 'Membro Verificado' : 'Perfil em Análise'}
                      </p>
                    </div>
                  </div>
                  {targetProfile.baptismYear && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center text-primary shrink-0">
                        <Church size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Ano de Batismo</p>
                        <p className="text-sm font-bold text-text-main">{targetProfile.baptismYear}</p>
                      </div>
                    </div>
                  )}
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

                <Separator className="my-8 bg-border-subtle/50" />

                <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">Redes Sociais</h4>
                <div className="flex gap-2">
                  {targetProfile.instagram && (
                    <a href={formatUrl(targetProfile.instagram)} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="rounded-xl hover:bg-surface text-text-muted hover:text-primary">
                        <Instagram size={20} />
                      </Button>
                    </a>
                  )}
                  {targetProfile.facebook && (
                    <a href={formatUrl(targetProfile.facebook)} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="rounded-xl hover:bg-surface text-text-muted hover:text-primary">
                        <Facebook size={20} />
                      </Button>
                    </a>
                  )}
                  {targetProfile.linkedin && (
                    <a href={formatUrl(targetProfile.linkedin)} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="rounded-xl hover:bg-surface text-text-muted hover:text-primary">
                        <Linkedin size={20} />
                      </Button>
                    </a>
                  )}
                  {targetProfile.website && (
                    <a href={formatUrl(targetProfile.website)} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="rounded-xl hover:bg-surface text-text-muted hover:text-primary">
                        <Globe size={20} />
                      </Button>
                    </a>
                  )}
                  {!targetProfile.instagram && !targetProfile.facebook && !targetProfile.linkedin && !targetProfile.website && (
                    <p className="text-xs text-text-muted italic">Nenhuma rede social vinculada.</p>
                  )}
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
