(function () {
  const PHONE_E164 = "5514996139532"; // +55 14 99613-9532 (sem +)
  const DEFAULT_SOURCE = "site";
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  function encode(text) {
    return encodeURIComponent(text).replace(/%20/g, "+");
  }

  function buildWhatsUrl(message) {
    return `https://wa.me/${PHONE_E164}?text=${encode(message)}`;
  }

  function track(eventName, params = {}) {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: eventName, ...params });
    } catch (_) {}
  }

  function openWhatsApp(message, source = DEFAULT_SOURCE) {
    track("lead_whatsapp_click", { source });
    window.open(buildWhatsUrl(message), "_blank", "noopener,noreferrer");
  }

  // ✅ NOVO: rolar até o formulário
  function goToForm(source = "cta") {
    track("cta_go_to_form", { source });

    const formSection = document.getElementById("form");
    if (!formSection) return;

    formSection.scrollIntoView({ behavior: "smooth", block: "start" });

    // foca no primeiro campo após a rolagem
    setTimeout(() => {
      const firstInput = document.querySelector('#leadForm input[name="nome"]');
      if (firstInput) firstInput.focus();
    }, 450);
  }

  // ✅ Agora: botões principais só descem para o formulário (não abrem WhatsApp)
  const ctaToFormButtons = [
    ["btnWhatsTop", "topo"],
    ["btnWhatsHero", "hero"],
    ["btnWhatsMid", "meio"],
    ["btnWhatsBottom", "faq"],
    ["btnWhatsFooter", "rodape"],
  ];

  for (const [id, source] of ctaToFormButtons) {
    const btn = document.getElementById(id);
    if (!btn) continue;

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      goToForm(source);
    });
  }

  // ✅ Formulário -> abre WhatsApp com mensagem completa
  const form = document.getElementById("leadForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const fd = new FormData(form);
      const nome = (fd.get("nome") || "").toString().trim();
      const telefone = (fd.get("telefone") || "").toString().trim();
      const evento = (fd.get("evento") || "").toString().trim();
      const data = (fd.get("data") || "").toString().trim();
      const pessoas = (fd.get("pessoas") || "").toString().trim();
      const cidade = (fd.get("cidade") || "").toString().trim();
      const mensagem = (fd.get("mensagem") || "").toString().trim();

      track("lead_form_submit", { source: "form" });

      const lines = [
        "Olá! Quero solicitar orçamento com o BUFFET ALABARSE - CHURRASCO&CIA.",
        "",
        `Nome: ${nome || "-"}`,
        `Telefone: ${telefone || "-"}`,
        `Tipo de evento: ${evento || "-"}`,
        `Data: ${data || "-"}`,
        `Nº de pessoas: ${pessoas || "-"}`,
        `Cidade: ${cidade || "-"}`,
        mensagem ? `Mensagem: ${mensagem}` : ""
      ].filter(Boolean);

      openWhatsApp(lines.join("\n"), "form");
    });
  }

  // Modal de privacidade
  const privacyLink = document.getElementById("privacyLink");
  const modal = document.getElementById("privacyModal");
  function closeModal() {
    if (!modal) return;
    modal.setAttribute("aria-hidden", "true");
  }
  function openModal() {
    if (!modal) return;
    modal.setAttribute("aria-hidden", "false");
  }
  if (privacyLink && modal) {
    privacyLink.addEventListener("click", function (e) {
      e.preventDefault();
      openModal();
    });

    modal.addEventListener("click", function (e) {
      const target = e.target;
      if (target && target.getAttribute && target.getAttribute("data-close") === "1") {
        closeModal();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });
  }
})();

(function(){
  const carousel = document.getElementById("carousel");
  if (!carousel) return;

  const track = carousel.querySelector(".carousel__track");
  const slides = track.children;
  let index = 0;
  let startX = 0;
  let isDragging = false;

  function goToSlide(i){
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
  }

  // autoplay
  setInterval(() => {
    goToSlide(index + 1);
  }, 4000); // 4 segundos

  // swipe mobile
  carousel.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
    isDragging = true;
  });

  carousel.addEventListener("touchend", e => {
    if (!isDragging) return;
    const diff = e.changedTouches[0].clientX - startX;
    if (diff > 50) goToSlide(index - 1);
    if (diff < -50) goToSlide(index + 1);
    isDragging = false;
  });
})();

