export type Direction = 'down' | 'right' | 'up' | 'left';
export type AgentStatus = 'idle' | 'working' | 'meeting' | 'break' | 'chatting';
export type AgentPose = 'standing' | 'walking' | 'sitting_typing' | 'drinking_coffee';
export type WeatherType = 'sunny' | 'rainy' | 'sunset' | 'night';
export type SpriteRenderMode = 'spritesheet_hd' | 'roster_transparent' | 'animated';
export type MapRenderMode = 'clean_tilemap' | 'reference_image';

export interface Point {
  x: number;
  y: number;
}

export interface Agent {
  id: string; // '01' to '15'
  name: string;
  role: string;
  department: 'Core' | 'Engineering' | 'Design' | 'Product' | 'Support' | 'Strategy';
  personality: string;
  specialty: string;
  cardIndex: number; // 0 to 14 in roster
  deskPos: Point; // percentage coordinate (0-100)
  deskFacing?: Direction;
  currentPos: Point;
  targetPos: Point;
  path?: Point[]; // A* waypoint queue
  facing: Direction;
  status: AgentStatus;
  pose?: AgentPose;
  currentTask: string;
  speechBubble?: string;
  bubbleTimer?: number;
  activityEmoji?: string;
  terminalLogs?: string[];
  stats: {
    efficiency: number;
    tasksDone: number;
    happiness: number;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  expReward: number;
  coinsReward: number;
  assigneeId: string;
  priority: 'low' | 'medium' | 'high';
  column: 'todo' | 'in_progress' | 'review' | 'done';
}

export interface PlayerStats {
  name: string;
  characterId: string;
  level: number;
  currentExp: number;
  maxExp: number;
  title: string;
  coins: number;
}

export interface OfficeHotspot {
  id: string;
  name: string;
  category: 'coffee' | 'vending' | 'cat' | 'meeting' | 'executive' | 'server' | 'bulletin';
  x: number;
  y: number;
  radius: number;
  prompt: string;
}

export interface MeetingTurn {
  speaker: string;
  id: string;
  dialogue: string;
}

export interface MeetingState {
  isActive: boolean;
  topic: string;
  participants: string[];
  currentTurnIndex: number;
  turns: MeetingTurn[];
  autoPlay: boolean;
}
