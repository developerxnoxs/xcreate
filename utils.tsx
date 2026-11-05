import { CharacterAppearanceOptions } from './types';

export const buildCharacterAppearanceString = (appearance: CharacterAppearanceOptions | string): string => {
  if (typeof appearance === 'string') return appearance;
  const parts = [];
  if (appearance.headwear) parts.push(`Headwear: ${appearance.headwear}`);
  if (appearance.upperBodyClothing) parts.push(`Upper Body: ${appearance.upperBodyClothing}`);
  if (appearance.lowerBodyClothing) parts.push(`Lower Body: ${appearance.lowerBodyClothing}`);
  if (appearance.footwear) parts.push(`Footwear: ${appearance.footwear}`);
  if (appearance.accessories) parts.push(`Accessories: ${appearance.accessories}`);
  if (appearance.customDetails) parts.push(`Details: ${appearance.customDetails}`);
  return parts.join(', ');
};
