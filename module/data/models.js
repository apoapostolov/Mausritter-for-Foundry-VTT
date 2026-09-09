const { NumberField, StringField, BooleanField, SchemaField, HTMLField } = foundry.data.fields;

function intField(initial = 0) {
  return new NumberField({ integer: true, initial, nullable: false });
}

function health() {
  return new SchemaField({
    value: intField(0),
    min: intField(0),
    max: intField(0)
  });
}

function hits() {
  return new SchemaField({
    value: intField(2),
    max: intField(2)
  });
}

function stat(label) {
  return new SchemaField({
    value: intField(0),
    label: new StringField({ initial: label }),
    max: intField(0)
  });
}

function stats() {
  return new SchemaField({
    strength: stat("Strength"),
    dexterity: stat("Dexterity"),
    will: stat("Will")
  });
}

function actorBase() {
  return {
    health: health(),
    hits: hits(),
    armor: intField(0),
    biography: new HTMLField({ initial: "" }),
    notes: new HTMLField({ initial: "" })
  };
}

export class CharacterData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...actorBase(),
      description: new SchemaField({
        background: new StringField({ initial: "Description" }),
        birthsign: new StringField({ initial: "" }),
        coat: new StringField({ initial: "" }),
        look: new StringField({ initial: "" })
      }),
      level: new SchemaField({
        value: intField(1),
        xp: intField(0)
      }),
      pips: new SchemaField({
        value: intField(0)
      }),
      grit: new SchemaField({
        value: intField(0),
        ignored: new StringField({ initial: "" })
      }),
      stats: stats(),
      other: new SchemaField({
        grit: new SchemaField({
          value: intField(0)
        })
      })
    };
  }
}

export class HirelingData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...actorBase(),
      description: new SchemaField({
        disposition: new StringField({ initial: "" })
      }),
      stats: stats()
    };
  }
}

export class CreatureData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...actorBase(),
      description: new SchemaField({
        disposition: new StringField({ initial: "" })
      }),
      stats: stats()
    };
  }
}

export class StorageActorData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...actorBase(),
      description: new SchemaField({
        disposition: new StringField({ initial: "" })
      }),
      size: new SchemaField({
        width: intField(3),
        height: intField(2)
      }),
      storeDiv: new StringField({ initial: "" })
    };
  }
}

function itemSheet() {
  return new SchemaField({
    active: new BooleanField({ initial: false }),
    currentX: intField(0),
    currentY: intField(0),
    initialX: intField(0),
    initialY: intField(0),
    xOffset: intField(0),
    yOffset: intField(0),
    rotation: intField(0),
    curWidth: intField(1),
    curHeight: intField(1),
    zIndex: intField(1)
  });
}

function itemPips() {
  return new SchemaField({
    value: intField(0),
    max: intField(0),
    html: new StringField({ initial: "" })
  });
}

function itemSize() {
  return new SchemaField({
    width: intField(1),
    height: intField(1),
    x: new StringField({ initial: "9em" }),
    y: new StringField({ initial: "9em" }),
    aspect: intField(1)
  });
}

function itemBase() {
  return {
    description: new HTMLField({ initial: "" }),
    sheet: itemSheet(),
    pips: itemPips(),
    size: itemSize(),
    equipped: new BooleanField({ initial: false }),
    stored: new StringField({ initial: "" })
  };
}

export class GearData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...itemBase(),
      weight: intField(0),
      cost: intField(0),
      tag: new StringField({ initial: "" }),
      placement: new StringField({ initial: "hand" }),
      color: new StringField({ initial: "white" })
    };
  }
}

export class WeaponData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...itemBase(),
      weight: intField(0),
      cost: intField(0),
      tag: new StringField({ initial: "" }),
      placement: new StringField({ initial: "hand" }),
      weapon: new SchemaField({
        dmg1: new StringField({ initial: "d6" }),
        dmg2: new StringField({ initial: "" }),
        selected: intField(0),
        canSwap: new BooleanField({ initial: false })
      }),
      color: new StringField({ initial: "white" })
    };
  }
}

export class ArmorData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...itemBase(),
      weight: intField(0),
      cost: intField(0),
      tag: new StringField({ initial: "" }),
      armor: new SchemaField({
        value: intField(1)
      }),
      color: new StringField({ initial: "white" })
    };
  }
}

export class StorageItemData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...itemBase(),
      weight: intField(0),
      cost: intField(0),
      store: new SchemaField({
        value: new StringField({ initial: "0" }),
        max: intField(25)
      }),
      tag: new StringField({ initial: "" }),
      color: new StringField({ initial: "white" })
    };
  }
}

export class ConditionData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...itemBase(),
      clear: new StringField({ initial: "" }),
      desc: new StringField({ initial: "" }),
      color: new StringField({ initial: "white" })
    };
  }
}

export class SpellData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...itemBase(),
      tag: new StringField({ initial: "" }),
      isSpell: new BooleanField({ initial: true }),
      color: new StringField({ initial: "white" })
    };
  }
}
