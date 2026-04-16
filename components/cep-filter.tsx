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
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ city: string; state: string } | null>(null);

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 8);
    setCep(value);
    setError(null);

    if (value.length === 8) {
      setLoading(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${value}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          const newLocation = { city: data.localidade, state: data.uf };
          setLocation(newLocation);
          onLocationChange(newLocation);
          setError(null);
        } else {
          setLocation(null);
          onLocationChange(null);
          setError('CEP não encontrado');
        }
      } catch (err) {
        console.error('Erro ao buscar CEP:', err);
        setLocation(null);
        onLocationChange(null);
        setError('Erro ao buscar CEP');
      } finally {
        setLoading(false);
      }
    } else if (value.length > 0 && value.length < 8) {
      setLocation(null);
      onLocationChange(null);
    } else if (value.length === 0) {
      setLocation(null);
      onLocationChange(null);
      setError(null);
    }
  };

  const clearLocation = () => {
    setCep('');
    setLocation(null);
    onLocationChange(null);
    setError(null);
  };

  return (
    <div className="flex flex-col gap-2 w-full md:w-auto relative">
      <div className="relative flex items-center group">
        <MapPin className={`absolute left-3 transition-colors ${error ? 'text-red-500' : 'text-text-muted/40 group-focus-within:text-primary'}`} size={16} />
        <Input
          placeholder="Ex: 01001-000"
          value={cep}
          onChange={handleCepChange}
          className={`pl-10 pr-10 border-none bg-surface h-12 w-full md:w-48 text-sm rounded-2xl focus-visible:ring-2 focus-visible:ring-primary/20 font-bold placeholder:text-text-muted/30 placeholder:font-medium transition-all ${error ? 'text-red-500 ring-2 ring-red-100' : ''}`}
          maxLength={8}
        />
        {loading && (
          <Loader2 className="absolute right-3 animate-spin text-primary" size={16} />
        )}
        {!loading && (location || cep.length > 0) && (
          <button 
            onClick={clearLocation}
            className="absolute right-3 text-text-muted/40 hover:text-primary transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>
      
      <div className="flex items-center gap-2 px-1">
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-all duration-300 ${
          location 
            ? 'bg-primary/5 text-primary border-primary/10' 
            : error 
              ? 'bg-red-50 text-red-500 border-red-100'
              : 'bg-surface text-text-muted border-border-subtle'
        }`}>
          <MapPin size={10} />
          {location ? `${location.city} - ${location.state}` : error ? error : 'Todo o Brasil'}
        </div>
      </div>
    </div>
  );
}
