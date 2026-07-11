let API_URL = "https://script.google.com/macros/s/AKfycbzEnZVzv6_ZSm7B9YtS4ow-csHpI1uDmgRhD6KzAXNtrwKRUWjqXwKYYJqmj6rACZGg/exec";

const BUSINESS_PHONE = "573123723999";
const DELIVERY_FEE = 0;
const PACKAGING_FEE = 1000;
const DEFAULT_OPERATION_CONFIG = {
  packagingFee: PACKAGING_FEE,
  categoryCovers: [],
  deliveryZones: [],
  paymentMethods: [
    { method_id: "nequi", nombre: "Nequi", tipo: "transferencia", detalle: "312 372 3999", activo: true, orden: 1 },
    { method_id: "transferencia", nombre: "Transferencia", tipo: "transferencia", detalle: "Cuenta por confirmar", activo: true, orden: 2 },
    { method_id: "efectivo", nombre: "Efectivo", tipo: "efectivo", detalle: "Pago al recoger", activo: true, orden: 3 }
  ],
  qrImage: ""
};

const DEFAULT_DELIVERY_SECTORS = [
  { sector: "Sector 1", precio: 5000, barrios: "COLOMBIA - RECREO; ISCREDIAL - ISLA DEL ZAPATO; BUENOS AIRES - BUENOS AIRES II; TRES UNIDOS - VICTORIA; MARGARITAS - CALLEJON PERROS; PARNASO - VILLA OLIMPICA; PUEBLO NUEVO - URIBE URIBE; AGUAS CLARAS - MIRADORES CACIQUE; CIPRES DEL LAGO - GALAN; CIUDAD BOLIVAR - COLINAS; OLAYA HERRERA - TORCOROMA; PALMIRA" },
  { sector: "Sector 2", precio: 6000, barrios: "PROGRESO - PROVIVIENDA; ARENAL - SAN FRANCISCO; CAMPANA - CARDALES; DORADO - PLAYAS; DAVID NUÑEZ - SAN LUIS; PRIMERO MAYO - SAN JUDAS; AMERICAS - SANTANA; CAMPO ALEGRE - METROPOLIS; INTERNACIONAL - MALVINAS; LA TORA - LA Y; FLORESTA - LIBERTAD; FLORESTA BAJA - VILLA LUZ; ALTO ANGELES - BARRIO INDEPENDENCIA; TRIUNFO - PORVENIR; COLINAS SEMINARIO - CHAPINERO; CANDELARIA - MIRAFLORES; SIMON BOLIVAR - EL UNO; ALTOS DEL ROSARIO" },
  { sector: "Sector 3", precio: 7000, barrios: "GRANJAS - BENJAMIN HERRERA; VERSALLES - ALCAZAR; ESPERANZA - NUEVA ESPERANZA; BELEN - LOS FICUS; LUIS ELEAZAR - 20 ENERO; SANTA ISABEL - COVIVA; OBRAS PUBLICAS - CRISTO REY; CIUDADELA PIPATON - CORTIJILLO; MARSELLA - BRISAS DEL INTERCAMBIADOR; YARIMA - ANTONIA SANTOS; SANTA BARBARA - ALTOS CAÑAVERAL; BAMBU - LOS PINOS; CINCUENTENARIO - REFUGIO; CERRO - PLANA DEL CERRO; BELLAVISTA - LIMONAR; NARANJOS - MANDARINOS; MIRADORES LA CEIBA - AUTOCONSTRUCCION; PRADOS CINCUENTENARIO; CIUDADELA CINCUENTENARIO; EL NOGAL - PENINSULA; CASTILLO - ANTONIO GALAN; VILLA SANDRA - NUEVO MILENIO SUR; LA LIGA - VILLA DE LEYVA; PALMAR - TAMARINDOS; LA PAZ - NOVALITO; VILLANUEVA - ALGARROBOS" },
  { sector: "Sector 4", precio: 8000, barrios: "ALPES - ALAMOS; 20 AGOSTO - BOSTON; DANUBIO - NARIÑO; SAN MARTIN - PUMARROSOS; RANGEL - COMUNEROS; ROSARIO - 25 AGOSTO; YARIGUIES; JERUSALEN - COLINAS DEL NORTE; VIYARELIS - BUENA VISTA; POZO 7 - VILLA AURA; 9 ABRIL - NUEVO HORIZONTE; PALOCA - PABLO ACUÑA; CAMPIN - MARIA EUGENIA; CAMPESTRE - PARAISO; MINAS PARAISO - VIVERO CLUB; RESERVA CARDALES - SIENA 37; RETEN - BONANZA; AGUAS BARRAN - SAN SILVESTRE" },
  { sector: "Sector 5", precio: 9000, barrios: "ALTOS DE ISRAEL - VILLA LUISA; HOTEL MIRAMAR; CIUDAD DEL SOL - TERRAZAS; PRADOS ARGELIA - ALTOS ARGELIA; 22 DE MARZO - VILLA MARI" },
  { sector: "Sector 6", precio: 15000, barrios: "GLAMPING MANHATAN; OLGA LUCIA; VILLA LINDA" },
  { sector: "Sector 7", precio: 20000, barrios: "PUENTE YONDO - PUERTA NORTE; PUERTA DEL 11 - LAURELES; GENEZARED - LA ELVIRA; CAFABA - AEROPUERTO; IMPALA" },
  { sector: "Sector 8", precio: 30000, barrios: "CENTRO; LLANITO" }
];

function defaultDeliveryZones() {
  let order = 1;
  return DEFAULT_DELIVERY_SECTORS.flatMap(group => splitZoneNames(group.barrios).map(nombre => ({
    zone_id: slugify(`${group.sector}-${nombre}`),
    nombre,
    sector: group.sector,
    aliases: [`barrio ${nombre}`, nombre],
    precio: group.precio,
    activo: true,
    orden: order++
  })));
}

function splitZoneNames(value = "") {
  return String(value).split(";").map(item => item.trim()).filter(Boolean);
}

