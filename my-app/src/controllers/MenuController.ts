// MVC PATTERN — Controller for food item CRUD

import supabase from '../supabase/supabaseClient';
import type { FoodItem, FoodCategory } from '../types';

export class MenuController {
  static async getAll(): Promise<FoodItem[]> {
    const { data, error } = await supabase
      .from('food_items')
      .select('*')
      .order('category')
      .order('name');
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  static async getAvailable(): Promise<FoodItem[]> {
    const { data, error } = await supabase
      .from('food_items')
      .select('*')
      .eq('availability', true)
      .order('category')
      .order('name');
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  static async create(item: Omit<FoodItem, 'id' | 'created_at' | 'updated_at'>): Promise<FoodItem> {
    const { data, error } = await supabase
      .from('food_items')
      .insert(item)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  static async update(id: string, updates: Partial<FoodItem>): Promise<void> {
    const { error } = await supabase
      .from('food_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw new Error(error.message);
  }

  static async toggleAvailability(id: string, availability: boolean): Promise<void> {
    await MenuController.update(id, { availability });
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase.from('food_items').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  static getCategories(): { value: FoodCategory; label: string }[] {
    return [
      { value: 'main_course', label: 'Main Course' },
      { value: 'fast_food', label: 'Fast Food' },
      { value: 'beverages', label: 'Beverages' },
      { value: 'desserts', label: 'Desserts' },
      { value: 'snacks', label: 'Snacks' },
      { value: 'other', label: 'Other' },
    ];
  }
}
