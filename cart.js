(function () {
'use strict';

var STORAGE_KEY   = 'hated_cart_items';
var SHIPPING_COST = 18000;

var countEl    = document.getElementById('cartCount');
var itemsEl    = document.getElementById('cart-items');
var emptyEl    = document.getElementById('cart-empty');
var deliveryEl = document.getElementById('cart-delivery');
var summaryEl  = document.getElementById('cart-summary');
var subtotalEl = document.getElementById('cart-subtotal');
var shippingRow = document.getElementById('shipping-row');
var shippingEl  = document.getElementById('cart-shipping');
var totalEl     = document.getElementById('cart-total');
var actions1    = document.getElementById('cart-actions-1');
var step1       = document.getElementById('step-1');
var step2       = document.getElementById('step-2');
var captureEl   = document.getElementById('cart-capture');
var previewEl   = document.getElementById('cart-preview');
var previewImg  = document.getElementById('preview-img');
var toastEl     = document.getElementById('cart-toast');
var postShare   = document.getElementById('post-share');
var btnShare    = document.getElementById('btn-share');

var currentImageBlob = null;
var imageGenerating  = false;
var currentImageName = 'hated-pedido-' + Date.now() + '.png';

/* ────────────────────────────────────────────
   UTILIDADES
──────────────────────────────────────────── */
function formatCOP(n) {
  return '$' + Number(n).toLocaleString('es-CO');
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function readCart() {
  try {
    var r = localStorage.getItem(STORAGE_KEY);
    return r ? JSON.parse(r) : [];
  } catch (e) { return []; }
}

function writeCart(items) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (e) {}
}

/* ────────────────────────────────────────────
   TOAST  (corregido: doble rAF para evitar la
   condición de carrera con hidden / display)
──────────────────────────────────────────── */
var toastTimer = null;

function showToast(msg) {
  if (!toastEl) return;
  clearTimeout(toastTimer);
  toastEl.textContent = msg;
  /* Visibilidad controlada solo por CSS — sin hidden para evitar race condition */
  toastEl.classList.add('show');
  toastTimer = setTimeout(function () {
    toastEl.classList.remove('show');
  }, 2500);
}

/* ────────────────────────────────────────────
   CONTADOR
──────────────────────────────────────────── */
function updateCount() {
  if (!countEl) return;
  var total = readCart().reduce(function (s, i) { return s + (i.qty || 1); }, 0);
  countEl.textContent = String(total);
}

/* ────────────────────────────────────────────
   MÉTODO DE ENVÍO
──────────────────────────────────────────── */
function getDeliveryMethod() {
  var r = document.querySelector('input[name="delivery"]:checked');
  return r ? r.value : 'pickup';
}

/* ────────────────────────────────────────────
   RENDER PASO 1
──────────────────────────────────────────── */
function render() {
  var items = readCart();
  itemsEl.innerHTML = '';

  if (items.length === 0) {
    emptyEl.hidden    = false;
    deliveryEl.hidden = true;
    summaryEl.hidden  = true;
    actions1.hidden   = true;
    return;
  }

  emptyEl.hidden    = true;
  deliveryEl.hidden = false;
  summaryEl.hidden  = false;
  actions1.hidden   = false;

  items.forEach(function (item) {
    var qty       = item.qty || 1;
    var itemTotal = item.price * qty;
    var row = document.createElement('div');
    row.className    = 'cart-item';
    row.dataset.id   = item.id;
    row.innerHTML =
      '<div class="cart-item-thumb">' +
        (item.image
          ? '<img src="' + item.image + '" alt="' + escapeHtml(item.name) + '">'
          : '<svg viewBox="0 0 64 64" aria-hidden="true">' +
              '<g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" stroke-linejoin="miter">' +
                '<path d="M6 10h8l4.8 26a4 4 0 0 0 4 3.4h22.4a4 4 0 0 0 4-3.2L54 18H16"/>' +
                '<circle cx="25" cy="50" r="3.2"/><circle cx="47" cy="50" r="3.2"/>' +
              '</g>' +
            '</svg>'
        ) +
      '</div>' +
      '<div class="cart-item-info">' +
        '<div class="cart-item-name">'  + escapeHtml(item.name) + '</div>' +
        '<div class="cart-item-type">'  + escapeHtml(item.type) + '</div>' +
        '<div class="cart-item-note">'  + escapeHtml(item.note) + '</div>' +
        '<div class="cart-item-bottom">' +
          '<div class="cart-item-price">' + formatCOP(itemTotal) + '</div>' +
          '<div class="cart-item-actions">' +
            '<div class="qty-control">' +
              '<button class="qty-btn" data-act="dec" aria-label="Reducir cantidad">−</button>' +
              '<span  class="qty-num">' + qty + '</span>' +
              '<button class="qty-btn" data-act="inc" aria-label="Aumentar cantidad">+</button>' +
            '</div>' +
            '<button class="remove-btn" data-act="remove">Quitar</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    itemsEl.appendChild(row);
  });

  updateTotals();
}

/* ────────────────────────────────────────────
   TOTALES
──────────────────────────────────────────── */
function updateTotals() {
  var items    = readCart();
  var subtotal = items.reduce(function (s, i) { return s + (i.price * (i.qty || 1)); }, 0);
  var method   = getDeliveryMethod();
  var shipping = method === 'shipping' ? SHIPPING_COST : 0;

  subtotalEl.textContent = formatCOP(subtotal);

  if (method === 'shipping') {
    shippingRow.hidden = false;
    shippingEl.textContent = formatCOP(shipping);
  } else {
    shippingRow.hidden = true;
  }

  totalEl.textContent = formatCOP(subtotal + shipping);
}

/* ────────────────────────────────────────────
   INTERACCIONES CON ÍTEMS (qty + remove)
──────────────────────────────────────────── */
itemsEl.addEventListener('click', function (e) {
  var btn = e.target.closest('[data-act]');
  if (!btn) return;
  var row = btn.closest('.cart-item');
  if (!row) return;
  var id  = row.dataset.id;
  var act = btn.dataset.act;
  var items = readCart();
  var idx   = items.findIndex(function (i) { return i.id === id; });
  if (idx < 0) return;

  if      (act === 'inc')    items[idx].qty = (items[idx].qty || 1) + 1;
  else if (act === 'dec')    items[idx].qty = Math.max(1, (items[idx].qty || 1) - 1);
  else if (act === 'remove') items.splice(idx, 1);

  writeCart(items);
  updateCount();
  render();
});

/* ────────────────────────────────────────────
   CAMBIO DE MÉTODO DE ENTREGA
──────────────────────────────────────────── */
document.querySelectorAll('input[name="delivery"]').forEach(function (radio) {
  radio.addEventListener('change', updateTotals);
});

/* ────────────────────────────────────────────
   NAVEGACIÓN ENTRE PASOS
──────────────────────────────────────────── */
document.getElementById('btn-next').addEventListener('click', function () {
  var items = readCart();
  if (items.length === 0) { showToast('El carrito está vacío'); return; }

  step1.hidden = true;
  step2.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  buildCapture();
});

document.getElementById('btn-back').addEventListener('click', function () {
  step2.hidden = true;
  step1.hidden = false;
  /* Resetea el estado del paso 2 */
  currentImageBlob = null;
  imageGenerating  = false;
  if (previewEl) previewEl.hidden = true;
  if (postShare) postShare.hidden = true;
  var instructions = document.querySelector('.cart-instructions');
  if (instructions) instructions.hidden = false;
  setBtnShare(false);
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

var btnNewOrder = document.getElementById('btn-new-order');
if (btnNewOrder) {
  btnNewOrder.addEventListener('click', function () {
    writeCart([]);
    updateCount();
    window.location.href = 'index.html#coleccion';
  });
}

/* ────────────────────────────────────────────
   CONSTRUCCIÓN DE LA CAPTURA (PASO 2)
──────────────────────────────────────────── */
function buildCapture() {
  var items = readCart();
  var captureItemsEl = document.getElementById('capture-items');
  captureItemsEl.innerHTML = '';
  currentImageBlob = null;

  var subtotal = 0;
  items.forEach(function (item) {
    var qty       = item.qty || 1;
    var itemTotal = item.price * qty;
    subtotal += itemTotal;

    var div = document.createElement('div');
    div.className = 'capture-item';
    div.innerHTML =
      '<div class="capture-item-thumb">' +
        (item.image
          ? '<img src="' + item.image + '" alt="' + escapeHtml(item.name) + '">'
          : '<svg viewBox="0 0 64 64" aria-hidden="true">' +
              '<g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" stroke-linejoin="miter">' +
                '<path d="M6 10h8l4.8 26a4 4 0 0 0 4 3.4h22.4a4 4 0 0 0 4-3.2L54 18H16"/>' +
                '<circle cx="25" cy="50" r="3.2"/><circle cx="47" cy="50" r="3.2"/>' +
              '</g>' +
            '</svg>'
        ) +
      '</div>' +
      '<div class="capture-item-info">' +
        '<div class="capture-item-name">'    + escapeHtml(item.name) + '</div>' +
        '<div class="capture-item-details">' + escapeHtml(item.note) + ' · x' + qty + '</div>' +
      '</div>' +
      '<div class="capture-item-price">' + formatCOP(itemTotal) + '</div>';
    captureItemsEl.appendChild(div);
  });

  var method   = getDeliveryMethod();
  var shipping = method === 'shipping' ? SHIPPING_COST : 0;
  var total    = subtotal + shipping;

  document.getElementById('capture-subtotal').textContent = formatCOP(subtotal);
  document.getElementById('capture-total').textContent    = formatCOP(total);
  document.getElementById('capture-delivery-method').textContent =
    method === 'shipping' ? 'Envío nacional' : 'Entrega personal';

  var shipRow = document.getElementById('capture-shipping-row');
  if (method === 'shipping') {
    shipRow.hidden = false;
    document.getElementById('capture-shipping').textContent = formatCOP(shipping);
  } else {
    shipRow.hidden = true;
  }

  /* Genera la imagen después de que el DOM se haya pintado */
  setBtnShare(false, 'Generando imagen…');
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      generateImage();
    });
  });
}

