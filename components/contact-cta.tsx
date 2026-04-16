'use client';

import React from 'react';
import { ShieldCheck, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, ContactFormData } from '@/lib/validations';

export function ContactCTA() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    }
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Mensagem enviada!', { 
        description: 'Obrigado pelo contato. Retornaremos em breve.' 
      });
      reset();
    } catch (error) {
      toast.error('Erro ao enviar mensagem');
    }
  };

  return (
    <section className="mt-24 bg-primary rounded-[2.5rem] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl shadow-primary/30">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full -ml-32 -mb-32 blur-3xl" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="max-w-xl text-center md:text-left">
          <h3 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">Dúvidas ou Sugestões?</h3>
          <p className="text-white/80 text-lg mb-8">
            Estamos aqui para ajudar você a encontrar o melhor serviço ou a divulgar o seu talento. 
            Faça parte da nossa rede de excelência.
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
              <ShieldCheck size={18} className="text-accent" />
              <span className="text-sm font-bold">Seguro & Confiável</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
              <Star size={18} className="text-highlight" />
              <span className="text-sm font-bold">Qualidade SUD</span>
            </div>
          </div>
        </div>
        
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl">
          <h4 className="text-text-main text-xl font-bold mb-6 text-center">Fale Conosco</h4>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Input 
                placeholder="Ex: João Silva" 
                {...register('name')}
                className="bg-surface border-none h-12 rounded-xl text-text-main placeholder:text-text-muted/50" 
              />
              {errors.name && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <Input 
                placeholder="Ex: joao@exemplo.com" 
                type="email"
                {...register('email')}
                className="bg-surface border-none h-12 rounded-xl text-text-main placeholder:text-text-muted/50" 
              />
              {errors.email && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.email.message}</p>}
            </div>
            <div className="space-y-1">
              <textarea 
                placeholder="Ex: Gostaria de saber mais sobre como anunciar meus serviços..." 
                {...register('message')}
                className="w-full bg-surface border-none rounded-xl p-4 text-text-main placeholder:text-text-muted/50 h-32 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
              {errors.message && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.message.message}</p>}
            </div>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-white h-12 rounded-xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
