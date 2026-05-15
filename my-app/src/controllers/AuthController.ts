// MVC PATTERN — Controller handles auth logic between view and Supabase

import supabase from '../supabase/supabaseClient';
import { UserFactory } from '../factories/UserFactory';
import type { UserRole, Profile } from '../types';

export class AuthController {
  static async register(
    name: string,
    email: string,
    password: string,
    role: UserRole,
    department: string
  ): Promise<{ profile: Profile | null; error: string | null }> {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) {
      return { profile: null, error: error?.message ?? 'Registration failed' };
    }

    const profile = UserFactory.createUser(data.user.id, name, email, role, department);
    const { error: profileError } = await supabase.from('profiles').insert(profile);
    if (profileError) {
      return { profile: null, error: profileError.message };
    }

    return { profile, error: null };
  }

  static async login(
    email: string,
    password: string
  ): Promise<{ profile: Profile | null; error: string | null }> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      return { profile: null, error: error?.message ?? 'Login failed' };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return { profile: null, error: profileError?.message ?? 'Profile not found' };
    }

    return { profile, error: null };
  }

  static async logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  static async getProfile(userId: string): Promise<Profile | null> {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    return data ?? null;
  }
}
