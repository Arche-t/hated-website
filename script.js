// Bottom Nav Active State Logic
function initBottomNav() {
  var navItems = $$('.bottom-nav-item');
  if (!navItems.length) return;

  function updateActiveItem() {
    var scrollY = window.scrollY;
    var sections = [
      { id: 'top', top: 0 },
      { id: 'cat-camisetas', top: $('#cat-camisetas')?.offsetTop || 0 },
      { id: 'coleccion', top: $('#coleccion')?.offsetTop || 0 },
      { id: 'instagram', top: $('#instagram')?.offsetTop || 0 }
    ];

    var currentSection = sections[0];
    sections.forEach(function(sec) {
      if (scrollY >= sec.top - 150) {
        currentSection = sec;
      }
    });

    navItems.forEach(function(item) {
      var href = item.getAttribute('href');
      if (href === '#' + currentSection.id) {
        item.classList.add('bottom-nav-item--active');
      } else {
        item.classList.remove('bottom-nav-item--active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveItem, { passive: true });

  navItems.forEach(function(item) {
    item.addEventListener('click', function(e) {
      navItems.forEach(function(i) { i.classList.remove('bottom-nav-item--active'); });
      item.classList.add('bottom-nav-item--active');
    });
  });

  updateActiveItem();
}
document.addEventListener('DOMContentLoaded', initBottomNav);
(function () {
'use strict';

var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var STORAGE_CART = 'hated_cart_items';
var STORAGE_WISH = 'hated_wishlist_items';
var FREE_SHIPPING_THRESHOLD = 150000;

// TikTok Feed Implementation
function initTikTokFeed() {
  var feed = $('#videoFeed');
  var track = $('#feedTrack');
  var closeBtn = $('#closeFeed');
  var videoCards = $$('.video-card');

  if (!feed || !track || !videoCards.length) return;

  var videoSources = [
    'assets/process/process1.mp4',
    'assets/process/process2.mp4',
    'assets/process/process3.mp4',
    'assets/process/process4.mp4',
    'assets/process/process5.mp4'
  ];

  var videoData = [
    { name: 'Proceso Ritual', desc: 'Intervención manual de piezas rescatadas.' },
    { name: 'Técnica Vascular', desc: 'Costuras expuestas y detalles en rojo sangre.' },
    { name: 'Arte Callejero', desc: 'Piezas únicas inspiradas en la resistencia.' },
    { name: 'Detalles Oscuros', desc: 'Zoom a las costuras y acabados manuales.' },
    { name: 'Cultura HATED', desc: 'Más que ropa, una declaración de principios.' },
    { name: 'Taller Nocturno', desc: 'Donde la magia oscura sucede.' }
  ];

  // Clear existing track content to avoid duplication
  track.innerHTML = '';

  videoSources.forEach(function (src, i) {
    var data = videoData[i] || { name: 'HATED', desc: '' };
    var slide = document.createElement('div');
    slide.className = 'video-slide';
    
    var isLast = (i === videoSources.length - 1);
    var scrollIcon = isLast 
      ? '<path d="M7 11l5 -5 5 5M7 18l5 -5 5 5"/>' 
      : '<path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>';

    slide.innerHTML = `
      <video src="${src}" loop muted playsinline></video>
      <div class="scroll-indicator">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${scrollIcon}
        </svg>
        <span>${isLast ? 'Inicio' : 'Scroll'}</span>
      </div>
    `;
    track.appendChild(slide);
  });

  // Memory for last viewed video index
  var lastViewedIndex = 0;

  videoCards.forEach(function (card) {
    card.addEventListener('click', function () {
      feed.classList.add('open');
      document.body.style.overflow = 'hidden';
      var slides = track.querySelectorAll('.video-slide');
      if (slides[lastViewedIndex]) slides[lastViewedIndex].scrollIntoView();
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      feed.classList.remove('open');
      document.body.style.overflow = '';
      track.querySelectorAll('video').forEach(function (v) { v.pause(); });
    });
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var video = entry.target.querySelector('video');
      if (entry.isIntersecting) {
        video.play().catch(function (e) { console.warn('Autoplay blocked'); });
        // Update last viewed index
        var slides = Array.from(track.querySelectorAll('.video-slide'));
        lastViewedIndex = slides.indexOf(entry.target);
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, { root: feed, threshold: 0.6 });

  track.querySelectorAll('.video-slide').forEach(function (slide) {
    observer.observe(slide);
  });

  // Dynamic Preview for the main card
  var previewVideo = $('#previewVideo');
  if (previewVideo) {
    previewVideo.play().catch(function() {});
    var currentPrevIdx = 0;
    setInterval(function() {
      currentPrevIdx = (currentPrevIdx + 1) % videoSources.length;
      previewVideo.src = videoSources[currentPrevIdx];
      previewVideo.play().catch(function() {});
    }, 5000);
  }
}

document.addEventListener('DOMContentLoaded', initTikTokFeed);

function $(sel, ctx) {
  return (ctx || document).querySelector(sel);
}
function $$(sel, ctx) {
  return Array.from((ctx || document).querySelectorAll(sel));
}
function formatCOP(n) {
  return '$' + n.toLocaleString('es-CO');
}
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function readJSON(key, fallback) {
  try {
    var r = localStorage.getItem(key);
    return r ? JSON.parse(r) : fallback;
  } catch (e) {
    return fallback;
  }
}
function writeJSON(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
}

var toastEl = $('#toast');
var toastTimer;
function showToast(msg, duration) {
  if (!toastEl) return;
  duration = duration || 2200;
  clearTimeout(toastTimer);
  toastEl.textContent = msg;
  /* Visibilidad controlada solo por CSS — sin hidden para evitar race condition */
  toastEl.classList.add('show');
  toastTimer = setTimeout(function () {
    toastEl.classList.remove('show');
  }, duration);
}

var loader = $('#loader');
var startedAt = Date.now();
var minVisible = reduce ? 0 : 1800;
var loaderHidden = false;
function hideLoader() {
  if (loaderHidden || !loader) return;
  loaderHidden = true;
  loader.style.opacity = '0';
  loader.style.visibility = 'hidden';
  setTimeout(function() {
    loader.classList.add('gone');
  }, 450);
  document.body.style.overflow = '';
}
function scheduleHide() {
  setTimeout(hideLoader, Math.max(0, minVisible - (Date.now() - startedAt)));
}
if (loader && !reduce) document.body.style.overflow = 'hidden';
window.addEventListener('load', scheduleHide);
setTimeout(scheduleHide, 4000);
window.addEventListener('pageshow', function (e) {
  if (e.persisted) hideLoader();
});

var headerWrapper = $('#headerWrapper');
var header = $('#header');
if (headerWrapper) {
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    if (y > 20) {
      headerWrapper.classList.add('scrolled');
      if (header) header.classList.add('scrolled');
    } else {
      headerWrapper.classList.remove('scrolled');
      if (header) header.classList.remove('scrolled');
    }
  }, { passive: true });
}

var burger = $('#burger');
var mobileMenu = $('#mobileMenu');
var mobileMenuClose = $('#mobileMenuClose');
var scrim = $('#scrim');

function setMobileMenu(open) {
  if (!burger || !mobileMenu) return;
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  mobileMenu.classList.toggle('open', open);
  mobileMenu.setAttribute('aria-hidden', String(!open));
  if (scrim) {
    scrim.hidden = false;
    scrim.classList.toggle('open', open);
  }
  document.body.style.overflow = open ? 'hidden' : '';
}
if (burger) {
  burger.addEventListener('click', function () {
    setMobileMenu(!mobileMenu.classList.contains('open'));
  });
}
if (mobileMenuClose) mobileMenuClose.addEventListener('click', function () {
  setMobileMenu(false);
});
if (scrim) scrim.addEventListener('click', function () {
  setMobileMenu(false);
});
if (mobileMenu) {
  mobileMenu.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMobileMenu(false);
  });
}
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('open')) {
    setMobileMenu(false);
    if (burger) burger.focus();
  }
});

$$('.mobile-menu-toggle').forEach(function (toggle) {
  toggle.addEventListener('click', function () {
    toggle.classList.toggle('open');
    var submenu = toggle.nextElementSibling;
    if (submenu) submenu.classList.toggle('open');
  });
});

function readCart() {
  return readJSON(STORAGE_CART, []);
}
function writeCart(items) {
  writeJSON(STORAGE_CART, items);
}
function cartCount() {
  return readCart().reduce(function (s, i) {
    return s + (i.qty || 1);
  }, 0);
}

function updateCartCounts() {
  var count = cartCount();
  var els = $$('#cartCount, #cartCountBottom');
  els.forEach(function (el) {
    if (!el) return;
    el.textContent = String(count);
    if (count > 0) el.hidden = false;
    else el.hidden = true;
    el.classList.remove('bounce');
    void el.offsetWidth;
    el.classList.add('bounce');
  });
}

function addToCart(item) {
  var items = readCart();
  var existing = items.find(function (i) {
    return i.name === item.name && i.note === item.note;
  });
  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    items.push(Object.assign({
      id: Date.now() + '-' + Math.random().toString(36).slice(2, 8),
      qty: 1
    }, item));
  }
  writeCart(items);
  updateCartCounts();
  renderMiniCart();
}

function removeFromCart(id) {
  var items = readCart().filter(function (i) {
    return i.id !== id;
  });
  writeCart(items);
  updateCartCounts();
  renderMiniCart();
}

/* ==========================================================================
   GALERÍA DE IMÁGENES EN CARDS
   - Si el card trae data-images="a.jpg,b.jpg,c.jpg" con 2+ rutas, se arma
     una galería (flechas + puntos + swipe).
   - Si trae 1 sola ruta (o ya tenía un <img> normal), se muestra como
     imagen simple, SIN ningún control de galería.
   - Si no tiene imágenes, se respeta el ícono SVG de respaldo.
   ========================================================================== */
function parseImageList(raw) {
  if (!raw) return [];
  return String(raw)
    .split(',')
    .map(function (s) { return s.trim(); })
    .filter(Boolean);
}

function getCardImages(card) {
  if (!card) return [];
  if (card.dataset.images) return parseImageList(card.dataset.images);
  var wrap = card.querySelector('.card-img');
  if (!wrap) return [];
  var slides = $$('.gallery-slide', wrap);
  if (slides.length) {
    return slides.map(function (img) { return img.getAttribute('src'); });
  }
  var single = wrap.querySelector('img');
  return single ? [single.getAttribute('src')] : [];
}

function buildGalleryControls(container, slideSelector, count) {
  var current = 0;

  var prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'gallery-arrow gallery-arrow--prev';
  prevBtn.setAttribute('aria-label', 'Foto anterior');
  prevBtn.innerHTML = '&#10094;';

  var nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'gallery-arrow gallery-arrow--next';
  nextBtn.setAttribute('aria-label', 'Foto siguiente');
  nextBtn.innerHTML = '&#10095;';

  var dots = document.createElement('div');
  dots.className = 'gallery-dots';
  for (var i = 0; i < count; i++) {
    var dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'gallery-dot' + (i === 0 ? ' is-active' : '');
    dot.dataset.index = String(i);
    dot.setAttribute('aria-label', 'Ir a foto ' + (i + 1));
    dots.appendChild(dot);
  }

  container.appendChild(prevBtn);
  container.appendChild(nextBtn);
  container.appendChild(dots);

  function goTo(index) {
    var slides = $$(slideSelector, container);
    var total = slides.length;
    if (!total) return;
    current = ((index % total) + total) % total;
    slides.forEach(function (s) { s.classList.remove('is-active'); });
    slides[current].classList.add('is-active');
    Array.prototype.forEach.call(dots.children, function (d) {
      d.classList.remove('is-active');
    });
    if (dots.children[current]) dots.children[current].classList.add('is-active');
  }

  prevBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    goTo(current - 1);
  });
  nextBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    goTo(current + 1);
  });
  dots.addEventListener('click', function (e) {
    var dot = e.target.closest('.gallery-dot');
    if (!dot) return;
    e.stopPropagation();
    goTo(parseInt(dot.dataset.index, 10));
  });

  var startX = null;
  var startY = null;
  container.addEventListener('touchstart', function (e) {
    if (!e.touches || !e.touches.length) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });
  container.addEventListener('touchend', function (e) {
    if (startX === null || !e.changedTouches || !e.changedTouches.length) { startX = null; return; }
    var dx = e.changedTouches[0].clientX - startX;
    var dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      goTo(current + (dx < 0 ? 1 : -1));
    }
    startX = null;
    startY = null;
  }, { passive: true });

  return {
    goTo: goTo,
    next: function () { goTo(current + 1); },
    prev: function () { goTo(current - 1); },
    prevBtn: prevBtn,
    nextBtn: nextBtn,
    dots: dots
  };
}