/* ────────────────────────────────────────────
   GENERACIÓN DE IMAGEN (html2canvas)
──────────────────────────────────────────── */
function generateImage() {
  if (typeof html2canvas === 'undefined') {
    showToast('No se pudo cargar html2canvas');
    setBtnShare(false, 'Compartir en Instagram');
    return;
  }
  if (imageGenerating) return;
  imageGenerating = true;

  html2canvas(captureEl, {
    backgroundColor: '#0a0a0f',
    scale: 2,
    useCORS: true,
    logging: false,
    removeContainer: true
  }).then(function (canvas) {
    canvas.toBlob(function (blob) {
      imageGenerating  = false;
      currentImageBlob = blob;
      var url = URL.createObjectURL(blob);
      previewImg.src = url;
      previewEl.hidden = false;
      setBtnShare(true, 'Compartir en Instagram');
    }, 'image/png');
  }).catch(function (err) {
    imageGenerating = false;
    console.error('[HATED] html2canvas error:', err);
    showToast('Error al generar la imagen');
    /* Permite intentar compartir igual usando solo el texto */
    setBtnShare(true, 'Compartir en Instagram');
  });
}

/* ────────────────────────────────────────────
   ESTADO DEL BOTÓN DE COMPARTIR
──────────────────────────────────────────── */
function setBtnShare(enabled, label) {
  if (!btnShare) return;
  btnShare.disabled    = !enabled;
  btnShare.textContent = label || 'Compartir en Instagram';
  btnShare.style.opacity = enabled ? '' : '0.6';
}

