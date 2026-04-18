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
  Users,
  Clock,
  CalendarDays,
  Plus,
  ChevronRight,
  Home,
  Navigation,
  Camera
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from "@/components/ui/separator";

interface ProfileDetailClientProps {
  id: string;
  initialProfile: UserProfile | null;
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

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { ThemeToggle } from '@/components/theme-toggle';

export function ProfileDetailClient({ id, initialProfile }: ProfileDetailClientProps) {
  const router = useRouter();
  const { user, profile: currentUserProfile, toggleContact } = useAuth();
  const [targetProfile, setTargetProfile] = useState<UserProfile | null>(initialProfile);
  const [loading, setLoading] = useState(!initialProfile);
  const [userRating, setUserRating] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  useEffect(() => {
    // We only need to fetch if we don't have the profile yet or to get fresh data
    const fetchProfile = async () => {
      if (!id || initialProfile) return;
      setLoading(true);
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
  }, [id, initialProfile]);

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

  const handlePhoneCall = () => {
    if (!targetProfile?.phone) return;
    window.open(`tel:${targetProfile.phone.replace(/\D/g, '')}`, '_self');
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
    <div className="min-h-screen bg-[#F3F2EF] dark:bg-background pb-12 transition-colors duration-300">
      {/* Header/Secondary Nav (Optional, based on image but keeping app consistency) */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-card border-b border-border-subtle px-6 md:px-10 h-16 flex items-center shadow-sm">
        <div className="max-w-6xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-surface"
              onClick={() => router.back()}
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-surface rounded-md border border-border-subtle w-64">
              <span className="text-text-muted text-xs">Pesquisar...</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 md:gap-8">
            <Link href="/" className="flex flex-col items-center gap-1 group">
              <Home size={22} className="text-text-muted group-hover:text-text-main transition-colors" />
              <span className="text-[10px] text-text-muted group-hover:text-text-main font-medium">Início</span>
            </Link>
            <div className="flex flex-col items-center gap-1 group opacity-40 cursor-not-allowed">
              <Users size={22} className="text-text-muted" />
              <span className="text-[10px] text-text-muted font-medium">Minha rede</span>
            </div>
            <div className="flex flex-col items-center gap-1 group opacity-40 cursor-not-allowed">
              <Briefcase size={22} className="text-text-muted" />
              <span className="text-[10px] text-text-muted font-medium">Vagas</span>
            </div>
            <div className="h-full w-px bg-border-subtle mx-2 self-stretch" />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 md:px-10 mt-6 md:grid md:grid-cols-[1fr_300px] gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Top Profile Card */}
          <Card className="rounded-xl overflow-hidden border border-border-subtle bg-white dark:bg-card shadow-sm">
            <div className="relative h-48 md:h-52 bg-gradient-to-r from-blue-400/20 to-indigo-400/20">
              {targetProfile.bannerURL ? (
                <Image 
                  src={targetProfile.bannerURL} 
                  alt="Banner" 
                  fill 
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="absolute inset-0 bg-[#D9E2EF] dark:bg-muted/50" />
              )}
            </div>
            
            <CardContent className="px-8 pb-8">
              <div className="relative flex flex-col pt-0">
                {/* Avatar Overlap */}
                <div className="-mt-24 mb-4 relative z-10 w-40 h-40 md:w-44 md:h-44">
                  <Avatar className="w-full h-full border-[4px] border-white dark:border-card bg-white dark:bg-card shadow-sm">
                    <AvatarImage src={targetProfile.photoURL} className="object-cover" />
                    <AvatarFallback className="bg-surface text-primary font-bold text-5xl">
                      {targetProfile.name[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl md:text-3xl font-bold text-text-main leading-tight">
                        {targetProfile.name}
                      </h2>
                      {targetProfile.verifiedMember && (
                        <ShieldCheck size={22} className="text-primary" />
                      )}
                    </div>
                    
                    <p className="text-lg text-text-main font-regular leading-relaxed max-w-xl">
                      {targetProfile.serviceType || targetProfile.category || 'Membro da Comunidade Skillsy'}
                      {targetProfile.companyName && ` na ${targetProfile.companyName}`}
                    </p>

                    <p className="text-sm text-text-muted pt-1">
                      {targetProfile.location && <span>{targetProfile.location}</span>}
                      {targetProfile.location && (targetProfile.instagram || targetProfile.website || targetProfile.phone) && (
                        <span className="mx-1.5 text-text-muted/40">•</span>
                      )}
                      {targetProfile.phone && (
                        <button 
                          onClick={handlePhoneCall}
                          className="text-text-main font-bold hover:text-primary transition-colors flex items-center gap-1 mr-2"
                        >
                          <Phone size={14} /> {targetProfile.phone}
                        </button>
                      )}
                      {(targetProfile.instagram || targetProfile.website) && (
                        <button className="text-primary font-bold hover:underline">
                          Informações de contato
                        </button>
                      )}
                    </p>

                    <p className="text-sm text-primary font-bold pt-1 hover:underline cursor-pointer">
                      {targetProfile.contacts?.length || 0} conexões
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 w-full md:w-auto">
                    {targetProfile.companyName && (
                      <div className="flex items-center gap-2.5 group cursor-pointer">
                        <div className="w-8 h-8 rounded bg-surface flex items-center justify-center border border-border-subtle group-hover:bg-primary/5 transition-colors">
                          <Building2 size={16} className="text-primary" />
                        </div>
                        <span className="text-sm font-bold text-text-main hover:text-primary transition-colors underline-offset-2 hover:underline">
                          {targetProfile.companyName}
                        </span>
                      </div>
                    )}
                    {targetProfile.ward && (
                      <div className="flex items-center gap-2.5 group cursor-pointer">
                        <div className="w-8 h-8 rounded bg-surface flex items-center justify-center border border-border-subtle group-hover:bg-primary/5 transition-colors text-primary">
                          <Church size={16} />
                        </div>
                        <span className="text-sm font-bold text-text-main hover:text-primary transition-colors underline-offset-2 hover:underline">
                          {targetProfile.ward}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                    <div className="flex flex-wrap items-center gap-3 mt-6">
                      {user?.uid === targetProfile.uid ? (
                        <Link href="/profile">
                          <Button className="rounded-full h-10 px-6 font-bold bg-primary text-white hover:bg-primary/90 shadow-none">
                            Editar perfil
                          </Button>
                        </Link>
                      ) : (
                        <>
                          {user?.uid !== targetProfile.uid && (
                            <Button 
                              onClick={handleToggleContact}
                              className={`rounded-full h-10 px-6 font-bold shadow-none ${
                                isContact 
                                  ? 'border-2 border-primary text-primary hover:bg-primary/5 bg-transparent' 
                                  : 'bg-primary text-white hover:bg-primary/90'
                              }`}
                            >
                              {isContact ? (
                                <>Em sua rede</>
                              ) : (
                                <><UserPlus size={18} className="mr-2" /> Conectar</>
                              )}
                            </Button>
                          )}
                        </>
                      )}
                      
                      <Button 
                        onClick={handleWhatsApp}
                        variant="outline"
                        className="rounded-full h-10 px-6 border-2 border-primary text-primary hover:bg-primary/5 font-bold"
                      >
                        Mensagem
                      </Button>
                      <Button 
                        variant="outline"
                        className="rounded-full h-10 px-4 border-2 border-text-muted/40 text-text-muted hover:bg-surface font-bold"
                      >
                        Mais
                      </Button>
                    </div>
              </div>
            </CardContent>
          </Card>

          {/* About Section */}
          <section className="bg-white dark:bg-card rounded-xl p-6 border border-border-subtle shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-text-main">Sobre</h3>
            <p className="text-sm text-text-muted leading-relaxed whitespace-pre-wrap max-w-3xl">
              {targetProfile.bio || 'Este membro ainda não adicionou uma descrição detalhada.'}
            </p>
            {targetProfile.website && (
              <a 
                href={formatUrl(targetProfile.website)} 
                target="_blank" 
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
              >
                {targetProfile.website.replace(/^https?:\/\//, '')} <ArrowLeft size={14} className="rotate-135" />
              </a>
            )}
          </section>
          
          {/* Gallery Section */}
          {(targetProfile.gallery && targetProfile.gallery.length > 0) || (user?.uid === targetProfile.uid) ? (
            <section className="bg-white dark:bg-card rounded-xl p-6 border border-border-subtle shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-text-main">Galeria de Fotos</h3>
                  {targetProfile.gallery && targetProfile.gallery.length > 0 && (
                    <span className="text-xs text-text-muted font-medium bg-surface px-2 py-0.5 rounded-full border border-border-subtle">{targetProfile.gallery.length}/5 fotos</span>
                  )}
                </div>
                {user?.uid === targetProfile.uid && (
                  <Link href="/profile">
                    <Button variant="ghost" size="sm" className="text-xs font-bold text-primary hover:bg-primary/5 h-8">
                      Gerenciar Galeria
                    </Button>
                  </Link>
                )}
              </div>
              
              {targetProfile.gallery && targetProfile.gallery.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {targetProfile.gallery.map((photo, index) => (
                    <motion.div 
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedImage(index)}
                      className={`relative rounded-xl overflow-hidden shadow-sm border border-border-subtle aspect-square cursor-pointer ${
                        index === 0 ? 'col-span-2 md:col-span-2 md:row-span-2' : ''
                      }`}
                    >
                      <Image 
                        src={typeof photo === 'string' ? photo : photo.url} 
                        alt={typeof photo === 'object' && photo.description ? photo.description : `Galeria ${index + 1}`} 
                        fill 
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-border-subtle rounded-2xl bg-surface/50">
                  <Camera className="w-12 h-12 text-text-muted/30 mb-4" />
                  <p className="text-sm text-text-muted font-medium mb-4">Sua galeria ainda não possui fotos profissionais.</p>
                  <Link href="/profile">
                    <Button size="sm" className="bg-primary text-white font-bold h-9">
                      Adicionar fotos
                    </Button>
                  </Link>
                </div>
              )}
            </section>
          ) : null}

          {/* Experience Section (Simulated based on image) */}
          <section className="bg-white dark:bg-card rounded-xl p-6 border border-border-subtle shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-text-main">Experiência</h3>
              <Button variant="ghost" size="icon" className="rounded-full opacity-40">
                <Plus size={20} />
              </Button>
            </div>
            
            <div className="space-y-6">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded bg-surface flex items-center justify-center shrink-0 border border-border-subtle">
                  <Briefcase size={24} className="text-text-muted/40" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-bold text-text-main">{targetProfile.serviceType || 'Profissional'}</h4>
                  <p className="text-sm text-text-main">{targetProfile.companyName || 'Autônomo'}</p>
                  <p className="text-xs text-text-muted">
                    {targetProfile.experienceYears ? `há ${targetProfile.experienceYears} anos` : 'Período não informado'}
                  </p>
                  <p className="text-xs text-text-muted italic">{targetProfile.location}</p>
                  {targetProfile.bio && (
                    <p className="text-xs text-text-muted mt-2 line-clamp-2">{targetProfile.bio}</p>
                  )}
                </div>
              </div>
              
              <Separator className="bg-border-subtle/50" />
              
              <div className="flex gap-3 opacity-60">
                <div className="w-12 h-12 rounded bg-surface flex items-center justify-center shrink-0 border border-border-subtle">
                  <Church size={24} className="text-text-muted/40" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-bold text-text-main">Membro voluntário</h4>
                  <p className="text-sm text-text-main">{targetProfile.ward || 'Comunidade Local'}</p>
                  <p className="text-xs text-text-muted">
                    {targetProfile.baptismYear ? `Desde ${targetProfile.baptismYear}` : 'Período não informado'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Verification / Trust Section */}
          <section className="bg-white dark:bg-card rounded-xl p-6 border border-border-subtle shadow-sm">
             <h3 className="text-xl font-bold mb-4 text-text-main flex items-center gap-2">
                Avaliações da Comunidade
             </h3>
             <div className="flex items-center gap-4 mb-6">
               <div className="text-center bg-surface rounded-2xl p-4 min-w-[100px]">
                 <p className="text-3xl font-black text-primary">{targetProfile.rating || '0.0'}</p>
                 <div className="flex items-center justify-center gap-0.5 text-highlight py-1">
                   <Star size={12} fill="currentColor" />
                   <Star size={12} fill="currentColor" />
                   <Star size={12} fill="currentColor" />
                   <Star size={12} fill="currentColor" />
                   <Star size={12} className="text-border-subtle" />
                 </div>
                 <p className="text-[10px] font-bold text-text-muted uppercase">{targetProfile.reviewCount || 0} avaliações</p>
               </div>
               
               <div className="flex-grow space-y-1.5">
                  <p className="text-sm text-text-muted">Avalie a qualidade do serviço prestado por este membro.</p>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        disabled={submittingRating || user?.uid === targetProfile.uid}
                        onMouseEnter={() => setRatingHover(star)}
                        onMouseLeave={() => setRatingHover(0)}
                        onClick={() => handleRate(star)}
                        className={`transition-all ${
                          (ratingHover || userRating || 0) >= star 
                            ? 'text-highlight' 
                            : 'text-border-subtle'
                        } disabled:opacity-50`}
                      >
                        <Star size={24} fill={(ratingHover || userRating || 0) >= star ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
               </div>
             </div>
          </section>
        </motion.div>

        {/* Sidebar */}
        <aside className="mt-4 md:mt-0 space-y-4">
          {targetProfile.businessAddress && (
            <Card className="rounded-xl border border-border-subtle bg-white dark:bg-card shadow-sm p-4">
              <h3 className="text-sm font-bold text-text-main mb-3 flex items-center gap-2">
                <MapPin size={16} className="text-primary" /> Endereço Comercial
              </h3>
              <div className="space-y-1.5 min-w-0">
                <p className="text-sm text-text-main font-medium leading-tight">
                  {targetProfile.businessAddress}, {targetProfile.businessAddressNumber}
                </p>
                {targetProfile.businessComplement && (
                  <p className="text-xs text-text-muted">{targetProfile.businessComplement}</p>
                )}
                <p className="text-xs text-text-muted">
                  {targetProfile.businessNeighborhood}
                </p>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  {targetProfile.businessState}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3 h-8 rounded-lg text-xs font-bold border-primary/20 text-primary hover:bg-primary/5"
                  onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${targetProfile.businessAddress}, ${targetProfile.businessAddressNumber}, ${targetProfile.businessNeighborhood}, ${targetProfile.businessState}`)}`, '_blank')}
                >
                  <Navigation size={12} className="mr-1.5" /> Ver no Mapa
                </Button>
              </div>
            </Card>
          )}

          <Card className="rounded-xl border border-border-subtle bg-white dark:bg-card shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border-subtle">
              <h3 className="text-sm font-bold text-text-main">Pessoas que talvez você conheça</h3>
            </div>
            <div className="p-4 space-y-4">
              {[
                { name: 'Ricardo Silva', role: 'Carpinteiro na Ala Sul', avatar: 'https://picsum.photos/seed/ricardo/40/40' },
                { name: 'Ana Souza', role: 'Designer em SP', avatar: 'https://picsum.photos/seed/ana/40/40' },
                { name: 'Marcos Oliveira', role: 'Encanador na Ala Oeste', avatar: 'https://picsum.photos/seed/marcos/40/40' },
              ].map((person, idx) => (
                <div key={idx} className="flex gap-2.5 items-start">
                  <Avatar className="w-10 h-10 shrink-0">
                    <AvatarImage src={person.avatar} />
                    <AvatarFallback>{person.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-main leading-none mb-1 truncate group-hover:underline cursor-pointer">
                      {person.name}
                    </p>
                    <p className="text-xs text-text-muted line-clamp-2 leading-snug">
                      {person.role}
                    </p>
                    <Button variant="outline" size="sm" className="mt-2 h-7 rounded-full text-xs border-[1.5px] border-text-muted/60 text-text-muted font-bold hover:bg-surface">
                      <UserPlus size={14} className="mr-1.5" /> Conectar
                    </Button>
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <Button variant="ghost" className="w-full h-8 text-xs font-bold text-text-muted hover:bg-surface rounded-md">
                  Exibir mais <ChevronRight size={14} className="ml-1" />
                </Button>
              </div>
            </div>
          </Card>

          <Card className="rounded-xl border border-border-subtle bg-white dark:bg-card shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Contatos diretos</p>
              <Users size={14} className="text-primary/40" />
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Avatar key={i} className="w-8 h-8 border-2 border-white dark:border-card -ml-2 first:ml-0">
                  <AvatarImage src={`https://picsum.photos/seed/${i * 123}/32/32`} />
                  <AvatarFallback>?</AvatarFallback>
                </Avatar>
              ))}
              <div className="w-8 h-8 rounded-full bg-surface border-2 border-white dark:border-card -ml-2 flex items-center justify-center text-[10px] font-bold text-text-muted">
                +12
              </div>
            </div>
          </Card>
          
          <div className="px-4 py-2">
            <p className="text-[10px] text-text-muted font-medium text-center">
              Skillsy © 2026 • Privacidade e Termos de Uso
            </p>
          </div>
        </aside>
      </main>
      {/* Lightbox Dialog */}
      <Dialog open={selectedImage !== null} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95 border-none sm:rounded-2xl gap-0">
          {selectedImage !== null && targetProfile?.gallery?.[selectedImage] && (
            <div className="flex flex-col">
              <DialogTitle className="sr-only">Visualização de Foto</DialogTitle>
              <div className="relative aspect-square md:aspect-video w-full bg-black flex items-center justify-center">
                 <Image 
                   src={typeof targetProfile.gallery[selectedImage] === 'string' ? (targetProfile.gallery[selectedImage] as any) : targetProfile.gallery[selectedImage].url}
                   alt="Preview"
                   fill
                   className="object-contain"
                   referrerPolicy="no-referrer"
                 />
              </div>
              {typeof targetProfile.gallery[selectedImage] === 'object' && targetProfile.gallery[selectedImage].description && (
                <div className="p-6 bg-white dark:bg-card">
                   <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2">Comentário</h4>
                   <DialogDescription className="text-text-main text-base leading-relaxed tracking-tight">
                     {targetProfile.gallery[selectedImage].description}
                   </DialogDescription>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