function initCardGalleries() {
  $$('.card').forEach(function (card) {
    var wrap = card.querySelector('.card-img');
    if (!wrap) return;

    var urls = [];
    if (card.dataset.images) {
      urls = parseImageList(card.dataset.images);
    } else {
      var legacyImg = wrap.querySelector('img');
      if (legacyImg && legacyImg.getAttribute('src')) urls = [legacyImg.getAttribute('src')];
    }

    if (!urls.length) return; /* sin imagen: se conserva el ícono SVG */

    /* Limpieza defensiva por si la función corre más de una vez */
    $$('img, .gallery-arrow, .gallery-dots', wrap).forEach(function (el) { el.remove(); });

    if (urls.length === 1) {
      var img = document.createElement('img');
      img.src = urls[0];
      img.alt = card.dataset.name || '';
      img.loading = 'lazy';
      wrap.insertBefore(img, wrap.firstChild);
      wrap.classList.remove('has-gallery');
      return; /* una sola imagen: sin galería */
    }

    /* Varias imágenes: se arma la galería */
    wrap.classList.add('has-gallery');
    var frag = document.createDocumentFragment();
    urls.forEach(function (url, i) {
      var img = document.createElement('img');
      img.src = url;
      img.alt = (card.dataset.name || '') + ' — foto ' + (i + 1);
      img.loading = i === 0 ? 'eager' : 'lazy';
      img.className = 'gallery-slide' + (i === 0 ? ' is-active' : '');
      frag.appendChild(img);
    });
    wrap.insertBefore(frag, wrap.firstChild);

    buildGalleryControls(wrap, '.gallery-slide', urls.length);
  });
}
initCardGalleries();

