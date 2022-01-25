export type TokenGoodiesSetting = {
  hasSpritesheet: boolean;
  hasTurnarounds: boolean;
  hasRiderBodies: boolean;
};

export const tokenGoodiesSettings: { [key: string]: TokenGoodiesSetting } = {
  wizards: {
    hasSpritesheet: true,
    hasTurnarounds: true,
    hasRiderBodies: true,
  },
  souls: {
    hasSpritesheet: false,
    hasTurnarounds: false,
    hasRiderBodies: true,
  },
  ponies: {
    hasSpritesheet: false,
    hasTurnarounds: false,
    hasRiderBodies: false,
  },
  warriors: {
    hasSpritesheet: false,
    hasTurnarounds: false,
    hasRiderBodies: false,
  },
};
