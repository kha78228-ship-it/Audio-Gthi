import { Track } from './types';

export const INITIAL_TRACKS: Track[] = [
  {
    id: '1',
    title: 'Midnight Lo-fi Beats',
    artist: 'ChillHop Vibes',
    genre: 'Lo-Fi Chill',
    durationSec: 218,
    plays: 14200,
    bitrate: '320kbps Hi-Fi',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '2',
    title: 'Deep Coding Horizon',
    artist: 'DevSynthesizer',
    genre: 'Deep Focus',
    durationSec: 184,
    plays: 28900,
    bitrate: '320kbps Hi-Fi',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '3',
    title: 'Sunset Acoustic Melody',
    artist: 'Elena Rossi',
    genre: 'Acoustic',
    durationSec: 245,
    plays: 9500,
    bitrate: '320kbps Hi-Fi',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '4',
    title: 'Neon Cyber Odyssey (Studio Master)',
    artist: 'HyperDrive Labs',
    genre: 'Electronic',
    durationSec: 310,
    plays: 35100,
    isVipOnly: true,
    bitrate: 'Lossless 24-bit/96kHz',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '5',
    title: 'Zen Tibetan Sanctuary (Spatial 3D Master)',
    artist: 'Mindful Sanctuary',
    genre: 'Ambient & Zen',
    durationSec: 275,
    plays: 18300,
    isVipOnly: true,
    bitrate: 'Spatial 3D Surround',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '6',
    title: 'Tập 01: Sáng tạo & Công nghệ AI',
    artist: 'TechTalk Vietnam Podcast',
    genre: 'Podcast & Talk',
    durationSec: 360,
    plays: 8200,
    bitrate: '320kbps Hi-Fi',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1487180144351-b8472da7d491?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '7',
    title: 'Morning Rain & Coffee Study',
    artist: 'Lofi Coffee Shop',
    genre: 'Lo-Fi Chill',
    durationSec: 195,
    plays: 22400,
    bitrate: '320kbps Hi-Fi',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: '8',
    title: 'Flow State Binaural Frequency (VIP Lossless)',
    artist: 'Theta Waves Lab',
    genre: 'Deep Focus',
    durationSec: 260,
    plays: 16700,
    isVipOnly: true,
    bitrate: 'Binaural 3D Lossless',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=600&q=80',
  }
];

export const GENRE_LIST = [
  'Tất cả',
  'Lo-Fi Chill',
  'Deep Focus',
  'Acoustic',
  'Electronic',
  'Ambient & Zen',
  'Podcast & Talk'
] as const;

export const FEATURED_PLAYLISTS = [
  {
    id: 'f1',
    title: 'Lo-Fi Tập Trung Làm Việc',
    description: 'Những giai điệu êm dịu, giúp bạn duy trì năng lượng và sự tập trung suốt ngày dài.',
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=600&q=80',
    trackCount: 18,
    genre: 'Lo-Fi Chill'
  },
  {
    id: 'f2',
    title: 'Coding Night in Cyberpunk (Lossless VIP)',
    description: 'Nhịp đập Synthwave & Electro bốc lửa chất lượng cao studio.',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80',
    trackCount: 24,
    genre: 'Electronic'
  },
  {
    id: 'f3',
    title: 'Không Gian Thiền & Tĩnh Tâm',
    description: 'Âm thanh sóng nước, chuông xoay Tây Tạng giúp giải tỏa căng thẳng và ngủ ngon.',
    coverUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
    trackCount: 12,
    genre: 'Ambient & Zen'
  }
];
