export type CommentTarget = "CHARACTER" | "TAP" | "SCENE" | "SHOT";
export type ShotContentType = "HANHDONG" | "THOAI" | "AMTHANH" | "ANHSANG";

export type ApiUser = {
  id: number;
  username: string;
  name: string;
  isLeader: boolean;
  permissions: string[];
};

export type Frame = {
  id: number;
  shotId: number;
  imageUrl: string;
  order: number;
};

export type ShotContent = {
  id: number;
  shotId: number;
  type: ShotContentType;
  character: string;
  text: string;
  order: number;
};

export type Shot = {
  id: number;
  sceneId: number;
  title: string;
  angle: string;
  movement: string;
  order: number;
  contents: ShotContent[];
  frames: Frame[];
};

export type Scene = {
  id: number;
  tapId: number;
  title: string;
  space: string;
  time: string;
  charactersPresent: string[];
  order: number;
  shots: Shot[];
};

export type Tap = {
  id: number;
  projectId: number;
  title: string;
  summary: string;
  locations: string[];
  equipment: string[];
  costumes: string[];
  order: number;
  scenes: Scene[];
};

export type Character = {
  id: number;
  projectId: number;
  name: string;
  desc: string;
};

export type Project = {
  id: number;
  title: string;
  mainPlot: string;
  createdAt: string;
  characters: Character[];
  taps: Tap[];
};

export type Comment = {
  id: number;
  targetType: CommentTarget;
  targetId: number;
  author: string;
  text: string;
  createdAt: string;
};
