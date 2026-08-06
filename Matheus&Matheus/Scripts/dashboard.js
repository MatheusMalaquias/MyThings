import { carregarPerfil } from './perfil.js';

const perfil = await carregarPerfil();

if (perfil) {
  const userLabel = document.getElementById('app-user-email');
  if (userLabel) {
    const papel = perfil.role === 'admin' ? 'Administrador' : 'Advogado';
    userLabel.textContent = `${perfil.nome} · ${papel}`;
  }

  if (perfil.role === 'admin') {
    const navUsuarios = document.getElementById('nav-usuarios');
    if (navUsuarios) {
      navUsuarios.hidden = false;
    }
  }
}