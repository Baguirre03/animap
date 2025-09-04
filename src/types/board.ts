// Board-related types
export interface Section {
  id: number;
  name: string;
  position_x: number;
  position_y: number;
  created_at: string;
}

export interface Layer {
  id: number;
  section_id: number;
  layer_index: number;
  is_active: boolean;
  created_at: string;
}

export interface Board {
  sections: Section[];
  layers: Layer[];
}
