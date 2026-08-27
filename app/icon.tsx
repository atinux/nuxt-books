import { ImageResponse } from 'next/og';

export const size = { height: 32, width: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          background: '#121212',
          borderRadius: 6,
          display: 'flex',
          height: '100%',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <svg fill="none" height="22" viewBox="0 0 24 24" width="22">
          <g stroke="#fafafa" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
            <path d="M12 6.5C10.4 5.2 8.4 4.5 6 4.5H3.5v13H6c2.4 0 4.4.7 6 2" />
            <path d="M12 6.5c1.6-1.3 3.6-2 6-2h2.5v13H18c-2.4 0-4.4.7-6 2" />
            <path d="M12 6.5v15" />
          </g>
        </svg>
      </div>
    ),
    size,
  );
}
