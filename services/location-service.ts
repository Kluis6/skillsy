export interface LocationData {
  city: string;
  state: string;
  display: string;
}

export class LocationService {
  static async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não suportada pelo seu navegador'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10`,
              {
                headers: {
                  'Accept-Language': 'pt-BR'
                }
              }
            );
            
            const data = await response.json();
            
            if (!data.address) {
              reject(new Error('Endereço não encontrado para estas coordenadas'));
              return;
            }

            const city = data.address.city || data.address.town || data.address.village || data.address.municipality || 'Cidade Desconhecida';
            const state = data.address.state || '';
            
            // Map common state names to 2-letter codes for Brazil (optional but good for consistency with ViaCEP)
            const stateMap: Record<string, string> = {
              'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM', 'Bahia': 'BA',
              'Ceará': 'CE', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES', 'Goiás': 'GO',
              'Maranhão': 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS', 'Minas Gerais': 'MG',
              'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR', 'Pernambuco': 'PE', 'Piauí': 'PI',
              'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN', 'Rio Grande do Sul': 'RS',
              'Rondônia': 'RO', 'Roraima': 'RR', 'Santa Catarina': 'SC', 'São Paulo': 'SP',
              'Sergipe': 'SE', 'Tocantins': 'TO'
            };

            const stateCode = stateMap[state] || state;

            resolve({
              city,
              state: stateCode,
              display: `${city}, ${stateCode}`
            });
          } catch (error) {
            console.error('Error reverse geocoding:', error);
            reject(new Error('Erro ao obter os detalhes do endereço'));
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          let msg = 'Erro ao obter localização';
          if (error.code === error.PERMISSION_DENIED) {
            msg = 'Permissão de localização negada';
          }
          reject(new Error(msg));
        },
        { timeout: 10000 }
      );
    });
  }
}
