import { ImageResponse } from 'next/og';

export const alt = 'Skillsy - Rede de apoio comunitário com profissionais e serviços de confiança';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          padding: '56px',
          background:
            'linear-gradient(135deg, #f4efe2 0%, #d9f0e4 45%, #9fd7c1 100%)',
          color: '#12372a',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            height: '100%',
            borderRadius: '36px',
            padding: '40px',
            background: 'rgba(255, 255, 255, 0.82)',
            boxShadow: '0 18px 60px rgba(18, 55, 42, 0.12)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '88px',
                height: '88px',
                borderRadius: '24px',
                background: '#12372a',
                color: '#f4efe2',
                fontSize: '40px',
                fontWeight: 700,
              }}
            >
              S
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ fontSize: '30px', fontWeight: 600 }}>Skillsy</div>
              <div style={{ fontSize: '22px', color: '#335c4c' }}>
                Rede de apoio comunitario SUD
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              maxWidth: '820px',
            }}
          >
            <div style={{ fontSize: '68px', lineHeight: 1.05, fontWeight: 800 }}>
              Encontre profissionais e servicos de confianca
            </div>
            <div style={{ fontSize: '30px', lineHeight: 1.35, color: '#335c4c' }}>
              Conectando talentos, indicacoes e apoio mutuo em uma plataforma sem fins
              lucrativos.
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '24px',
              color: '#335c4c',
            }}
          >
            <div>skillsy.com.br</div>
            <div>Busca segura • Perfis publicos • Comunidade SUD</div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
