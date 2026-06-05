'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function publishStory(storyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase
    .from('stories')
    .update({ is_public: true })
    .eq('id', storyId);

  if (error) {
    console.error('Failed to publish story:', error);
    throw new Error('Failed to publish story');
  }

  revalidatePath('/dashboard');
}
