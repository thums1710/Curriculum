    const tabs = document.querySelectorAll('.tab');
    const panels = document.querySelectorAll('.experience-panel');
    const tabRow = document.querySelector('.tabs');
    const prevBtn = document.getElementById('experiencePrev');
    const nextBtn = document.getElementById('experienceNext');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(item => item.classList.remove('active'));
        panels.forEach(panel => panel.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
      });
    });

    if (prevBtn && nextBtn && tabRow) {
      prevBtn.addEventListener('click', () => {
        tabRow.scrollBy({ left: -220, behavior: 'smooth' });
      });

      nextBtn.addEventListener('click', () => {
        tabRow.scrollBy({ left: 220, behavior: 'smooth' });
      });
    }

    const contactModal = document.getElementById('contactModal');
    const openContactModal = document.getElementById('openContactModal');
    const closeContactModal = document.getElementById('closeContactModal');
    const cancelContactForm = document.getElementById('cancelContactForm');
    const contactForm = document.getElementById('contactForm');
    const submitContactForm = document.getElementById('submitContactForm');

    function openModal() {
      contactModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      contactModal.classList.remove('open');
      document.body.style.overflow = '';
    }

    openContactModal?.addEventListener('click', openModal);
    closeContactModal?.addEventListener('click', closeModal);
    cancelContactForm?.addEventListener('click', closeModal);

    contactModal?.addEventListener('click', (event) => {
      if (event.target === contactModal) closeModal();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && contactModal?.classList.contains('open')) closeModal();
    });

    const EMAILJS_PUBLIC_KEY = 'APPl2cW5_E4IfksqH';
    const EMAILJS_SERVICE_ID = 'service_4pde1xf';
    const EMAILJS_TEMPLATE_ID = 'template_2aehuco';

    if (window.emailjs) {
      emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    }

    contactForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!window.emailjs) {
        alert('O envio não está disponível no momento.');
        return;
      }

      const nome = contactForm.elements.nome.value.trim();
      const email = contactForm.elements.email.value.trim();
      const mensagem = contactForm.elements.mensagem.value.trim();

      if (!nome || !email || !mensagem) {
        alert('Preencha todos os campos antes de enviar.');
        return;
      }

      submitContactForm.disabled = true;
      submitContactForm.textContent = 'Enviando...';

      try {
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          { nome, email, mensagem },
          { publicKey: EMAILJS_PUBLIC_KEY }
        );
        contactForm.reset();
        closeModal();
        alert('Mensagem enviada com sucesso!');
      } catch (error) {
        console.error(error);
        alert('Não foi possível enviar a mensagem. Tente novamente.');
      } finally {
        submitContactForm.disabled = false;
        submitContactForm.textContent = 'Enviar mensagem';
      }
    });
  