DEFAULT_OPERATION_CONFIG.deliveryZones = defaultDeliveryZones();
const MAX_QTY = 999999;
const MENU_FETCH_TIMEOUT_MS = 3800;
const MENU_SYNC_INTERVAL_MS = 2500;
const ORDER_RECORD_FAST_TIMEOUT_MS = 1400;
const MENU_CACHE_KEY = "chanchos_menu_cache_v5";
const MENU_PENDING_KEY = "chanchos_menu_pending_v1";
const SHARED_MENU_CHANGE_KEY = "oscars_menu_change_event_v1";
const CLIENT_SYNC_SOURCE_ID = `index-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const SHARED_MENU_ACTIONS = new Set(["upsertProduct", "deleteProduct", "upsertExtra", "deleteExtra", "upsertOperationConfig"]);
const EMAIL_AUTOFILL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const STATIC_PRODUCT_IMAGES = [];

const KNOWN_PRODUCT_IMAGES_BY_ID = {};

const IMAGE_CATEGORY_GROUPS = {};

const CATEGORY_DETECTION_ORDER = [];

const IMAGE_MATCH_STOP_WORDS = new Set([
  "bebida",
  "bebidas",
  "con",
  "de",
  "del",
  "en",
  "la",
  "las",
  "los",
  "para",
  "sabor",
  "sabores",
  "subcategoria"
]);

const IMAGE_MATCH_TYPE_WORDS = new Set([
  "cerveza",
  "gaseosa",
  "granizado",
  "limonada"
]);

const CATEGORY_ORDER = [
  "bebidas",
  "burgers",
  "perros",
  "alitas",
  "picadas",
  "desgranados",
  "sandwiches",
  "papas-especiales",
  "ensaladas",
  "crepes",
  "patacones",
  "cortes",
  "pizzetas",
  "menu-infantil",
  "pizzas",
  "pizzas-especiales",
  "pizzas-familiares",
  "pizzas-premium",
  "combos",
  "entradas"
];

const CATEGORY_LABELS = {
  bebidas: "Bebidas",
  burgers: "Burgers",
  perros: "Perros",
  alitas: "Alitas",
  picadas: "Picadas",
  desgranados: "Desgranados",
  sandwiches: "Sandwiches",
  "papas-especiales": "Papas Especiales",
  ensaladas: "Ensaladas",
  crepes: "Crepes",
  patacones: "Patacones",
  cortes: "Cortes",
  pizzetas: "Pizzetas",
  "menu-infantil": "Menú Infantil",
  pizzas: "Hamburguesas",
  "pizzas-especiales": "Parrilla",
  "pizzas-familiares": "Familiares",
  "pizzas-premium": "Premium",
  combos: "Combos",
  entradas: "Entradas"
};

const STOREFRONT_CATEGORY_MAP = {
  "tortas-personalizadas": "pizzas",
  "tortas-infantiles": "pizzas-especiales",
  "tortas-elegantes": "pizzas-premium",
  postres: "entradas",
  cupcakes: "pizzas-especiales",
  brownies: "combos",
  cheesecakes: "pizzas-familiares",
  "mini-postres": "entradas",
  "mesa-dulce": "combos",
  desayunos: "combos",
  macarons: "entradas",
  galletas: "entradas",
  toppers: "entradas"
};

const CATEGORIES_WITHOUT_EXTRAS = new Set([
  "bebidas"
]);

const demoMenu = {
  products: [
    {
      producto_id: "demo-pizza-pepperoni",
      categoria_id: "pizzas",
      nombre: "Hamburguesa Parrillera",
      precio: 32000,
      descripcion: "Hamburguesa a la parrilla con salsa de la casa y sabor ahumado.",
      imagen: "",
      orden: 1,
      activo: true
    },
    {
      producto_id: "demo-pizza-hawaiana",
      categoria_id: "pizzas",
      nombre: "Hamburguesa BBQ",
      precio: 30000,
      descripcion: "Carne a la parrilla, salsa BBQ, queso fundido y vegetales frescos.",
      imagen: "",
      orden: 2,
      activo: true
    },
    {
      producto_id: "demo-pizza-especial",
      categoria_id: "pizzas-especiales",
      nombre: "Oscar's Parrilla Especial",
      precio: 42000,
      descripcion: "Combinación de carnes, vegetales frescos y salsa especial de la casa.",
      imagen: "",
      orden: 3,
      activo: true
    },
    {
      producto_id: "demo-combo",
      categoria_id: "combos",
      nombre: "Combo Hamburguesa y Bebida",
      precio: 56000,
      descripcion: "Hamburguesa, bebida y entrada para compartir.",
      imagen: "",
      orden: 4,
      activo: true
    }
  ],
  extras: [
    { extra_id: "extra-queso", nombre: "Queso extra", precio: 5000, orden: 1, activo: true },
    { extra_id: "extra-borde", nombre: "Borde de queso", precio: 7000, orden: 2, activo: true },
    { extra_id: "extra-pepperoni", nombre: "Pepperoni extra", precio: 6000, orden: 3, activo: true },
    { extra_id: "extra-salsa", nombre: "Salsa de ajo", precio: 2500, orden: 4, activo: true }
  ]
};

const state = {
  products: [],
  extras: [],
  operationConfig: DEFAULT_OPERATION_CONFIG,
  categories: [],
  cart: [],
  activeCategory: "",
  search: "",
  adminToken: "",
  adminProductCategory: "todas",
  adminProductSearch: "",
  editingProductId: "",
  editingExtraId: "",
  pendingMenuWrites: readPendingMenuWrites(),
  menuFingerprint: "",
  menuSyncInProgress: false,
  menuRefreshQueued: false,
  menuPollTimer: null,
  updatedAt: "",
  categoryNoticeTimer: null
};

const el = {
  categories: document.getElementById("categories"),
  catalog: document.getElementById("catalog"),
  search: document.getElementById("search"),
  refreshMenu: document.getElementById("refresh-menu"),
  bottomCart: document.getElementById("bottom-cart"),
  bottomMenu: document.getElementById("bottom-menu"),
  syncStatus: document.getElementById("sync-status"),
  cartCount: document.getElementById("cart-count"),
  floatingCart: document.getElementById("floating-cart"),
  floatingCount: document.getElementById("floating-count"),
  openCart: document.getElementById("open-cart"),
  closeCart: document.getElementById("close-cart"),
  cartDrawer: document.getElementById("cart-drawer"),
  cartItems: document.getElementById("cart-items"),
  cartSubtotal: document.getElementById("cart-subtotal"),
  cartTotal: document.getElementById("cart-total"),
  checkoutBtn: document.getElementById("checkout-btn"),
  clearCart: document.getElementById("clear-cart"),
  productModal: document.getElementById("product-modal"),
  modalContent: document.getElementById("modal-content"),
  modalClose: document.getElementById("modal-close"),
  checkoutModal: document.getElementById("checkout-modal"),
  checkoutClose: document.getElementById("checkout-close"),
  checkoutProductsModal: document.getElementById("checkout-products-modal"),
  checkoutProductsClose: document.getElementById("checkout-products-close"),
  checkoutProductsList: document.getElementById("checkout-products-list"),
  checkoutProductsFull: document.getElementById("checkout-products-full"),
  checkoutProductsDetail: document.getElementById("checkout-products-detail"),
  checkoutForm: document.getElementById("checkout-form"),
  step1: document.getElementById("step1"),
  step2: document.getElementById("step2"),
  nextStep1: document.getElementById("next-step1"),
  backStep2: document.getElementById("back-step2"),
  backToCart: document.getElementById("back-to-cart"),
  clientSummary: document.getElementById("client-summary"),
  addressLabel: document.getElementById("address-label"),
  addressInput: document.getElementById("checkout-address"),
  addressHelper: document.getElementById("address-helper"),
  paymentMethod: document.getElementById("payment-method"),
  transferInfo: document.getElementById("transfer-info"),
  cartProductsCheckout: document.getElementById("cart-products-checkout"),
  cartPackaging: document.getElementById("cart-packaging"),
  cartDeliveryLabel: document.getElementById("cart-delivery-label"),
  cartDelivery: document.getElementById("cart-delivery"),
  cartTotalCheckout: document.getElementById("cart-total-checkout"),
  menuBtn: document.getElementById("menu-btn"),
  sideMenu: document.getElementById("side-menu"),
  closeMenu: document.getElementById("close-menu"),
  adminOpen: document.getElementById("admin-open"),
  adminOpenMenu: document.getElementById("admin-open-menu"),
  adminPanel: document.getElementById("admin-panel"),
  adminClose: document.getElementById("admin-close"),
  adminLogout: document.getElementById("admin-logout"),
  adminReload: document.getElementById("admin-reload"),
  adminLogin: document.getElementById("admin-login"),
  adminWorkspace: document.getElementById("admin-workspace"),
  adminToken: document.getElementById("admin-token"),
  adminUnlock: document.getElementById("admin-unlock"),
  productForm: document.getElementById("product-form"),
  productReset: document.getElementById("product-reset"),
  productCancel: document.getElementById("product-cancel"),
  productSubmitLabel: document.getElementById("product-submit-label"),
  productHasOptions: document.getElementById("product-has-options"),
  adminProductSearch: document.getElementById("admin-product-search"),
  productOptionsEditor: document.getElementById("product-options-editor"),
  adminProductCategories: document.getElementById("admin-product-categories"),
  productList: document.getElementById("admin-product-list"),
  extraForm: document.getElementById("extra-form"),
  extraReset: document.getElementById("extra-reset"),
  extraList: document.getElementById("admin-extra-list"),
  toast: document.getElementById("toast"),
  loader: document.getElementById("app-loader"),
  loaderTitle: document.getElementById("loader-title"),
  loaderText: document.getElementById("loader-text"),
  smartDialog: document.getElementById("smart-dialog"),
  smartDialogClose: document.getElementById("smart-dialog-close"),
  smartDialogKicker: document.getElementById("smart-dialog-kicker"),
  smartDialogTitle: document.getElementById("smart-dialog-title"),
  smartDialogMessage: document.getElementById("smart-dialog-message"),
  smartDialogField: document.getElementById("smart-dialog-field"),
  smartDialogInput: document.getElementById("smart-dialog-input"),
  smartDialogCancel: document.getElementById("smart-dialog-cancel"),
  smartDialogConfirm: document.getElementById("smart-dialog-confirm"),
  chatToggle: document.getElementById("chat-toggle"),
  chatPanel: document.getElementById("chat-panel"),
  chatClose: document.getElementById("chat-close"),
  chatMessages: document.getElementById("chat-messages"),
  chatForm: document.getElementById("chat-form"),
  chatInput: document.getElementById("chat-input")
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  resetCatalogSearch(false);
  bindEvents();
  bindAdminMoneyInputs();
  disableSearchAutofill();
  clearCachedMenu();
  renderAll();
  await loadMenu({ background: true });
  startMenuRealtimeSync();
  window.setTimeout(() => resetCatalogSearch(true), 0);
}

function bindEvents() {
  bindCategoryWheelScroll();

  el.search.addEventListener("input", event => {
    state.search = sanitizeCatalogSearch(event.currentTarget.value);
    renderProducts();
  });

  el.refreshMenu.addEventListener("click", () => loadMenu({ force: true }));
  el.openCart.addEventListener("click", openCart);
  el.bottomCart.addEventListener("click", openCart);
  el.bottomMenu.addEventListener("click", openSideMenu);
  el.floatingCart.addEventListener("click", openCart);
  el.closeCart.addEventListener("click", closeCart);
  el.checkoutBtn.addEventListener("click", openCheckout);
  el.clearCart.addEventListener("click", clearCart);
  el.modalClose.addEventListener("click", closeProductModal);
  el.productModal.addEventListener("click", event => {
    if (event.target === el.productModal) closeProductModal();
  });

  el.checkoutClose.addEventListener("click", closeCheckout);
  el.checkoutModal.addEventListener("click", event => {
    if (event.target === el.checkoutModal) closeCheckout();
  });
  el.checkoutProductsDetail?.addEventListener("click", openCheckoutProductsModal);
  el.checkoutProductsClose?.addEventListener("click", closeCheckoutProductsModal);
  el.checkoutProductsModal?.addEventListener("click", event => {
    if (event.target === el.checkoutProductsModal) closeCheckoutProductsModal();
  });
  el.backToCart.addEventListener("click", () => {
    closeCheckout();
    openCart();
  });
  el.nextStep1.addEventListener("click", goToCheckoutStep2);
  el.backStep2.addEventListener("click", () => setCheckoutStep(1));
  el.checkoutForm.addEventListener("change", updateCheckoutControls);
  el.checkoutForm.addEventListener("input", updateCheckoutControls);
  el.checkoutForm.addEventListener("submit", submitCheckout);
  el.transferInfo.addEventListener("click", event => {
    const downloadButton = event.target.closest("[data-download-qr]");
    if (downloadButton) {
      downloadQrImage(downloadButton.dataset.downloadQr || "");
      return;
    }
    const button = event.target.closest("[data-copy-payment]");
    if (!button) return;
    copyText(button.dataset.copyPayment || "");
  });

  el.menuBtn.addEventListener("click", openSideMenu);
  el.closeMenu.addEventListener("click", closeSideMenu);
  el.sideMenu.addEventListener("click", event => {
    if (event.target === el.sideMenu) closeSideMenu();
  });

  if (el.adminOpen?.tagName === "BUTTON") {
    el.adminOpen.addEventListener("click", openAdmin);
  }
  if (el.adminOpenMenu?.tagName === "BUTTON") {
    el.adminOpenMenu.addEventListener("click", () => {
      closeSideMenu();
      openAdmin();
    });
  }
  el.adminClose.addEventListener("click", closeAdmin);
  el.adminLogout.addEventListener("click", () => logoutAdmin(true));
  el.adminReload.addEventListener("click", () => loadMenu({ force: true }));
  el.adminUnlock.addEventListener("click", unlockAdmin);
  el.adminToken.addEventListener("keydown", event => {
    if (event.key === "Enter") unlockAdmin();
  });

  document.querySelectorAll("[data-admin-tab]").forEach(button => {
    button.addEventListener("click", () => setAdminTab(button.dataset.adminTab));
  });

  el.productForm.addEventListener("submit", saveProduct);
  el.productReset.addEventListener("click", resetProductForm);
  el.productCancel.addEventListener("click", resetProductForm);
  el.productHasOptions.addEventListener("change", () => {
    renderProductOptionsEditor(normalizeProductOptions(el.productForm.elements.opciones.value), el.productHasOptions.checked);
    updateEditedFields(el.productForm);
  });
  el.adminProductSearch.addEventListener("input", () => {
    state.adminProductSearch = el.adminProductSearch.value.trim().toLowerCase();
    renderAdminProducts();
  });
  el.extraForm.addEventListener("submit", saveExtra);
  el.extraReset.addEventListener("click", resetExtraForm);
  el.productForm.addEventListener("input", () => updateEditedFields(el.productForm));
  el.extraForm.addEventListener("input", () => updateEditedFields(el.extraForm));
  el.productForm.elements.activo.addEventListener("change", () => updateSwitchLabels());
  el.extraForm.elements.activo.addEventListener("change", () => updateSwitchLabels());
  el.chatToggle?.addEventListener("click", openChat);
  el.chatClose?.addEventListener("click", closeChat);
  el.chatForm?.addEventListener("submit", submitChat);
  document.querySelectorAll("[data-chat-question]").forEach(button => {
    button.addEventListener("click", () => handleChatQuestion(button.dataset.chatQuestion || ""));
  });

  window.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeProductModal();
      closeCheckout();
      closeCheckoutProductsModal();
      closeSideMenu();
    }
  });
}

function bindCategoryWheelScroll() {
  if (!el.categories) return;
  el.categories.addEventListener("wheel", event => {
    const scroller = el.categories;
    const maxScroll = scroller.scrollWidth - scroller.clientWidth;
    if (maxScroll <= 0) return;

    const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    if (!delta) return;

    const atStart = scroller.scrollLeft <= 0;
    const atEnd = scroller.scrollLeft >= maxScroll - 1;
    if ((delta < 0 && atStart) || (delta > 0 && atEnd)) return;

    event.preventDefault();
    scroller.scrollLeft = Math.max(0, Math.min(maxScroll, scroller.scrollLeft + delta));
  }, { passive: false });
}

async function loadMenu(options = {}) {
  if (state.menuSyncInProgress) {
    state.menuRefreshQueued = true;
    return;
  }
  state.menuSyncInProgress = true;
  const hasMenu = state.products.length;
  if (!options.background || !hasMenu) setSync("Sincronizando");
  const configuredUrl = API_URL.trim();

  if (!configuredUrl) {
    applyMenu(emptyRemoteMenu(), { force: true });
    setSync("Sin conexión");
    state.menuSyncInProgress = false;
    return;
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), MENU_FETCH_TIMEOUT_MS);
  try {
    const url = new URL(configuredUrl);
    url.searchParams.set("action", "menu");
    url.searchParams.set("_", Date.now().toString());

    const response = await fetch(url.toString(), { method: "GET", cache: "no-store", signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const payload = await response.json();
    if (!payload.ok) throw new Error(payload.error || "Respuesta inválida");

    const remoteMenu = prepareFrontendMenu(payload.data || payload);
    applyMenu(remoteMenu, { force: options.force });
    setSync("Carta actualizada");
  } catch (error) {
    console.error(error);
    applyMenu(emptyRemoteMenu(), { force: true });
    setSync("Sin sincronizar");
    toast("No se pudo sincronizar la carta desde Supabase.");
  } finally {
    state.menuSyncInProgress = false;
    window.clearTimeout(timeoutId);
    if (state.menuRefreshQueued) {
      state.menuRefreshQueued = false;
      window.setTimeout(() => loadMenu({ background: true, force: true }), 120);
    }
  }
}

function startMenuRealtimeSync() {
  bindSharedMenuChangeListener();
  window.clearInterval(state.menuPollTimer);
  state.menuPollTimer = window.setInterval(() => {
    loadMenu({ background: true });
  }, MENU_SYNC_INTERVAL_MS);

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) loadMenu({ background: true, force: true });
  });
  window.addEventListener("focus", () => loadMenu({ background: true, force: true }));
  window.addEventListener("online", () => loadMenu({ background: true, force: true }));
}

function bindSharedMenuChangeListener() {
  if (bindSharedMenuChangeListener.bound) return;
  bindSharedMenuChangeListener.bound = true;

  window.addEventListener("storage", event => {
    if (event.key !== SHARED_MENU_CHANGE_KEY || !event.newValue) return;
    try {
      handleSharedMenuChange(JSON.parse(event.newValue));
    } catch (error) {
      console.warn("No se pudo leer aviso de actualizacion de carta", error);
    }
  });

  if ("BroadcastChannel" in window) {
    const channel = new BroadcastChannel(SHARED_MENU_CHANGE_KEY);
    channel.addEventListener("message", event => handleSharedMenuChange(event.data));
    bindSharedMenuChangeListener.channel = channel;
  }
}

function announceSharedMenuChange(action, data = {}) {
  if (!isSharedMenuAction(action)) return;
  const message = {
    source: "index",
    origin: CLIENT_SYNC_SOURCE_ID,
    action,
    id: data.product?.producto_id || data.producto_id || data.extra?.extra_id || data.extra_id || action,
    payload: sharedMenuPayload(action, data),
    at: Date.now()
  };

  try {
    localStorage.setItem(SHARED_MENU_CHANGE_KEY, JSON.stringify(message));
  } catch (error) {
    console.warn("No se pudo publicar cambio de carta", error);
  }
  bindSharedMenuChangeListener.channel?.postMessage(message);
}

function handleSharedMenuChange(message = {}) {
  if (message.origin === CLIENT_SYNC_SOURCE_ID) return;
  if (!isSharedMenuAction(message.action)) return;
  if (Date.now() - moneyToNumber(message.at) > 20000) return;
  const applied = applySharedMenuChange(message);
  requestMenuRefreshSoon(applied ? 350 : 120);
}

function requestMenuRefreshSoon(delay = 250) {
  window.clearTimeout(requestMenuRefreshSoon.timer);
  requestMenuRefreshSoon.timer = window.setTimeout(() => {
    loadMenu({ background: true, force: true });
  }, delay);
}

function isSharedMenuAction(action) {
  return SHARED_MENU_ACTIONS.has(action);
}

function sharedMenuPayload(action, data = {}) {
  if (action === "upsertProduct" && data.product) return { product: data.product };
  if (action === "deleteProduct") return { producto_id: data.producto_id };
  if (action === "upsertExtra" && data.extra) return { extra: data.extra };
  if (action === "deleteExtra") return { extra_id: data.extra_id };
  return {};
}

function applySharedMenuChange(message = {}) {
  const payload = message.payload || {};
  if (message.action === "upsertProduct" && payload.product) {
    upsertStorefrontProduct(normalizeIncomingStorefrontProduct(normalizeProduct(payload.product)), true);
    finalizeOptimisticMenuChange();
    return true;
  }

  if (message.action === "deleteProduct" && payload.producto_id) {
    state.products = state.products.filter(product => product.producto_id !== payload.producto_id);
    state.categories = buildCategories(state.products);
    finalizeOptimisticMenuChange();
    return true;
  }

  if (message.action === "upsertExtra" && payload.extra) {
    upsertStorefrontExtra(normalizeExtra(payload.extra));
    finalizeOptimisticMenuChange();
    return true;
  }

  if (message.action === "deleteExtra" && payload.extra_id) {
    state.extras = state.extras.filter(extra => extra.extra_id !== payload.extra_id);
    finalizeOptimisticMenuChange();
    return true;
  }

  return false;
}

function finalizeOptimisticMenuChange() {
  state.updatedAt = new Date().toISOString();
  renderAll();
}

function applyCachedMenu() {
  clearCachedMenu();
}

function readCachedMenu() {
  clearCachedMenu();
  return null;
}

function cacheMenu(menu) {
  clearCachedMenu();
}

function clearCachedMenu() {
  try {
    localStorage.removeItem(MENU_CACHE_KEY);
  } catch (error) {
    console.warn("No se pudo limpiar cache local de carta", error);
  }
}

function emptyRemoteMenu() {
  return {
    products: [],
    extras: [],
    operationConfig: state.operationConfig || DEFAULT_OPERATION_CONFIG,
    updatedAt: new Date().toISOString()
  };
}

function normalizeOperationConfig(config = {}) {
  const fallback = DEFAULT_OPERATION_CONFIG;
  const packagingFee = moneyToNumber(config.packagingFee ?? config.packaging_fee ?? fallback.packagingFee);
  const deliveryZones = Array.isArray(config.deliveryZones || config.delivery_zones)
    ? (config.deliveryZones || config.delivery_zones)
    : fallback.deliveryZones;
  const paymentMethods = Array.isArray(config.paymentMethods || config.payment_methods)
    ? (config.paymentMethods || config.payment_methods)
    : fallback.paymentMethods;

  return {
    packagingFee: Math.max(0, packagingFee),
    deliveryZones: deliveryZones.map((zone, index) => {
      const nombre = zone.nombre || zone.name || `Zona ${index + 1}`;
      return {
        zone_id: zone.zone_id || zone.id || slugify(nombre),
        nombre,
        aliases: expandZoneAliases(nombre, zone.aliases),
        precio: Math.max(0, moneyToNumber(zone.precio ?? zone.price)),
        activo: zone.activo !== false,
        orden: moneyToNumber(zone.orden ?? index + 1)
      };
    }).filter(zone => zone.activo && zone.nombre).sort(sortByOrderThenName),
    paymentMethods: paymentMethods.map((method, index) => ({
      method_id: method.method_id || method.id || slugify(method.nombre || method.name || `metodo-${index + 1}`),
      nombre: method.nombre || method.name || `Metodo ${index + 1}`,
      tipo: normalizeComparable(method.tipo || method.type || method.method_type || "transferencia"),
      detalle: method.detalle || method.detail || method.cuenta || "",
      titular: method.titular || method.owner || "",
      activo: method.activo !== false,
      orden: moneyToNumber(method.orden ?? index + 1)
    })).filter(method => method.activo && method.nombre).sort(sortByOrderThenName),
    categoryCovers: normalizeCategoryCovers(config.categoryCovers || config.category_covers || []),
    qrImage: String(config.qrImage || config.qr_image || "").trim()
  };
}

function normalizeCategoryCovers(covers = []) {
  const list = Array.isArray(covers) ? covers : [];
  return list
    .map((cover, index) => ({
      category_id: normalizeCategoryId(cover.category_id || cover.categoria_id || cover.id || ""),
      image_url: String(cover.image_url || cover.imagen || cover.url || cover.image || "").trim(),
      storage_path: String(cover.storage_path || cover.path || "").trim(),
      orden: moneyToNumber(cover.orden ?? index + 1),
      updated_at: cover.updated_at || cover.updatedAt || ""
    }))
    .filter(cover => cover.category_id && cover.image_url)
    .sort((a, b) => moneyToNumber(a.orden) - moneyToNumber(b.orden) || a.category_id.localeCompare(b.category_id, "es"));
}

function expandZoneAliases(name, aliases) {
  const explicit = Array.isArray(aliases)
    ? aliases
    : String(aliases || "").split(",").map(item => item.trim()).filter(Boolean);
  const parts = String(name || "").split(/\s*-\s*/).map(item => item.trim()).filter(Boolean);
  return [...new Set([name, `barrio ${name}`, ...parts, ...parts.map(part => `barrio ${part}`), ...explicit].filter(Boolean))];
}

function readPendingMenuWrites() {
  try {
    const raw = localStorage.getItem(MENU_PENDING_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePendingMenuWrites() {
  try {
    localStorage.setItem(MENU_PENDING_KEY, JSON.stringify(state.pendingMenuWrites.slice(-50)));
  } catch (error) {
    console.warn("No se pudo guardar cola local de carta", error);
  }
}

function queuePendingMenuWrite(action, data) {
  const pending = {
    action,
    data,
    id: data.product?.producto_id || data.producto_id || data.extra?.extra_id || data.extra_id || `${action}-${Date.now()}`,
    createdAt: Date.now()
  };
  state.pendingMenuWrites = state.pendingMenuWrites.filter(item => !(item.action === action && item.id === pending.id));
  state.pendingMenuWrites.push(pending);
  savePendingMenuWrites();
}

function applyPendingMenuWrites() {
  const fresh = [];
  state.pendingMenuWrites.forEach(pending => {
    if (Date.now() - pending.createdAt > 120000) return;
    if (pendingMenuWriteSynced(pending)) return;
    applyPendingMenuWrite(pending);
    fresh.push(pending);
  });
  state.pendingMenuWrites = fresh;
  savePendingMenuWrites();
}

function pendingMenuWriteSynced(pending) {
  const data = pending.data || {};
  if (pending.action === "deleteProduct") return !state.products.some(item => item.producto_id === data.producto_id);
  if (pending.action === "upsertProduct") return state.products.some(item => item.producto_id === data.product?.producto_id && sameMeaningfulJson(item, data.product));
  if (pending.action === "upsertExtra") return state.extras.some(item => item.extra_id === data.extra?.extra_id && sameMeaningfulJson(item, data.extra));
  return false;
}

function applyPendingMenuWrite(pending) {
  const data = pending.data || {};
  if (pending.action === "upsertProduct" && data.product) upsertStorefrontProduct(data.product, false);
  if (pending.action === "upsertExtra" && data.extra) upsertStorefrontExtra(data.extra, false);
  if (pending.action === "deleteProduct") state.products = state.products.filter(item => item.producto_id !== data.producto_id);
}

function prepareFrontendMenu(menu) {
  const products = normalizeProducts(menu.products || menu.productos || []).map(normalizeIncomingStorefrontProduct);
  const extras = normalizeExtras(menu.extras || []);

  return {
    products,
    extras,
    operationConfig: normalizeOperationConfig({
      ...(menu.operationConfig || menu.operation_config || menu.settings || {}),
      categoryCovers: menuCategoryCovers(menu)
    }),
    updatedAt: menu.updatedAt || menu.updated_at || new Date().toISOString()
  };
}

function normalizeIncomingStorefrontProduct(product, index = 0) {
  return {
    ...product,
    categoria_id: normalizeStorefrontCategory(product.categoria_id),
    imagen: normalizeStorefrontImage(product, index)
  };
}

function menuCategoryCovers(menu = {}) {
  const settings = menu.operationConfig || menu.operation_config || menu.settings || {};
  const tableCovers = menu.categoryCovers || menu.category_covers;
  if (Array.isArray(tableCovers) && tableCovers.length) return tableCovers;
  return settings.categoryCovers || settings.category_covers || [];
}

function normalizeStorefrontCategory(categoryId) {
  const id = normalizeCategoryId(categoryId);
  if (CATEGORY_ORDER.includes(id)) return id;
  return STOREFRONT_CATEGORY_MAP[id] || "pizzas";
}

function normalizeStorefrontImage(product, index) {
  const explicit = String(product?.imagen || "").trim();
  if (/^https?:\/\//i.test(explicit) || explicit.startsWith("data:")) return explicit;
  return "";
}

function applyMenu(menu, options = {}) {
  const fingerprint = menuFingerprint(menu);
  if (!options.force && fingerprint && fingerprint === state.menuFingerprint) return;
  state.menuFingerprint = fingerprint;
  state.products = normalizeProducts(menu.products || menu.productos || []);
  state.extras = normalizeExtras(menu.extras || []);
  state.updatedAt = menu.updatedAt || menu.updated_at || new Date().toISOString();
  state.operationConfig = normalizeOperationConfig({
    ...(menu.operationConfig || menu.operation_config || menu.settings || {}),
    categoryCovers: menuCategoryCovers(menu)
  });
  applyPendingMenuWrites();
  state.categories = buildCategories(state.products);
  state.activeCategory = state.categories.some(category => category.id === state.activeCategory)
    ? state.activeCategory
    : state.categories[0]?.id || "";
  renderAll();
}

function menuFingerprint(menu) {
  try {
    return JSON.stringify({
      products: menu.products || menu.productos || [],
      extras: menu.extras || [],
      categoryCovers: menu.categoryCovers || menu.category_covers || [],
      operationConfig: menu.operationConfig || menu.operation_config || menu.settings || {}
    });
  } catch {
    return `${Date.now()}`;
  }
}

function renderAll() {
  renderCategories();
  renderProducts();
  renderCart();
  renderAdmin();
}

function renderCategories() {
  const available = getAvailableProducts();
  const counts = available.reduce((acc, product) => {
    acc[product.categoria_id] = (acc[product.categoria_id] || 0) + 1;
    return acc;
  }, {});

  el.categories.innerHTML = state.categories.map(category => {
    const count = counts[category.id] || 0;
    const active = category.id === state.activeCategory ? "active" : "";
    const cover = categoryCoverImage(category);
    return `
      <button class="category-btn ${active}" type="button" data-category="${escapeAttr(category.id)}">
        <span class="category-cover skeleton-cover" aria-hidden="true">
          <img src="${escapeAttr(cover)}" alt="" loading="lazy" onload="this.parentElement.classList.remove('skeleton-cover')" onerror="this.onerror=null;this.src='${escapeAttr(categoryFallbackImage(category.id))}';this.parentElement.classList.remove('skeleton-cover');">
        </span>
        <span class="category-card-meta">
          <strong>${escapeHtml(category.label)}</strong>
          <small>(${count})</small>
          <span class="category-arrow" aria-hidden="true">›</span>
        </span>
      </button>
    `;
  }).join("");

  el.categories.querySelectorAll("[data-category]").forEach(button => {
    button.addEventListener("click", () => {
      state.activeCategory = button.dataset.category;
      renderCategories();
      renderProducts();
      showCategoryNotice(state.activeCategory);
    });
  });
}

function showCategoryNotice(categoryId) {
  const messages = {
    burgers: "Todas nuestras hamburguesas vienen acompañadas de papas artesanales a la francesa.",
    perros: "Todos nuestros perros vienen acompañados de papas artesanales a la francesa."
  };
  const message = messages[categoryId];
  if (!message) return;

  let notice = document.getElementById("category-notice");
  if (!notice) {
    notice = document.createElement("div");
    notice.id = "category-notice";
    notice.className = "category-notice";
    notice.setAttribute("role", "status");
    notice.setAttribute("aria-live", "polite");
    document.body.appendChild(notice);
  }

  notice.innerHTML = `
    <button class="category-notice-close" type="button" aria-label="Cerrar aviso">x</button>
    <span class="category-notice-kicker">Oscar's Parrilla</span>
    <strong>${escapeHtml(labelFromId(categoryId))}</strong>
    <p>${escapeHtml(message)}</p>
  `;
  notice.classList.add("is-visible");
  notice.querySelector(".category-notice-close")?.addEventListener("click", hideCategoryNotice);
  window.clearTimeout(state.categoryNoticeTimer);
  state.categoryNoticeTimer = window.setTimeout(hideCategoryNotice, 5000);
}

function hideCategoryNotice() {
  const notice = document.getElementById("category-notice");
  if (notice) notice.classList.remove("is-visible");
  window.clearTimeout(state.categoryNoticeTimer);
  state.categoryNoticeTimer = null;
}

function categoryCoverImage(category) {
  const cover = (state.operationConfig?.categoryCovers || []).find(item => item.category_id === category.id);
  if (cover?.image_url) return versionImageUrl(cover.image_url, cover.updated_at);
  const product = getAvailableProducts().find(item => item.categoria_id === category.id && item.imagen);
  return product ? resolveProductImage(product) : categoryFallbackImage(category.id);
}

function categoryFallbackImage(categoryId) {
  const product = getAvailableProducts().find(item => item.categoria_id === categoryId);
  return "./images/logo.png";
}

function renderProducts() {
  const products = getAvailableProducts().filter(product => {
    const categoryMatch = product.categoria_id === state.activeCategory;
    const text = `${product.nombre} ${product.descripcion} ${product.categoria_id}`.toLowerCase();
    return categoryMatch && (!state.search || text.includes(state.search));
  });

  if (!products.length) {
    el.catalog.innerHTML = `<div class="empty-state">No hay productos disponibles con ese filtro.</div>`;
    return;
  }

  el.catalog.innerHTML = products.map(product => {
    const image = resolveProductImage(product);
    return `
      <article class="product-card">
        <div>
          ${image ? `<div class="product-visual"><img src="${escapeAttr(image)}" alt="${escapeAttr(product.nombre)}" loading="lazy" onerror="this.onerror=null;this.closest('.product-visual')?.classList.add('image-load-error');this.remove();"></div>` : productVisualTemplate(product)}
          <div class="product-meta">
            <span>${escapeHtml(labelFromId(product.categoria_id))}</span>
            <span class="product-rating">4.9</span>
          </div>
          <h3>${escapeHtml(product.nombre)}</h3>
          <p>${escapeHtml(product.descripcion || "Producto disponible para ordenar.")}</p>
        </div>
        <div class="product-footer">
          <span class="price">${formatMoney(product.precio)}</span>
          <button class="add-btn" type="button" aria-label="Agregar ${escapeAttr(product.nombre)}" data-add-product="${escapeAttr(product.producto_id)}">+</button>
        </div>
      </article>
    `;
  }).join("");

  el.catalog.querySelectorAll("[data-add-product]").forEach(button => {
    button.addEventListener("click", () => openProductModal(button.dataset.addProduct));
  });
}

function openProductModal(productId, cartIndex = null) {
  const product = state.products.find(item => item.producto_id === productId);
  if (!product) return;

  const cartItem = Number.isInteger(cartIndex) ? state.cart[cartIndex] : null;
  const productOptions = getProductOptions(product);
  const productFlavors = getProductFlavors(product);
  const allowExtras = productAllowsExtras(product);
  let selectedOption = productOptions.find(option => option.id === cartItem?.option_id) || productOptions[0] || null;
  let selectedFlavor = productFlavors.find(flavor => flavor.id === cartItem?.flavor_id) || productFlavors[0] || null;
  const selectedExtras = {};
  if (allowExtras) {
    (cartItem?.extras || []).forEach(extra => {
      selectedExtras[extra.extra_id] = { ...extra };
    });
  }

  const image = resolveProductImage({ ...product, imagen: selectedOption?.image || product.imagen, selectedOptionLabel: selectedOption?.label });
  let productQty = clampQuantity(cartItem?.qty || 1);

  el.modalContent.innerHTML = `
    ${image ? `<div class="modal-product-visual"><img id="modal-product-image" src="${escapeAttr(image)}" alt="${escapeAttr(product.nombre)}" onerror="this.onerror=null;this.closest('.modal-product-visual')?.classList.add('image-load-error');this.remove();"></div>` : productVisualTemplate(product, "modal-product-visual")}
    <div class="modal-title">
      <span class="eyebrow">${escapeHtml(labelFromId(product.categoria_id))}</span>
      <h2>${escapeHtml(product.nombre)}</h2>
      <p>${escapeHtml(product.descripcion || "")}</p>
      <strong class="price" id="selected-option-price">${formatMoney(getSelectedProductPrice(product, selectedOption))}</strong>
    </div>

    ${productOptions.length > 1 ? `
      <div class="option-list" role="radiogroup" aria-label="Opciones de ${escapeAttr(product.nombre)}">
        ${productOptions.map(option => optionRowTemplate(option, selectedOption)).join("")}
      </div>
    ` : ""}

    ${productFlavors.length ? `
      <div class="flavor-list" role="radiogroup" aria-label="Sabores de ${escapeAttr(product.nombre)}">
        <div class="flavor-title">Sabor</div>
        ${productFlavors.map(flavor => flavorRowTemplate(flavor, selectedFlavor)).join("")}
      </div>
    ` : ""}

    ${allowExtras ? `
      <div class="extras-list">
        ${getAvailableExtras().length ? getAvailableExtras().map(extra => extraRowTemplate(extra, selectedExtras[extra.extra_id]?.qty || 0)).join("") : `<div class="empty-state">No hay extras configurados.</div>`}
      </div>
    ` : ""}

    <div class="product-config">
      <label class="quantity-field">Cantidad
        <div class="quantity-stepper">
          <button type="button" id="product-qty-minus" aria-label="Disminuir cantidad">-</button>
          <span id="product-qty">${productQty}</span>
          <button type="button" id="product-qty-plus" aria-label="Aumentar cantidad">+</button>
        </div>
      </label>
      <button class="primary-btn" id="add-configured-product" type="button">${cartItem ? "Actualizar producto" : "Agregar al carrito"} <span id="modal-total"></span></button>
    </div>
  `;

  const qtyLabel = document.getElementById("product-qty");
  const totalLabel = document.getElementById("modal-total");
  const optionPriceLabel = document.getElementById("selected-option-price");
  const modalImage = document.getElementById("modal-product-image");

  const updateTotal = () => {
    qtyLabel.textContent = productQty;
    if (optionPriceLabel) optionPriceLabel.textContent = formatMoney(getSelectedProductPrice(product, selectedOption));
    if (modalImage) {
      modalImage.src = resolveProductImage({ ...product, imagen: selectedOption?.image || product.imagen, selectedOptionLabel: selectedOption?.label });
    }
    const extrasTotal = Object.values(selectedExtras).reduce((sum, extra) => sum + moneyToBigInt(extra.precio) * qtyToBigInt(extra.qty), 0n);
    totalLabel.textContent = formatMoney(moneyToBigInt(getSelectedProductPrice(product, selectedOption)) * qtyToBigInt(productQty) + extrasTotal);
  };

  el.modalContent.querySelectorAll("[data-product-option]").forEach(input => {
    input.addEventListener("change", () => {
      selectedOption = productOptions.find(option => option.id === input.value) || selectedOption;
      updateTotal();
    });
  });

  el.modalContent.querySelectorAll("[data-product-flavor]").forEach(input => {
    input.addEventListener("change", () => {
      selectedFlavor = productFlavors.find(flavor => flavor.id === input.value) || selectedFlavor;
    });
  });

  if (allowExtras) {
    el.modalContent.querySelectorAll("[data-extra-plus]").forEach(button => {
      button.addEventListener("click", () => {
        const extra = getAvailableExtras().find(item => item.extra_id === button.dataset.extraPlus);
        if (!extra) return;
        selectedExtras[extra.extra_id] = selectedExtras[extra.extra_id] || { ...extra, qty: 0 };
        selectedExtras[extra.extra_id].qty = clampQuantity(selectedExtras[extra.extra_id].qty + 1);
        button.parentElement.querySelector("[data-extra-qty]").textContent = selectedExtras[extra.extra_id].qty;
        updateTotal();
      });
    });

    el.modalContent.querySelectorAll("[data-extra-minus]").forEach(button => {
      button.addEventListener("click", () => {
        const extraId = button.dataset.extraMinus;
        if (!selectedExtras[extraId]) return;
        selectedExtras[extraId].qty = clampQuantity(selectedExtras[extraId].qty - 1, 0);
        if (selectedExtras[extraId].qty <= 0) delete selectedExtras[extraId];
        button.parentElement.querySelector("[data-extra-qty]").textContent = selectedExtras[extraId]?.qty || 0;
        updateTotal();
      });
    });
  }

  document.getElementById("product-qty-minus").addEventListener("click", () => {
    productQty = clampQuantity(productQty - 1);
    updateTotal();
  });
  document.getElementById("product-qty-plus").addEventListener("click", () => {
    productQty = clampQuantity(productQty + 1);
    updateTotal();
  });

  document.getElementById("add-configured-product").addEventListener("click", () => {
    const extras = allowExtras ? Object.values(selectedExtras)
      .filter(extra => extra.qty > 0)
      .map(extra => ({
        extra_id: extra.extra_id,
        nombre: extra.nombre,
        precio: moneyToNumber(extra.precio),
        qty: clampQuantity(extra.qty)
      })) : [];

    const item = {
      cart_id: cartItem?.cart_id || makeId("cart"),
      product_id: product.producto_id,
      title: product.nombre,
      category: product.categoria_id,
      option_id: selectedOption?.id || "",
      option_label: selectedOption?.label || "",
      flavor_id: selectedFlavor?.id || "",
      flavor_label: selectedFlavor?.label || "",
      price: getSelectedProductPrice(product, selectedOption),
      qty: productQty,
      extras
    };

    if (cartItem) {
      state.cart[cartIndex] = item;
    } else {
      addToCart(item);
    }

    renderCart();
    closeProductModal();
    closeCart();
    toast("Producto agregado. Puedes seguir eligiendo.");
  });

  updateTotal();
  openLayer(el.productModal);
}

function productVisualTemplate(product, className = "product-visual") {
  const label = labelFromId(product.categoria_id).split(" ").slice(0, 2).join(" ");
  return `
    <div class="${className} product-visual-placeholder" aria-hidden="true">
      <span>${escapeHtml(label)}</span>
    </div>
  `;
}

function categoryIconTemplate(id) {
  const icons = {
    burgers: `
      <path d="M5 11c.8-4 5.2-6 9-4.8 2.2.7 4 2.2 5 4.8H5z"/>
      <path d="M4.5 13h15"/>
      <path d="M6 16h12"/>
      <path d="M7 19h10"/>
      <path d="M9 8.2h.01M12 7.5h.01M15 8.5h.01"/>
    `,
    perros: `
      <path d="M5 13c2.8-2.4 11.2-2.4 14 0"/>
      <path d="M6 15h12"/>
      <path d="M8 11.5c1.7 1.2 6.3 1.2 8 0"/>
      <path d="M8 17h8"/>
    `,
    alitas: `
      <path d="M7 15c-1.8-4 1-8 5-8 2.4 0 4.4 1.4 5 3.6"/>
      <path d="M17 10.5c2 1 2.5 3.5 1.1 5.3-1.7 2.3-5.9 2.6-9.1-.1"/>
      <path d="M10 11c1.5.6 3.4.7 5.1.2"/>
    `,
    picadas: `
      <path d="M5 17c2.5 2.2 11.5 2.2 14 0"/>
      <path d="M4 13h16"/>
      <path d="M7 10l2-3M12 10l1-4M17 10l-2-3"/>
      <circle cx="8" cy="14" r="1"/>
      <circle cx="13" cy="14" r="1"/>
      <circle cx="17" cy="14" r="1"/>
    `,
    desgranados: `
      <path d="M7 6h10l2 13H5L7 6z"/>
      <path d="M8 10h8M8.5 14h7"/>
      <circle cx="10" cy="8" r=".5"/>
      <circle cx="14" cy="8" r=".5"/>
    `,
    sandwiches: `
      <path d="M5 8c4-3 10-3 14 0v3H5V8z"/>
      <path d="M5 13h14"/>
      <path d="M6 16h12l-1.5 3h-9L6 16z"/>
      <path d="M9 10h.01M13 10h.01M17 10h.01"/>
    `,
    "papas-especiales": `
      <path d="M8 9h8l-1 11H9L8 9z"/>
      <path d="M9 9 8 4M11 9l1-5M13 9l2-5M15 9l1-4"/>
    `,
    ensaladas: `
      <path d="M5 13h14c-.8 4-3.7 6-7 6s-6.2-2-7-6z"/>
      <path d="M8 10c1-3 4-4 7-2"/>
      <path d="M12 11c1-2 3.5-3 6-1"/>
      <path d="M9 13c.8.9 5.2.9 6 0"/>
    `,
    crepes: `
      <path d="M5 17 19 7"/>
      <path d="M6 16c3 3 9 3 12 0"/>
      <path d="M7 15c2-3 6-6 10-8"/>
      <circle cx="12" cy="13" r="1"/>
    `,
    patacones: `
      <circle cx="9" cy="12" r="4"/>
      <circle cx="15" cy="12" r="4"/>
      <path d="M7.5 10.5h3M13.5 13.5h3"/>
    `,
    cortes: `
      <path d="M7 17c-2-2-1.5-6 1.7-8.4 3.4-2.6 8.2-2.3 10.1.6 1.8 2.8-.4 7.3-4.4 9-2.8 1.2-5.6.7-7.4-1.2z"/>
      <circle cx="10" cy="13" r="1.8"/>
      <path d="M13 10c1.6.5 2.8 1.5 3.5 3"/>
    `,
    pizzetas: `
      <circle cx="12" cy="12" r="8"/>
      <path d="M12 4v16M4 12h16"/>
      <circle cx="9" cy="9" r="1"/>
      <circle cx="15" cy="14" r="1"/>
    `,
    "menu-infantil": `
      <path d="M7 10h10v9H7z"/>
      <path d="M9 10V7a3 3 0 0 1 6 0v3"/>
      <path d="M10 14h.01M14 14h.01"/>
      <path d="M10 17h4"/>
    `,
    pizzas: `
      <path d="M4 19 19 4l1 16-16-1z"/>
      <path d="M8 17c2.5-4.5 5.5-7.5 10-10"/>
      <circle cx="13" cy="12" r="1"/>
      <circle cx="16" cy="16" r="1"/>
    `,
    "pizzas-especiales": `
      <path d="M5 18c2-6 6-10 13-13"/>
      <path d="M5 18h14L18 5"/>
      <circle cx="11" cy="13" r="1"/>
      <circle cx="15" cy="15" r="1"/>
    `,
    "pizzas-familiares": `
      <circle cx="12" cy="12" r="8"/>
      <path d="M12 4v16M4 12h16M6.5 6.5l11 11M17.5 6.5l-11 11"/>
    `,
    "pizzas-premium": `
      <path d="M12 4l7 6-7 10-7-10 7-6z"/>
      <path d="M8 10h8"/>
      <path d="M10 10l2 10 2-10"/>
    `,
    combos: `
      <path d="M5 7h8v12H5z"/>
      <path d="M15 10h4v9h-4z"/>
      <path d="M7 5h4v2H7z"/>
    `,
    entradas: `
      <path d="M5 14c3-5 9-5 14 0"/>
      <path d="M6 14h12l-2 5H8z"/>
      <path d="M9 10l1-3M13 10l2-3"/>
    `,
    bebidas: `
      <path d="M8 5h8l-1 15H9L8 5z"/>
      <path d="M7 9h10"/>
      <path d="M10 5l1-3h5"/>
    `
  };

  return `
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      ${icons[id] || icons.pizzas}
    </svg>
  `;
}

function extraRowTemplate(extra, qty) {
  return `
    <div class="extra-row">
      <div>
        <strong>${escapeHtml(extra.nombre)}</strong>
        <small>${formatMoney(extra.precio)}</small>
      </div>
      <div class="extra-controls">
        <button type="button" data-extra-minus="${escapeAttr(extra.extra_id)}">-</button>
        <span data-extra-qty>${qty}</span>
        <button type="button" data-extra-plus="${escapeAttr(extra.extra_id)}">+</button>
      </div>
    </div>
  `;
}

function optionRowTemplate(option, selectedOption) {
  const checked = option.id === selectedOption?.id ? "checked" : "";
  return `
    <label class="option-row">
      <input type="radio" name="product-option" value="${escapeAttr(option.id)}" data-product-option ${checked}>
      <span>
        <strong>${escapeHtml(option.label)}</strong>
        <small>${formatMoney(option.price)}</small>
      </span>
    </label>
  `;
}

function flavorRowTemplate(flavor, selectedFlavor) {
  const checked = flavor.id === selectedFlavor?.id ? "checked" : "";
  return `
    <label class="flavor-row">
      <input type="radio" name="product-flavor" value="${escapeAttr(flavor.id)}" data-product-flavor ${checked}>
      <span>${escapeHtml(flavor.label)}</span>
    </label>
  `;
}

function addToCart(item) {
  const sameItem = state.cart.find(cartItem => (
    cartItem.product_id === item.product_id &&
    cartItem.option_id === item.option_id &&
    cartItem.flavor_id === item.flavor_id &&
    JSON.stringify(cartItem.extras) === JSON.stringify(item.extras)
  ));

  if (sameItem) {
    sameItem.qty = clampQuantity(sameItem.qty + item.qty);
  } else {
    item.qty = clampQuantity(item.qty);
    state.cart.push(item);
  }
}

function renderCart() {
  const totals = getCartTotals();
  const totalQty = state.cart.reduce((sum, item) => sum + clampQuantity(item.qty), 0);

  el.cartCount.textContent = totalQty;
  el.floatingCount.textContent = totalQty;
  el.floatingCart.classList.toggle("hidden", totalQty === 0);
  el.cartSubtotal.textContent = formatMoney(totals.subtotal);
  el.cartTotal.textContent = formatMoney(totals.subtotal);

  if (!state.cart.length) {
    el.cartItems.innerHTML = `<div class="empty-state">Tu selección está vacía.</div>`;
    return;
  }

  el.cartItems.innerHTML = state.cart.map((item, index) => {
    const extras = item.extras || [];
    const optionText = item.option_label ? `Opción: ${item.option_label}` : "";
    const flavorText = item.flavor_label ? `Sabor: ${item.flavor_label}` : "";
    const extrasText = extras.length
      ? extras.map(extra => `${clampQuantity(extra.qty)}x ${extra.nombre} ${formatMoney(extra.precio)}`).join(", ")
      : "Sin extras";
    return `
      <article class="cart-item">
        <div>
          <h3>${escapeHtml(item.title)}</h3>
          ${optionText ? `<small>${escapeHtml(optionText)}</small>` : ""}
          ${flavorText ? `<small>${escapeHtml(flavorText)}</small>` : ""}
          <small>${escapeHtml(extrasText)}</small>
        </div>
        <div class="cart-item-controls">
          <div class="qty-controls">
            <button type="button" data-cart-minus="${index}" aria-label="Restar">-</button>
            <span>${clampQuantity(item.qty)}</span>
            <button type="button" data-cart-plus="${index}" aria-label="Sumar">+</button>
          </div>
          <div class="cart-line-actions">
            <button class="cart-icon-action" type="button" data-cart-edit="${index}" aria-label="Editar producto" title="Editar">
              <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5z"/>
              </svg>
            </button>
            <button class="cart-icon-action danger" type="button" data-cart-remove="${index}" aria-label="Eliminar producto" title="Eliminar">
              <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <path d="M4 7h16"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M6 7l1 14h10l1-14"/>
                <path d="M9 7V4h6v3"/>
              </svg>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  el.cartItems.querySelectorAll("[data-cart-plus]").forEach(button => {
    button.addEventListener("click", () => changeCartQty(Number(button.dataset.cartPlus), 1));
  });
  el.cartItems.querySelectorAll("[data-cart-minus]").forEach(button => {
    button.addEventListener("click", () => changeCartQty(Number(button.dataset.cartMinus), -1));
  });
  el.cartItems.querySelectorAll("[data-cart-remove]").forEach(button => {
    button.addEventListener("click", () => removeCartItem(Number(button.dataset.cartRemove)));
  });
  el.cartItems.querySelectorAll("[data-cart-edit]").forEach(button => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.cartEdit);
      const item = state.cart[index];
      closeCart();
      openProductModal(item.product_id, index);
    });
  });
}