$$('.add').forEach(function (btn) {
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (btn.disabled) return;
    var card = btn.closest('.card');
    if (!card) return;
    var images = getCardImages(card);
    var firstImg = images.length > 0 ? images[0] : '';
    var item = {
      name: card.dataset.name || '',
      price: parseInt(String(card.dataset.price).replace(/[^0-9]/g, ''), 10) || 0,
      note: card.dataset.note || '',
      type: card.dataset.condition || 'Sin asignar',
      image: firstImg
    };
    addToCart(item);
    var label = btn.textContent;
    btn.textContent = 'Añadido';
    btn.classList.add('done');
    setTimeout(function () {
      btn.textContent = label;
      btn.classList.remove('done');
    }, 1200);
    showToast('Pieza añadida al carrito');
  });
});

/* Modificamos el comportamiento del card para que al hacer clic abra el modal y permita usar la wishlist */
$$('.card').forEach(function (card) {
  card.addEventListener('click', function (e) {
    if (e.target.closest('.add')) return; // Evitar abrir modal si se hace clic en el botón añadir
    openModal(card);
  });
});

var miniCart = $('#miniCart');
var miniCartClose = $('#miniCartClose');
var miniCartItems = $('#miniCartItems');
var miniCartEmpty = $('#miniCartEmpty');
var miniCartFoot = $('#miniCartFoot');
var miniCartTotal = $('#miniCartTotal');
var miniCartContinue = $('#miniCartContinue');
var shippingFill = $('#shippingFill');
var shippingMessage = $('#shippingMessage');
var btnCart = $('#btn-cart');
var btnCartBottom = $('#btnCartBottom');

