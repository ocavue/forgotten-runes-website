export type TokenGoodiesSetting = {
  hasSpritesheet: boolean;
  hasTurnarounds: boolean;
  hasFamiliarTurnarounds: boolean;
  hasFamiliarSpritesheet: boolean;
  hasRiderBodies: boolean;
};

export const tokenGoodiesSettings: { [key: string]: TokenGoodiesSetting } = {
  wizards: {
    hasSpritesheet: true,
    hasTurnarounds: true,
    hasFamiliarTurnarounds: true,
    hasFamiliarSpritesheet: true,
    hasRiderBodies: true,
  },
  souls: {
    hasSpritesheet: false,
    hasTurnarounds: false,
    hasFamiliarTurnarounds: false,
    hasFamiliarSpritesheet: false,
    hasRiderBodies: true,
  },
  ponies: {
    hasSpritesheet: false,
    hasTurnarounds: false,
    hasFamiliarTurnarounds: false,
    hasFamiliarSpritesheet: false,
    hasRiderBodies: false,
  },
  warriors: {
    hasSpritesheet: false,
    hasTurnarounds: false,
    hasFamiliarTurnarounds: false,
    hasFamiliarSpritesheet: false,
    hasRiderBodies: false,
  },
};
