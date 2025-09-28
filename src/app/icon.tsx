import { BrainCircuit } from 'lucide-react';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'hsl(228 51% 33%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'hsl(210 40% 98%)',
          borderRadius: '8px'
        }}
      >
        <BrainCircuit size={24} />
      </div>
    ),
    {
      ...size,
    }
  );
}