function setMiniCart(open) {
  if (!miniCart) return;
  miniCart.classList.toggle('open', open);
  miniCart.setAttribute('aria-hidden', String(!open));
  if (scrim) {
    scrim.hidden = false;
    scrim.classList.toggle('open', open);
  }
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) renderMiniCart();
}

if (btnCart) btnCart.addEventListener('click', function () {
  setMiniCart(true);
});
if (btnCartBottom) btnCartBottom.addEventListener('click', function () {
  setMiniCart(true);
});
if (miniCartClose) miniCartClose.addEventListener('click', function () {
  setMiniCart(false);
});
if (miniCartContinue) miniCartContinue.addEventListener('click', function () {
  setMiniCart(false);
});

function renderMiniCart() {
  if (!miniCartItems) return;
  var items = readCart();
  miniCartItems.innerHTML = '';

  if (items.length === 0) {
    miniCartEmpty.hidden = false;
    miniCartFoot.hidden = true;
    if (miniCartTotal) miniCartTotal.textContent = formatCOP(0);
    return;
  }

  miniCartEmpty.hidden = true;
  miniCartFoot.hidden = false;

  var subtotal = 0;
  items.forEach(function (item) {
    var qty = item.qty || 1;
    var itemTotal = item.price * qty;
    subtotal += itemTotal;

    var li = document.createElement('li');
    li.className = 'mini-cart-item';
    li.innerHTML =
      '<div class="mini-cart-item-thumb">' +
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
      '<div class="mini-cart-item-info">' +
        '<div class="mini-cart-item-name">' + escapeHtml(item.name) + '</div>' +
        '<div class="mini-cart-item-note">' + escapeHtml(item.note) + ' · x' + qty + '</div>' +
      '</div>' +
      '<div class="mini-cart-item-right">' +
        '<div class="mini-cart-item-price">' + formatCOP(itemTotal) + '</div>' +
        '<button class="mini-cart-item-remove" data-id="' + item.id + '">Quitar</button>' +
      '</div>';
    miniCartItems.appendChild(li);
  });

  if (miniCartTotal) miniCartTotal.textContent = formatCOP(subtotal);
}

