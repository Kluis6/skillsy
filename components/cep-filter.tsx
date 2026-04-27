"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, X, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationService } from "@/services/location-service";
import { toast } from "sonner";

interface CepFilterProps {
  onLocationChange: (location: { city: string; state: string } | null) => void;
  initialLocation?: { city: string; state: string } | null;
}

export function CepFilter({
  onLocationChange,
  initialLocation,
}: CepFilterProps) {
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{
    city: string;
    state: string;
  } | null>(initialLocation || null);

  useEffect(() => {
    if (initialLocation) {
      setLocation(initialLocation);
    } else {
      setLocation(null);
      setCep("");
    }
  }, [initialLocation]);

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 8);
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
          setError("CEP não encontrado");
        }
      } catch (err) {
        console.error("Erro ao buscar CEP:", err);
        setLocation(null);
        onLocationChange(null);
        setError("Erro ao buscar CEP");
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

  const handleDetectLocation = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await LocationService.getCurrentLocation();
      const newLocation = { city: data.city, state: data.state };
      setLocation(newLocation);
      onLocationChange(newLocation);
      setCep(""); // Clear CEP if using GPS
      toast.success("Localização detectada!", {
        description: `${data.city}, ${data.state}`,
      });
    } catch (err: any) {
      setError(err.message);
      toast.error("Erro de geolocalização", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const clearLocation = () => {
    setCep("");
    setLocation(null);
    onLocationChange(null);
    setError(null);
  };

  return (
    <div className="">
      {location ? (
        <Button
          variant="outline"
          onClick={clearLocation}
          className="flex justify-center items-center px-7 py-5 "
        >
          <X className="size-4 text-gray-700" />
          <p className="text-gray-700">Remover localização</p>
        </Button>
      ) : (
        <Button
          variant="outline"
          onClick={handleDetectLocation}
          disabled={loading}
          className="py-5 px-7 text-gray-700 min-w-28 flex justify-between  text-center items-center"
        >
          {loading ? (
            <div className="w-full flex justify-center items-center">
              <Loader2 className="animate-spin text-primary size-4" />
            </div>
          ) : (
            <>
              <MapPin
                className={`transition-colors ${error ? "text-red-500" : "text-gray-700"}`}
              />
              <p>Sua localização</p>
            </>
          )}
        </Button>
      )}
    </div>
  );
}
