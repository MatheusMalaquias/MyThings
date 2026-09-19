/**
 * AdminNav.js — revela o link "Painel Admin" no menu em QUALQUER página
 * que tenha um elemento #link-admin, contanto que a conta logada esteja
 * na tabela `admins`. Assim o acesso não depende de estar numa página
 * específica. Requer ./Scripts/supabaseConfig.js carregado antes.
 */
document.addEventListener('DOMContentLoaded', async () => {
  const linkAdmin = document.getElementById('link-admin');
  if (!linkAdmin) return;

  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) return;

  const { data: admin } = await supabaseClient
    .from('admins')
    .select('usuario_id')
    .eq('usuario_id', session.user.id)
    .maybeSingle();

  if (admin) {
    linkAdmin.hidden = false;
  }
});