function changeCartQty(index, delta) {
  const item = state.cart[index];
  if (!item) return;
  item.qty = clampQuantity(item.qty + delta, 0);
  if (item.qty <= 0) state.cart.splice(index, 1);
  renderCart();
}

function removeCartItem(index) {
  state.cart.splice(index, 1);
  renderCart();
}

async function clearCart() {
  if (!state.cart.length) return;
  const ok = await smartConfirm({
    title: "Vaciar carrito",
    message: "Se quitaran todos los productos agregados al pedido.",
    confirmText: "Vaciar carrito",
    danger: true
  });
  if (!ok) return;
  state.cart = [];
  renderCart();
}

function openCheckout() {
  if (!state.cart.length) {
    toast("Agrega al menos un producto antes de pedir.");
    return;
  }
  closeCart();
  el.checkoutForm.reset();
  setCheckoutStep(1);
  updateCheckoutControls();
  openLayer(el.checkoutModal);
}

function getCheckoutQuote() {
  const form = el.checkoutForm;
  const method = form.querySelector("input[name='method']:checked")?.value || "recoger";
  const address = form.elements.address?.value.trim() || "";
  const subtotal = getCartTotals().subtotal;
  const packaging = moneyToBigInt(getPackagingFee()) * qtyToBigInt(getCartProductCount());
  const zone = method === "domicilio" ? matchDeliveryZone(address) : null;
  const delivery = method === "domicilio" ? moneyToBigInt(zone?.precio || 0) : 0n;
  return {
    method,
    address,
    subtotal,
    packaging,
    zone,
    delivery,
    total: subtotal + packaging + delivery
  };
}

