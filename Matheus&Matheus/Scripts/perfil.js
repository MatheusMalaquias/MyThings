import { supabase } from './supabase-client.js';

export async function carregarPerfil() {
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;

  if (!session) {
    return null;
  }

  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nome, email, role, escritorio_id')
    .eq('id', session.user.id)
    .single();

  if (error) {
    console.error('Não foi possível carregar o perfil:', error.message);
    return null;
  }

  return data;
}