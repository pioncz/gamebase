import { Pawn, PawnMove, Player } from '@/lib/types';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import Engine from './../../../../engine/engine.js';
import { config } from '@/lib/config';
import { styled } from '@/lib/stitches.config.js';

export type GameComponentHandle = {
  initGame: (a: number, pawns: Pawn[]) => void;
  movePawn: (pawnMove: PawnMove) => void;
  checkMoves: (
    pawns: Pawn[],
    diceNumber: number,
    playerIndex: number,
  ) => void;
  clearGame: () => void;
  appendStats: () => void;
  rollDice: (diceNumber?: number, diceColors?: string[]) => void;
  selectPawns: (pawnIds: string[]) => void;
};

const GameComponent = forwardRef(
  (
    {
      gameName,
      onClick,
      firstPlayerId,
      gameId,
      players,
    }: {
      onClick: (e: { pawnId: string }) => void;
      gameId?: string;
      gameName: string;
      players: Player[];
      firstPlayerId: string;
    },
    ref,
  ) => {
    const rendererContainerRef = useRef(null);
    const containerRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line
    const engineRef = useRef<any>(null);

    useImperativeHandle(
      ref,
      () => ({
        initGame: (animationLength: number, pawns: Pawn[]) => {
          containerRef.current?.classList.add('in-game');

          engineRef.current?.initGame(
            {
              gameId: gameId,
              gameName: gameName,
              pawns: pawns,
              players: players,
            },
            firstPlayerId,
            animationLength,
          );
        },
        movePawn: (pawnMove: PawnMove) => {
          engineRef.current?.board.movePawn(pawnMove);
        },
        checkMoves: (
          pawns: Pawn[],
          diceNumber: number,
          playerIndex: number,
        ) => {
          engineRef.current?.board.checkMoves(
            pawns,
            diceNumber,
            playerIndex,
          );
        },
        clearGame: () => {
          containerRef.current?.classList.remove('in-game');
          engineRef.current?.clearGame();
        },
        appendStats: () => {
          engineRef.current?.appendStats();
        },
        rollDice: (diceNumber?: number, diceColors?: string[]) => {
          engineRef.current?.rollDice(diceNumber, diceColors);
        },
        selectPawns: (pawnIds: string[]) => {
          engineRef.current?.selectPawns(pawnIds);
        },
      }),
      [firstPlayerId, gameId, gameName, players],
    );

    useEffect(() => {
      if (gameName && !engineRef.current) {
        engineRef.current = new Engine({
          container: rendererContainerRef.current,
          gameName,
        });

        if (config.stats) {
          engineRef.current?.appendStats();
        }
      } else if (gameName && engineRef.current) {
        engineRef.current?.changeGame(gameName);
      }

      return () => {
        engineRef.current?.off('click', onClick);
      };
    }, [gameName, onClick]);

    useEffect(() => {
      if (!engineRef.current) return;

      engineRef.current?.on('click', onClick);

      return () => {
        engineRef.current?.off('click', onClick);
      };
    }, [onClick]);

    // useEffect(() => {
    //   if (engineRef.current && moves.length) {
    //     const move = moves[moves.length - 1];
    //     engineRef.current?.movePawn(move);
    //   }
    // }, [moves]);

    return (
      <Root className="game-component" ref={containerRef}>
        <div ref={rendererContainerRef} className="renderer"></div>
      </Root>
    );
  },
);

const Root = styled('div', {
  position: 'absolute',
  width: '100%',
  height: '100%',
  bottom: '0',
  left: '0',
  backgroundImage: 'linear-gradient(170deg, #141e30, #3b77bb)',
  transition: 'background 1s ease-out',
  backgroundSize: '100% 400%',

  '&.in-game': {
    backgroundPosition: '0 100%',
  },

  '.renderer': {
    overflow: 'hidden',
    width: '100%',
    height: '100%',
  },
});

export default GameComponent;
