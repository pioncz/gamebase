import { Fields, FieldTypes } from './Fields.js';

const getField = (index) => {
  const fieldIndex = index % Fields.length;

  return Fields[fieldIndex];
};
export const getFieldByPosition = (x, z) => {
  return Fields.find((field) => {
    return field.x === x && field.z === z;
  });
};
export const getFieldSequence = (
  pawns,
  pawn,
  diceNumber,
  playerIndex,
) => {
  let fieldSequence = [],
    areFieldsEqual = (fieldA, fieldB) => {
      return fieldA.x == fieldB.x && fieldA.z == fieldB.z;
    },
    startFieldIndex = Fields.findIndex((field) =>
      areFieldsEqual(field, pawn),
    ),
    startField = startFieldIndex > -1 && Fields[startFieldIndex],
    isFieldOccupied = (field) => {
      let fieldOccupied = pawns.find(
        (f) => f.z === field.z && f.x === field.x,
      );
      return !!fieldOccupied;
    };

  if (!startField) return [];

  if (startField.type === FieldTypes.spawn) {
    if (diceNumber === 6 || diceNumber === 1) {
      let index = startFieldIndex;

      while (!fieldSequence.length) {
        let nextField = getField(++index);

        if (nextField.type !== FieldTypes.spawn) {
          fieldSequence.push(nextField);
        }
      }
    } else {
      fieldSequence = [];
    }
  } else {
    let index = startFieldIndex;
    while (fieldSequence.length !== diceNumber && index !== -1) {
      let nextField = getField(++index),
        lastField =
          fieldSequence.length &&
          fieldSequence[fieldSequence.length - 1];

      if (nextField.type === FieldTypes.spawn) {
        continue;
      }
      if (
        !isNaN(nextField.playerIndex) &&
        nextField.playerIndex !== playerIndex &&
        nextField.type !== FieldTypes.start
      ) {
        continue;
      }
      if (
        (startField.type === FieldTypes.goal ||
          (lastField && lastField.type === FieldTypes.goal)) &&
        nextField.type !== FieldTypes.goal
      ) {
        fieldSequence = [];
        index = -1;
      }

      if (index !== -1) {
        fieldSequence.push(nextField);
      }
    }
  }

  // If last field is taken by another pawn of same player, return []
  if (
    fieldSequence.length &&
    isFieldOccupied(fieldSequence[fieldSequence.length - 1])
  ) {
    fieldSequence = [];
  }

  return fieldSequence;
};
export const getSpawnFields = (playerIndex) => {
  return Fields.filter(
    (field) =>
      field.playerIndex === playerIndex &&
      field.type === FieldTypes.spawn,
  );
};
export const getEmptySpawnFields = (pawns, playerIndex) => {
  let spawnFields = getSpawnFields(playerIndex);

  return spawnFields.filter(
    (field) =>
      pawns.findIndex(
        (pawn) => pawn.x === field.x && pawn.z === field.z,
      ) === -1,
  );
};
export const getWinningPlayer = (gameState) => {
  let playerPoints = [];
  for (let i = 0; i < gameState.playerIds.length; i++) {
    const playerId = gameState.playerIds[i];
    const playerPawns = gameState.pawns.filter(
      (pawn) => pawn.playerId === playerId,
    );
    let points = Fields.length * playerPawns.length;
    for (let j = 0; j < playerPawns.length; j++) {
      const pawn = playerPawns[j];
      let fieldIndex = Fields.findIndex(
        (field) => field.x === pawn.x && field.z === pawn.z,
      );
      let field = Fields[fieldIndex];
      if (field.type === FieldTypes.goal) {
        points += Fields.length * playerPawns.length;
      }
      while (
        field.type !== FieldTypes.goal ||
        field.playerIndex !== i
      ) {
        points--;
        field = getField(++fieldIndex);
      }
    }
    playerPoints.push({ playerId, points });
  }

  playerPoints = playerPoints.sort((a, b) => b.points - a.points);
  return playerPoints[0].playerId;
};
export const checkMoves = (gameState, diceNumber, playerId) => {
  let avaiableMoves = [];

  if (
    !gameState ||
    !gameState.playerIds ||
    !gameState.pawns ||
    !diceNumber ||
    !playerId
  ) {
    console.error('Wrong params');
  }

  let playerIndex = gameState.playerIds.indexOf(playerId),
    playerPawns = gameState.pawns.filter(
      (pawn) => pawn.playerId === playerId,
    );

  for (let pawnId in playerPawns) {
    let pawn = playerPawns[pawnId],
      fieldSequence = getFieldSequence(
        playerPawns,
        pawn,
        diceNumber,
        playerIndex,
      );

    if (fieldSequence.length) {
      avaiableMoves.push({ pawnId: pawn.id, fieldSequence });
    }
  }

  return avaiableMoves;
};
export const checkWin = (pawns) => {
  let fields = pawns.map((pawn) =>
      getFieldByPosition(pawn.x, pawn.z),
    ),
    fieldGoals = fields.map(
      (field) => field.type === FieldTypes.goal,
    );

  return fieldGoals.indexOf(false) === -1;
};

export { FieldTypes };