function getPackagingFee() {
  return Math.max(0, moneyToNumber(state.operationConfig?.packagingFee ?? PACKAGING_FEE));
}

function getCartProductCount() {
  return state.cart.reduce((sum, item) => sum + clampQuantity(item.qty), 0);
}

function matchDeliveryZone(address = "") {
  const text = normalizeAddressText(address);
  const zones = state.operationConfig?.deliveryZones || [];
  if (!text) return null;
  const ranked = zones
    .filter(zone => zone.activo !== false)
    .map(zone => ({ zone, score: deliveryZoneScore(text, zone) }))
    .filter(item => item.score >= 0.74)
    .sort((a, b) => b.score - a.score || String(a.zone.nombre).length - String(b.zone.nombre).length);
  return ranked[0]?.zone || null;
}

function deliveryZoneScore(addressText, zone) {
  const candidates = [zone.nombre, ...(zone.aliases || [])].map(normalizeAddressText).filter(Boolean);
  return candidates.reduce((best, candidate) => Math.max(best, textSimilarityScore(addressText, candidate)), 0);
}

function textSimilarityScore(addressText, candidate) {
  if (!candidate) return 0;
  if (addressText.includes(candidate)) return 1;
  const addressTokens = meaningfulAddressTokens(addressText);
  const candidateTokens = meaningfulAddressTokens(candidate);
  if (!candidateTokens.length) return 0;
  const matched = candidateTokens.filter(token => {
    return addressTokens.some(input => input === token || input.includes(token) || token.includes(input) || levenshteinDistance(input, token) <= allowedTokenDistance(token));
  }).length;
  return matched / candidateTokens.length;
}

