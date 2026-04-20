import { supabase } from '$lib/supabase';

export interface CardProgress {
  card_id: string;
  card_type: 'vocab' | 'phrase';
  done: boolean;
}

export async function getDoneCards(userId: string): Promise<CardProgress[]> {
  const { data, error } = await supabase
    .from('user_card_progress')
    .select('card_id, card_type, done')
    .eq('user_id', userId)
    .eq('done', true);
  
  if (error) throw error;
  return data || [];
}

export async function markCardDone(userId: string, cardId: string, cardType: 'vocab' | 'phrase'): Promise<void> {
  const { error } = await supabase.rpc('mark_card_done', {
    p_user_id: userId,
    p_card_id: cardId,
    p_card_type: cardType
  });
  
  if (error) throw error;
}

export async function markCardUndone(userId: string, cardId: string): Promise<void> {
  const { error } = await supabase
    .from('user_card_progress')
    .delete()
    .eq('user_id', userId)
    .eq('card_id', cardId);
  
  if (error) throw error;
}

export async function isCardDone(userId: string, cardId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_card_progress')
    .select('done')
    .eq('user_id', userId)
    .eq('card_id', cardId)
    .eq('done', true)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
}
