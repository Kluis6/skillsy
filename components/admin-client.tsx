'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { UserService } from '@/services/user-service';
import { UserProfile } from '@/models/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  adminEditUserSchema, 
  AdminEditUserFormData, 
  adminCreateAdminSchema, 
  AdminCreateAdminFormData 
} from '@/lib/validations';
import { 
  Users, 
  Search, 
  Filter, 
  ShieldAlert, 
  ShieldCheck, 
  Edit3, 
  Ban, 
  CheckCircle,
  Star,
  ArrowLeft,
  Briefcase,
  Church,
  MapPin,
  Mail,
  Calendar,
  MoreVertical,
  Trash2,
  X,
  Navigation,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { Skeleton } from "@/components/ui/skeleton";

import { ThemeToggle } from '@/components/theme-toggle';
import { LocationService } from '@/services/location-service';

export function AdminClient() {
  const { profile, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWard, setFilterWard] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterHasServices, setFilterHasServices] = useState(false);
  const [filterRecent, setFilterRecent] = useState(false);
  
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddAdminDialogOpen, setIsAddAdminDialogOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const editForm = useForm<AdminEditUserFormData>({
    resolver: zodResolver(adminEditUserSchema),
  });

  const adminForm = useForm<AdminCreateAdminFormData>({
    resolver: zodResolver(adminCreateAdminSchema),
    defaultValues: { name: '', email: '' }
  });

  const [detectingLocation, setDetectingLocation] = useState(false);

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    try {
      const data = await LocationService.getCurrentLocation();
      editForm.setValue('location', data.display, { shouldValidate: true });
      toast.success('Localização detectada!', { description: data.display });
    } catch (error: any) {
      toast.error('Erro de geolocalização', { description: error.message });
    } finally {
      setDetectingLocation(false);
    }
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const allUsers = await UserService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }, []);

  const applyFilters = useCallback(() => {
    let result = [...users];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(u => 
        u.name.toLowerCase().includes(term) || 
        u.email.toLowerCase().includes(term)
      );
    }

    if (filterWard) {
      result = result.filter(u => u.ward?.toLowerCase().includes(filterWard.toLowerCase()));
    }

    if (filterState) {
      result = result.filter(u => u.location?.toLowerCase().includes(filterState.toLowerCase()));
    }

    if (filterHasServices) {
      result = result.filter(u => u.isProvider);
    }

    if (filterRecent) {
      // Sort by createdAt descending
      result.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });
    }

    setFilteredUsers(result);
  }, [users, searchTerm, filterWard, filterState, filterHasServices, filterRecent]);

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchUsers();
    }
  }, [profile, fetchUsers]);

  useEffect(() => {
    if (profile?.role === 'admin') {
      applyFilters();
    }
  }, [applyFilters, profile]);

  const handleEditClick = (user: UserProfile) => {
    setEditingUser(user);
    editForm.reset({
      name: user.name,
      location: user.location || '',
      ward: user.ward || '',
      serviceType: user.serviceType || '',
      role: user.role as 'user' | 'admin',
      isProvider: user.isProvider || false,
      verifiedMember: user.verifiedMember || false,
      isBlocked: user.isBlocked || false,
      baptismYear: user.baptismYear || null,
    });
    setIsEditDialogOpen(true);
  };

  const onSaveEdit = async (data: AdminEditUserFormData) => {
    if (!editingUser) return;
    try {
      // Clean empty strings to null
      const sanitizedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, value === '' ? null : value])
      );

      await UserService.adminUpdateUser(editingUser.uid, sanitizedData);
      toast.success('Usuário atualizado com sucesso');
      setIsEditDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error('Erro ao atualizar usuário');
    }
  };

  const onCreateAdmin = async (data: AdminCreateAdminFormData) => {
    try {
      // Check if email already exists
      const existing = await UserService.getProfileByEmail(data.email);
      if (existing) {
        toast.error('Este e-mail já está cadastrado');
        return;
      }

      const tempId = `pre_${Math.random().toString(36).substring(2, 11)}`;
      const newAdmin: Partial<UserProfile> = {
        uid: tempId,
        name: data.name,
        email: data.email,
        role: 'admin',
        isProvider: false,
        contacts: [],
      };

      await UserService.createProfile(newAdmin);
      toast.success('Administrador pré-cadastrado com sucesso!');
      setIsAddAdminDialogOpen(false);
      adminForm.reset();
      fetchUsers();
    } catch (error) {
      console.error('Error creating admin:', error);
      toast.error('Erro ao criar administrador');
    }
  };

  const handleToggleBlock = async (user: UserProfile) => {
    try {
      await UserService.adminUpdateUser(user.uid, { isBlocked: !user.isBlocked });
      toast.success(user.isBlocked ? 'Usuário desbloqueado' : 'Usuário bloqueado');
      fetchUsers();
    } catch (error) {
      toast.error('Erro ao alterar status do usuário');
    }
  };

  const handleToggleVerify = async (user: UserProfile) => {
    try {
      await UserService.adminUpdateUser(user.uid, { verifiedMember: !user.verifiedMember });
      toast.success(user.verifiedMember ? 'Verificação removida' : 'Usuário verificado');
      fetchUsers();
    } catch (error) {
      toast.error('Erro ao alterar verificação');
    }
  };

  const handleSeedData = async () => {
    if (!confirm('Isso irá gerar 5 usuários de teste no banco de dados. Deseja continuar?')) return;
    
    setIsSeeding(true);
    try {
      await UserService.seedUsers();
      toast.success('Dados de teste gerados com sucesso!');
      fetchUsers();
    } catch (error) {
      toast.error('Erro ao gerar dados de teste');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="pb-20 px-6 md:px-10 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-bold text-text-main font-heading">Dashboard Administrativo</h2>
          <p className="text-text-muted mt-1">Gerencie usuários, verificações e configurações da plataforma.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline"
            onClick={handleSeedData}
            disabled={isSeeding}
            className="rounded-2xl px-6 font-bold h-11 border-primary/20 text-primary hover:bg-primary/5"
          >
            {isSeeding ? 'Gerando...' : 'Gerar Dados'}
          </Button>
          <Button 
            onClick={() => setIsAddAdminDialogOpen(true)}
            className="bg-primary text-white hover:bg-primary/90 rounded-2xl px-6 font-bold shadow-lg shadow-primary/20 h-11"
          >
            <ShieldCheck size={18} className="mr-2" /> Novo Admin
          </Button>
        </div>
      </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="bg-card border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Total de Usuários</CardDescription>
              <CardTitle className="text-4xl font-bold font-heading">{users.length}</CardTitle>
            </CardHeader>
            <div className="h-1 bg-primary/20 w-full" />
          </Card>
          <Card className="bg-card border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Prestadores de Serviço</CardDescription>
              <CardTitle className="text-4xl font-bold font-heading">{users.filter(u => u.isProvider).length}</CardTitle>
            </CardHeader>
            <div className="h-1 bg-green-500/20 w-full" />
          </Card>
          <Card className="bg-card border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Membros Verificados</CardDescription>
              <CardTitle className="text-4xl font-bold font-heading">{users.filter(u => u.verifiedMember).length}</CardTitle>
            </CardHeader>
            <div className="h-1 bg-highlight/20 w-full" />
          </Card>
        </div>

        {/* Filters & Search */}
        <Card className="bg-card border-none shadow-sm rounded-[2.5rem] p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-end">
            <div className="flex-grow space-y-2 w-full">
              <Label className="text-xs font-bold text-text-muted uppercase ml-1">Buscar Usuário</Label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <Input 
                  placeholder="Ex: João ou joao@exemplo.com" 
                  className="pl-12 bg-surface border-none rounded-2xl h-12 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full lg:w-auto">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-text-muted uppercase ml-1">Ala/Ramo</Label>
                <Input 
                  placeholder="Ex: Ala Centro" 
                  className="bg-surface border-none rounded-2xl h-12 text-sm"
                  value={filterWard}
                  onChange={(e) => setFilterWard(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-text-muted uppercase ml-1">Estado</Label>
                <Input 
                  placeholder="Ex: SP" 
                  className="bg-surface border-none rounded-2xl h-12 text-sm"
                  value={filterState}
                  onChange={(e) => setFilterState(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 h-12 px-4 bg-surface rounded-2xl">
                <Switch 
                  id="providers-only" 
                  checked={filterHasServices}
                  onCheckedChange={setFilterHasServices}
                />
                <Label htmlFor="providers-only" className="text-sm font-medium cursor-pointer">Apenas Prestadores</Label>
              </div>
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card className="bg-card border-none shadow-sm rounded-[2.5rem] overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-surface/50">
                <TableRow className="border-border-subtle hover:bg-transparent">
                  <TableHead className="w-[300px] py-6 pl-8 font-bold text-text-muted uppercase text-[10px] tracking-widest">Usuário</TableHead>
                  <TableHead className="font-bold text-text-muted uppercase text-[10px] tracking-widest">Localização / Ala</TableHead>
                  <TableHead className="font-bold text-text-muted uppercase text-[10px] tracking-widest">Status</TableHead>
                  <TableHead className="font-bold text-text-muted uppercase text-[10px] tracking-widest">Avaliação</TableHead>
                  <TableHead className="text-right pr-8 font-bold text-text-muted uppercase text-[10px] tracking-widest">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-20 text-center text-text-muted">Carregando dados...</TableCell>
                  </TableRow>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <TableRow key={u.uid} className="border-border-subtle hover:bg-surface/30 transition-colors">
                      <TableCell className="py-5 pl-8">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-10 h-10 border border-border-subtle">
                            <AvatarImage src={u.photoURL} />
                            <AvatarFallback className="bg-primary/5 text-primary font-bold">{u.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-bold text-text-main flex items-center gap-1">
                              {u.name}
                              {u.verifiedMember && <ShieldCheck size={14} className="text-primary" />}
                              {u.role === 'admin' && <Badge variant="secondary" className="text-[8px] h-4 px-1 bg-red-50 text-red-500 border-red-100">Admin</Badge>}
                            </span>
                            <span className="text-xs text-text-muted flex items-center gap-1"><Mail size={10} /> {u.email}</span>
                            {(u.companyName || u.category) && (
                              <span className="text-[10px] text-primary font-bold mt-0.5">
                                {u.companyName && <span>{u.companyName}</span>}
                                {u.companyName && u.category && <span> • </span>}
                                {u.category && <span>{u.category}</span>}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-text-main flex items-center gap-1"><MapPin size={12} className="text-text-muted" /> {u.location || 'N/A'}</span>
                          <span className="text-xs text-text-muted flex items-center gap-1"><Church size={12} className="text-text-muted" /> {u.ward || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {u.isProvider ? (
                            <Badge className="bg-green-50 text-green-600 border-green-100 text-[10px]">Prestador</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-text-muted">Membro</Badge>
                          )}
                          {u.isBlocked && (
                            <Badge className="bg-red-50 text-red-600 border-red-100 text-[10px]">Bloqueado</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-bold text-highlight text-sm">
                          <Star size={14} fill="currentColor" /> {u.rating || '0.0'}
                          <span className="text-text-muted font-normal text-xs ml-1">({u.reviewCount || 0})</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-surface transition-colors cursor-pointer outline-none">
                            <MoreVertical size={18} />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl border-border-subtle shadow-xl p-2 w-48">
                            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-3 py-2">Gerenciar</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditClick(u)} className="rounded-xl cursor-pointer focus:bg-primary/5 focus:text-primary">
                              <Edit3 size={16} className="mr-2" /> Editar Perfil
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleVerify(u)} className="rounded-xl cursor-pointer focus:bg-primary/5 focus:text-primary">
                              <ShieldCheck size={16} className="mr-2" /> {u.verifiedMember ? 'Remover Verificação' : 'Verificar Membro'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border-subtle my-1" />
                            <DropdownMenuItem 
                              onClick={() => handleToggleBlock(u)} 
                              className={`rounded-xl cursor-pointer ${u.isBlocked ? 'text-green-600 focus:bg-green-50 focus:text-green-600' : 'text-red-600 focus:bg-red-50 focus:text-red-600'}`}
                            >
                              {u.isBlocked ? (
                                <><CheckCircle size={16} className="mr-2" /> Desbloquear</>
                              ) : (
                                <><Ban size={16} className="mr-2" /> Bloquear Usuário</>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-20 text-center text-text-muted">Nenhum usuário encontrado com estes filtros.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-8 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-heading">Editar Perfil de Usuário</DialogTitle>
            <DialogDescription>
              Altere as informações cadastrais e permissões do membro.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={editForm.handleSubmit(onSaveEdit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Nome Completo</Label>
                <Input 
                  id="name" 
                  placeholder="Ex: João da Silva"
                  {...editForm.register('name')}
                  className="bg-surface border-none rounded-2xl h-12"
                />
                {editForm.formState.errors.name && <p className="text-[10px] text-red-500 font-bold ml-2">{editForm.formState.errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">E-mail</Label>
                <Input 
                  id="email" 
                  value={editingUser?.email || ''} 
                  disabled
                  className="bg-surface border-none rounded-2xl h-12 opacity-60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Localização</Label>
                <div className="flex gap-2">
                  <Input 
                    id="location" 
                    placeholder="Ex: São Paulo, SP"
                    {...editForm.register('location')}
                    className="bg-surface border-none rounded-2xl h-12 flex-grow"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleDetectLocation}
                    disabled={detectingLocation}
                    className="shrink-0 h-12 w-12 rounded-2xl bg-surface border-none hover:bg-primary/5 hover:text-primary transition-all"
                    title="Detectar localização"
                  >
                    {detectingLocation ? <Loader2 size={18} className="animate-spin" /> : <Navigation size={18} />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ward" className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Ala / Ramo</Label>
                <Input 
                  id="ward" 
                  placeholder="Ex: Ala Centro"
                  {...editForm.register('ward')}
                  className="bg-surface border-none rounded-2xl h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceType" className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Serviço / Categoria</Label>
                <Input 
                  id="serviceType" 
                  placeholder="Ex: Pintura Residencial"
                  {...editForm.register('serviceType')}
                  className="bg-surface border-none rounded-2xl h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Papel no Sistema</Label>
                <select 
                  id="role"
                  {...editForm.register('role')}
                  className="w-full bg-surface border-none rounded-2xl h-12 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                >
                  <option value="user">Usuário Comum</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="baptismYear" className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Ano de Batismo</Label>
                <Input 
                  id="baptismYear" 
                  type="number"
                  placeholder="Ex: 2010"
                  {...editForm.register('baptismYear', { valueAsNumber: true })}
                  className="bg-surface border-none rounded-2xl h-12"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-6 p-6 bg-surface rounded-3xl mb-6">
              <div className="flex items-center gap-3">
                <Switch 
                  id="edit-isProvider" 
                  checked={editForm.watch('isProvider')}
                  onCheckedChange={(checked) => editForm.setValue('isProvider', checked)}
                />
                <Label htmlFor="edit-isProvider" className="text-sm font-bold cursor-pointer">Prestador de Serviço</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch 
                  id="edit-verified" 
                  checked={editForm.watch('verifiedMember')}
                  onCheckedChange={(checked) => editForm.setValue('verifiedMember', checked)}
                />
                <Label htmlFor="edit-verified" className="text-sm font-bold cursor-pointer">Membro Verificado</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch 
                  id="edit-blocked" 
                  checked={editForm.watch('isBlocked')}
                  onCheckedChange={(checked) => editForm.setValue('isBlocked', checked)}
                />
                <Label htmlFor="edit-blocked" className="text-sm font-bold text-red-600 cursor-pointer">Bloquear Acesso</Label>
              </div>
            </div>

            <DialogFooter className="gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="rounded-2xl h-12 px-8 font-bold">
                Cancelar
              </Button>
              <Button type="submit" disabled={editForm.formState.isSubmitting} className="bg-primary text-white hover:bg-primary/90 rounded-2xl h-12 px-8 font-bold shadow-lg shadow-primary/20">
                {editForm.formState.isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Admin Dialog */}
      <Dialog open={isAddAdminDialogOpen} onOpenChange={setIsAddAdminDialogOpen}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-8 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-heading">Novo Administrador</DialogTitle>
            <DialogDescription>
              Pré-cadastre um e-mail para ter acesso administrativo ao entrar na plataforma.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={adminForm.handleSubmit(onCreateAdmin)}>
            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <Label htmlFor="new-name" className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Nome</Label>
                <Input 
                  id="new-name" 
                  placeholder="Ex: João Silva"
                  {...adminForm.register('name')}
                  className="bg-surface border-none rounded-2xl h-12"
                />
                {adminForm.formState.errors.name && <p className="text-[10px] text-red-500 font-bold ml-2">{adminForm.formState.errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-email" className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">E-mail</Label>
                <Input 
                  id="new-email" 
                  type="email"
                  placeholder="Ex: joao@exemplo.com"
                  {...adminForm.register('email')}
                  className="bg-surface border-none rounded-2xl h-12"
                />
                {adminForm.formState.errors.email && <p className="text-[10px] text-red-500 font-bold ml-2">{adminForm.formState.errors.email.message}</p>}
              </div>
            </div>

            <DialogFooter className="gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsAddAdminDialogOpen(false)} className="rounded-2xl h-12 px-8 font-bold">
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={adminForm.formState.isSubmitting}
                className="bg-primary text-white hover:bg-primary/90 rounded-2xl h-12 px-8 font-bold shadow-lg shadow-primary/20"
              >
                {adminForm.formState.isSubmitting ? 'Criando...' : 'Criar Administrador'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