function meaningfulAddressTokens(value) {
  const stopWords = new Set(["barrio", "br", "cll", "calle", "cra", "carrera", "kr", "numero", "nro", "no", "apto", "apartamento", "casa", "mz", "manzana", "via", "sector", "comuna", "edificio", "torre"]);
  return normalizeAddressText(value).split(" ").filter(token => token.length > 1 && !stopWords.has(token));
}

function normalizeAddressText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/ñ/g, "n")
    .replace(/\b(av|av\.|avenida)\b/g, " avenida ")
    .replace(/\b(b|brr|barr)\b/g, " barrio ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function allowedTokenDistance(token) {
  if (token.length <= 4) return 0;
  if (token.length <= 7) return 1;
  return 2;
}

function levenshteinDistance(a, b) {
  if (a === b) return 0;
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j += 1) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return matrix[a.length][b.length];
}

function transferMethods() {
  return (state.operationConfig?.paymentMethods || [])
    .filter(method => method.activo !== false && normalizeComparable(method.tipo) !== "efectivo");
}

function cashMethods() {
  return (state.operationConfig?.paymentMethods || [])
    .filter(method => method.activo !== false && normalizeComparable(method.tipo) === "efectivo");
}

function renderPaymentOptions(method, currentValue) {
  const allowedMethods = method === "domicilio"
    ? transferMethods()
    : [...cashMethods(), ...transferMethods()];
  const fallbackMethods = method === "domicilio"
    ? DEFAULT_OPERATION_CONFIG.paymentMethods.filter(item => normalizeComparable(item.tipo) !== "efectivo")
    : DEFAULT_OPERATION_CONFIG.paymentMethods;
  const options = allowedMethods.length ? allowedMethods : fallbackMethods;
  el.paymentMethod.innerHTML = `<option value="" disabled>Selecciona una opción</option>${options.map(item => `
    <option value="${escapeAttr(item.method_id)}">${escapeHtml(item.nombre)}</option>
  `).join("")}`;
  const nextValue = options.some(item => item.method_id === currentValue)
    ? currentValue
    : options[0]?.method_id || "";
  el.paymentMethod.value = nextValue;
}

function renderCheckoutProductsSummary() {
  if (!el.checkoutProductsList) return;
  const items = state.cart || [];
  const visibleItems = items.slice(0, 2);
  const remaining = Math.max(0, items.length - visibleItems.length);
  el.checkoutProductsList.innerHTML = items.length ? `
    ${visibleItems.map(checkoutProductSummaryRow).join("")}
    ${remaining ? `<button class="checkout-more-products" type="button" data-open-checkout-products>+${remaining} producto${remaining === 1 ? "" : "s"} más</button>` : ""}
  ` : `<div class="empty-state">Tu selección está vacía.</div>`;
  el.checkoutProductsDetail?.classList.toggle("hidden", items.length <= 2 && !items.some(hasVerboseCartItem));
  el.checkoutProductsList.querySelectorAll("[data-open-checkout-products]").forEach(button => {
    button.addEventListener("click", openCheckoutProductsModal);
  });
}

function checkoutProductSummaryRow(item) {
  const qty = clampQuantity(item.qty);
  const details = checkoutItemDetails(item);
  return `
    <article class="checkout-product-row">
      <div>
        <strong>${qty}x ${escapeHtml(item.title || "Producto")}</strong>
        ${details ? `<small>${escapeHtml(details)}</small>` : ""}
      </div>
      <span>${formatMoney(getItemTotal(item))}</span>
    </article>
  `;
}

function checkoutItemDetails(item) {
  const pieces = [];
  if (item.option_label) pieces.push(item.option_label);
  if (item.flavor_label) pieces.push(`Sabor ${item.flavor_label}`);
  const extras = item.extras || [];
  if (extras.length) {
    pieces.push(extras.map(extra => `${clampQuantity(extra.qty)}x ${extra.nombre}`).join(", "));
  } else {
    pieces.push("Sin extras");
  }
  return pieces.filter(Boolean).join(" · ");
}

function hasVerboseCartItem(item) {
  if (!item) return false;
  return checkoutItemDetails(item).length > 42;
}

function openCheckoutProductsModal() {
  if (!el.checkoutProductsModal || !el.checkoutProductsFull) return;
  const quote = getCheckoutQuote();
  el.checkoutProductsFull.innerHTML = `
    <div class="checkout-products-full-list">
      ${state.cart.map(item => `
        <article class="checkout-product-full-row">
          <div>
            <strong>${clampQuantity(item.qty)}x ${escapeHtml(item.title || "Producto")}</strong>
            <small>${escapeHtml(checkoutItemDetails(item))}</small>
          </div>
          <span>${formatMoney(getItemTotal(item))}</span>
        </article>
      `).join("")}
    </div>
    <div class="checkout-products-full-total">
      <span>Productos</span><strong>${formatMoney(quote.subtotal)}</strong>
      <span>Empaque para llevar</span><strong>${formatMoney(quote.packaging)}</strong>
      <span>${quote.zone ? `Domicilio ${escapeHtml(quote.zone.nombre)}` : "Domicilio"}</span><strong>${quote.method === "domicilio" ? (quote.zone ? formatMoney(quote.delivery) : "Por confirmar") : "$ 0"}</strong>
      <span>Total a pagar</span><strong>${formatMoney(quote.total)}</strong>
    </div>
  `;
  openLayer(el.checkoutProductsModal);
}

function closeCheckoutProductsModal() {
  if (el.checkoutProductsModal) closeLayer(el.checkoutProductsModal);
}

function deliveryHelperTemplate(quote) {
  if (!quote.address) {
    return `<span>Escribe tu dirección completa. Detectaremos el barrio para calcular el domicilio.</span>`;
  }
  if (quote.zone) {
    return `<span>Zona detectada: <strong>${escapeHtml(quote.zone.nombre)}</strong>. Domicilio ${formatMoney(quote.delivery)}.</span>`;
  }
  return `<span>No encontré ese barrio en la tabla. El domicilio se confirmará por WhatsApp y por ahora no se suma al total.</span>`;
}

function renderTransferInfo(paymentId, method) {
  const selected = (state.operationConfig?.paymentMethods || []).find(item => item.method_id === paymentId);
  const isTransfer = selected && normalizeComparable(selected.tipo) !== "efectivo";
  el.transferInfo.classList.toggle("hidden", !isTransfer);
  if (!isTransfer) {
    el.transferInfo.innerHTML = "";
    return;
  }
  const qr = versionImageUrl(state.operationConfig?.qrImage || "", state.updatedAt);
  const transferList = transferMethods();
  el.transferInfo.innerHTML = `
    <div class="transfer-head">
      <div>
        <span class="eyebrow">${method === "domicilio" ? "Pago requerido" : "Transferencia"}</span>
        <strong>${escapeHtml(selected.nombre)}</strong>
        <small>Escanea el QR o descarga la imagen para pagar.</small>
      </div>
      ${qr ? `
        <div class="transfer-qr-card">
          <img src="${escapeAttr(qr)}" alt="QR de pago">
          <button class="secondary-btn transfer-download" type="button" data-download-qr="${escapeAttr(qr)}">Descargar QR</button>
        </div>
      ` : `<div class="transfer-qr-empty">QR pendiente por configurar</div>`}
    </div>
    <div class="payment-copy-list">
      ${transferList.map(item => `
        <button class="payment-copy-row" type="button" data-copy-payment="${escapeAttr(item.detalle || item.nombre)}">
          <span class="payment-copy-identity">
            <strong>${escapeHtml(item.nombre)}</strong>
            <small>${escapeHtml(item.titular || "Dato de pago")}</small>
          </span>
          <em>${escapeHtml(item.detalle || "Por configurar")}</em>
          <span class="payment-copy-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M8 8h10v12H8z"/>
              <path d="M5 16H4V4h12v1"/>
            </svg>
          </span>
        </button>
      `).join("")}
    </div>
  `;
}

async function copyText(text) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    toast("Dato de pago copiado.");
  } catch {
    toast(text);
  }
}

async function downloadQrImage(src) {
  if (!src) return;
  const fileName = "qr-pago-oscars-parrilla.png";
  try {
    const response = src.startsWith("data:")
      ? await fetch(src)
      : await fetch(src, { mode: "cors", cache: "no-store" });
    if (!response.ok) throw new Error("No se pudo descargar el QR");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1200);
    toast("QR descargado.");
  } catch {
    const link = document.createElement("a");
    link.href = src;
    link.download = fileName;
    link.target = "_blank";
    link.rel = "noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast("Si se abre el QR, mantén presionada la imagen y elige guardar.");
  }
}

function goToCheckoutStep2() {
  const name = el.checkoutForm.elements.name.value.trim();
  const phone = el.checkoutForm.elements.phone.value.trim();

  if (!name || !phone) {
    toast("Completa nombre y teléfono para continuar.");
    return;
  }

  el.clientSummary.textContent = `${name} - ${phone}`;
  setCheckoutStep(2);
  updateCheckoutControls();
}

function setCheckoutStep(step) {
  el.step1.classList.toggle("active", step === 1);
  el.step2.classList.toggle("active", step === 2);
}

function updateCheckoutControls() {
  const previousPayment = el.paymentMethod.value;
  const quote = getCheckoutQuote();
  renderPaymentOptions(quote.method, previousPayment);
  const payment = el.paymentMethod.value;

  el.addressLabel.classList.toggle("hidden", quote.method !== "domicilio");
  el.addressHelper.classList.toggle("hidden", quote.method !== "domicilio");
  el.checkoutForm.elements.address.required = quote.method === "domicilio";
  el.cartProductsCheckout.textContent = formatMoney(quote.subtotal);
  el.cartPackaging.innerHTML = `${formatMoney(quote.packaging)} <small>${getCartProductCount()} producto${getCartProductCount() === 1 ? "" : "s"} x ${formatMoney(getPackagingFee())}</small>`;
  el.cartDeliveryLabel.textContent = quote.zone ? `Domicilio ${quote.zone.nombre}` : "Domicilio";
  el.cartDelivery.textContent = quote.method === "domicilio"
    ? (quote.zone ? formatMoney(quote.delivery) : "Por confirmar")
    : "$ 0";
  el.cartTotalCheckout.textContent = formatMoney(quote.total);
  el.addressHelper.innerHTML = quote.method !== "domicilio"
    ? ""
    : deliveryHelperTemplate(quote);
  renderCheckoutProductsSummary();
  renderTransferInfo(payment, quote.method);
}

async function submitCheckout(event) {
  event.preventDefault();
  const form = el.checkoutForm;
  const name = form.elements.name.value.trim();
  const phone = form.elements.phone.value.trim();
  const method = form.querySelector("input[name='method']:checked")?.value || "recoger";
  const address = form.elements.address.value.trim();
  const payment = form.elements.payment.value;
  const notes = form.elements.notes.value.trim();
  const quote = getCheckoutQuote();

  if (!name || !phone || !payment) {
    toast("Revisa los datos obligatorios.");
    return;
  }

  if (method === "domicilio" && !address) {
    toast("Agrega la dirección para el domicilio.");
    return;
  }
  const selectedPayment = (state.operationConfig?.paymentMethods || []).find(item => item.method_id === payment);
  if (method === "domicilio" && normalizeComparable(selectedPayment?.tipo || "") === "efectivo") {
    toast("Para domicilio el pago debe ser por transferencia.");
    return;
  }

  const order = buildCheckoutOrder({ name, phone, method, address, selectedPayment, payment, notes, quote });
  const lines = buildWhatsAppOrderLines(order, quote, selectedPayment);
  const quoteUrl = `https://wa.me/${BUSINESS_PHONE}?text=${encodeURIComponent(lines.join("\n"))}`;
  const whatsappWindow = window.open("about:blank", "_blank");
  if (whatsappWindow) whatsappWindow.opener = null;
  const submitButton = form.querySelector("button[type='submit']");
  if (submitButton) submitButton.disabled = true;

  const recordPromise = recordOrder(order);
  const recordedFast = await Promise.race([
    recordPromise,
    wait(ORDER_RECORD_FAST_TIMEOUT_MS).then(() => false)
  ]);
  if (!recordedFast) recordPromise.catch(() => {});

  if (whatsappWindow) {
    whatsappWindow.location.href = quoteUrl;
  } else {
    window.location.href = quoteUrl;
  }

  state.cart = [];
  renderCart();
  closeCheckout();
  if (submitButton) submitButton.disabled = false;
}