/* ────────────────────────────────────────────
   COMPARTIR
──────────────────────────────────────────── */
if (btnShare) {
  btnShare.addEventListener('click', function () {
    if (imageGenerating) { showToast('Generando imagen, espera…'); return; }

    var items    = readCart();
    var method   = getDeliveryMethod();
    var subtotal = items.reduce(function (s, i) { return s + (i.price * (i.qty || 1)); }, 0);
    var shipping = method === 'shipping' ? SHIPPING_COST : 0;
    var total    = subtotal + shipping;

    var text = '¡Hola @hated.png! Quiero hacer un pedido:\n\n';
    items.forEach(function (item, i) {
      text += (i + 1) + '. ' + item.name + ' (x' + (item.qty || 1) + ') — ' + formatCOP(item.price * (item.qty || 1)) + '\n';
      if (item.note) text += '   ' + item.note + '\n';
    });
    text += '\nSubtotal: ' + formatCOP(subtotal);
    if (method === 'shipping') text += '\nEnvío: ' + formatCOP(shipping);
    text += '\nTotal: ' + formatCOP(total);
    text += '\nEntrega: ' + (method === 'shipping' ? 'Envío nacional' : 'Entrega personal en Pereira');

    /* Si tenemos imagen, intentamos Web Share API con archivo */
    if (currentImageBlob && navigator.share && navigator.canShare) {
      var file = new File([currentImageBlob], currentImageName, { type: 'image/png' });
      var shareData = { files: [file], title: 'Pedido HATED', text: text };
      if (navigator.canShare(shareData)) {
        navigator.share(shareData)
          .then(function () { showPostShare(); })
          .catch(function (err) {
            if (err.name !== 'AbortError') fallbackShare(text);
          });
        return;
      }
    }

    /* Fallback: compartir solo texto */
    fallbackShare(text);
  });
}

function showPostShare() {
  var instructions = document.querySelector('.cart-instructions');
  if (instructions) instructions.hidden = true;
  if (postShare) postShare.hidden = false;
  showToast('¡Pedido enviado!');
}

function fallbackShare(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(function () {
        showToast('Resumen copiado · Abre Instagram y pégalo');
        setTimeout(function () {
          window.open('https://www.instagram.com/hated.png/', '_blank');
          showPostShare();
        }, 1500);
      })
      .catch(function () { showToast('No se pudo copiar el resumen'); });
  } else {
    /* Último recurso: abrir Instagram directamente */
    window.open('https://www.instagram.com/hated.png/', '_blank');
    showPostShare();
  }
}

/* ────────────────────────────────────────────
   HEADER SCROLL + AÑO
──────────────────────────────────────────── */
var headerEl = document.getElementById('header');
if (headerEl) {
  window.addEventListener('scroll', function () {
    headerEl.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });
}

var yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

/* ────────────────────────────────────────────
   INIT
──────────────────────────────────────────── */
function initCart() {
  render();
  updateCount();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCart);
} else {
  initCart();
}

})();
