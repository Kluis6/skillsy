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
  Navigation,
  Loader2,
  Clock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Card,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { 
  Tooltip,
  TooltipContent,
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { LocationService } from '@/services/location-service';

const BRAZIL_STATES = [
  { label: 'Todos os Estados', value: 'all' },
  { label: 'Acre', value: 'AC' },
  { label: 'Alagoas', value: 'AL' },
  { label: 'Amapá', value: 'AP' },
  { label: 'Amazonas', value: 'AM' },
  { label: 'Bahia', value: 'BA' },
  { label: 'Ceará', value: 'CE' },
  { label: 'Distrito Federal', value: 'DF' },
  { label: 'Espírito Santo', value: 'ES' },
  { label: 'Goiás', value: 'GO' },
  { label: 'Maranhão', value: 'MA' },
  { label: 'Mato Grosso', value: 'MT' },
  { label: 'Mato Grosso do Sul', value: 'MS' },
  { label: 'Minas Gerais', value: 'MG' },
  { label: 'Pará', value: 'PA' },
  { label: 'Paraíba', value: 'PB' },
  { label: 'Paraná', value: 'PR' },
  { label: 'Pernambuco', value: 'PE' },
  { label: 'Piauí', value: 'PI' },
  { label: 'Rio de Janeiro', value: 'RJ' },
  { label: 'Rio Grande do Norte', value: 'RN' },
  { label: 'Rio Grande do Sul', value: 'RS' },
  { label: 'Rondônia', value: 'RO' },
  { label: 'Roraima', value: 'RR' },
  { label: 'Santa Catarina', value: 'SC' },
  { label: 'São Paulo', value: 'SP' },
  { label: 'Sergipe', value: 'SE' },
  { label: 'Tocantins', value: 'TO' },
];

export function AdminUsersClient() {
  const { profile, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWard, setFilterWard] = useState('');
  const [filterState, setFilterState] = useState('all');
  const [filterHasServices, setFilterHasServices] = useState(false);
  const [filterRecent, setFilterRecent] = useState(false);
  
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddAdminDialogOpen, setIsAddAdminDialogOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

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

    if (filterState !== 'all') {
      result = result.filter(u => 
        u.location?.toUpperCase().includes(filterState.toUpperCase())
      );
    }

    if (filterHasServices) {
      result = result.filter(u => u.isProvider);
    }

    if (filterRecent) {
      result.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });
    }

    setFilteredUsers(result);
    setCurrentPage(1); // Reset to first page when filters change
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
    
    // Ensure baptismYear is handled as a number even if stored as string
    const baptismYearValue = typeof user.baptismYear === 'string' 
      ? parseInt(user.baptismYear, 10) 
      : user.baptismYear;

    editForm.reset({
      name: user.name,
      location: user.location || '',
      ward: user.ward || '',
      serviceType: user.serviceType || '',
      role: user.role as 'user' | 'admin',
      isProvider: user.isProvider || false,
      verifiedMember: user.verifiedMember || false,
      isBlocked: user.isBlocked || false,
      baptismYear: baptismYearValue && !isNaN(baptismYearValue) ? baptismYearValue : null,
      availability: user.availability || [],
      serviceHours: user.serviceHours || '',
      businessAddress: user.businessAddress || '',
      businessAddressNumber: user.businessAddressNumber || '',
      businessNeighborhood: user.businessNeighborhood || '',
      businessState: user.businessState || '',
      businessComplement: user.businessComplement || '',
    });
    setIsEditDialogOpen(true);
  };

  const onSaveEdit = async (data: AdminEditUserFormData) => {
    if (!editingUser) return;
    try {
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-surface">
        <ShieldAlert size={64} className="text-red-500 mb-6" />
        <h1 className="text-3xl font-bold mb-4">Acesso Negado</h1>
        <p className="text-text-muted mb-8">Esta área é restrita a administradores do sistema.</p>
        <Link href="/">
          <Button className="bg-primary text-white font-bold rounded-xl px-8">Voltar para Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="pb-20 px-6 md:px-10 py-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
             <Link href="/admin">
               <Button variant="ghost" size="icon" className="rounded-full hover:bg-surface">
                 <ArrowLeft size={20} />
               </Button>
             </Link>
             <div>
               <h2 className="text-3xl font-bold text-text-main font-heading">Gerenciar Usuários</h2>
               <p className="text-text-muted mt-1">Total de {users.length} membros cadastrados.</p>
             </div>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline"
              onClick={handleSeedData}
              disabled={isSeeding}
              className="rounded-2xl px-6 font-bold h-11 border-border-subtle hover:bg-surface"
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
                <Label className="text-xs font-bold text-text-muted uppercase ml-1">Estado (UF)</Label>
                <Select value={filterState} onValueChange={(val) => setFilterState(val || 'all')}>
                  <SelectTrigger className="bg-surface border-none rounded-2xl h-12 text-sm w-full">
                    <SelectValue placeholder="Selecione o Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRAZIL_STATES.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
        <Card className="bg-card border-none shadow-sm rounded-[2.5rem] overflow-hidden mb-10">
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
                  filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((u) => (
                    <TableRow key={u.uid} className="border-border-subtle hover:bg-surface/30 transition-colors">
                      <TableCell className="py-5 pl-8">
                        <div className="flex items-center gap-4">
                          <Avatar size="lg" className="border border-border-subtle">
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
                        <div className="flex items-center justify-end gap-2">
                          <Tooltip>
                            <TooltipTrigger>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleToggleBlock(u)}
                                className={`w-9 h-9 rounded-xl transition-all ${
                                  u.isBlocked 
                                    ? 'text-green-600 hover:bg-green-50 hover:text-green-700 bg-green-50/10' 
                                    : 'text-red-500 hover:bg-red-50 hover:text-red-600'
                                }`}
                              >
                                {u.isBlocked ? <CheckCircle size={18} /> : <Ban size={18} />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="rounded-xl font-bold text-xs uppercase tracking-widest bg-white border-border-subtle shadow-xl px-3 py-2 text-text-main">
                              {u.isBlocked ? 'Desbloquear Acesso' : 'Bloquear Acesso'}
                            </TooltipContent>
                          </Tooltip>

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
                        </div>
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
          
          {/* Pagination UI */}
          {!loading && filteredUsers.length > 0 && (
            <div className="bg-surface/50 px-8 py-5 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs font-bold text-text-muted uppercase tracking-widest">
                Mostrando <span className="text-primary">{Math.min(filteredUsers.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}</span> - <span className="text-primary">{Math.min(filteredUsers.length, currentPage * ITEMS_PER_PAGE)}</span> de {filteredUsers.length} registros
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="w-9 h-9 rounded-xl hover:bg-primary/5 hover:text-primary disabled:opacity-30"
                >
                  <ChevronsLeft size={16} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="w-9 h-9 rounded-xl hover:bg-primary/5 hover:text-primary disabled:opacity-30"
                >
                  <ChevronLeft size={16} />
                </Button>
                
                <div className="flex items-center mx-2 gap-1">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Página</span>
                  <div className="bg-surface px-3 py-1.5 rounded-lg text-xs font-black text-primary border border-border-subtle/50 min-w-[2.5rem] text-center">
                    {currentPage}
                  </div>
                  <span className="text-xs font-bold text-text-muted uppercase tracking-widest">de {Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)}</span>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredUsers.length / ITEMS_PER_PAGE), prev + 1))}
                  disabled={currentPage === Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)}
                  className="w-9 h-9 rounded-xl hover:bg-primary/5 hover:text-primary disabled:opacity-30"
                >
                  <ChevronRight size={16} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setCurrentPage(Math.ceil(filteredUsers.length / ITEMS_PER_PAGE))}
                  disabled={currentPage === Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)}
                  className="w-9 h-9 rounded-xl hover:bg-primary/5 hover:text-primary disabled:opacity-30"
                >
                  <ChevronsRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-8 max-w-2xl overflow-y-auto max-h-[90vh]">
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

              <div className="md:col-span-2 space-y-4 pt-2">
                <h4 className="text-sm font-bold text-text-main border-l-4 border-primary pl-3">Endereço Comercial (Opcional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Endereço (Rua/Avenida)</Label>
                    <Input 
                      placeholder="Ex: Rua das Flores"
                      {...editForm.register('businessAddress')}
                      className="bg-surface border-none rounded-2xl h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Número</Label>
                    <Input 
                      placeholder="Ex: 123"
                      {...editForm.register('businessAddressNumber')}
                      className="bg-surface border-none rounded-2xl h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Bairro</Label>
                    <Input 
                      placeholder="Ex: Centro"
                      {...editForm.register('businessNeighborhood')}
                      className="bg-surface border-none rounded-2xl h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Estado</Label>
                    <Input 
                      placeholder="Ex: SP"
                      {...editForm.register('businessState')}
                      className="bg-surface border-none rounded-2xl h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1">Complemento</Label>
                    <Input 
                      placeholder="Ex: Sala 10, Bloco B"
                      {...editForm.register('businessComplement')}
                      className="bg-surface border-none rounded-2xl h-12"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2 md:col-span-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1 flex items-center gap-1">
                  <CalendarDays size={12} /> Disponibilidade
                </Label>
                <div className="flex flex-wrap gap-2">
                  {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => {
                    const isSelected = editForm.watch('availability')?.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          const current = editForm.getValues('availability') || [];
                          const next = isSelected 
                            ? current.filter(d => d !== day)
                            : [...current, day];
                          editForm.setValue('availability', next, { shouldDirty: true });
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
              <div className="space-y-2 pt-2 md:col-span-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-text-muted ml-1 flex items-center gap-1">
                  <Clock size={12} /> Horário de Atendimento
                </Label>
                <Input 
                  {...editForm.register('serviceHours')}
                  placeholder="Ex: 08:00 - 18:00 ou Por agendamento"
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
    </TooltipProvider>
  );
}