async function recordOrder(order) {
  if (!API_URL.trim()) return false;

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), ORDER_RECORD_FAST_TIMEOUT_MS + 2600);
  try {
    const response = await fetch(API_URL.trim(), {
      method: "POST",
      keepalive: true,
      signal: controller.signal,
      body: JSON.stringify({
        action: "createOrder",
        order
      })
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.error || `HTTP ${response.status}`);
    return true;
  } catch (error) {
    console.warn("No se pudo registrar el pedido en la API", error);
    toast("El pedido se enviará por WhatsApp. Si no aparece en admin, revisa la sincronización.");
    return false;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function buildCheckoutOrder({ name, phone, method, address, selectedPayment, payment, notes, quote }) {
  return {
    cliente: name,
    telefono: phone,
    metodo: method,
    direccion: address,
    pago: selectedPayment?.nombre || formatBudgetLabel(payment),
    notas: notes,
    subtotal: Number(quote.subtotal),
    domicilio: Number(quote.delivery),
    empaque: Number(quote.packaging),
    barrio: quote.zone?.nombre || "",
    total: Number(quote.total),
    items: state.cart.map(normalizeCartItemForOrder)
  };
}

function normalizeCartItemForOrder(item) {
  return {
    producto_id: item.product_id,
    nombre: item.title,
    opcion: item.option_label || "",
    sabor: item.flavor_label || "",
    precio: Number(item.price || 0),
    cantidad: clampQuantity(item.qty),
    extras: (item.extras || []).map(extra => ({
      extra_id: extra.extra_id || "",
      nombre: extra.nombre || "",
      precio: Number(extra.precio || 0),
      cantidad: clampQuantity(extra.qty)
    }))
  };
}

function buildWhatsAppOrderLines(order, quote, selectedPayment) {
  const deliveryText = order.metodo === "recoger"
    ? "Sin costo (recoge en el local)"
    : (quote.zone ? `${formatMoney(quote.delivery)} (${quote.zone.nombre})` : "Por confirmar por WhatsApp");
  const lines = [
    "*Nueva orden - Oscar's Parrilla*",
    "",
    "*Cliente*",
    `Nombre: ${order.cliente}`,
    `Telefono: ${order.telefono}`,
    "",
    "*Entrega*",
    `Modalidad: ${order.metodo === "domicilio" ? "Domicilio" : "Recoger en el local"}`,
    ...(order.metodo === "domicilio" ? [`Direccion: ${order.direccion}`] : ["Sede para recoger: Por confirmar"]),
    ...(order.barrio ? [`Barrio/Zona: ${order.barrio}`] : []),
    `Pago: ${order.pago}`,
    ...(selectedPayment?.detalle ? [`Dato de pago: ${selectedPayment.detalle}`] : []),
    "",
    "*Productos*"
  ];

  order.items.forEach((item, index) => {
    const itemTotal = moneyToBigInt(item.precio) * qtyToBigInt(item.cantidad);
    const optionText = item.opcion ? ` (${item.opcion})` : "";
    lines.push(`${index + 1}. ${item.cantidad} x ${item.nombre}${optionText} - ${formatMoney(itemTotal)}`);
    if (item.sabor) lines.push(`   Sabor: ${item.sabor}`);
    if (item.extras?.length) {
      item.extras.forEach(extra => {
        const extraTotal = moneyToBigInt(extra.precio) * qtyToBigInt(extra.cantidad);
        lines.push(`   + ${extra.cantidad} x ${extra.nombre} - ${formatMoney(extraTotal)}`);
      });
    }
  });

  lines.push("");
  lines.push("*Totales*");
  lines.push(`Productos: ${formatMoney(quote.subtotal)}`);
  lines.push(`Empaque: ${formatMoney(quote.packaging)} (${getCartProductCount()} producto${getCartProductCount() === 1 ? "" : "s"} x ${formatMoney(getPackagingFee())})`);
  lines.push(`Domicilio: ${deliveryText}`);
  lines.push(`Total: ${formatMoney(quote.total)}`);
  if (order.notas) {
    lines.push("");
    lines.push("*Notas*");
    lines.push(order.notas);
  }
  return lines;
}

function wait(ms) {
  return new Promise(resolve => window.setTimeout(resolve, ms));
}

function formatBudgetLabel(value) {
  const labels = {
    "por-definir": "Por confirmar",
    nequi: "Nequi",
    transferencia: "Transferencia",
    efectivo: "Efectivo"
  };
  return labels[value] || value || "Por confirmar";
}

function openChat() {
  if (!el.chatPanel) return;
  el.chatPanel.classList.remove("hidden");
  el.chatToggle?.setAttribute("aria-expanded", "true");
  if (!el.chatMessages?.children.length) {
    addChatMessage("bot", "Hola, soy el asistente de Oscar's Parrilla. Puedo ayudarte a elegir una hamburguesa, revisar categorías, preparar tu pedido o llevarte a WhatsApp.");
  }
}

function closeChat() {
  el.chatPanel?.classList.add("hidden");
  el.chatToggle?.setAttribute("aria-expanded", "false");
}

function submitChat(event) {
  event.preventDefault();
  const question = el.chatInput?.value.trim() || "";
  if (!question) return;
  el.chatInput.value = "";
  handleChatQuestion(question);
}

function handleChatQuestion(question) {
  openChat();
  addChatMessage("user", question);
  window.setTimeout(() => addChatMessage("bot", buildChatAnswer(question)), 160);
}

function buildChatAnswer(question) {
  const text = normalizeImageKey(question);
  const categories = state.categories.map(category => category.label).slice(0, 6).join(", ");
  const featured = getAvailableProducts().slice(0, 4).map(product => product.nombre).join(", ");

  if (/(pedid|precio|valor|cuanto|whatsapp|wp)/.test(text)) {
    return "Para pedir bien, cuéntanos la hora del pedido, la dirección o si recoges, el tamaño, el sabor, los extras, la cantidad de personas y la forma de pago. Puedes agregar productos a la selección y tocar Pedir por WhatsApp para enviar el mensaje listo.";
  }

  if (/(dato|informacion|necesit|pedido|fecha)/.test(text)) {
    return "Los datos clave son: hora del pedido, dirección o recogida, cantidad de personas, sabores preferidos, extras, bebidas y cualquier indicación especial.";
  }

  if (/(combo|entrada|bebida|familiar|premium|especial)/.test(text)) {
    return "Sí, Oscar's Parrilla maneja hamburguesas, parrilla, combos, entradas y bebidas. Puedes revisar la carta y agregar lo que quieras a la selección.";
  }

  if (/(categoria|carta|producto|menu)/.test(text)) {
    return `La carta tiene categorías como ${categories || "hamburguesas, parrilla y combos"}. Algunas ideas destacadas: ${featured || "hamburguesas a la parrilla y combos para compartir"}.`;
  }

  if (/(foto|referencia|ingrediente|sabor)/.test(text)) {
    return "Puedes pedir recomendaciones por sabor: clásica, carnes, pollo, vegetariana, premium o familiar. También puedes indicar ingredientes que quieras evitar.";
  }

  return "Claro. Para ayudarte mejor, dime si buscas una hamburguesa, parrilla, combo o bebida. También puedes seleccionar productos y enviarlos por WhatsApp.";
}

function addChatMessage(role, message) {
  if (!el.chatMessages) return;
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${role}`;
  bubble.textContent = message;
  el.chatMessages.appendChild(bubble);
  el.chatMessages.scrollTop = el.chatMessages.scrollHeight;
}

function openAdmin() {
  updateAdminSessionUi();
  openLayer(el.adminPanel);
}

function closeAdmin() {
  logoutAdmin(false);
  closeLayer(el.adminPanel);
}

function unlockAdmin(showToast = true) {
  const token = el.adminToken.value.trim();
  if (!token) {
    toast("Ingresa la contraseña de administrador.");
    return;
  }
  state.adminToken = token;
  el.adminLogin.classList.add("hidden");
  el.adminWorkspace.classList.remove("hidden");
  el.adminLogout.classList.remove("hidden");
  renderAdmin();
  if (showToast) toast("Panel listo para editar.");
}

function logoutAdmin(showToast = true) {
  state.adminToken = "";
  el.adminToken.value = "";
  resetProductForm();
  resetExtraForm();
  updateAdminSessionUi();
  if (showToast) toast("Sesión administrativa cerrada.");
}

function updateAdminSessionUi() {
  const loggedIn = Boolean(state.adminToken);
  el.adminLogin.classList.toggle("hidden", loggedIn);
  el.adminWorkspace.classList.toggle("hidden", !loggedIn);
  el.adminLogout.classList.toggle("hidden", !loggedIn);
  if (!loggedIn) el.adminToken.value = "";
}

function setAdminTab(tab) {
  document.querySelectorAll("[data-admin-tab]").forEach(button => {
    button.classList.toggle("active", button.dataset.adminTab === tab);
  });
  document.getElementById("admin-products").classList.toggle("active", tab === "products");
  document.getElementById("admin-extras").classList.toggle("active", tab === "extras");
}

function renderAdmin() {
  renderAdminProductCategories();
  renderAdminProducts();
  renderAdminExtras();
}

function renderAdminProductCategories() {
  if (!el.adminProductCategories) return;
  const categories = buildCategories(state.products);
  const selectedExists = state.adminProductCategory === "todas" || categories.some(category => category.id === state.adminProductCategory);
  if (!selectedExists) state.adminProductCategory = "todas";

  const buttons = [
    { id: "todas", label: "Todas", count: state.products.length },
    ...categories.map(category => ({
      ...category,
      count: state.products.filter(product => product.categoria_id === category.id).length
    }))
  ];

  el.adminProductCategories.innerHTML = buttons.map(category => {
    const active = category.id === state.adminProductCategory ? "active" : "";
    return `<button class="admin-filter-btn ${active}" type="button" data-admin-product-category="${escapeAttr(category.id)}">${escapeHtml(category.label)} <span>${category.count}</span></button>`;
  }).join("");

  el.adminProductCategories.querySelectorAll("[data-admin-product-category]").forEach(button => {
    button.addEventListener("click", () => {
      state.adminProductCategory = button.dataset.adminProductCategory;
      state.adminProductSearch = "";
      el.adminProductSearch.value = "";
      renderAdminProductCategories();
      renderAdminProducts();
    });
  });
}

function renderAdminProducts() {
  if (!el.productList) return;
  const products = [...state.products]
    .filter(product => state.adminProductCategory === "todas" || product.categoria_id === state.adminProductCategory)
    .filter(product => {
      const text = `${product.nombre} ${product.descripcion} ${product.categoria_id}`.toLowerCase();
      return !state.adminProductSearch || text.includes(state.adminProductSearch);
    })
    .sort(sortAdminProducts);
  el.productList.innerHTML = products.map(product => `
    <article class="admin-row ${product.activo ? "" : "inactive"}">
      <div>
        <h3>${escapeHtml(product.nombre)} - ${formatMoney(product.precio)}</h3>
        <p>${escapeHtml(labelFromId(product.categoria_id))} | ${product.activo ? "activo" : "producto agotado"}${product.opciones.length ? ` | opciones: ${escapeHtml(product.opciones.map(option => `${option.label} ${formatMoney(option.price)}`).join(", "))}` : ""}</p>
      </div>
      <div class="admin-row-actions">
        <button class="secondary-btn" type="button" data-edit-product="${escapeAttr(product.producto_id)}">Editar</button>
        <button class="danger-btn admin-delete-btn" type="button" data-delete-product="${escapeAttr(product.producto_id)}">Eliminar</button>
      </div>
    </article>
  `).join("") || `<div class="empty-state">No hay productos cargados en esta categoría.</div>`;

  el.productList.querySelectorAll("[data-edit-product]").forEach(button => {
    button.addEventListener("click", () => fillProductForm(button.dataset.editProduct));
  });
  el.productList.querySelectorAll("[data-delete-product]").forEach(button => {
    button.addEventListener("click", () => deleteProduct(button.dataset.deleteProduct));
  });
}

function renderAdminExtras() {
  if (!el.extraList) return;
  const extras = [...state.extras].sort(sortByOrderThenName);
  el.extraList.innerHTML = extras.map(extra => `
    <article class="admin-row ${extra.activo ? "" : "inactive"}">
      <div>
        <h3>${escapeHtml(extra.nombre)} - ${formatMoney(extra.precio)}</h3>
        <p>orden ${extra.orden || 0} | ${extra.activo ? "activo" : "inactivo"}</p>
      </div>
      <div class="admin-row-actions">
        <button class="secondary-btn" type="button" data-edit-extra="${escapeAttr(extra.extra_id)}">Editar</button>
        <button class="danger-btn admin-delete-btn" type="button" data-toggle-extra="${escapeAttr(extra.extra_id)}">${extra.activo ? "Eliminar" : "Restaurar"}</button>
      </div>
    </article>
  `).join("") || `<div class="empty-state">No hay extras cargados.</div>`;

  el.extraList.querySelectorAll("[data-edit-extra]").forEach(button => {
    button.addEventListener("click", () => fillExtraForm(button.dataset.editExtra));
  });
  el.extraList.querySelectorAll("[data-toggle-extra]").forEach(button => {
    button.addEventListener("click", () => toggleExtra(button.dataset.toggleExtra));
  });
}

function fillProductForm(productId) {
  const product = state.products.find(item => item.producto_id === productId);
  if (!product) return;
  state.editingProductId = product.producto_id;
  setFormValues(el.productForm, product);
  renderProductOptionsEditor(product.opciones, product.opciones.length > 0);
  el.productForm.elements.activo.checked = product.activo;
  updateSwitchLabels();
  updateProductFormMode();
  markFormEditing(el.productForm, true);
  el.productForm.scrollIntoView({ behavior: "smooth", block: "center" });
}

function fillExtraForm(extraId) {
  const extra = state.extras.find(item => item.extra_id === extraId);
  if (!extra) return;
  state.editingExtraId = extra.extra_id;
  setFormValues(el.extraForm, extra);
  el.extraForm.elements.activo.checked = extra.activo;
  updateSwitchLabels();
  markFormEditing(el.extraForm, true);
  el.extraForm.scrollIntoView({ behavior: "smooth", block: "center" });
}

function resetProductForm() {
  state.editingProductId = "";
  el.productForm.reset();
  el.productForm.elements.activo.checked = true;
  el.productForm.elements.producto_id.value = "";
  el.productForm.elements.orden.value = "0";
  renderProductOptionsEditor([], false);
  updateSwitchLabels();
  updateProductFormMode();
  markFormEditing(el.productForm, false);
}

function updateProductFormMode() {
  const editing = Boolean(state.editingProductId);
  el.productSubmitLabel.textContent = editing ? "Actualizar producto" : "Guardar producto";
  el.productCancel.classList.toggle("hidden", !editing);
}

function resetExtraForm() {
  state.editingExtraId = "";
  el.extraForm.reset();
  el.extraForm.elements.activo.checked = true;
  el.extraForm.elements.extra_id.value = "";
  el.extraForm.elements.orden.value = "0";
  updateSwitchLabels();
  markFormEditing(el.extraForm, false);
}

function updateSwitchLabels() {
  const productSwitchLabel = el.productForm.elements.activo?.nextElementSibling;
  if (productSwitchLabel) {
    productSwitchLabel.textContent = el.productForm.elements.activo.checked ? "Activo" : "Producto Agotado";
  }

  const extraSwitchLabel = el.extraForm.elements.activo?.nextElementSibling;
  if (extraSwitchLabel) {
    extraSwitchLabel.textContent = el.extraForm.elements.activo.checked ? "Activo" : "Agotado";
  }
}

function renderProductOptionsEditor(options = [], forceVisible = false) {
  const normalizedOptions = normalizeProductOptions(options);
  const priceLabel = el.productForm.elements.precio?.closest("label");
  const editorOptions = normalizedOptions.length ? normalizedOptions : getDefaultProductOptions();
  const isVisible = Boolean(forceVisible);
  el.productHasOptions.checked = isVisible;

  if (!isVisible) {
    el.productForm.elements.opciones.value = "";
    el.productForm.elements.precio.required = true;
    priceLabel?.classList.remove("hidden");
    el.productOptionsEditor.classList.add("hidden");
    el.productOptionsEditor.innerHTML = "";
    return;
  }

  el.productForm.elements.precio.required = false;
  priceLabel?.classList.add("hidden");
  el.productOptionsEditor.classList.remove("hidden");
  el.productOptionsEditor.innerHTML = `
    <div class="admin-options-title">Opciones del producto</div>
    ${editorOptions.map((option, index) => `
      <div class="admin-option-row" data-option-row data-option-id="${escapeAttr(option.id)}">
        <label>Opción
          <input type="text" autocomplete="off" value="${escapeAttr(option.label)}" data-option-label>
        </label>
        <label>Precio
          <input type="text" inputmode="numeric" autocomplete="off" value="${option.price > 0 ? escapeAttr(formatMoney(option.price)) : ""}" placeholder="$ 0" data-option-price>
        </label>
        <button class="danger-btn option-remove-btn ${index < 2 ? "hidden" : ""}" type="button" data-remove-option>Quitar</button>
      </div>
    `).join("")}
    <button class="secondary-btn option-add-btn" type="button" data-add-option>Agregar opción</button>
  `;

  el.productOptionsEditor.querySelectorAll("[data-option-price]").forEach(input => {
    input.addEventListener("input", () => {
      formatAdminMoneyInput(input);
      syncProductOptionsFromEditor();
      updateEditedFields(el.productForm);
    });
    input.addEventListener("blur", () => {
      formatAdminMoneyInput(input);
      syncProductOptionsFromEditor();
    });
  });

  el.productOptionsEditor.querySelectorAll("[data-option-label]").forEach(input => {
    input.addEventListener("input", () => {
      syncProductOptionsFromEditor();
      updateEditedFields(el.productForm);
    });
  });

  el.productOptionsEditor.querySelectorAll("[data-remove-option]").forEach(button => {
    button.addEventListener("click", () => {
      button.closest("[data-option-row]")?.remove();
      syncProductOptionsFromEditor();
      updateEditedFields(el.productForm);
    });
  });

  el.productOptionsEditor.querySelector("[data-add-option]")?.addEventListener("click", () => {
    addProductOptionRow();
    syncProductOptionsFromEditor();
    updateEditedFields(el.productForm);
  });

  syncProductOptionsFromEditor();
}

function syncProductOptionsFromEditor() {
  if (!el.productOptionsEditor || el.productOptionsEditor.classList.contains("hidden") || !el.productHasOptions.checked) {
    el.productForm.elements.opciones.value = "";
    return;
  }

  const updatedOptions = [...el.productOptionsEditor.querySelectorAll("[data-option-row]")].map((row, index) => {
    const label = row.querySelector("[data-option-label]")?.value.trim() || "";
    const price = moneyToNumber(row.querySelector("[data-option-price]")?.value || "");
    return {
      id: row.dataset.optionId || makeOptionId(label, index),
      label,
      price
    };
  }).filter(option => option.label && option.price > 0);

  el.productForm.elements.opciones.value = updatedOptions.length ? JSON.stringify(updatedOptions) : "";
  if (updatedOptions[0]) {
    el.productForm.elements.precio.value = formatMoney(updatedOptions[0].price);
  }
}

function getDefaultProductOptions() {
  const basePrice = moneyToNumber(el.productForm.elements.precio?.value || "");
  return [
    { id: "opt-personal", label: "Personal", price: basePrice },
    { id: "opt-familiar", label: "Familiar", price: 0 }
  ];
}

function addProductOptionRow() {
  const button = el.productOptionsEditor.querySelector("[data-add-option]");
  if (!button) return;

  const index = el.productOptionsEditor.querySelectorAll("[data-option-row]").length;
  const wrapper = document.createElement("div");
  wrapper.className = "admin-option-row";
  wrapper.dataset.optionRow = "";
  wrapper.dataset.optionId = `opt-${Date.now()}-${index}`;
  wrapper.innerHTML = `
    <label>Opción
      <input type="text" autocomplete="off" value="Opción ${index + 1}" data-option-label>
    </label>
    <label>Precio
      <input type="text" inputmode="numeric" autocomplete="off" placeholder="$ 0" data-option-price>
    </label>
    <button class="danger-btn option-remove-btn" type="button" data-remove-option>Quitar</button>
  `;

  button.before(wrapper);
  wrapper.querySelector("[data-option-label]")?.addEventListener("input", () => {
    syncProductOptionsFromEditor();
    updateEditedFields(el.productForm);
  });
  wrapper.querySelector("[data-option-price]")?.addEventListener("input", event => {
    formatAdminMoneyInput(event.currentTarget);
    syncProductOptionsFromEditor();
    updateEditedFields(el.productForm);
  });
  wrapper.querySelector("[data-option-price]")?.addEventListener("blur", event => {
    formatAdminMoneyInput(event.currentTarget);
    syncProductOptionsFromEditor();
  });
  wrapper.querySelector("[data-remove-option]")?.addEventListener("click", () => {
    wrapper.remove();
    syncProductOptionsFromEditor();
    updateEditedFields(el.productForm);
  });
}

function makeOptionId(label, index) {
  return `opt-${slugify(label || `opcion-${index + 1}`)}`;
}

async function saveProduct(event) {
  event.preventDefault();
  syncProductOptionsFromEditor();
  const data = getFormObject(el.productForm);
  const productOptions = normalizeProductOptions(data.opciones);
  if (el.productHasOptions.checked && productOptions.length < 2) {
    toast("Completa al menos dos opciones con nombre y precio.");
    return;
  }
  const product = normalizeProduct({
    ...data,
    producto_id: data.producto_id || state.editingProductId || makeId("prod"),
    activo: el.productForm.elements.activo.checked
  });

  upsertStorefrontProduct(product);
  queuePendingMenuWrite("upsertProduct", { product });
  resetProductForm();
  resetCatalogSearch(false);
  renderAll();
  cacheCurrentMenu();
  const saved = await postAdmin("upsertProduct", { product });
  if (saved) scheduleMenuRefresh();
}

async function saveExtra(event) {
  event.preventDefault();
  const data = getFormObject(el.extraForm);
  const extra = normalizeExtra({
    ...data,
    extra_id: data.extra_id || state.editingExtraId || makeId("extra"),
    activo: el.extraForm.elements.activo.checked
  });

  upsertStorefrontExtra(extra);
  queuePendingMenuWrite("upsertExtra", { extra });
  resetExtraForm();
  resetCatalogSearch(false);
  renderAll();
  cacheCurrentMenu();
  const saved = await postAdmin("upsertExtra", { extra });
  if (saved) scheduleMenuRefresh();
}

async function deleteProduct(productId) {
  const product = state.products.find(item => item.producto_id === productId);
  if (!product) return;
  const confirmed = await smartConfirm({
    title: "Eliminar producto",
    message: `"${product.nombre}" se eliminara definitivamente de la carta.`,
    confirmText: "Eliminar",
    danger: true
  });
  if (!confirmed) return;

  state.products = state.products.filter(item => item.producto_id !== productId);
  queuePendingMenuWrite("deleteProduct", { producto_id: productId, hardDelete: true });
  if (state.editingProductId === productId) resetProductForm();
  resetCatalogSearch(false);
  renderAll();
  cacheCurrentMenu();
  const saved = await postAdmin("deleteProduct", { producto_id: productId, hardDelete: true });
  if (saved) scheduleMenuRefresh();
}

async function toggleExtra(extraId) {
  const extra = state.extras.find(item => item.extra_id === extraId);
  if (!extra) return;
  const updated = { ...extra, activo: !extra.activo };
  upsertStorefrontExtra(updated);
  queuePendingMenuWrite("upsertExtra", { extra: updated });
  renderAll();
  cacheCurrentMenu();
  const saved = await postAdmin("upsertExtra", { extra: updated });
  if (saved) scheduleMenuRefresh();
}

async function postAdmin(action, data) {
  if (!API_URL.trim()) {
    toast("Configura API_URL antes de guardar cambios reales.");
    return false;
  }
  if (!state.adminToken) {
    updateAdminSessionUi();
    toast("Inicia sesión en el panel administrativo.");
    return false;
  }

  try {
    const response = await fetch(API_URL.trim(), {
      method: "POST",
      body: JSON.stringify({
        action,
        token: state.adminToken,
        password: state.adminToken,
        ...data
      })
    });

    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.error || `HTTP ${response.status}`);
    announceSharedMenuChange(action, data);
    toast("La carta quedo actualizada correctamente.");
    return true;
  } catch (error) {
    console.error(error);
    toast(`No se pudo guardar: ${error.message}`);
    return false;
  }
}

function upsertStorefrontProduct(product, rebuildCategories = true) {
  const index = state.products.findIndex(item => item.producto_id === product.producto_id);
  if (index >= 0) {
    state.products[index] = product;
  } else {
    state.products = [product, ...state.products];
  }
  state.products = normalizeProducts(state.products);
  if (rebuildCategories) state.categories = buildCategories(state.products);
}

function upsertStorefrontExtra(extra) {
  const index = state.extras.findIndex(item => item.extra_id === extra.extra_id);
  if (index >= 0) {
    state.extras[index] = extra;
  } else {
    state.extras = [extra, ...state.extras];
  }
  state.extras = normalizeExtras(state.extras);
}

function cacheCurrentMenu() {
  cacheMenu({
    products: state.products,
    extras: state.extras,
    operationConfig: state.operationConfig,
    categoryCovers: state.operationConfig?.categoryCovers || [],
    updatedAt: new Date().toISOString()
  });
}

function scheduleMenuRefresh() {
  window.clearTimeout(scheduleMenuRefresh.timer);
  scheduleMenuRefresh.timer = window.setTimeout(() => loadMenu({ background: true, force: true }), 450);
}

function normalizeProducts(products) {
  return products
    .map(normalizeProduct)
    .filter(product => product.producto_id && product.nombre)
    .sort(sortByOrderThenName);
}

function normalizeProduct(product) {
  return {
    producto_id: String(product.producto_id || product.id || makeId("prod")).trim(),
    categoria_id: normalizeCategoryId(product.categoria_id || product.category || "general"),
    nombre: String(product.nombre || product.title || "").trim(),
    precio: moneyToNumber(product.precio ?? product.price),
    descripcion: String(product.descripcion || product.desc || "").trim(),
    imagen: normalizeManagedImageValue(product.imagen || product.image),
    opciones: normalizeProductOptions(product.opciones ?? product.options ?? product.sizes),
    sabores: normalizeProductFlavors(productFlavorSource(product)),
    orden: moneyToNumber(product.orden),
    activo: toBool(product.activo),
    updated_at: product.updated_at || product.updatedAt || ""
  };
}

function normalizeProductOptions(value) {
  let raw = value;
  if (typeof raw === "string") {
    const text = raw.trim();
    if (!text) return [];
    try {
      raw = JSON.parse(text);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(raw)) return [];

  return raw
    .map((option, index) => ({
      id: String(option.id || option.option_id || makeId("opcion")).trim(),
      label: String(option.label || option.nombre || option.name || `Opcion ${index + 1}`).trim(),
      price: moneyToNumber(option.price ?? option.precio),
      image: String(option.image || option.imagen || "").trim()
    }))
    .filter(option => option.id && option.label && option.price > 0);
}

function getProductOptions(product) {
  return Array.isArray(product.opciones) ? product.opciones : [];
}

function normalizeProductFlavors(value) {
  let raw = value;
  if (typeof raw === "string") {
    const text = raw.trim();
    if (!text) return [];
    try {
      raw = JSON.parse(text);
    } catch {
      raw = text.split(/\n|,|;/);
    }
  }
  if (!Array.isArray(raw)) return [];
  const seen = new Set();
  return raw
    .map((flavor, index) => {
      const label = String(
        flavor && typeof flavor === "object"
          ? flavor.label || flavor.nombre || flavor.name || flavor.sabor || ""
          : flavor || ""
      ).trim();
      const id = String(flavor && typeof flavor === "object" ? flavor.id || flavor.flavor_id || "" : "").trim()
        || `sabor-${slugify(label || `sabor-${index + 1}`)}`;
      return { id, label };
    })
    .filter(flavor => {
      const key = normalizeComparable(flavor.label);
      if (!flavor.id || !key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function getProductFlavors(product) {
  return normalizeProductFlavors(productFlavorSource(product));
}

function productFlavorSource(product = {}) {
  const candidates = [
    product.sabores,
    product.flavors,
    product.flavours,
    product.salsas,
    product.sauces,
    product.opciones_sabor,
    product.opcionesSabores,
    product.sabores_sin_costo
  ];
  return candidates.find(hasFlavorValue) || "";
}

function hasFlavorValue(value) {
  if (Array.isArray(value)) return value.length > 0;
  return String(value || "").trim().length > 0;
}

function inferProductFlavors(product = {}) {
  const text = `${product.nombre || ""} ${product.categoria_id || ""} ${product.descripcion || ""}`;
  if (!/alitas|salsa|salsas/i.test(text)) return [];
  const description = String(product.descripcion || "");
  const parenthetical = description.match(/\(([^)]+)\)/)?.[1] || "";
  const source = parenthetical || description;
  const cleaned = source
    .replace(/\b(salsas?|sabores?|banadas?|bañadas?|deliciosas?|nuestras?)\b/gi, "")
    .replace(/\s+o\s+/gi, ", ")
    .replace(/\s+y\s+/gi, ", ");
  return normalizeProductFlavors(cleaned);
}

function getSelectedProductPrice(product, selectedOption) {
  return selectedOption?.price || product.precio;
}

function normalizeExtras(extras) {
  return extras
    .map(normalizeExtra)
    .filter(extra => extra.extra_id && extra.nombre)
    .sort(sortByOrderThenName);
}

function normalizeExtra(extra) {
  return {
    extra_id: String(extra.extra_id || extra.id || makeId("extra")).trim(),
    nombre: String(extra.nombre || extra.name || "").trim(),
    precio: moneyToNumber(extra.precio ?? extra.price),
    imagen: normalizeManagedImageValue(extra.imagen || extra.image),
    orden: moneyToNumber(extra.orden),
    activo: toBool(extra.activo),
    updated_at: extra.updated_at || extra.updatedAt || ""
  };
}

function buildCategories(products) {
  const ids = [...new Set(products.filter(product => product.activo).map(product => product.categoria_id).filter(Boolean))];
  return ids
    .sort((a, b) => categoryOrderIndex(a) - categoryOrderIndex(b) || labelFromId(a).localeCompare(labelFromId(b), "es"))
    .map(id => ({ id, label: labelFromId(id) }));
}

function getAvailableProducts() {
  return state.products.filter(product => product.activo);
}

function getAvailableExtras() {
  return state.extras.filter(extra => extra.activo);
}

function productAllowsExtras(product) {
  return !CATEGORIES_WITHOUT_EXTRAS.has(normalizeCategoryId(product.categoria_id));
}

function resolveProductImage(product) {
  const explicit = resolveImagePath(product.imagen);
  if (explicit) return versionImageUrl(explicit, product.updated_at);
  return "";
}

function getSmartProductImage(product) {
  if (!STATIC_PRODUCT_IMAGES.length) return "";

  const primaryText = normalizeImageKey(`${product?.nombre || ""} ${product?.option_label || ""} ${product?.selectedOptionLabel || ""}`);
  const fullText = normalizeImageKey(`${primaryText} ${product?.descripcion || ""} ${product?.categoria_id || ""}`);
  const productInfo = {
    primaryTokens: getImageTokens(primaryText),
    fullTokens: getImageTokens(fullText),
    primaryCompact: compactImageKey(primaryText),
    fullCompact: compactImageKey(fullText)
  };

  const ranked = STATIC_PRODUCT_IMAGES
    .map(image => ({ image, score: smartImageScore(image, productInfo) }))
    .filter(item => item.score >= 30)
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.image || "";
}

function smartImageScore(image, productInfo) {
  const imageText = normalizeImageKey(image.replace(/\.[a-z0-9]+$/i, ""));
  const imageCompact = compactImageKey(imageText);
  const imageTokens = getImageTokens(imageText);
  const specificTokens = imageTokens.filter(token => !IMAGE_MATCH_TYPE_WORDS.has(token));
  const specificCompact = specificTokens.join("");
  const primaryTokenSet = new Set(productInfo.primaryTokens);
  const fullTokenSet = new Set(productInfo.fullTokens);
  let primaryScore = 0;
  let secondaryScore = 0;

  imageTokens.forEach(token => {
    const isType = IMAGE_MATCH_TYPE_WORDS.has(token);
    if (primaryTokenSet.has(token)) primaryScore += isType ? 8 : 34 + token.length;
    if (fullTokenSet.has(token)) secondaryScore += isType ? 3 : 8 + token.length;
  });

  if (specificTokens.length > 1 && productInfo.primaryCompact.includes(specificCompact)) primaryScore += 52 + specificCompact.length;
  if (specificTokens.length > 1 && productInfo.fullCompact.includes(specificCompact)) secondaryScore += 14 + specificCompact.length;
  if (productInfo.primaryCompact.includes(imageCompact)) primaryScore += 20;

  return primaryScore >= 30 ? primaryScore + secondaryScore : 0;
}

function isPizzaPlaceholderImage(value) {
  return /(?:^|\/)pizza\d+\.png$/i.test(String(value || ""));
}

function productImageFallback(product) {
  return "";
}

function resolveImagePath(value) {
  return normalizeManagedImageValue(value);
}

function normalizeManagedImageValue(value) {
  const image = String(value || "").trim();
  if (!image) return "";
  if (/^https?:\/\//i.test(image) || image.startsWith("data:image/")) return image;
  return "";
}

function versionImageUrl(url, version) {
  const raw = String(url || "").trim();
  if (!raw || raw.startsWith("data:") || !/^https?:\/\//i.test(raw)) return raw;
  if (!version && /[?&]v=/.test(raw)) return raw;
  try {
    const parsed = new URL(raw);
    if (version || !parsed.searchParams.has("v")) {
      parsed.searchParams.set("v", String(version || Date.now()));
    }
    return parsed.toString();
  } catch {
    const separator = raw.includes("?") ? "&" : "?";
    return `${raw}${separator}v=${encodeURIComponent(String(version || Date.now()))}`;
  }
}

function getKnownProductImage(product) {
  const productId = normalizeKnownProductId(product.producto_id || product.id);
  const known = KNOWN_PRODUCT_IMAGES_BY_ID[productId];
  if (!known) return "";

  const sameCategory = normalizeCategoryId(product.categoria_id) === normalizeCategoryId(known.category);
  if (!sameCategory) return "";

  const currentName = compactImageKey(product.nombre);
  const knownName = compactImageKey(known.name);
  const sameProduct = currentName && knownName && (currentName.includes(knownName) || knownName.includes(currentName));
  return sameProduct ? known.image : "";
}

function normalizeKnownProductId(value) {
  return String(value || "").trim().replace(/^prod-/i, "");
}

function normalizeImageKey(value) {
  return String(value || "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([a-zA-Z])(\d)/g, "$1 $2")
    .replace(/(\d)([a-zA-Z])/g, "$1 $2")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function compactImageKey(value) {
  return normalizeImageKey(value).replace(/\s+/g, "");
}

function getImageTokens(value) {
  return normalizeImageKey(value)
    .split(" ")
    .filter(token => (token.length > 2 || /^\d+$/.test(token)) && !IMAGE_MATCH_STOP_WORDS.has(token));
}

function detectCategoryFamily(categoryId, productName = "") {
  const categoryKey = normalizeImageKey(categoryId);
  const categoryCompact = compactImageKey(categoryId);
  const nameKey = normalizeImageKey(productName);
  const nameCompact = compactImageKey(productName);

  const categoryFamily = CATEGORY_DETECTION_ORDER.find(family => {
    const group = IMAGE_CATEGORY_GROUPS[family];
    return group.aliases.some(alias => {
      const aliasKey = normalizeImageKey(alias);
      const aliasCompact = compactImageKey(alias);
      return categoryKey.split(" ").includes(aliasKey) ||
        categoryCompact.includes(aliasCompact);
    });
  });

  if (categoryFamily) return categoryFamily;

  return CATEGORY_DETECTION_ORDER.find(family => {
    const group = IMAGE_CATEGORY_GROUPS[family];
    return group.aliases.some(alias => {
      const aliasKey = normalizeImageKey(alias);
      const aliasCompact = compactImageKey(alias);
      return nameKey.split(" ").includes(aliasKey) ||
        nameCompact.includes(aliasCompact);
    });
  }) || "";
}

function detectImageFamilies(imageKey, imageCompact) {
  return new Set(CATEGORY_DETECTION_ORDER.filter(family => {
    const group = IMAGE_CATEGORY_GROUPS[family];
    return group.aliases.some(alias => imageMatchesTerm(imageKey, imageCompact, alias));
  }));
}

function imageMatchesTerm(imageKey, imageCompact, term) {
  const termKey = normalizeImageKey(term);
  const termCompact = compactImageKey(term);
  return imageKey.split(" ").includes(termKey) || imageCompact.includes(termCompact);
}

function hasCategoryConflict(productFamily, imageFamilies) {
  if (!imageFamilies.size || imageFamilies.has(productFamily)) return false;
  return [...imageFamilies].some(family => family !== productFamily);
}

function getCartTotals() {
  return {
    subtotal: state.cart.reduce((sum, item) => sum + getItemTotal(item), 0n)
  };
}

function getItemTotal(item) {
  const extrasTotal = (item.extras || []).reduce((sum, extra) => {
    return sum + moneyToBigInt(extra.precio) * qtyToBigInt(extra.qty);
  }, 0n);
  return moneyToBigInt(item.price) * qtyToBigInt(item.qty) + extrasTotal;
}

function openCart() {
  openLayer(el.cartDrawer);
}

function closeCart() {
  closeLayer(el.cartDrawer);
}

function closeProductModal() {
  closeLayer(el.productModal);
}

function closeCheckout() {
  closeCheckoutProductsModal();
  closeLayer(el.checkoutModal);
}

function openSideMenu() {
  el.sideMenu.classList.remove("hidden");
  el.sideMenu.setAttribute("aria-hidden", "false");
  window.requestAnimationFrame(() => el.sideMenu.classList.add("is-open"));
}

function closeSideMenu() {
  el.sideMenu.classList.remove("is-open");
  el.sideMenu.setAttribute("aria-hidden", "true");
  window.setTimeout(() => {
    if (!el.sideMenu.classList.contains("is-open")) {
      el.sideMenu.classList.add("hidden");
    }
  }, 260);
}

function openLayer(node) {
  node.classList.remove("hidden");
  node.setAttribute("aria-hidden", "false");
}

function closeLayer(node) {
  node.classList.add("hidden");
  node.setAttribute("aria-hidden", "true");
}

function smartConfirm(options = {}) {
  return openSmartDialog({ ...options, mode: "confirm" });
}

function smartPrompt(options = {}) {
  return openSmartDialog({ ...options, mode: "prompt" });
}

function openSmartDialog(options = {}) {
  return new Promise(resolve => {
    const mode = options.mode || "confirm";
    const isPrompt = mode === "prompt";
    el.smartDialogKicker.textContent = options.kicker || "Oscar's Parrilla";
    el.smartDialogTitle.textContent = options.title || "Confirmar acción";
    el.smartDialogMessage.textContent = options.message || "Revisa la información antes de continuar.";
    el.smartDialogCancel.textContent = options.cancelText || "Cancelar";
    el.smartDialogConfirm.textContent = options.confirmText || "Continuar";
    el.smartDialogConfirm.classList.toggle("danger-btn", Boolean(options.danger));
    el.smartDialogConfirm.classList.toggle("primary-btn", !options.danger);
    el.smartDialogField.classList.toggle("hidden", !isPrompt);
    el.smartDialogField.childNodes[0].textContent = options.label || "Respuesta";
    el.smartDialogInput.value = options.value || "";
    el.smartDialogInput.placeholder = options.placeholder || "";
    el.smartDialogInput.inputMode = options.inputMode || "text";

    const finish = value => {
      document.removeEventListener("keydown", handleKeys);
      el.smartDialogClose.removeEventListener("click", cancel);
      el.smartDialogCancel.removeEventListener("click", cancel);
      el.smartDialogConfirm.removeEventListener("click", accept);
      el.smartDialog.removeEventListener("click", backdrop);
      closeLayer(el.smartDialog);
      resolve(value);
    };
    const cancel = () => finish(isPrompt ? "" : false);
    const accept = () => finish(isPrompt ? el.smartDialogInput.value : true);
    const backdrop = event => {
      if (event.target === el.smartDialog) cancel();
    };
    const handleKeys = event => {
      if (event.key === "Escape") cancel();
      if (event.key === "Enter" && (isPrompt || document.activeElement !== el.smartDialogCancel)) {
        event.preventDefault();
        accept();
      }
    };

    el.smartDialogClose.addEventListener("click", cancel);
    el.smartDialogCancel.addEventListener("click", cancel);
    el.smartDialogConfirm.addEventListener("click", accept);
    el.smartDialog.addEventListener("click", backdrop);
    document.addEventListener("keydown", handleKeys);
    openLayer(el.smartDialog);
    window.setTimeout(() => (isPrompt ? el.smartDialogInput : el.smartDialogConfirm).focus(), 40);
  });
}

function setSync(text) {
  el.syncStatus.textContent = text;
}

function showLoader(title = "Sincronizando carta", text = "Estamos preparando la información.") {
  showLoader.count = (showLoader.count || 0) + 1;
  el.loaderTitle.textContent = title;
  el.loaderText.textContent = text;
  el.loader.classList.remove("hidden");
  el.loader.setAttribute("aria-hidden", "false");
}

function hideLoader() {
  showLoader.count = Math.max(0, (showLoader.count || 0) - 1);
  if (showLoader.count > 0) return;
  el.loader.classList.add("hidden");
  el.loader.setAttribute("aria-hidden", "true");
}

function toast(message) {
  el.toast.textContent = message;
  el.toast.classList.add("show");
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => el.toast.classList.remove("show"), 3600);
}

function setFormValues(form, values) {
  Object.entries(values).forEach(([key, value]) => {
    if (form.elements[key] && form.elements[key].type !== "checkbox") {
      form.elements[key].value = key === "opciones" && Array.isArray(value)
        ? JSON.stringify(value)
        : key === "precio" && value != null && String(value).trim() !== ""
        ? formatMoney(value)
        : value ?? "";
    }
  });
  updateEditedFields(form);
}

function getFormObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function resetCatalogSearch(shouldRender = true) {
  state.search = "";
  if (el.search) el.search.value = "";
  if (shouldRender) renderProducts();
}

function disableSearchAutofill() {
  if (!el.search) return;
  const harden = () => {
    const nonce = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    el.search.setAttribute("autocomplete", "new-password");
    el.search.setAttribute("autocorrect", "off");
    el.search.setAttribute("autocapitalize", "none");
    el.search.setAttribute("spellcheck", "false");
    el.search.setAttribute("inputmode", "search");
    el.search.setAttribute("enterkeyhint", "search");
    el.search.setAttribute("name", `menu_search_${nonce}`);
    el.search.setAttribute("id", "search");
    el.search.setAttribute("data-lpignore", "true");
    el.search.setAttribute("data-1p-ignore", "true");
    el.search.setAttribute("data-form-type", "other");
    el.search.setAttribute("aria-autocomplete", "none");
    el.search.setAttribute("readonly", "readonly");
  };

  harden();
  window.setTimeout(() => {
    stripEmailAutofill(true);
  }, 250);

  window.setTimeout(() => harden(), 0);
  window.setTimeout(() => stripEmailAutofill(true), 600);
  window.setTimeout(() => stripEmailAutofill(true), 1400);

  el.search.addEventListener("focus", () => {
    el.search.setAttribute("readonly", "readonly");
    window.setTimeout(() => el.search.removeAttribute("readonly"), 80);
    stripEmailAutofill(true);
  });

  el.search.addEventListener("blur", () => {
    stripEmailAutofill(false);
    harden();
  });

  el.search.addEventListener("paste", event => {
    const text = event.clipboardData?.getData("text") || "";
    if (looksLikeEmailAutofill(text)) {
      event.preventDefault();
      stripEmailAutofill(true);
      toast("El buscador no acepta correos ni autocompletado.");
    }
  });

  el.search.addEventListener("beforeinput", event => {
    if (looksLikeEmailAutofill(event.data || "")) {
      event.preventDefault();
      stripEmailAutofill(true);
    }
  });
}

function sanitizeCatalogSearch(value) {
  const text = String(value || "");
  if (looksLikeEmailAutofill(text)) {
    stripEmailAutofill(true);
    return "";
  }

  return text.replace(/@/g, "").trim().toLowerCase();
}

function stripEmailAutofill(shouldRender = false) {
  if (!el.search) return;
  const value = el.search.value || "";
  if (!looksLikeEmailAutofill(value) && !value.includes("@")) {
    state.search = value.trim().toLowerCase();
    return;
  }

  el.search.value = "";
  state.search = "";
  if (shouldRender) renderProducts();
}

function looksLikeEmailAutofill(value) {
  const text = String(value || "").trim();
  return EMAIL_AUTOFILL_PATTERN.test(text) || /@/.test(text);
}

function bindAdminMoneyInputs() {
  [el.productForm, el.extraForm].forEach(form => {
    const input = form?.elements?.precio;
    if (!input) return;
    input.addEventListener("input", () => formatAdminMoneyInput(input));
    input.addEventListener("blur", () => formatAdminMoneyInput(input));
  });
}

function formatAdminMoneyInput(input) {
  const amount = moneyToNumber(input.value);
  input.value = amount > 0 ? formatMoney(amount) : "";
}

function markFormEditing(form, isEditing) {
  form.classList.toggle("editing", isEditing);
  if (!isEditing) {
    form.querySelectorAll(".field-editing").forEach(label => label.classList.remove("field-editing"));
    return;
  }
  updateEditedFields(form);
}

function updateEditedFields(form) {
  const isEditing = form.classList.contains("editing");
  form.querySelectorAll("label").forEach(label => {
    const field = label.querySelector("input:not([type='hidden']):not([type='checkbox']), textarea, select");
    label.classList.toggle("field-editing", Boolean(isEditing && field && String(field.value || "").trim()));
  });
}

function sortByOrderThenName(a, b) {
  return moneyToNumber(a.orden) - moneyToNumber(b.orden) || String(a.nombre).localeCompare(String(b.nombre), "es");
}

function sortAdminProducts(a, b) {
  return categoryOrderIndex(a.categoria_id) - categoryOrderIndex(b.categoria_id) || sortByOrderThenName(a, b);
}

function formatMoney(value) {
  const amount = typeof value === "bigint" ? value : moneyToBigInt(value);
  return `$ ${amount.toLocaleString("es-CO")}`;
}

function moneyToNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, Math.round(value));
  const cleaned = String(value ?? "0").replace(/[^\d-]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : 0;
}

function moneyToBigInt(value) {
  if (typeof value === "bigint") return value < 0n ? 0n : value;
  const cleaned = String(value ?? "0").replace(/[^\d-]/g, "");
  if (!cleaned || cleaned === "-") return 0n;
  try {
    const parsed = BigInt(cleaned);
    return parsed < 0n ? 0n : parsed;
  } catch {
    return BigInt(moneyToNumber(value));
  }
}

function qtyToBigInt(value) {
  return BigInt(clampQuantity(value));
}

function clampQuantity(value, min = 1, max = MAX_QTY) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return min;
  return Math.min(max, Math.max(min, parsed));
}

function toBool(value) {
  if (typeof value === "boolean") return value;
  const normalized = String(value ?? "true").trim().toLowerCase();
  return !["false", "0", "no", "inactivo", "inactive"].includes(normalized);
}

function makeId(prefix) {
  const random = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${random}`.toLowerCase();
}

function slugify(value) {
  return String(value || "general")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "general";
}

function normalizeCategoryId(value) {
  const id = slugify(value);
  return id;
}

function sameMeaningfulJson(a, b) {
  return JSON.stringify(normalizeComparable(a)) === JSON.stringify(normalizeComparable(b));
}

function normalizeComparable(value) {
  if (Array.isArray(value)) return value.map(normalizeComparable);
  if (!value || typeof value !== "object") return value;
  return Object.keys(value)
    .sort()
    .reduce((acc, key) => {
      if (["updatedAt", "updated_at", "actualizado"].includes(key)) return acc;
      acc[key] = normalizeComparable(value[key]);
      return acc;
    }, {});
}

function categoryOrderIndex(id) {
  const index = CATEGORY_ORDER.indexOf(id);
  return index === -1 ? CATEGORY_ORDER.length : index;
}

function labelFromId(value) {
  const id = normalizeCategoryId(value);
  if (CATEGORY_LABELS[id]) return CATEGORY_LABELS[id];
  return String(id || "general")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

function cssEscape(value) {
  if (globalThis.CSS?.escape) return CSS.escape(String(value));
  return String(value).replace(/["\\]/g, "\\$&");
}



