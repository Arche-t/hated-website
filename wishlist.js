(function () {
'use strict';

/* ─── Claves localStorage ─────────────────────────────── */
var KEY_WISH = 'hated_wishlist_items';
var KEY_CART = 'hated_cart_items';

/* ─── Referencias DOM ─────────────────────────────────── */
var elEmpty      = document.getElementById('wishlist-empty');
var elContent    = document.getElementById('wishlist-content');
var elCarousel   = document.getElementById('wishlistCarousel');
var elDots       = document.getElementById('carouselIndicators');
var elName       = document.getElementById('detailsName');
var elPrice      = document.getElementById('detailsPrice');
var elType       = document.getElementById('detailsType');
var elSizes      = document.getElementById('detailsSizes');
var elNote       = document.getElementById('detailsNote');
var elToast      = document.getElementById('wishlist-toast');
var elCartCount  = document.getElementById('cartCount');

/* ─── Estado ──────────────────────────────────────────── */
var activeIdx = 0;

/* ─── Storage ─────────────────────────────────────────── */
function loadWish() {
  try {
    var raw = localStorage.getItem(KEY_WISH);
    if (!raw) return [];
    var parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) { return []; }
}

function saveWish(arr) {
  try { localStorage.setItem(KEY_WISH, JSON.stringify(arr)); } catch (e) {}
}

function loadCart() {
  try {
    var raw = localStorage.getItem(KEY_CART);
    if (!raw) return [];
    var parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) { return []; }
}

function saveCart(arr) {
  try { localStorage.setItem(KEY_CART, JSON.stringify(arr)); } catch (e) {}
}

/* ─── Formato ─────────────────────────────────────────── */
function fmt(n) {
  return '$' + Number(n || 0).toLocaleString('es-CO');
}

function esc(s) {
  return String(s || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

/* ─── Mostrar / ocultar (sin depender del atributo hidden) ─ */
function show(el) {
  if (!el) return;
  el.removeAttribute('hidden');
  el.style.display = '';
}

function hide(el) {
  if (!el) return;
  el.setAttribute('hidden', '');
  el.style.display = 'none';
}

/* ─── Toast ───────────────────────────────────────────── */
var toastTid = null;
function toast(msg) {
  if (!elToast) return;
  clearTimeout(toastTid);
  elToast.textContent = msg;
  elToast.classList.add('show');
  toastTid = setTimeout(function () {
    elToast.classList.remove('show');
  }, 2500);
}

/* ─── Contador carrito ────────────────────────────────── */
function refreshCartCount() {
  if (!elCartCount) return;
  var n = loadCart().reduce(function (s, i) { return s + (i.qty || 1); }, 0);
  elCartCount.textContent = String(n);
}

/* ─── Render principal ────────────────────────────────── */
function render() {
  var list = loadWish();          /* siempre fresco del storage */
  elCarousel.innerHTML = '';
  elDots.innerHTML = '';

  if (list.length === 0) {
    show(elEmpty);
    hide(elContent);
    return;
  }

  /* Hay items: mostrar contenido, ocultar empty */
  hide(elEmpty);
  show(elContent);

  /* Clamp del índice activo */
  if (activeIdx >= list.length) activeIdx = list.length - 1;
  if (activeIdx < 0)            activeIdx = 0;

  list.forEach(function (item, i) {
    /* Tarjeta carrusel */
    var card = document.createElement('div');
    card.className = 'wishlist-item' + (i === activeIdx ? ' active' : '');
    card.setAttribute('data-index', String(i));
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.innerHTML =
      '<div class="wishlist-item-img' + (item.image ? ' has-photo' : '') + '">' +
        (item.image
          ? '<img src="' + esc(item.image) + '" alt="' + esc(item.name) + '">'
          : '<svg viewBox="0 0 64 64" aria-hidden="true">' +
              '<g fill="none" stroke="currentColor" stroke-width="1.6"' +
                  ' stroke-linecap="square" stroke-linejoin="miter">' +
                '<path d="M6 10h8l4.8 26a4 4 0 0 0 4 3.4h22.4' +
                         'a4 4 0 0 0 4-3.2L54 18H16"/>' +
                '<circle cx="25" cy="50" r="3.2"/>' +
                '<circle cx="47" cy="50" r="3.2"/>' +
                '<path d="M22 22h28M24 30h24"/>' +
              '</g>' +
            '</svg>'
        ) +
      '</div>' +
      '<div class="wishlist-item-content">' +
        '<div class="wishlist-item-name">'  + esc(item.name)  + '</div>' +
        '<div class="wishlist-item-price">' + fmt(item.price) + '</div>' +
      '</div>';
    elCarousel.appendChild(card);

    /* Dot */
    var dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === activeIdx ? ' active' : '');
    dot.setAttribute('data-index', String(i));
    dot.setAttribute('aria-label', 'Ítem ' + (i + 1));
    elDots.appendChild(dot);
  });

  renderDetails(list);
}

/* ─── Panel de detalles (sin re-renderizar el carrusel) ── */
function renderDetails(list) {
  if (!list) list = loadWish();
  if (list.length === 0) return;

  var item = list[activeIdx];
  elName.textContent  = item.name  || '';
  elPrice.textContent = fmt(item.price);
  elType.textContent  = item.type  || 'Sin asignar';
  elSizes.textContent = item.sizes || 'No especificado';
  elNote.textContent  = item.note  || 'Sin notas';

  /* Resaltar tarjeta y dot activos */
  elCarousel.querySelectorAll('.wishlist-item').forEach(function (c, i) {
    c.classList.toggle('active', i === activeIdx);
  });
  elDots.querySelectorAll('.carousel-dot').forEach(function (d, i) {
    d.classList.toggle('active', i === activeIdx);
  });

  /* Centrar tarjeta activa */
  var activeCard = elCarousel.querySelector('.wishlist-item.active');
  if (activeCard) {
    activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
}

/* ─── Navegación carrusel ─────────────────────────────── */
function goTo(idx) {
  var list = loadWish();
  if (list.length === 0) return;
  if (idx < 0)             idx = list.length - 1;
  if (idx >= list.length)  idx = 0;
  activeIdx = idx;
  renderDetails(list);
}

document.getElementById('carouselPrev').addEventListener('click', function () {
  goTo(activeIdx - 1);
});
document.getElementById('carouselNext').addEventListener('click', function () {
  goTo(activeIdx + 1);
});

elDots.addEventListener('click', function (e) {
  var dot = e.target.closest('[data-index]');
  if (dot && dot.classList.contains('carousel-dot')) {
    goTo(parseInt(dot.getAttribute('data-index'), 10));
  }
});

elCarousel.addEventListener('click', function (e) {
  var card = e.target.closest('.wishlist-item');
  if (card) goTo(parseInt(card.getAttribute('data-index'), 10));
});

elCarousel.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' || e.key === ' ') {
    var card = e.target.closest('.wishlist-item');
    if (card) { e.preventDefault(); goTo(parseInt(card.getAttribute('data-index'), 10)); }
  }
});

/* ─── Añadir al carrito ───────────────────────────────── */
document.getElementById('btn-add-to-cart').addEventListener('click', function () {
  var list = loadWish();
  if (list.length === 0) return;
  var item = list[activeIdx];
  if (!item) return;

  var cart = loadCart();
  var found = cart.find(function (c) { return c.name === item.name; });
  if (found) {
    found.qty = (found.qty || 1) + 1;
  } else {
    cart.push({
      id:    Date.now() + '-' + Math.random().toString(36).slice(2, 8),
      name:  item.name,
      price: item.price,
      note:  item.note  || '',
      type:  item.type  || 'Sin asignar',
      image: item.image || '',
      qty:   1
    });
  }
  saveCart(cart);
  refreshCartCount();
  toast('Añadido al carrito ✓');
});

/* ─── Quitar ítem de la wishlist ──────────────────────── */
document.getElementById('btn-remove-from-wishlist').addEventListener('click', function () {
  var list = loadWish();
  if (list.length === 0) return;
  list.splice(activeIdx, 1);
  saveWish(list);
  if (activeIdx >= list.length) activeIdx = Math.max(0, list.length - 1);
  render();
  toast('Quitado de favoritos');
});

/* ─── Vaciar lista ────────────────────────────────────── */
document.getElementById('btn-clear-wishlist').addEventListener('click', function () {
  if (!confirm('¿Vaciar toda la lista de deseos?')) return;
  saveWish([]);
  activeIdx = 0;
  render();
  toast('Lista vaciada');
});

/* ─── Compartir lista ─────────────────────────────────── */
document.getElementById('btn-share-wishlist').addEventListener('click', function () {
  var list = loadWish();
  if (list.length === 0) { toast('Tu lista está vacía'); return; }

  var total = list.reduce(function (s, i) { return s + (i.price || 0); }, 0);
  var text  = '¡Hola @hated.png! Estas son mis piezas favoritas:\n\n';
  list.forEach(function (item, i) {
    text += (i + 1) + '. ' + item.name + ' — ' + fmt(item.price) + '\n';
    if (item.note) text += '   ' + item.note + '\n';
  });
  text += '\nTotal: ' + fmt(total) + '\n\n¿Están disponibles?';

  if (navigator.share) {
    navigator.share({ title: 'Mi lista de deseos HATED', text: text })
      .then(function () { toast('Lista compartida'); })
      .catch(function (err) { if (err.name !== 'AbortError') copyText(text); });
  } else {
    copyText(text);
  }
});

function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(function () {
        toast('Lista copiada · Abre Instagram y pégala');
        setTimeout(function () {
          window.open('https://www.instagram.com/hated.png/', '_blank');
        }, 1500);
      })
      .catch(function () { toast('No se pudo copiar'); });
  } else {
    toast('Tu dispositivo no permite compartir');
  }
}

/* ─── Header scroll ───────────────────────────────────── */
var hdr = document.getElementById('header');
if (hdr) {
  window.addEventListener('scroll', function () {
    hdr.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });
}

/* ─── Año footer ──────────────────────────────────────── */
var yr = document.getElementById('year');
if (yr) yr.textContent = String(new Date().getFullYear());

/* ─── Init ────────────────────────────────────────────── */
refreshCartCount();
render();

})();
