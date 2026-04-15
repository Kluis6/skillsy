'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CepFilterProps {
  onLocationChange: (location: { city: string; state: string } | null) => void;
}

export function CepFilter({ onLocationChange }: CepFilterProps) {
  const [cep, setCep] = useState('');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ city: string; state: string } | null>(null);

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 8);
    setCep(value);

    if (value.length === 8) {
      setLoading(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${value}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          const newLocation = { city: data.localidade, state: data.uf };
          setLocation(newLocation);
          onLocationChange(newLocation);
        } else {
          setLocation(null);
          onLocationChange(null);
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        setLocation(null);
        onLocationChange(null);
      } finally {
        setLoading(false);
      }
    } else if (value.length < 8 && location) {
      setLocation(null);
      onLocationChange(null);
    }
  };

  const clearLocation = () => {
    setCep('');
    setLocation(null);
    onLocationChange(null);
  };

  return (
    <div className="flex flex-col gap-2 w-full md:w-auto">
      <div className="relative flex items-center group">
        <MapPin className="absolute left-3 text-text-muted/40 group-focus-within:text-primary transition-colors" size={16} />
        <Input
          placeholder="Filtrar por CEP"
          value={cep}
          onChange={handleCepChange}
          className="pl-10 pr-10 border-none bg-transparent h-12 w-full md:w-40 text-sm focus-visible:ring-0 font-bold placeholder:text-text-muted/30 placeholder:font-medium"
          maxLength={8}
        />
        {loading && (
          <Loader2 className="absolute right-3 animate-spin text-primary" size={16} />
        )}
        {!loading && location && (
          <button 
            onClick={clearLocation}
            className="absolute right-3 text-text-muted/40 hover:text-primary transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>
      {location && (
        <div className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold rounded-full flex items-center gap-1 animate-in fade-in slide-in-from-top-1 border border-primary/10 absolute -bottom-8 left-0 whitespace-nowrap">
          <MapPin size={10} />
          {location.city} - {location.state}
        </div>
      )}
    </div>
  );
}
