(function () {
  const menuToggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.menu');
  const header = document.querySelector('.encabezado');
  const yearElement = document.getElementById('anio-actual');
  const acordeonTitulos = document.querySelectorAll('.acordeon-titulo');
  const formulario = document.querySelector('.formulario');

  function toggleMenu() {
    if (!menuToggle || !menu) {
      return;
    }
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    menu.classList.toggle('activo');
  }

  function closeMenu() {
    if (!menuToggle || !menu) {
      return;
    }
    menuToggle.setAttribute('aria-expanded', 'false');
    menu.classList.remove('activo');
  }

  function handleResize() {
    if (window.innerWidth > 768) {
      closeMenu();
    }
  }

  function handleScroll() {
    if (!header) {
      return;
    }
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  function smoothScroll(event) {
    if (!(event.currentTarget instanceof HTMLAnchorElement)) {
      return;
    }
    const hash = event.currentTarget.hash;
    if (hash && document.querySelector(hash)) {
      event.preventDefault();
      const target = document.querySelector(hash);
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (menu && menu.classList.contains('activo')) {
        closeMenu();
      }
    }
  }

  function toggleAcordeon(event) {
    const button = event.currentTarget;
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }
    const content = button.nextElementSibling;
    if (!(content instanceof HTMLElement)) {
      return;
    }
    const expanded = button.getAttribute('aria-expanded') === 'true';

    acordeonTitulos.forEach((titulo) => {
      if (titulo !== button) {
        titulo.setAttribute('aria-expanded', 'false');
        const siguiente = titulo.nextElementSibling;
        if (siguiente instanceof HTMLElement) {
          siguiente.hidden = true;
        }
      }
    });

    button.setAttribute('aria-expanded', String(!expanded));
    content.hidden = expanded;
  }

  function validarFormulario(event) {
    if (!formulario) {
      return;
    }
    const nombre = formulario.querySelector('#nombre');
    const email = formulario.querySelector('#email');
    const mensaje = formulario.querySelector('#mensaje');
    let valido = true;

    [nombre, email, mensaje].forEach((campo) => {
      if (campo instanceof HTMLInputElement || campo instanceof HTMLTextAreaElement) {
        campo.setCustomValidity('');
        campo.classList.remove('error');
      }
    });

    if (!(nombre instanceof HTMLInputElement) || !nombre.value.trim()) {
      if (nombre instanceof HTMLInputElement) {
        nombre.setCustomValidity('Por favor, ingresa tu nombre.');
        nombre.classList.add('error');
      }
      valido = false;
    }

    if (!(email instanceof HTMLInputElement) || !email.value.trim()) {
      if (email instanceof HTMLInputElement) {
        email.setCustomValidity('Necesitamos un correo para contactarte.');
        email.classList.add('error');
      }
      valido = false;
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(email.value)) {
      email.setCustomValidity('Ingresa un correo electrónico válido.');
      email.classList.add('error');
      valido = false;
    }

    if (!(mensaje instanceof HTMLTextAreaElement) || !mensaje.value.trim()) {
      if (mensaje instanceof HTMLTextAreaElement) {
        mensaje.setCustomValidity('Cuéntanos brevemente tu necesidad.');
        mensaje.classList.add('error');
      }
      valido = false;
    }

    if (!valido) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', toggleMenu);
  }

  if (menu) {
    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', smoothScroll);
    });
  }

  window.addEventListener('resize', handleResize);
  window.addEventListener('scroll', handleScroll);
  handleScroll();

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  acordeonTitulos.forEach((titulo) => {
    titulo.addEventListener('click', toggleAcordeon);
  });

  if (formulario) {
    formulario.addEventListener('submit', validarFormulario);
  }
})();