if (miniCartItems) {
  miniCartItems.addEventListener('click', function (e) {
    var btn = e.target.closest('.mini-cart-item-remove');
    if (!btn) return;
    removeFromCart(btn.dataset.id);
    showToast('Pieza eliminada');
  });
}

var btnSearch = $('#btn-search');
var searchOverlay = $('#searchOverlay');
var searchClose = $('#searchClose');
var searchInput = $('#searchInput');
var searchResults = $('#searchResults');

function setSearch(open) {
  if (!searchOverlay) return;
  searchOverlay.classList.toggle('open', open);
  searchOverlay.hidden = !open;
  if (open) {
    setTimeout(function () {
      if (searchInput) searchInput.focus();
    }, 100);
    if (scrim) {
      scrim.hidden = false;
      scrim.classList.add('open');
    }
    document.body.style.overflow = 'hidden';
  } else {
    if (scrim && !mobileMenu.classList.contains('open') && !miniCart.classList.contains('open')) {
      scrim.classList.remove('open');
      setTimeout(function () {
        scrim.hidden = true;
      }, 300);
    }
    document.body.style.overflow = '';
    if (searchInput) searchInput.value = '';
    if (searchResults) searchResults.innerHTML = '';
  }
}

if (btnSearch) btnSearch.addEventListener('click', function () {
  setSearch(true);
});
if (searchClose) searchClose.addEventListener('click', function () {
  setSearch(false);
});

if (searchInput) {
  searchInput.addEventListener('input', function () {
    var q = searchInput.value.trim().toLowerCase();
    if (!searchResults) return;
    if (q.length < 2) {
      searchResults.innerHTML = '';
      return;
    }
    var matches = $$('.card').filter(function (card) {
      var name = (card.dataset.name || '').toLowerCase();
      var note = (card.dataset.note || '').toLowerCase();
      return name.indexOf(q) !== -1 || note.indexOf(q) !== -1;
    }).slice(0, 8);
    searchResults.innerHTML = matches.map(function (card) {
      /* Los cards no tienen atributo id: se referencia por data-name,
         igual que en getWishlistItemImage, para poder ubicarlos luego. */
      return '<div class="search-result-item" data-target="' + escapeHtml(card.dataset.name) + '">' +
        '<span class="search-result-name">' + escapeHtml(card.dataset.name) + '</span>' +
        '<span class="search-result-price">' + formatCOP(parseInt(String(card.dataset.price).replace(/[^0-9]/g, ''), 10) || 0) + '</span>' +
      '</div>';
    }).join('');
  });
}

if (searchResults) {
  searchResults.addEventListener('click', function (e) {
    var item = e.target.closest('.search-result-item');
    if (!item) return;
    var name = item.dataset.target;
    var target = $$('.card').find(function (card) {
      return card.dataset.name === name;
    });
    setSearch(false);
    if (target) {
      setTimeout(function () {
        openModal(target);
      }, 300);
    }
  });
}

/* ── Wishlist: siempre leer del storage, nunca de una copia en memoria ── */
var wishlistCountEl = $('#wishlistCount');
var currentCard = null;

function readWishlist() {
  return readJSON(STORAGE_WISH, []);
}

