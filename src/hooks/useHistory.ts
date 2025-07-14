import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface HistoryItem {
  id: string;
  file_name: string;
  duration: number;
  created_at: string;
  transcript: string | null;
  analysis: any | null;
  status: 'uploaded' | 'transcribed' | 'analyzed';
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        console.log('No authenticated user');
        return;
      }

      const { data, error } = await supabase
        .from('audio_history')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching history:', error);
        return;
      }

      setHistory(data || []);
    } catch (error) {
      console.error('Error in fetchHistory:', error);
    }
  }

  async function addHistoryItem(item: Omit<HistoryItem, 'id' | 'created_at' | 'user_id'>) {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        console.log('No authenticated user');
        return;
      }

      const { data, error } = await supabase
        .from('audio_history')
        .insert([{ ...item, user_id: user.user.id }])
        .select()
        .single();

      if (error) {
        console.error('Error adding history item:', error);
        return;
      }

      setHistory(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error in addHistoryItem:', error);
    }
  }

  async function updateHistoryItem(id: string, updates: Partial<HistoryItem>) {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        console.log('No authenticated user');
        return;
      }

      const { error } = await supabase
        .from('audio_history')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.user.id);

      if (error) {
        console.error('Error updating history item:', error);
        return;
      }

      setHistory(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));
    } catch (error) {
      console.error('Error in updateHistoryItem:', error);
    }
  }

  return {
    history,
    addHistoryItem,
    updateHistoryItem,
  };
}