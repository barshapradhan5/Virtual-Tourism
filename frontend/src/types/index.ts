export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  theme_color: string;
  description: string;
  places_count: number;
}

export interface State {
  id: number;
  name: string;
  code: string;
}

export interface POI {
  id: string;
  title: string;
  body: string;
  pos_x: number;
  pos_y: number;
  pos_z: number;
  radius: number;
  audio_url?: string;
  order: number;
}

export interface MediaItem {
  id: number;
  image_url: string;
  caption?: string;
  credit?: string;
  order: number;
}

export interface SceneAsset {
  id: number;
  kind: 'glb' | 'hdr' | 'audio' | 'panorama';
  asset_url: string;
  version: string;
  size_bytes: number;
}

export interface Place {
  id: string;
  slug: string;
  name: string;
  category: Category;
  state?: State;
  short_description: string;
  short_description_ai?: string;
  history_notes?: string;
  latitude: number;
  longitude: number;
  best_season: string;
  scene_mode: '3d' | 'panorama';
  hero_image_url?: string;
  panorama_url?: string;
  spawn_x?: number;
  spawn_y?: number;
  spawn_z?: number;
  pois?: POI[];
  media_items?: MediaItem[];
  scene_assets?: SceneAsset[];
}

export interface SceneManifest {
  id: string;
  slug: string;
  name: string;
  scene_mode: '3d' | 'panorama';
  panorama_url?: string;
  spawn_x: number;
  spawn_y: number;
  spawn_z: number;
  pois: POI[];
  scene_assets: SceneAsset[];
  environment: {
    sky_preset: string;
    ambient_light_intensity: number;
    ground_color: string;
    fog_color: string;
    fog_near: number;
    fog_far: number;
  };
}

export interface VisitSession {
  id: string;
  place: string;
  place_detail: Place;
  started_at: string;
  ended_at?: string;
  duration_s: number;
  device_info?: string;
}

export interface GuideAnswer {
  session_id: string;
  answer: string;
  is_fallback: boolean;
  source: string;
}