function updateWishlistCount() {
  if (!wishlistCountEl) return;
  var count = readWishlist().length;
  if (count > 0) {
    wishlistCountEl.hidden = false;
    wishlistCountEl.textContent = String(count);
    wishlistCountEl.classList.remove('bounce');
    void wishlistCountEl.offsetWidth;
    wishlistCountEl.classList.add('bounce');
  } else {
    wishlistCountEl.hidden = true;
  }
}

function isItemInWishlist(name) {
  return readWishlist().some(function (i) { return i.name === name; });
}

/* Resuelve la imagen de un ítem de wishlist:
   1) usa la que se guardó al momento de añadirlo a favoritos (item.image)
   2) si no existe, busca el card real en el DOM de la página actual por su nombre
   3) si tampoco lo encuentra (p. ej. en wishlist.html, donde no existen los cards),
      devuelve '' para que quien renderice use el ícono genérico como respaldo */
function getWishlistItemImage(item) {
  if (item && item.image) return item.image;
  if (!item || !item.name) return '';
  var selector = '.card[data-name="' + String(item.name).replace(/"/g, '\\"') + '"]';
  var matchingCard = document.querySelector(selector);
  var img = matchingCard ? matchingCard.querySelector('.card-img img') : null;
  return img ? img.src : '';
}

function toggleWishlist(card) {
  if (!card) return;
  /* Leer del storage en el momento del toggle, no de una copia vieja */
  var list = readWishlist();
  var name = card.dataset.name;
  var idx  = list.findIndex(function (i) { return i.name === name; });

  if (idx >= 0) {
    list.splice(idx, 1);
    writeJSON(STORAGE_WISH, list);
    updateWishlistCount();
    updateModalWishlistBtn();
    showToast('Quitado de favoritos');
  } else {
    var images = getCardImages(card);
    var firstImg = images.length > 0 ? images[0] : '';
    var item = {
      id:           Date.now() + '-' + Math.random().toString(36).slice(2, 8),
      name:         name,
      price:        parseInt(String(card.dataset.price).replace(/[^0-9]/g, ''), 10) || 0,
      note:         card.dataset.note         || '',
      type:         card.dataset.condition    || 'Sin asignar',
      sizes:        card.dataset.sizes        || '',
      measurements: card.dataset.measurements || '',
      state:        card.dataset.state        || '',
      brand:        card.dataset.brand        || 'HATED',
      desc:         card.dataset.desc         || '',
      image:        firstImg
    };
    list.push(item);
    writeJSON(STORAGE_WISH, list);
    updateWishlistCount();
    updateModalWishlistBtn();
    showToast('Añadido a favoritos ♥');
  }
}

function updateModalWishlistBtn() {
  var modalWishlistBtn = $('#modalWishlist');
  var wishlistBtnText  = $('#wishlistBtnText');
  if (modalWishlistBtn && currentCard) {
    /* isItemInWishlist ya lee del storage */
    var inList = isItemInWishlist(currentCard.dataset.name);
    modalWishlistBtn.classList.toggle('active', inList);
    if (wishlistBtnText) {
      wishlistBtnText.textContent = inList ? 'Quitar de favoritos' : 'Añadir a favoritos';
    }
  }
}

updateWishlistCount();

var revealables = $$('.reveal');
if (reduce || !('IntersectionObserver' in window)) {
  revealables.forEach(function (el) {
    el.classList.add('in');
  });
} else {
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  revealables.forEach(function (el) {
    io.observe(el);
  });
}

var yearEl = $('#year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

document.addEventListener('click', function (e) {
  var link = e.target.closest('a[href^="#"]');
  if (!link) return;
  var href = link.getAttribute('href');
  if (href === '#') return;
  var id = href.slice(1);
  var target = document.getElementById(id);
  if (!target) return;
  e.preventDefault();
  setMobileMenu(false);
  setMiniCart(false);
  setSearch(false);
  target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  if (history.pushState) history.pushState(null, '', '#' + id);
});

var modal = $('#productModal');
var modalScrim = $('#modalScrim');
var modalClose = $('#modalClose');
var modalImg = $('#modalImg');
var modalImgWrap = $('#modalImgWrap');
var modalSvg = $('#modalSvg');
var modalGalleryKeyHandler = null;

function clearModalGallery() {
  if (!modalImgWrap) return;
  if (modalGalleryKeyHandler) {
    document.removeEventListener('keydown', modalGalleryKeyHandler);
    modalGalleryKeyHandler = null;
  }
  $$('.gallery-slide, .gallery-arrow, .gallery-dots', modalImgWrap).forEach(function (el) {
    /* modalImg también tiene la clase de imagen simple pero nunca gallery-slide,
       así que este selector solo afecta a lo que insertamos dinámicamente */
    el.remove();
  });
}

function buildModalGallery(images, name) {
  if (!modalImgWrap) return;
  var frag = document.createDocumentFragment();
  images.forEach(function (url, i) {
    var img = document.createElement('img');
    img.src = url;
    img.alt = name + ' — foto ' + (i + 1);
    img.className = 'gallery-slide' + (i === 0 ? ' is-active' : '');
    frag.appendChild(img);
  });
  modalImgWrap.appendChild(frag);

  var controls = buildGalleryControls(modalImgWrap, '.gallery-slide', images.length);
  modalGalleryKeyHandler = function (e) {
    if (!modal || modal.hidden) return;
    if (e.key === 'ArrowLeft') controls.prev();
    if (e.key === 'ArrowRight') controls.next();
  };
  document.addEventListener('keydown', modalGalleryKeyHandler);
}
var modalName = $('#modalName');
var modalPrice = $('#modalPrice');
var modalCondition = $('#modalCondition');
var modalSizes = $('#modalSizes');
var modalMeasurements = $('#modalMeasurements');
var modalState = $('#modalState');
var modalBrand = $('#modalBrand');
var modalDetails = $('#modalDetails');
var modalAdd = $('#modalAdd');
var modalWishlistBtn = $('#modalWishlist');
var wishlistBtnText = $('#wishlistBtnText');

function openModal(card) {
  if (!modal || !card) return;
  currentCard = card;
  var isSold = card.querySelector('.tag--sold');

  modalName.textContent = card.dataset.name || '';
  modalPrice.textContent = card.dataset.price ? formatCOP(Number(card.dataset.price)) : '';
  modalCondition.textContent = card.dataset.condition || '';
  modalSizes.textContent = card.dataset.sizes || 'N/A';
  modalMeasurements.textContent = 'N/A';
  modalState.textContent = card.dataset.state || 'N/A';
  modalBrand.textContent = card.dataset.brand || 'HATED';
  modalDetails.textContent = 'N/A';

  clearModalGallery();
  var images = getCardImages(card);
  if (modalImg && modalSvg) {
    if (images.length === 0) {
      modalImg.hidden = true;
      modalImg.removeAttribute('src');
      modalSvg.hidden = false;
    } else if (images.length === 1) {
      modalImg.src = images[0];
      modalImg.alt = card.dataset.name || '';
      modalImg.hidden = false;
      modalSvg.hidden = true;
    } else {
      /* Varias imágenes: se oculta la imagen simple y se arma la galería */
      modalImg.hidden = true;
      modalImg.removeAttribute('src');
      modalSvg.hidden = true;
      buildModalGallery(images, card.dataset.name || '');
    }
  }

  if (isSold) {
    modal.classList.add('is-sold');
    modalAdd.textContent = 'Vendida';
    modalAdd.disabled = true;
  } else {
    modal.classList.remove('is-sold');
    modalAdd.textContent = 'Añadir al carrito';
    modalAdd.disabled = false;
  }

  /* isItemInWishlist lee del storage, refleja el estado real */
  var inList = isItemInWishlist(card.dataset.name);
  if (modalWishlistBtn) {
    modalWishlistBtn.classList.toggle('active', inList);
    if (wishlistBtnText) {
      wishlistBtnText.textContent = inList ? 'Quitar de favoritos' : 'Añadir a favoritos';
    }
  }

  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  setTimeout(function () {
    modalClose.focus();
  }, 100);
}

function closeModal() {
  if (!modal) return;
  modal.hidden = true;
  document.body.style.overflow = '';
  currentCard = null;
  clearModalGallery();
}

$$('.card').forEach(function (card) {
  var priceEl = card.querySelector('.card-body .price');
  var rawPrice = parseInt(String(card.dataset.price).replace(/[^0-9]/g, ''), 10);
  if (priceEl && !isNaN(rawPrice)) {
    priceEl.textContent = formatCOP(rawPrice);
  }
  card.addEventListener('click', function (e) {
    if (e.target.closest('.add')) return;
    openModal(card);
  });
});

if (modalClose) modalClose.addEventListener('click', closeModal);
if (modalScrim) modalScrim.addEventListener('click', closeModal);
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && modal && !modal.hidden) closeModal();
});

