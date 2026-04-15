'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { UserService } from '@/services/user-service';
import { UserProfile } from '@/models/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Filter, 
  ShieldAlert, 
  ShieldCheck, 
  Edit3, 
  Ban, 
  CheckCircle,
  ArrowLeft,
  Briefcase,
  Church,
  MapPin,
  Calendar
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import Link from 'next/link';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function AdminPanel() {
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
  const [editFormData, setEditFormData] = useState<Partial<UserProfile>>({});

  const fetchUsers = async () => {
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
  };

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
  }, [profile]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleEditClick = (user: UserProfile) => {
    setEditingUser(user);
    setEditFormData({ ...user });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    try {
      await UserService.adminUpdateUser(editingUser.uid, editFormData);
      toast.success('Usuário atualizado com sucesso');
      setIsEditDialogOpen(false);
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Erro ao atualizar usuário');
    }
  };

  const handleToggleBlock = async (user: UserProfile) => {
    const newBlockedState = !user.isBlocked;
    try {
      await UserService.adminUpdateUser(user.uid, { isBlocked: newBlockedState });
      toast.success(newBlockedState ? 'Usuário bloqueado' : 'Usuário desbloqueado');
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error('Error toggling block state:', error);
      toast.error('Erro ao alterar estado de bloqueio');
    }
  };

  if (authLoading) return <div className="p-10 text-center">Carregando...</div>;

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert size={64} className="text-red-500 mb-6" />
        <h1 className="text-3xl font-bold mb-4">Acesso Negado</h1>
        <p className="text-text-muted mb-8">Você não tem permissão para acessar esta área.</p>
        <Link href="/">
          <Button className="bg-primary text-white font-bold rounded-xl px-8">Voltar para Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-20">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border-subtle px-6 md:px-10 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-surface">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <h1 className="text-xl font-bold tracking-tight text-text-main font-heading flex items-center gap-2">
              <Users size={24} className="text-primary" /> Painel Administrativo
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold px-3 py-1">
              Admin Mode
            </Badge>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <Card className="rounded-3xl border-border-subtle shadow-sm sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg font-heading flex items-center gap-2">
                  <Filter size={18} className="text-primary" /> Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Busca por Nome/Email</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <Input 
                      placeholder="Pesquisar..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-surface border-none rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Filtrar por Ala</Label>
                  <div className="relative">
                    <Church className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <Input 
                      placeholder="Nome da Ala" 
                      value={filterWard}
                      onChange={(e) => setFilterWard(e.target.value)}
                      className="pl-10 bg-surface border-none rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Filtrar por Estado</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <Input 
                      placeholder="Ex: SP, RJ..." 
                      value={filterState}
                      onChange={(e) => setFilterState(e.target.value)}
                      className="pl-10 bg-surface border-none rounded-xl"
                    />
                  </div>
                </div>

                <Separator className="bg-border-subtle/50" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 cursor-pointer" htmlFor="has-services">
                      <Briefcase size={16} className="text-text-muted" /> Apenas Prestadores
                    </Label>
                    <Switch 
                      id="has-services"
                      checked={filterHasServices}
                      onCheckedChange={setFilterHasServices}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 cursor-pointer" htmlFor="recent">
                      <Calendar size={16} className="text-text-muted" /> Mais Recentes
                    </Label>
                    <Switch 
                      id="recent"
                      checked={filterRecent}
                      onCheckedChange={setFilterRecent}
                    />
                  </div>
                </div>

                <Button 
                  variant="ghost" 
                  className="w-full rounded-xl text-text-muted hover:text-primary"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterWard('');
                    setFilterState('');
                    setFilterHasServices(false);
                    setFilterRecent(false);
                  }}
                >
                  Limpar Filtros
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* User List */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="rounded-[2.5rem] border-border-subtle shadow-xl shadow-primary/5 overflow-hidden">
              <CardHeader className="bg-white border-b border-border-subtle p-8">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl font-heading">Usuários</CardTitle>
                    <CardDescription>Gerencie os membros da sua comunidade ({filteredUsers.length} encontrados)</CardDescription>
                  </div>
                  <Button onClick={fetchUsers} variant="outline" className="rounded-xl">
                    Atualizar Lista
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-surface/50 hover:bg-surface/50 border-border-subtle">
                      <TableHead className="w-[300px] pl-8">Usuário</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ala / Local</TableHead>
                      <TableHead className="text-right pr-8">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-32 text-center text-text-muted">
                          Carregando usuários...
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-32 text-center text-text-muted">
                          Nenhum usuário encontrado com os filtros atuais.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.uid} className="hover:bg-surface/30 border-border-subtle transition-colors">
                          <TableCell className="pl-8 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10 border border-border-subtle">
                                <AvatarImage src={user.photoURL} />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                  {user.name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-bold text-text-main flex items-center gap-1">
                                  {user.name}
                                  {user.verifiedMember && <CheckCircle size={14} className="text-primary" />}
                                </span>
                                <span className="text-xs text-text-muted">{user.email}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge 
                                variant={user.role === 'admin' ? 'default' : 'secondary'}
                                className="w-fit text-[10px] uppercase tracking-wider font-bold"
                              >
                                {user.role}
                              </Badge>
                              {user.isBlocked && (
                                <Badge variant="destructive" className="w-fit text-[10px] uppercase tracking-wider font-bold">
                                  Bloqueado
                                </Badge>
                              )}
                              {user.isProvider && (
                                <Badge variant="outline" className="w-fit text-[10px] uppercase tracking-wider font-bold border-green-200 text-green-600 bg-green-50">
                                  Prestador
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col text-sm">
                              <span className="text-text-main font-medium">{user.ward || 'Sem Ala'}</span>
                              <span className="text-text-muted text-xs">{user.location || 'Sem Local'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right pr-8">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="rounded-xl hover:bg-primary/10 hover:text-primary"
                                onClick={() => handleEditClick(user)}
                              >
                                <Edit3 size={18} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className={`rounded-xl ${user.isBlocked ? 'text-green-500 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'}`}
                                onClick={() => handleToggleBlock(user)}
                              >
                                {user.isBlocked ? <ShieldCheck size={18} /> : <Ban size={18} />}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-[2.5rem] max-w-2xl p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="bg-primary p-8 text-white">
            <DialogTitle className="text-2xl font-heading">Editar Usuário</DialogTitle>
            <DialogDescription className="text-white/80">
              Alterando informações de {editingUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input 
                  value={editFormData.name || ''} 
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="bg-surface border-none rounded-xl h-12"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  value={editFormData.email || ''} 
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="bg-surface border-none rounded-xl h-12"
                />
              </div>
              <div className="space-y-2">
                <Label>Ala (Igreja)</Label>
                <Input 
                  value={editFormData.ward || ''} 
                  onChange={(e) => setEditFormData({ ...editFormData, ward: e.target.value })}
                  className="bg-surface border-none rounded-xl h-12"
                />
              </div>
              <div className="space-y-2">
                <Label>Localização (Cidade/Estado)</Label>
                <Input 
                  value={editFormData.location || ''} 
                  onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                  className="bg-surface border-none rounded-xl h-12"
                />
              </div>
            </div>

            <Separator className="bg-border-subtle/50" />

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className="text-base font-bold">Permissões & Status</Label>
                <div className="flex items-center justify-between p-4 bg-surface rounded-2xl">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">Administrador</span>
                    <span className="text-xs text-text-muted">Acesso total ao painel</span>
                  </div>
                  <Switch 
                    checked={editFormData.role === 'admin'}
                    onCheckedChange={(checked) => setEditFormData({ ...editFormData, role: checked ? 'admin' : 'user' })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-surface rounded-2xl">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">Bloqueado</span>
                    <span className="text-xs text-text-muted">Impedir acesso ao app</span>
                  </div>
                  <Switch 
                    checked={editFormData.isBlocked === true}
                    onCheckedChange={(checked) => setEditFormData({ ...editFormData, isBlocked: checked })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-bold">Verificação</Label>
                <div className="flex items-center justify-between p-4 bg-surface rounded-2xl">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">Membro Verificado</span>
                    <span className="text-xs text-text-muted">Selo de confiança</span>
                  </div>
                  <Switch 
                    checked={editFormData.verifiedMember === true}
                    onCheckedChange={(checked) => setEditFormData({ ...editFormData, verifiedMember: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-surface rounded-2xl">
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">Prestador</span>
                    <span className="text-xs text-text-muted">Habilitar serviços</span>
                  </div>
                  <Switch 
                    checked={editFormData.isProvider === true}
                    onCheckedChange={(checked) => setEditFormData({ ...editFormData, isProvider: checked })}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="bg-surface p-6 gap-3">
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl px-6 font-bold">
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} className="bg-primary text-white rounded-xl px-10 font-bold shadow-lg shadow-primary/20">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
