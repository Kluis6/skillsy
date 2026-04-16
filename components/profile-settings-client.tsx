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
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';

import { Skeleton } from "@/components/ui/skeleton";

import { ThemeToggle } from '@/components/theme-toggle';

export function ProfileSettingsClient() {
  const { user, profile, updateProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    ward: '',
    serviceType: '',
    category: '',
    companyName: '',
    isProvider: false,
    whatsapp: '',
    instagram: '',
    facebook: '',
    linkedin: '',
    website: '',
    photoURL: '',
    bannerURL: '',
    gallery: [] as string[]
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        ward: profile.ward || '',
        serviceType: profile.serviceType || '',
        category: profile.category || '',
        companyName: profile.companyName || '',
        isProvider: profile.isProvider || false,
        whatsapp: profile.whatsapp || '',
        instagram: profile.instagram || '',
        facebook: profile.facebook || '',
        linkedin: profile.linkedin || '',
        website: profile.website || '',
        photoURL: profile.photoURL || '',
        bannerURL: profile.bannerURL || '',
        gallery: profile.gallery || []
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setLoading(true);
    
    // Clean data: remove empty strings or set to null if needed
    const cleanedData = { ...formData };
    const optionalFields = [
      'instagram', 'facebook', 'linkedin', 'website', 'whatsapp', 
      'bio', 'location', 'ward', 'companyName', 'serviceType', 
      'category', 'photoURL', 'bannerURL'
    ];
    
    optionalFields.forEach(field => {
      if ((cleanedData as any)[field] === '') {
        (cleanedData as any)[field] = null;
      }
    });

    try {
      await updateProfile(cleanedData);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      let errorMessage = 'Erro ao atualizar perfil';
      
      try {
        // Try to parse the JSON error from handleFirestoreError
        const errorData = JSON.parse(error.message);
        if (errorData.error.includes('permission-denied') || errorData.error.includes('Missing or insufficient permissions')) {
          errorMessage = 'Erro de permissão: Verifique se todos os campos estão no formato correto e dentro do limite de tamanho.';
        } else {
          errorMessage = `Erro: ${errorData.error}`;
        }
      } catch (e) {
        // Fallback if not a JSON error
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
        setFormData(prev => ({ ...prev, photoURL: base64 }));
        toast.success('Foto de perfil carregada!');
      } else if (type === 'banner') {
        setFormData(prev => ({ ...prev, bannerURL: base64 }));
        toast.success('Banner carregado!');
      } else if (type === 'gallery') {
        setFormData(prev => ({ ...prev, gallery: [...prev.gallery, base64] }));
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
    galleryInputRef.current?.click();
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
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
              onClick={handleSave} 
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
                    src={formData.bannerURL} 
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
                    <AvatarImage src={formData.photoURL} />
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
                    onCheckedChange={(checked) => setFormData({ ...formData, isProvider: checked })}
                  />
                </div>
                
                {formData.isProvider && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Nome da Empresa (Opcional)</Label>
                      <Input 
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="Ex: Silva Construções"
                        className="bg-surface border-none rounded-2xl h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Categoria do Serviço</Label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-surface border-none rounded-2xl h-12 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
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
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Especialidade Detalhada</Label>
                      <Input 
                        value={formData.serviceType}
                        onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                        placeholder="Ex: Eletricista, Professor de Inglês, etc."
                        className="bg-surface border-none rounded-2xl h-12"
                      />
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
                    <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Nome Completo</Label>
                    <Input 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-surface border-none rounded-2xl h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1 flex items-center gap-1">
                      <MapPin size={12} /> Localização (Cidade/Estado)
                    </Label>
                    <Input 
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Ex: São Paulo, SP"
                      className="bg-surface border-none rounded-2xl h-12"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1 flex items-center gap-1">
                      <Church size={12} /> Ala / Ramo
                    </Label>
                    <Input 
                      value={formData.ward}
                      onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                      placeholder="Ex: Ala Centro, Estaca Brasil"
                      className="bg-surface border-none rounded-2xl h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Bio / Descrição</Label>
                  <Textarea 
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Conte um pouco sobre você e seus talentos..."
                    className="bg-surface border-none rounded-3xl min-h-[150px] p-6 focus:ring-2 focus:ring-primary/20"
                  />
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
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="Ex: 11999999999"
                    className="bg-surface border-none rounded-2xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1 flex items-center gap-1 text-pink-600">
                    <Instagram size={12} /> Instagram
                  </Label>
                  <Input 
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="@seuusuario"
                    className="bg-surface border-none rounded-2xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1 flex items-center gap-1 text-blue-600">
                    <Facebook size={12} /> Facebook
                  </Label>
                  <Input 
                    value={formData.facebook}
                    onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                    className="bg-surface border-none rounded-2xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1 flex items-center gap-1 text-blue-800">
                    <Linkedin size={12} /> LinkedIn
                  </Label>
                  <Input 
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="bg-surface border-none rounded-2xl h-12"
                  />
                </div>
              </div>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-sm bg-card p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold font-heading">Galeria de Fotos</h3>
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
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {formData.gallery.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-2xl overflow-hidden group border border-border-subtle">
                    <Image 
                      src={photo} 
                      alt={`Galeria ${index}`} 
                      fill 
                      className="object-cover transition-transform group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        onClick={() => removePhoto(index)}
                        className="rounded-full w-8 h-8"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
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
