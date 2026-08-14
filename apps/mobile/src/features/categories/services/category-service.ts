import type { CategoryKind } from '@personal-finance/types';
import type { CategoryRecord } from '../../../database/records';
import { nowIso } from '../../../lib/clock';
import { createId } from '../../../lib/id';
import type { CategoryRepository } from '../../../repositories/category-repository';
import { DEFAULT_CATEGORIES } from './default-categories';

export type CreateCategoryInput = {
  name: string;
  type: CategoryKind;
  parentId?: string | null;
  icon?: string | null;
  colorToken?: string | null;
};

export class CategoryService {
  constructor(private readonly categories: CategoryRepository) {}

  async list(includeArchived = false): Promise<CategoryRecord[]> {
    return this.categories.list(includeArchived);
  }

  async get(id: string): Promise<CategoryRecord> {
    const category = await this.categories.getById(id);
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  }

  async seedIfEmpty(): Promise<void> {
    if ((await this.categories.count()) > 0) {
      return;
    }
    const now = nowIso();
    for (const [index, item] of DEFAULT_CATEGORIES.entries()) {
      await this.categories.insert({
        id: createId(),
        parentId: null,
        name: item.name,
        type: item.type,
        icon: null,
        colorToken: item.colorToken,
        displayOrder: index,
        isSystem: true,
        isArchived: false,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      });
    }
  }

  async create(input: CreateCategoryInput): Promise<CategoryRecord> {
    const name = input.name.trim();
    if (!name) {
      throw new Error('Category name is required');
    }
    if (input.parentId) {
      const parent = await this.get(input.parentId);
      if (parent.type !== input.type) {
        throw new Error('Subcategory type must match parent');
      }
    }
    const now = nowIso();
    const record: CategoryRecord = {
      id: createId(),
      parentId: input.parentId ?? null,
      name,
      type: input.type,
      icon: input.icon ?? null,
      colorToken: input.colorToken ?? null,
      displayOrder: 0,
      isSystem: false,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    await this.categories.insert(record);
    return record;
  }

  async update(id: string, patch: { name?: string }): Promise<CategoryRecord> {
    const current = await this.get(id);
    const next: CategoryRecord = {
      ...current,
      name: patch.name?.trim() || current.name,
      updatedAt: nowIso(),
    };
    if (!next.name) {
      throw new Error('Category name is required');
    }
    await this.categories.update(next);
    return next;
  }

  async archive(id: string): Promise<CategoryRecord> {
    const current = await this.get(id);
    const next: CategoryRecord = { ...current, isArchived: true, updatedAt: nowIso() };
    await this.categories.update(next);
    return next;
  }

  async restore(id: string): Promise<CategoryRecord> {
    const current = await this.get(id);
    const next: CategoryRecord = { ...current, isArchived: false, updatedAt: nowIso() };
    await this.categories.update(next);
    return next;
  }
}
