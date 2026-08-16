export type CommentTarget = "CHARACTER" | "TAP" | "SCENE" | "SHOT";
export type ShotContentType = "HANHDONG" | "THOAI" | "AMTHANH" | "ANHSANG";
export type Role = "MANAGER" | "ASSISTANT" | "ADMIN" | "STAFF";

export type ApiUser = {
  id: number;
  username: string;
  name: string;
  role: Role;
  permissions: string[];
};

type Ownable = {
  createdById: number;
  createdByName: string;
  active: boolean;
};

export type Frame = Ownable & {
  id: number;
  shotId: number;
  imageUrl: string;
  order: number;
};

export type ShotContent = Ownable & {
  id: number;
  shotId: number;
  type: ShotContentType;
  character: string;
  text: string;
  order: number;
};

export type Shot = Ownable & {
  id: number;
  sceneId: number;
  title: string;
  angle: string;
  movement: string;
  order: number;
  contents: ShotContent[];
  frames: Frame[];
};

export type Scene = Ownable & {
  id: number;
  tapId: number;
  title: string;
  space: string;
  time: string;
  charactersPresent: string[];
  order: number;
  shots: Shot[];
};

export type Tap = Ownable & {
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

export type Character = Ownable & {
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
  createdById: number;
  createdByName: string;
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