if (modalAdd) {
  modalAdd.addEventListener('click', function (e) {
    e.stopPropagation();
    if (modalAdd.disabled || !currentCard) return;
    var currentPhoto = currentCard.querySelector('.card-img img');
    var item = {
      name: currentCard.dataset.name || '',
      price: parseInt(String(currentCard.dataset.price).replace(/[^0-9]/g, ''), 10) || 0,
      note: currentCard.dataset.note || '',
      type: currentCard.dataset.condition || 'Sin asignar',
      image: currentPhoto ? currentPhoto.src : ''
    };
    addToCart(item);
    var label = modalAdd.textContent;
    modalAdd.textContent = 'Añadido';
    modalAdd.classList.add('done');
    setTimeout(function () {
      modalAdd.textContent = label;
      modalAdd.classList.remove('done');
    }, 1200);
    showToast('Pieza añadida al carrito');
  });
}

if (modalWishlistBtn) {
  modalWishlistBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (currentCard) toggleWishlist(currentCard);
  });
}

updateCartCounts();
renderMiniCart();

window.HATED = {
  readCart: readCart,
  writeCart: writeCart,
  readWishlist: readWishlist,
  getWishlistItemImage: getWishlistItemImage,
  formatCOP: formatCOP,
  escapeHtml: escapeHtml,
  showToast: showToast
};

