const FieldType = {
  spawn: 'spawn',
  start: 'start',
  goal: 'goal',
};

const Fields = require('./Fields'),
  getField = (index) => {
    const fieldIndex = index % Fields.length;

    return Fields[fieldIndex];
  },
  getFieldSequence = (pawns, pawn, diceNumber, playerIndex) => {
    let fieldSequence = [],
      areFieldsEqual = (fieldA, fieldB) => {
        return fieldA.x == fieldB.x &&
          fieldA.z == fieldB.z;
      },
      startFieldIndex = Fields.findIndex((field)=> areFieldsEqual(field, pawn)),
      startField = startFieldIndex > -1 && Fields[startFieldIndex],
      isFieldOccupied = (field) => {
        let fieldOccupied = pawns.find(f => f.z === field.z && f.x === field.x);
        return !!fieldOccupied;
      };
  
    if (!startField) return [];
    
    if (startField.type === FieldType.spawn) {
      if (diceNumber === 6) {
        let index = startFieldIndex;
        
        while(!fieldSequence.length) {
         let nextField = getField(++index);

          if (nextField.type !== FieldType.spawn) {
            fieldSequence.push(nextField);
          }
        }
      } else {
        fieldSequence = [];
      }
    } else {
      let index = startFieldIndex;
      while(fieldSequence.length !== diceNumber && index !== -1) {
        let nextField = getField(++index),
          lastField = fieldSequence.length && fieldSequence[fieldSequence.length - 1];
        
        if (nextField.type === FieldType.spawn) {
          continue;
        }
        if (!isNaN(nextField.playerIndex) &&
          nextField.playerIndex !== playerIndex &&
          nextField.type !== FieldType.start
        ) {
          continue;
        }
        if ((startField.type === FieldType.goal ||
          (lastField && lastField.type === FieldType.goal))
            && nextField.type !== FieldType.goal) {
          fieldSequence = [];
          index = -1;
        }
        
        if (index !== -1) {
          fieldSequence.push(nextField);
        }
      }
    }

    // If last field is taken by another pawn, return []
    if (fieldSequence.length && isFieldOccupied(fieldSequence[fieldSequence.length - 1])) {
      fieldSequence = [];
    }

    return fieldSequence;
  },
  checkMoves = (pawns, diceNumber, playerIndex) => {
    let avaiableMoves = [];
    
    if (!pawns || !diceNumber || (!playerIndex && playerIndex !== 0)) {
      console.error('Wrong params');
    }
  
    for(let pawnId in pawns) {
      let pawn = pawns[pawnId],
        fieldSequence = getFieldSequence(pawns, pawn, diceNumber, playerIndex);
      
      if (fieldSequence.length) {
        avaiableMoves.push({pawnId: pawn.id, fieldSequence});
      }
    }
    
    return avaiableMoves;
  };

module.exports = {
  getFieldSequence,
  checkMoves,
};