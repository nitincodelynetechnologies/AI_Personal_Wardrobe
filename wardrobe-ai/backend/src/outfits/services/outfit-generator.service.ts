import { Injectable } from '@nestjs/common';
import { ClothingItemRecord } from '../../wardrobe/interfaces/clothing-item.interface';
import {
  OUTFIT_STYLE_SCORE_MAX,
  OUTFIT_STYLE_SCORE_MIN,
} from '../constants/outfits.constants';
import { OutfitGenerationSelection } from '../interfaces/outfit.interface';

interface WardrobeBuckets {
  tops: ClothingItemRecord[];
  bottoms: ClothingItemRecord[];
  footwear: ClothingItemRecord[];
  accessories: ClothingItemRecord[];
}

@Injectable()
export class OutfitGeneratorService {
  generateSelection(
    items: ClothingItemRecord[],
    seasonTag = 'All',
  ): OutfitGenerationSelection {
    const buckets = this.bucketByCategory(items);
    const tops = this.filterBySeason(buckets.tops, seasonTag);
    const bottoms = this.filterBySeason(buckets.bottoms, seasonTag);
    const footwear = this.filterBySeason(buckets.footwear, seasonTag);
    const accessories = this.filterBySeason(buckets.accessories, seasonTag);

    const top = this.pickRandom(tops.length ? tops : buckets.tops);
    const bottom = this.pickComplementaryBottom(
      top,
      bottoms.length ? bottoms : buckets.bottoms,
    );
    const shoes = this.pickRandom(footwear.length ? footwear : buckets.footwear);
    const accessoryPool = accessories.length ? accessories : buckets.accessories;
    const accessory = accessoryPool.length ? this.pickRandom(accessoryPool) : null;

    if (!top || !bottom || !shoes) {
      throw new Error('Unable to select outfit items');
    }

    return {
      top_id: top.id,
      bottom_id: bottom.id,
      footwear_id: shoes.id,
      accessory_id: accessory?.id ?? null,
      style_score: this.generateStyleScore(),
      season_tag: seasonTag,
    };
  }

  hasRequiredCategories(items: ClothingItemRecord[]): boolean {
    const buckets = this.bucketByCategory(items);
    return buckets.tops.length > 0 && buckets.bottoms.length > 0 && buckets.footwear.length > 0;
  }

  private bucketByCategory(items: ClothingItemRecord[]): WardrobeBuckets {
    return items.reduce<WardrobeBuckets>(
      (acc, item) => {
        switch (item.category) {
          case 'Top':
            acc.tops.push(item);
            break;
          case 'Bottom':
            acc.bottoms.push(item);
            break;
          case 'Footwear':
            acc.footwear.push(item);
            break;
          case 'Accessory':
            acc.accessories.push(item);
            break;
          default:
            break;
        }
        return acc;
      },
      { tops: [], bottoms: [], footwear: [], accessories: [] },
    );
  }

  private filterBySeason(items: ClothingItemRecord[], seasonTag: string): ClothingItemRecord[] {
    if (seasonTag === 'All') {
      return items;
    }

    return items.filter((item) => item.season === seasonTag || item.season === 'All');
  }

  private pickComplementaryBottom(
    top: ClothingItemRecord | null,
    bottoms: ClothingItemRecord[],
  ): ClothingItemRecord | null {
    if (!bottoms.length) {
      return null;
    }

    if (!top?.color_hex) {
      return this.pickRandom(bottoms);
    }

    const contrasting = bottoms.filter((item) => item.color_hex && item.color_hex !== top.color_hex);
    if (contrasting.length) {
      return this.pickRandom(contrasting);
    }

    const neutral = bottoms.filter((item) => !item.color_hex);
    if (neutral.length) {
      return this.pickRandom(neutral);
    }

    return this.pickRandom(bottoms);
  }

  private pickRandom<T>(items: T[]): T | null {
    if (!items.length) {
      return null;
    }

    return items[Math.floor(Math.random() * items.length)] ?? null;
  }

  private generateStyleScore(): number {
    return (
      Math.floor(Math.random() * (OUTFIT_STYLE_SCORE_MAX - OUTFIT_STYLE_SCORE_MIN + 1)) +
      OUTFIT_STYLE_SCORE_MIN
    );
  }
}
