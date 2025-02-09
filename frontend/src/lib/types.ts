export type Player = {
  id: string;
  state: 'loading' | 'loggedIn' | 'loggedOut';
  avatar?: string;
  login?: string;
  temporary?: boolean;
  diceId?: string;
  color?: string;
  disconnected?: boolean;
};

export type Dice = {
  id: string;
  colors: string[];
};

export type PlayerColor = {
  playerId: string;
  color: string;
};

export type Pawn = {};

export type Game = {
  id: string;
  players: Player[];
  playerColors: PlayerColor[];
  currentPlayerId: string;
  pawns: [];
  finishTimestamp: number;
  colorsQueue?: [];
  roomState: string;
};

export type GameAction = {
  type: string;
  value?: string;
  gameState?: Game;
  animationLength?: number;
  playerId?: string;
  expectedAction?: string;
  diceNumber?: number;
  pawnId?: string;
  fieldSequence?: [];
  pawnIds?: string[];
  winnerId?: string;
};

export type PawnMove = {
  pawnId: string;
  fieldSequence: { x: number; z: number }[];
};
