'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User as UserIcon, 
  Camera, 
  Plus, 
  Trash2, 
  Instagram, 
  Facebook, 
  Linkedin, 
  Globe, 
  MessageCircle, 
  ArrowLeft,
  Save,
  ShieldCheck,
  Briefcase,
  MapPin,
  Church,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Navigation,
  Clock,
  CalendarDays,
  Phone
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileFormData } from '@/lib/validations';

import { Skeleton } from "@/components/ui/skeleton";

import { ThemeToggle } from '@/components/theme-toggle';
import { LocationService } from '@/services/location-service';

export function ProfileSettingsClient() {
  const { user, profile, updateProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, touchedFields, dirtyFields }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      bio: '',
      location: '',
      ward: '',
      serviceType: '',
      category: '',
      companyName: '',
      isProvider: false,
      whatsapp: '',
      phone: '',
      instagram: '',
      facebook: '',
      linkedin: '',
      website: '',
      baptismYear: '',
      availability: [],
      serviceHours: '',
      photoURL: '',
      bannerURL: '',
      gallery: [],
      businessAddress: '',
      businessAddressNumber: '',
      businessNeighborhood: '',
      businessState: '',
      businessComplement: ''
    }
  });

  const formData = watch();

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        ward: profile.ward || '',
        serviceType: profile.serviceType || '',
        category: profile.category || '',
        companyName: profile.companyName || '',
        isProvider: profile.isProvider || false,
        whatsapp: profile.whatsapp || '',
        phone: profile.phone || '',
        instagram: profile.instagram || '',
        facebook: profile.facebook || '',
        linkedin: profile.linkedin || '',
        website: profile.website || '',
        baptismYear: profile.baptismYear ? String(profile.baptismYear) : '',
        availability: profile.availability || [],
        serviceHours: profile.serviceHours || '',
        photoURL: profile.photoURL || '',
        bannerURL: profile.bannerURL || '',
        gallery: profile.gallery || [],
        businessAddress: profile.businessAddress || '',
        businessAddressNumber: profile.businessAddressNumber || '',
        businessNeighborhood: profile.businessNeighborhood || '',
        businessState: profile.businessState || '',
        businessComplement: profile.businessComplement || ''
      });
    }
  }, [profile, reset]);

  const [detectingLocation, setDetectingLocation] = useState(false);

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    try {
      const data = await LocationService.getCurrentLocation();
      setValue('location', data.display, { shouldValidate: true });
      toast.success('Localização detectada!', { description: data.display });
    } catch (error: any) {
      toast.error('Erro de geolocalização', { description: error.message });
    } finally {
      setDetectingLocation(false);
    }
  };

  const onFormSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    
    // Clean data: convert empty strings to null for the database
    const cleanedData = { ...data };
    const fieldsToNullify = [
      'instagram', 'facebook', 'linkedin', 'website', 'whatsapp', 'phone',
      'bio', 'location', 'ward', 'companyName', 'serviceType', 
      'category', 'photoURL', 'bannerURL', 'baptismYear', 'serviceHours',
      'businessAddress', 'businessAddressNumber', 'businessNeighborhood', 'businessState', 'businessComplement'
    ];
    
    fieldsToNullify.forEach(field => {
      if ((cleanedData as any)[field] === '') {
        (cleanedData as any)[field] = null;
      }
    });

    // Automatic verification if baptism year is present
    if (cleanedData.baptismYear) {
      (cleanedData as any).verifiedMember = true;
      (cleanedData as any).baptismYear = parseInt(cleanedData.baptismYear);
    } else {
      // If baptismYear was removed, we don't necessarily remove verification unless it's only based on it
      // But the user said "considere isso como um perfil verificado", implying the link.
      // However, admins might verify people manually. 
      // Let's only set verifiedMember to true but NOT false if baptismYear is absent, 
      // OR better, let's follow the prompt strictly: baptismYear presence = verified.
      (cleanedData as any).verifiedMember = false;
    }

    try {
      await updateProfile(cleanedData as any);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      let errorMessage = 'Erro ao atualizar perfil';
      
      try {
        const errorData = JSON.parse(error.message);
        if (errorData.error.includes('permission-denied') || errorData.error.includes('Missing or insufficient permissions')) {
          errorMessage = 'Erro de permissão: Verifique se todos os campos estão no formato correto e dentro do limite de tamanho.';
        } else {
          errorMessage = `Erro: ${errorData.error}`;
        }
      } catch (e) {
        if (error.message) errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const compressAndGetBase64 = async (file: File) => {
    const options = {
      maxSizeMB: 0.1, // 100KB to keep Firestore docs small
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(file, options);
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(compressedFile);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
    } catch (error) {
      console.error('Compression error:', error);
      throw error;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner' | 'gallery') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(type);
    try {
      const base64 = await compressAndGetBase64(file);
      if (type === 'avatar') {
        setValue('photoURL', base64, { shouldDirty: true });
        toast.success('Foto de perfil carregada!');
      } else if (type === 'banner') {
        setValue('bannerURL', base64, { shouldDirty: true });
        toast.success('Banner carregado!');
      } else if (type === 'gallery') {
        if (formData.gallery.length >= 5) {
          toast.error('Limite atingido', { description: 'Você pode enviar no máximo 5 fotos para a galeria.' });
          return;
        }
        setValue('gallery', [...formData.gallery, { url: base64, description: '' }], { shouldDirty: true });
        toast.success('Foto adicionada à galeria!');
      }
    } catch (error) {
      toast.error('Erro ao carregar imagem');
    } finally {
      setUploading(null);
      e.target.value = ''; // Reset input
    }
  };

  const handleAddPhoto = () => {
    if (formData.gallery.length >= 5) {
      toast.error('Limite atingido', { description: 'Você pode enviar no máximo 5 fotos para a galeria.' });
      return;
    }
    galleryInputRef.current?.click();
  };

  const removePhoto = (index: number) => {
    setValue('gallery', formData.gallery.filter((_, i) => i !== index), { shouldDirty: true });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-surface pb-20">
        <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border-subtle px-6 md:px-10 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Skeleton className="h-10 w-48 rounded-xl" />
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Skeleton className="h-11 w-32 rounded-2xl" />
            </div>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-6 mt-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-8">
              <Skeleton className="h-64 w-full rounded-[2.5rem]" />
              <Skeleton className="h-48 w-full rounded-[2.5rem]" />
            </div>
            <div className="lg:col-span-2 space-y-8">
              <Skeleton className="h-[400px] w-full rounded-[2.5rem]" />
              <Skeleton className="h-[300px] w-full rounded-[2.5rem]" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-surface">
        <h1 className="text-3xl font-bold mb-4">Acesso Restrito</h1>
        <p className="text-text-muted mb-8">Você precisa estar logado para editar seu perfil.</p>
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
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-surface">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-text-main font-heading">Configurações do Perfil</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button 
              onClick={handleSubmit(onFormSubmit)} 
              disabled={loading}
              className="bg-primary text-white hover:bg-primary/90 rounded-2xl px-6 font-bold shadow-lg shadow-primary/20 h-11"
            >
              {loading ? 'Salvando...' : <><Save size={18} className="mr-2" /> Salvar</>}
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Avatar & Basic Info */}
          <div className="space-y-8">
            <Card className="rounded-[2.5rem] border-none shadow-sm bg-card overflow-hidden">
              <div className="relative h-32 bg-gradient-to-r from-primary/10 to-accent/10">
                {formData.bannerURL && (
                  <Image 
                    src={formData.bannerURL!} 
                    alt="Banner" 
                    fill 
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
                <button 
                  onClick={() => bannerInputRef.current?.click()}
                  disabled={uploading === 'banner'}
                  className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white p-2 rounded-xl hover:bg-white/30 transition-colors disabled:opacity-50"
                  title="Alterar Banner"
                >
                  {uploading === 'banner' ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                </button>
                <input 
                  type="file" 
                  ref={bannerInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'banner')}
                />
              </div>
              <CardContent className="pt-10 pb-8 flex flex-col items-center -mt-16">
                <div className="relative group mb-6">
                  <Avatar className="w-32 h-32 border-4 border-surface shadow-xl">
                    <AvatarImage src={formData.photoURL || undefined} />
                    <AvatarFallback className="bg-primary/5 text-primary text-4xl font-bold">
                      {formData.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <button 
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploading === 'avatar'}
                    className="absolute bottom-0 right-0 bg-primary text-white p-2.5 rounded-2xl shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
                  >
                    {uploading === 'avatar' ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                  </button>
                  <input 
                    type="file" 
                    ref={avatarInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'avatar')}
                  />
                </div>
                <h2 className="text-xl font-bold text-text-main mb-1">{formData.name || 'Seu Nome'}</h2>
                <p className="text-sm text-text-muted mb-4">{user.email}</p>
                {profile?.verifiedMember && (
                  <Badge className="bg-primary/10 text-primary border-none font-bold px-4 py-1.5 rounded-full flex items-center gap-2">
                    <ShieldCheck size={14} /> Membro Verificado
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-sm bg-card p-8">
              <h3 className="font-bold mb-6 flex items-center gap-2"><Briefcase size={18} className="text-primary" /> Status Profissional</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-primary/5">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold">Quero Anunciar</Label>
                    <p className="text-[10px] text-text-muted">Aparecer nos resultados das buscas de serviços</p>
                  </div>
                  <Switch 
                    checked={formData.isProvider}
                    onCheckedChange={(checked) => setValue('isProvider', checked)}
                  />
                </div>
                
                {formData.isProvider && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Nome da Empresa (Opcional)</Label>
                      <Input 
                        {...register('companyName')}
                        placeholder="Ex: Silva Construções"
                        className={`bg-surface border-none rounded-2xl h-12 ${errors.companyName ? 'ring-2 ring-red-500' : ''}`}
                      />
                      {errors.companyName && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.companyName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">
                        Categoria do Serviço <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <select 
                          {...register('category')}
                          className={`w-full bg-surface border-none rounded-2xl h-12 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none ${errors.category ? 'ring-2 ring-red-500' : ''}`}
                        >
                          <option value="">Selecione uma categoria</option>
                          <option value="Tecnologia">Tecnologia</option>
                          <option value="Design">Design</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Consultoria">Consultoria</option>
                          <option value="Cozinha">Cozinha</option>
                          <option value="Limpeza">Limpeza</option>
                          <option value="Manutenção">Manutenção</option>
                          <option value="Beleza">Beleza</option>
                          <option value="Educação">Educação</option>
                          <option value="Saúde">Saúde</option>
                          <option value="Eventos">Eventos</option>
                          <option value="Jurídico">Jurídico</option>
                          <option value="Financeiro">Financeiro</option>
                          <option value="Assistência">Assistência Técnica</option>
                          <option value="Reformas">Reformas e Reparos</option>
                          <option value="Automotivo">Automotivo</option>
                          <option value="Moda">Moda</option>
                          <option value="Bem Estar">Bem Estar</option>
                          <option value="Pet Care">Pet Care</option>
                          <option value="Fotografia">Fotografia</option>
                          <option value="Música">Música</option>
                          <option value="Idiomas">Idiomas</option>
                          <option value="Esportes">Esportes</option>
                          <option value="Festas">Festas</option>
                          <option value="Transporte">Transporte</option>
                          <option value="Outros">Outros</option>
                        </select>
                      </div>
                      {errors.category && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.category.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Especialidade Detalhada</Label>
                      <Input 
                        {...register('serviceType')}
                        placeholder="Ex: Eletricista, Professor de Inglês, etc."
                        className={`bg-surface border-none rounded-2xl h-12 ${errors.serviceType ? 'ring-2 ring-red-500' : ''}`}
                      />
                      {errors.serviceType && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.serviceType.message}</p>}
                    </div>

                    <div className="space-y-4 pt-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1 flex items-center gap-1">
                        <CalendarDays size={12} /> Disponibilidade
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => {
                          const isSelected = formData.availability?.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                const current = formData.availability || [];
                                const next = isSelected 
                                  ? current.filter(d => d !== day)
                                  : [...current, day];
                                setValue('availability', next, { shouldDirty: true });
                              }}
                              className={`h-10 px-4 rounded-xl text-xs font-bold transition-all border-2 ${
                                isSelected 
                                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                                  : 'bg-surface border-transparent text-text-muted hover:border-primary/20'
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1 flex items-center gap-1">
                        <Clock size={12} /> Horário de Atendimento
                      </Label>
                      <Input 
                        {...register('serviceHours')}
                        placeholder="Ex: 08:00 - 18:00 ou Por agendamento"
                        className={`bg-surface border-none rounded-2xl h-12 ${errors.serviceHours ? 'ring-2 ring-red-500' : ''}`}
                      />
                      {errors.serviceHours && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.serviceHours.message}</p>}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column: Detailed Info */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="rounded-[2.5rem] border-none shadow-sm bg-card p-8">
              <CardHeader className="px-0 pt-0 mb-6">
                <CardTitle className="text-2xl font-bold font-heading">Informações Pessoais</CardTitle>
                <CardDescription>Estes dados ajudam outros membros a te encontrarem.</CardDescription>
              </CardHeader>
              <CardContent className="px-0 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">
                        Nome Completo <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input 
                          {...register('name')}
                          className={`bg-surface border-2 rounded-2xl h-12 transition-all ${
                            errors.name 
                            ? 'border-red-500/50 focus:border-red-500 ring-0' 
                            : touchedFields.name && !errors.name 
                              ? 'border-green-500/50 focus:border-green-500 ring-0' 
                              : 'border-transparent focus:border-primary/20 ring-0'
                          }`}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          {errors.name ? (
                            <AlertCircle size={18} className="text-red-500" />
                          ) : touchedFields.name && !errors.name ? (
                            <CheckCircle2 size={18} className="text-green-500" />
                          ) : null}
                        </div>
                      </div>
                      {errors.name && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.name.message}</p>}
                    </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1 flex items-center gap-1">
                      <MapPin size={12} /> Localização (Cidade/Estado)
                    </Label>
                    <div className="flex gap-2">
                      <Input 
                        {...register('location')}
                        placeholder="Ex: São Paulo, SP"
                        className={`bg-surface border-none rounded-2xl h-12 flex-grow ${errors.location ? 'ring-2 ring-red-500' : ''}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleDetectLocation}
                        disabled={detectingLocation}
                        className="shrink-0 h-12 w-12 rounded-2xl bg-surface border-none hover:bg-primary/5 hover:text-primary transition-all"
                        title="Detectar minha localização"
                      >
                        {detectingLocation ? <Loader2 size={18} className="animate-spin" /> : <Navigation size={18} />}
                      </Button>
                    </div>
                    {errors.location && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.location.message}</p>}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1 flex items-center gap-1">
                      <Church size={12} /> Ala / Ramo
                    </Label>
                    <Input 
                      {...register('ward')}
                      placeholder="Ex: Ala Centro, Estaca Brasil"
                      className={`bg-surface border-none rounded-2xl h-12 ${errors.ward ? 'ring-2 ring-red-500' : ''}`}
                    />
                    {errors.ward && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.ward.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1 flex items-center gap-1">
                      <Church size={12} /> Ano de Batismo (SUD)
                    </Label>
                    <Input 
                      {...register('baptismYear')}
                      placeholder="Ex: 2010"
                      maxLength={4}
                      className={`bg-surface border-none rounded-2xl h-12 ${errors.baptismYear ? 'ring-2 ring-red-500' : ''}`}
                    />
                    {errors.baptismYear && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.baptismYear.message}</p>}
                    <p className="text-[10px] text-primary/60 font-medium ml-1">Preencher este campo ativa o selo de Membro Verificado.</p>
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <h4 className="text-sm font-bold text-text-main border-l-4 border-primary pl-3">Endereço Comercial (Opcional)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Endereço (Rua/Avenida)</Label>
                      <Input 
                        {...register('businessAddress')}
                        placeholder="Ex: Rua das Flores"
                        className={`bg-surface border-none rounded-2xl h-12 ${errors.businessAddress ? 'ring-2 ring-red-500' : ''}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Número</Label>
                      <Input 
                        {...register('businessAddressNumber')}
                        placeholder="Ex: 123"
                        className={`bg-surface border-none rounded-2xl h-12 ${errors.businessAddressNumber ? 'ring-2 ring-red-500' : ''}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Bairro</Label>
                      <Input 
                        {...register('businessNeighborhood')}
                        placeholder="Ex: Centro"
                        className={`bg-surface border-none rounded-2xl h-12 ${errors.businessNeighborhood ? 'ring-2 ring-red-500' : ''}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Estado</Label>
                      <Input 
                        {...register('businessState')}
                        placeholder="Ex: SP"
                        className={`bg-surface border-none rounded-2xl h-12 ${errors.businessState ? 'ring-2 ring-red-500' : ''}`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Complemento</Label>
                      <Input 
                        {...register('businessComplement')}
                        placeholder="Ex: Sala 10, Bloco B"
                        className={`bg-surface border-none rounded-2xl h-12 ${errors.businessComplement ? 'ring-2 ring-red-500' : ''}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <Label className="text-xs font-bold uppercase tracking-wider text-text-muted">Bio / Descrição</Label>
                    <span className={`text-[10px] font-bold ${formData.bio && formData.bio.length > 500 ? 'text-red-500' : 'text-text-muted'}`}>
                      {formData.bio?.length || 0} / 500
                    </span>
                  </div>
                  <Textarea 
                    {...register('bio')}
                    placeholder="Conte um pouco sobre você e seus talentos..."
                    className={`bg-surface border-none rounded-3xl min-h-[150px] p-6 focus:ring-2 focus:ring-primary/20 ${errors.bio ? 'ring-2 ring-red-500' : ''}`}
                    maxLength={500}
                  />
                  {errors.bio && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.bio.message}</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-sm bg-card p-8">
              <h3 className="text-xl font-bold mb-6 font-heading">Redes Sociais & Contato</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1 flex items-center gap-1 text-green-600">
                    <MessageCircle size={12} /> WhatsApp
                  </Label>
                  <Input 
                    {...register('whatsapp')}
                    placeholder="Ex: 11999999999"
                    className={`bg-surface border-none rounded-2xl h-12 ${errors.whatsapp ? 'ring-2 ring-red-500' : ''}`}
                  />
                  {errors.whatsapp && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.whatsapp.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1 flex items-center gap-1">
                    <Phone size={12} className="text-primary" /> Telefone Adicional (Opcional)
                  </Label>
                  <Input 
                    {...register('phone')}
                    placeholder="Ex: 1133334444"
                    className={`bg-surface border-none rounded-2xl h-12 ${errors.phone ? 'ring-2 ring-red-500' : ''}`}
                  />
                  {errors.phone && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.phone.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1 flex items-center gap-1 text-pink-600">
                    <Instagram size={12} /> Instagram
                  </Label>
                  <Input 
                    {...register('instagram')}
                    placeholder="@seuusuario"
                    className={`bg-surface border-none rounded-2xl h-12 ${errors.instagram ? 'ring-2 ring-red-500' : ''}`}
                  />
                  {errors.instagram && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.instagram.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1 flex items-center gap-1 text-blue-600">
                    <Facebook size={12} /> Facebook
                  </Label>
                  <Input 
                    {...register('facebook')}
                    placeholder="Link do perfil"
                    className={`bg-surface border-none rounded-2xl h-12 ${errors.facebook ? 'ring-2 ring-red-500' : ''}`}
                  />
                  {errors.facebook && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.facebook.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1 flex items-center gap-1 text-blue-800">
                    <Linkedin size={12} /> LinkedIn
                  </Label>
                  <Input 
                    {...register('linkedin')}
                    placeholder="Link do perfil"
                    className={`bg-surface border-none rounded-2xl h-12 ${errors.linkedin ? 'ring-2 ring-red-500' : ''}`}
                  />
                  {errors.linkedin && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.linkedin.message}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1 flex items-center gap-1">
                    <Globe size={12} /> Website
                  </Label>
                  <Input 
                    {...register('website')}
                    placeholder="https://exemplo.com"
                    className={`bg-surface border-none rounded-2xl h-12 ${errors.website ? 'ring-2 ring-red-500' : ''}`}
                  />
                  {errors.website && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.website.message}</p>}
                </div>
              </div>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-sm bg-card p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold font-heading">Galeria de Fotos</h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${formData.gallery.length >= 5 ? 'bg-red-50 text-red-500 border-red-100' : 'bg-primary/5 text-primary border-primary/10'}`}>
                    {formData.gallery.length}/5
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddPhoto}
                  disabled={uploading === 'gallery'}
                  className="rounded-xl border-primary/20 text-primary hover:bg-primary/5 font-bold disabled:opacity-50"
                >
                  {uploading === 'gallery' ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Plus size={16} className="mr-2" />} Adicionar Foto
                </Button>
                <input 
                  type="file" 
                  ref={galleryInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'gallery')}
                />
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {formData.gallery.map((photo, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    <div className="relative aspect-square rounded-2xl overflow-hidden group border border-border-subtle">
                      <Image 
                        src={typeof photo === 'string' ? photo : photo.url} 
                        alt={`Galeria ${index}`} 
                        fill 
                        className="object-cover transition-transform group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="rounded-full w-8 h-8"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                    <Textarea
                      placeholder="Comentário (opcional)"
                      value={typeof photo === 'string' ? '' : photo.description || ''}
                      onChange={(e) => {
                        const newGallery = [...formData.gallery];
                        const photoItem = formData.gallery[index];
                        if (typeof photoItem === 'string') {
                           newGallery[index] = { url: photoItem, description: e.target.value };
                        } else {
                           newGallery[index] = { ...photoItem, description: e.target.value };
                        }
                        setValue('gallery', newGallery, { shouldDirty: true });
                      }}
                      className="text-[10px] min-h-[50px] h-auto p-2 bg-surface border-none resize-none rounded-xl"
                    />
                  </div>
                ))}
                {formData.gallery.length === 0 && (
                  <div className="col-span-full py-12 text-center bg-surface rounded-3xl border-2 border-dashed border-border-subtle">
                    <Camera className="mx-auto h-10 w-10 text-text-muted/20 mb-3" />
                    <p className="text-sm text-text-muted font-medium">Sua galeria está vazia.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
