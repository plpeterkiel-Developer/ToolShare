import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
      }}
    >
      {/* Wrench head */}
      <div
        style={{
          position: 'absolute',
          width: 52,
          height: 52,
          borderRadius: '50%',
          backgroundColor: 'white',
          top: 38,
          left: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            backgroundColor: '#16a34a',
          }}
        />
      </div>
      {/* Wrench handle */}
      <div
        style={{
          position: 'absolute',
          width: 20,
          height: 90,
          borderRadius: 10,
          backgroundColor: 'white',
          top: 58,
          left: 80,
          transform: 'rotate(45deg)',
        }}
      />
      {/* Share arrow left */}
      <div
        style={{
          position: 'absolute',
          left: 24,
          top: 50,
          width: 4,
          height: 50,
          borderRadius: 2,
          backgroundColor: 'white',
          opacity: 0.5,
          transform: 'rotate(10deg)',
        }}
      />
      {/* Share arrow right */}
      <div
        style={{
          position: 'absolute',
          right: 24,
          bottom: 50,
          width: 4,
          height: 50,
          borderRadius: 2,
          backgroundColor: 'white',
          opacity: 0.5,
          transform: 'rotate(10deg)',
        }}
      />
    </div>,
    { ...size }
  )
}
