'use client';

import React, { useState, useEffect } from 'react';
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
  Phone, 
  Building2, 
  Church, 
  Briefcase,
  Star,
  CheckCircle2,
  Image as ImageIcon,
  Save,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'motion/react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: '',
    bio: '',
    ward: '',
    companyName: '',
    whatsapp: '',
    serviceType: '',
    phones: [''],
    socialLinks: {
      instagram: '',
      facebook: '',
      linkedin: '',
      website: ''
    },
    gallery: [],
    experienceYears: 0
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
        ward: profile.ward || '',
        companyName: profile.companyName || '',
        whatsapp: profile.whatsapp || '',
        serviceType: profile.serviceType || '',
        phones: profile.phones?.length ? profile.phones : [''],
        socialLinks: {
          instagram: profile.socialLinks?.instagram || '',
          facebook: profile.socialLinks?.facebook || '',
          linkedin: profile.socialLinks?.linkedin || '',
          website: profile.socialLinks?.website || ''
        },
        gallery: profile.gallery || [],
        experienceYears: profile.experienceYears || 0
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev: any) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handlePhoneChange = (index: number, value: string) => {
    const newPhones = [...formData.phones];
    newPhones[index] = value;
    setFormData((prev: any) => ({ ...prev, phones: newPhones }));
  };

  const addPhone = () => {
    if (formData.phones.length < 5) {
      setFormData((prev: any) => ({ ...prev, phones: [...prev.phones, ''] }));
    }
  };

  const removePhone = (index: number) => {
    const newPhones = formData.phones.filter((_: any, i: number) => i !== index);
    setFormData((prev: any) => ({ ...prev, phones: newPhones.length ? newPhones : [''] }));
  };

  const handleGalleryChange = (index: number, value: string) => {
    const newGallery = [...formData.gallery];
    newGallery[index] = value;
    setFormData((prev: any) => ({ ...prev, gallery: newGallery }));
  };

  const addGalleryImage = () => {
    if (formData.gallery.length < 5) {
      setFormData((prev: any) => ({ ...prev, gallery: [...prev.gallery, ''] }));
    }
  };

  const removeGalleryImage = (index: number) => {
    const newGallery = formData.gallery.filter((_: any, i: number) => i !== index);
    setFormData((prev: any) => ({ ...prev, gallery: newGallery }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      // Clean up empty phones and gallery items
      const cleanedData = {
        ...formData,
        phones: formData.phones.filter((p: string) => p.trim() !== ''),
        gallery: formData.gallery.filter((g: string) => g.trim() !== ''),
        experienceYears: Number(formData.experienceYears)
      };

      await updateDoc(userRef, cleanedData);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao salvar alterações.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Acesso Restrito</h2>
        <p className="text-text-muted mb-8">Você precisa estar logado para editar seu perfil.</p>
        <Link href="/">
          <Button className="bg-primary text-white font-bold rounded-xl px-8">Voltar para Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border-subtle px-6 md:px-10 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-surface">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-text-main font-heading">Editar Perfil</h1>
          </div>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="bg-primary text-white font-bold rounded-xl px-6 shadow-lg shadow-primary/20"
          >
            {loading ? 'Salvando...' : <><Save size={18} className="mr-2" /> Salvar</>}
          </Button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 mt-12">
        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Header / Avatar Section */}
          <section className="flex flex-col md:flex-row items-center gap-8 bg-white p-8 rounded-[2.5rem] border border-border-subtle shadow-xl shadow-primary/5">
            <div className="relative group">
              <Avatar className="w-32 h-32 border-4 border-surface shadow-lg">
                <AvatarImage src={user.photoURL || ''} />
                <AvatarFallback className="bg-primary text-white text-4xl font-bold font-heading">
                  {formData.name?.[0] || user.email?.[0]}
                </AvatarFallback>
              </Avatar>
              <button type="button" className="absolute bottom-0 right-0 bg-primary text-white p-2.5 rounded-full shadow-lg border-2 border-white hover:scale-110 transition-transform">
                <Camera size={18} />
              </button>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <h2 className="text-3xl font-bold text-text-main font-heading">{formData.name || 'Seu Nome'}</h2>
                {profile?.verifiedMember && <CheckCircle2 size={20} className="text-primary" />}
              </div>
              <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-text-muted">
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-highlight fill-highlight" />
                  <span className="font-bold text-text-main">{profile?.rating || '5.0'}</span>
                  <span>({profile?.reviewCount || 0} avaliações)</span>
                </div>
                <div className="w-1 h-1 bg-border-subtle rounded-full" />
                <span>Membro desde {new Date(profile?.createdAt?.seconds * 1000).getFullYear() || '2026'}</span>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Basic Info */}
            <Card className="rounded-3xl border-border-subtle shadow-sm">
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2">
                  <UserIcon size={20} className="text-primary" /> Informações Básicas
                </CardTitle>
                <CardDescription>Como você será visto na comunidade.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    className="bg-surface border-none rounded-xl h-12"
                    placeholder="Ex: João Silva"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ward" className="flex items-center gap-1">
                    <Church size={14} /> Nome da Ala (Opcional)
                  </Label>
                  <Input 
                    id="ward" 
                    name="ward" 
                    value={formData.ward} 
                    onChange={handleInputChange} 
                    className="bg-surface border-none rounded-xl h-12"
                    placeholder="Ex: Ala Central"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="flex items-center gap-1">
                    <Building2 size={14} /> Nome da Empresa (Opcional)
                  </Label>
                  <Input 
                    id="companyName" 
                    name="companyName" 
                    value={formData.companyName} 
                    onChange={handleInputChange} 
                    className="bg-surface border-none rounded-xl h-12"
                    placeholder="Ex: Silva Construções"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serviceType" className="flex items-center gap-1">
                    <Briefcase size={14} /> Tipo de Serviço
                  </Label>
                  <Input 
                    id="serviceType" 
                    name="serviceType" 
                    value={formData.serviceType} 
                    onChange={handleInputChange} 
                    className="bg-surface border-none rounded-xl h-12"
                    placeholder="Ex: Manutenção de computadores"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experienceYears">Anos de Experiência</Label>
                  <Input 
                    id="experienceYears" 
                    name="experienceYears" 
                    type="number"
                    value={formData.experienceYears} 
                    onChange={handleInputChange} 
                    className="bg-surface border-none rounded-xl h-12"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact & Social */}
            <Card className="rounded-3xl border-border-subtle shadow-sm">
              <CardHeader>
                <CardTitle className="font-heading flex items-center gap-2">
                  <Phone size={20} className="text-primary" /> Contato & Redes
                </CardTitle>
                <CardDescription>Facilite o contato dos seus clientes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="flex items-center gap-1">
                    <MessageCircle size={14} className="text-green-500" /> WhatsApp
                  </Label>
                  <Input 
                    id="whatsapp" 
                    name="whatsapp" 
                    value={formData.whatsapp} 
                    onChange={handleInputChange} 
                    className="bg-surface border-none rounded-xl h-12"
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Telefones Adicionais</Label>
                  {formData.phones.map((phone: string, index: number) => (
                    <div key={index} className="flex gap-2">
                      <Input 
                        value={phone} 
                        onChange={(e) => handlePhoneChange(index, e.target.value)} 
                        className="bg-surface border-none rounded-xl h-12 flex-1"
                        placeholder="Outro telefone"
                      />
                      {formData.phones.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removePhone(index)}
                          className="text-red-500 hover:bg-red-50 rounded-xl"
                        >
                          <Trash2 size={18} />
                        </Button>
                      )}
                    </div>
                  ))}
                  {formData.phones.length < 5 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={addPhone}
                      className="w-full border-dashed border-primary/30 text-primary hover:bg-surface rounded-xl"
                    >
                      <Plus size={14} className="mr-1" /> Adicionar Telefone
                    </Button>
                  )}
                </div>

                <Separator className="bg-border-subtle/50" />

                <div className="space-y-4">
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-500" size={18} />
                    <Input 
                      name="socialLinks.instagram" 
                      value={formData.socialLinks.instagram} 
                      onChange={handleInputChange} 
                      className="pl-10 bg-surface border-none rounded-xl h-11 text-sm"
                      placeholder="Instagram URL"
                    />
                  </div>
                  <div className="relative">
                    <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" size={18} />
                    <Input 
                      name="socialLinks.facebook" 
                      value={formData.socialLinks.facebook} 
                      onChange={handleInputChange} 
                      className="pl-10 bg-surface border-none rounded-xl h-11 text-sm"
                      placeholder="Facebook URL"
                    />
                  </div>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-700" size={18} />
                    <Input 
                      name="socialLinks.linkedin" 
                      value={formData.socialLinks.linkedin} 
                      onChange={handleInputChange} 
                      className="pl-10 bg-surface border-none rounded-xl h-11 text-sm"
                      placeholder="LinkedIn URL"
                    />
                  </div>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <Input 
                      name="socialLinks.website" 
                      value={formData.socialLinks.website} 
                      onChange={handleInputChange} 
                      className="pl-10 bg-surface border-none rounded-xl h-11 text-sm"
                      placeholder="Seu Website"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bio Section */}
          <Card className="rounded-3xl border-border-subtle shadow-sm">
            <CardHeader>
              <CardTitle className="font-heading">Bio & Descrição</CardTitle>
              <CardDescription>Conte um pouco sobre você ou sua empresa para a comunidade.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                name="bio" 
                value={formData.bio} 
                onChange={handleInputChange} 
                placeholder="Descreva seus serviços, valores e experiência..."
                className="bg-surface border-none rounded-2xl min-h-[150px] p-4 text-base"
              />
            </CardContent>
          </Card>

          {/* Gallery Section */}
          <Card className="rounded-3xl border-border-subtle shadow-sm">
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <ImageIcon size={20} className="text-primary" /> Galeria de Fotos (Máx 5)
              </CardTitle>
              <CardDescription>Mostre fotos do seu trabalho ou empresa.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {formData.gallery.map((url: string, index: number) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-2">
                      <Input 
                        value={url} 
                        onChange={(e) => handleGalleryChange(index, e.target.value)} 
                        className="bg-surface border-none rounded-xl h-11 text-sm"
                        placeholder="URL da imagem"
                      />
                      {url && (
                        <div className="aspect-video rounded-xl overflow-hidden border border-border-subtle bg-surface">
                          <img src={url} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeGalleryImage(index)}
                      className="text-red-500 hover:bg-red-50 rounded-xl mt-1"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                ))}
              </div>
              {formData.gallery.length < 5 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addGalleryImage}
                  className="w-full border-dashed border-primary/30 text-primary hover:bg-surface rounded-xl h-12"
                >
                  <Plus size={18} className="mr-2" /> Adicionar Foto à Galeria
                </Button>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 pt-6">
            <Link href="/">
              <Button variant="ghost" className="rounded-xl px-8 font-bold text-text-muted">Cancelar</Button>
            </Link>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-primary text-white font-bold rounded-xl px-12 h-12 shadow-xl shadow-primary/20"
            >
              {loading ? 'Salvando...' : 'Salvar Perfil'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