/* ==========================================================================
   SISTEMA DE CARRUSEL 3D - Clientes Satisfechos
   ========================================================================== */
function initCustomerCarousel() {
  var track = $('#customerTrack');
  var slides = $$('.customer-slide', track);
  var prevBtn = $('#custPrev');
  var nextBtn = $('#custNext');

  if (!track || slides.length === 0) return;

  var currentIdx = 0;

  function updateCarousel() {
    slides.forEach(function (slide, i) {
      slide.classList.remove('active', 'prev', 'next', 'hidden');
      
      if (i === currentIdx) {
        slide.classList.add('active');
      } else if (i === (currentIdx - 1 + slides.length) % slides.length) {
        slide.classList.add('prev');
      } else if (i === (currentIdx + 1) % slides.length) {
        slide.classList.add('next');
      } else {
        slide.classList.add('hidden');
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      currentIdx = (currentIdx - 1 + slides.length) % slides.length;
      updateCarousel();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      currentIdx = (currentIdx + 1) % slides.length;
      updateCarousel();
    });
  }

  updateCarousel();
}

// Iniciar el carrusel
initCustomerCarousel();

/* --- CONTROL de ENTRADA Y MÚSICA --- */
function initEntryExperience() {
  var btnEnter = $('#btnEnter');
  var overlay = $('#entry-overlay');
  var music = $('#bgMusic');

  if (!btnEnter || !overlay) return;

  btnEnter.addEventListener('click', function() {
    // 1. Desvanecer overlay
    overlay.classList.add('gone');
    
    // 2. Iniciar música inmediatamente
    if (music) {
      music.play().then(function() {
        console.log('Música iniciada tras entrar');
      }).catch(function(err) {
        console.error('Error al iniciar música:', err);
      });
    }
  });
}

/* ==========================================================================
   SISTEMA DE CARRUSEL 3D - Clientes Satisfechos
   ========================================================================== */
function initCustomerCarousel() {
  var track = $('#customerTrack');
  var slides = $$('.customer-slide', track);
  var prevBtn = $('#custPrev');
  var nextBtn = $('#custNext');

  if (!track || slides.length === 0) return;

  var currentIdx = 0;

  function updateCarousel() {
    slides.forEach(function (slide, i) {
      slide.classList.remove('active', 'prev', 'next', 'hidden');

      if (i === currentIdx) {
        slide.classList.add('active');
      } else if (i === (currentIdx - 1 + slides.length) % slides.length) {
        slide.classList.add('prev');
      } else if (i === (currentIdx + 1) % slides.length) {
        slide.classList.add('next');
      } else {
        slide.classList.add('hidden');
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      currentIdx = (currentIdx - 1 + slides.length) % slides.length;
      updateCarousel();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      currentIdx = (currentIdx + 1) % slides.length;
      updateCarousel();
    });
  }

  updateCarousel();
}

// Iniciar todo
initEntryExperience();
initCustomerCarousel();
})();
