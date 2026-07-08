const API_URL = "https://script.google.com/macros/s/AKfycbzEnZVzv6_ZSm7B9YtS4ow-csHpI1uDmgRhD6KzAXNtrwKRUWjqXwKYYJqmj6rACZGg/exec";
const ADMIN_CACHE_KEY = "chanchos_admin_cache_v3";
const ADMIN_PENDING_KEY = "chanchos_admin_pending_v1";
const API_TIMEOUT_MS = 18000;
const API_REALTIME_POLL_MS = 1000;
const ADMIN_PAGE_TITLE = document.title;
const MENU_CATEGORY_ORDER = [
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
  "menu-infantil"
];
const MENU_CATEGORY_LABELS = {
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
  "menu-infantil": "Menu Infantil"
};
const BEVERAGE_PRODUCT_IMAGES = [
  { type: "limonada", aliases: ["pepino"], image: "limonada-de-pepino.png" },
  { type: "limonada", aliases: ["cereza", "cerezada", "cerezado"], image: "limonada-de-cereza.png" },
  { type: "granizado", aliases: ["limon"], image: "granizado-de-limon.png" },
  { type: "granizado", aliases: ["mandarina"], image: "granizado-de-mandarina.png" },
  { type: "granizado", aliases: ["mango"], image: "granizado-de-mango.png" }
];
const BUSINESS_RECEIPT_INFO = [
  "Parrilla y sabor en cada bocado",
  "Calle 61 n 18 b 30 barrio Parnaso, Barrancabermeja, Santander",
  "Horario: 5:00 p.m. a 11:00 p.m.",
  "Instagram: instagram.com/oscarsparrilla",
  "WhatsApp: +57 312 372 3999"
];
const DEFAULT_OPERATION_CONFIG = {
  packagingFee: 1000,
  qrImage: "",
  categoryCovers: [],
  deliveryZones: [],
  paymentMethods: [
    { method_id: "nequi", nombre: "Nequi", tipo: "transferencia", detalle: "312 372 3999", titular: "Oscar's Parrilla", activo: true, orden: 1 },
    { method_id: "efectivo", nombre: "Efectivo", tipo: "efectivo", detalle: "Solo para recoger", titular: "", activo: true, orden: 2 }
  ]
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
  return DEFAULT_DELIVERY_SECTORS.flatMap(group => String(group.barrios).split(";").map(item => item.trim()).filter(Boolean).map(nombre => ({
    zone_id: slugify(`${group.sector}-${nombre}`),
    nombre,
    sector: group.sector,
    aliases: [`barrio ${nombre}`, nombre],
    precio: group.precio,
    activo: true,
    orden: order++
  })));
}
DEFAULT_OPERATION_CONFIG.deliveryZones = defaultDeliveryZones();

const state = {
  token: sessionStorage.getItem("chanchos_admin_token") || "",
  cashierSession: JSON.parse(sessionStorage.getItem("chanchos_cashier_session") || "null"),
  hasBoss: true,
  loginMode: "login",
  authInfoLoaded: false,
  localStateLoaded: false,
  products: [],
  extras: [],
  orders: [],
  tables: [],
  payments: [],
  inventory: [],
  inventoryMovements: [],
  cashiers: [],
  operationConfig: DEFAULT_OPERATION_CONFIG,
  pendingWrites: [],
  kpis: {},
  activeKpiDetail: "",
  incomeSourceFilter: "todos",
  incomeDateFilter: "hoy",
  inventoryMovementSearch: "",
  orderFilter: "todas",
  selectedOrderIds: new Set(),
  activeView: location.hash?.replace("#", "") || "mesas",
  productCategoryFilter: "todas",
  selectedCoverCategory: "",
  categoryCoverFile: null,
  categoryCoverPreviewUrl: "",
  productSearch: "",
  productStatusFilter: "todos",
  extraSearch: "",
  extraStatusFilter: "todos",
  cashierSearch: "",
  cashierStatusFilter: "todos",
  bankFormDirty: false,
  tableSearch: "",
  tableStatusFilter: "todas",
  selectedTableId: "",
  dispatchSearch: "",
  knownOrderIds: new Set(),
  liveOrdersReady: false,
  pollTimer: null,
  syncInProgress: false,
  sectionSyncInProgress: "",
  orderSyncInProgress: false,
  pendingFlushInProgress: false,
  soundReady: false,
  soundUnlockArmed: false,
  unseenOrderAlerts: 0
};

const el = {
  navLinks: document.querySelectorAll("[data-view]"),
  loginGate: document.getElementById("login-gate"),
  loginForm: document.getElementById("login-form"),
  loginModeLabel: document.getElementById("login-mode-label"),
  loginTitle: document.getElementById("login-title"),
  loginCopy: document.getElementById("login-copy"),
  loginSubmit: document.getElementById("login-submit"),
  loginHelper: document.getElementById("login-helper"),
  loginError: document.getElementById("login-error"),
  loginPasswordToggle: document.getElementById("login-password-toggle"),
  firstBossName: document.getElementById("first-boss-name"),
  sidebarChat: document.getElementById("sidebar-chat"),
  sidebarChatTitle: document.getElementById("sidebar-chat-title"),
  sidebarChatMessages: document.getElementById("sidebar-chat-messages"),
  sidebarChatForm: document.getElementById("sidebar-chat-form"),
  sidebarChatClose: document.getElementById("sidebar-chat-close"),
  sessionRole: document.getElementById("session-role"),
  sessionUser: document.getElementById("session-user"),
  logout: document.getElementById("logout-admin"),
  reload: document.getElementById("reload-admin"),
  status: document.getElementById("dashboard-status"),
  orderFilter: document.getElementById("order-status-filter"),
  ordersList: document.getElementById("orders-list"),
  selectAllOrders: document.getElementById("select-all-orders"),
  selectedOrdersCount: document.getElementById("selected-orders-count"),
  bulkOrderStatus: document.getElementById("bulk-order-status"),
  applyBulkOrderStatus: document.getElementById("apply-bulk-order-status"),
  orderCleanupScope: document.getElementById("order-cleanup-scope"),
  deleteOrdersRecords: document.getElementById("delete-orders-records"),
  productsTable: document.getElementById("products-table"),
  productCategoryStrip: document.getElementById("product-category-strip"),
  categoryCoversOpen: document.getElementById("category-covers-open"),
  categoryCoverModal: document.getElementById("category-cover-modal"),
  categoryCoverClose: document.getElementById("category-cover-close"),
  categoryCoverCancel: document.getElementById("category-cover-cancel"),
  categoryCoverSelect: document.getElementById("category-cover-select"),
  categoryCoverPreview: document.getElementById("category-cover-preview"),
  categoryCoverDrop: document.getElementById("category-cover-drop"),
  categoryCoverFile: document.getElementById("category-cover-file"),
  categoryCoverFileMeta: document.getElementById("category-cover-file-meta"),
  categoryCoverProgress: document.getElementById("category-cover-progress"),
  categoryCoverSave: document.getElementById("category-cover-save"),
  extrasTable: document.getElementById("extras-table"),
  inventoryTable: document.getElementById("inventory-table"),
  inventoryKpis: document.getElementById("inventory-kpis"),
  inventoryMovements: document.getElementById("inventory-movements"),
  inventoryMovementSearch: document.getElementById("inventory-movement-search"),
  incomeList: document.getElementById("income-list"),
  incomeSourceFilter: document.getElementById("income-source-filter"),
  incomeDateFilter: document.getElementById("income-date-filter"),
  incomeCleanupScope: document.getElementById("income-cleanup-scope"),
  deleteIncomeRecords: document.getElementById("delete-income-records"),
  cashiersTable: document.getElementById("cashiers-table"),
  productSubmit: document.getElementById("product-submit"),
  productForm: document.getElementById("product-form"),
  extraForm: document.getElementById("extra-form"),
  inventoryForm: document.getElementById("inventory-form"),
  cashierForm: document.getElementById("cashier-form"),
  newProduct: document.getElementById("new-product"),
  newExtra: document.getElementById("new-extra"),
  newInventory: document.getElementById("new-inventory"),
  newCashier: document.getElementById("new-cashier"),
  tableForm: document.getElementById("table-form"),
  quickExpenseForm: document.getElementById("quick-expense-form"),
  tablesGrid: document.getElementById("tables-grid"),
  selectedTableTitle: document.getElementById("selected-table-title"),
  tableTicket: document.getElementById("table-ticket"),
  dispatchSearch: document.getElementById("dispatch-search"),
  dispatchProducts: document.getElementById("dispatch-products"),
  backToTables: document.getElementById("back-to-tables"),
  openCheckout: document.getElementById("open-checkout"),
  printReceipt: document.getElementById("print-receipt"),
  checkoutModal: document.getElementById("checkout-modal"),
  checkoutClose: document.getElementById("checkout-close"),
  checkoutForm: document.getElementById("table-checkout-form"),
  checkoutTitle: document.getElementById("checkout-table-title"),
  checkoutTotal: document.getElementById("checkout-total"),
  mixedPaymentFields: document.getElementById("mixed-payment-fields"),
  bankConfigForm: document.getElementById("bank-config-form"),
  saveBankConfig: document.getElementById("save-bank-config"),
  bankPreview: document.getElementById("bank-preview"),
  bankQrFile: document.getElementById("bank-qr-file"),
  qrPickerPreview: document.getElementById("qr-picker-preview"),
  qrPickerCaption: document.getElementById("qr-picker-caption"),
  paymentMethodsEditor: document.getElementById("payment-methods-editor"),
  deliveryZonesEditor: document.getElementById("delivery-zones-editor"),
  addPaymentMethod: document.getElementById("add-payment-method"),
  addDeliveryZone: document.getElementById("add-delivery-zone"),
  cancelTable: document.getElementById("cancel-table"),
  smartDialog: document.getElementById("smart-dialog"),
  smartDialogClose: document.getElementById("smart-dialog-close"),
  smartDialogKicker: document.getElementById("smart-dialog-kicker"),
  smartDialogTitle: document.getElementById("smart-dialog-title"),
  smartDialogMessage: document.getElementById("smart-dialog-message"),
  smartDialogField: document.getElementById("smart-dialog-field"),
  smartDialogInput: document.getElementById("smart-dialog-input"),
  smartDialogCancel: document.getElementById("smart-dialog-cancel"),
  smartDialogConfirm: document.getElementById("smart-dialog-confirm"),
  toast: document.getElementById("toast"),
  newOrderAlert: document.getElementById("new-order-alert"),
  newOrderAlertClose: document.getElementById("new-order-alert-close"),
  newOrderAlertOpen: document.getElementById("new-order-alert-open"),
  newOrderAlertTitle: document.getElementById("new-order-alert-title"),
  newOrderAlertDetail: document.getElementById("new-order-alert-detail"),
  notificationPermission: document.getElementById("notification-permission-btn"),
  notificationPermissionLabel: document.getElementById("notification-permission-label"),
  alertSound: document.getElementById("order-alert-sound")
};

Object.assign(el, {
  productSearch: document.getElementById("product-search"),
  productStatusFilter: document.getElementById("product-status-filter"),
  extraSearch: document.getElementById("extra-search"),
  extraStatusFilter: document.getElementById("extra-status-filter"),
  cashierSearch: document.getElementById("cashier-search"),
  cashierStatusFilter: document.getElementById("cashier-status-filter"),
  tableSearch: document.getElementById("table-search"),
  tableStatusFilter: document.getElementById("table-status-filter"),
  orderDetailModal: document.getElementById("order-detail-modal"),
  orderDetailClose: document.getElementById("order-detail-close"),
  orderDetailContent: document.getElementById("order-detail-content")
});

document.addEventListener("DOMContentLoaded", init);

function init() {
  bindEvents();
  updateSessionUi();
  if (state.token) {
    loadLocalAdminState();
    updateNotificationPermissionUi();
    applyCachedAdminData();
    setActiveView(state.activeView);
    hideLoginGate();
    armSoundUnlock();
    loadActiveSectionData({ silent: true })
      .finally(() => loadAdminData({ silent: true, background: true }))
      .finally(startOrderPolling);
  } else {
    showLoginGate();
    setStatus("Inicia sesión para cargar el panel.");
  }
}

function bindEvents() {
  el.navLinks.forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
        setActiveView(link.dataset.view, { load: true });
    });
  });

  el.loginForm.addEventListener("submit", submitLogin);
  el.loginForm.addEventListener("input", clearLoginError);
  el.loginPasswordToggle?.addEventListener("click", toggleLoginPassword);
  el.logout.addEventListener("click", logoutAdmin);

  el.reload.addEventListener("click", () => {
    unlockSound();
    loadAdminData({ fresh: true });
    startOrderPolling();
  });

  el.orderFilter.addEventListener("change", () => {
    state.orderFilter = el.orderFilter.value;
    renderOrders();
  });
  el.productSearch?.addEventListener("input", () => {
    state.productSearch = el.productSearch.value;
    renderProducts();
  });
  el.productStatusFilter?.addEventListener("change", () => {
    state.productStatusFilter = el.productStatusFilter.value;
    renderProducts();
  });
  el.categoryCoversOpen?.addEventListener("click", openCategoryCoverModal);
  el.categoryCoverClose?.addEventListener("click", closeCategoryCoverModal);
  el.categoryCoverCancel?.addEventListener("click", closeCategoryCoverModal);
  el.categoryCoverModal?.addEventListener("click", event => {
    if (event.target === el.categoryCoverModal) closeCategoryCoverModal();
  });
  el.categoryCoverSelect?.addEventListener("change", () => {
    state.selectedCoverCategory = el.categoryCoverSelect.value;
    clearCategoryCoverFile();
    renderCategoryCoverModal();
  });
  el.categoryCoverFile?.addEventListener("change", event => handleCategoryCoverFile(event.target.files?.[0]));
  el.categoryCoverDrop?.addEventListener("dragover", event => {
    event.preventDefault();
    el.categoryCoverDrop.classList.add("is-dragging");
  });
  el.categoryCoverDrop?.addEventListener("dragleave", () => el.categoryCoverDrop.classList.remove("is-dragging"));
  el.categoryCoverDrop?.addEventListener("drop", event => {
    event.preventDefault();
    el.categoryCoverDrop.classList.remove("is-dragging");
    handleCategoryCoverFile(event.dataTransfer?.files?.[0]);
  });
  el.categoryCoverSave?.addEventListener("click", saveCategoryCover);
  el.extraSearch?.addEventListener("input", () => {
    state.extraSearch = el.extraSearch.value;
    renderExtras();
  });
  el.extraStatusFilter?.addEventListener("change", () => {
    state.extraStatusFilter = el.extraStatusFilter.value;
    renderExtras();
  });
  el.cashierSearch?.addEventListener("input", () => {
    state.cashierSearch = el.cashierSearch.value;
    renderCashiers();
  });
  el.cashierStatusFilter?.addEventListener("change", () => {
    state.cashierStatusFilter = el.cashierStatusFilter.value;
    renderCashiers();
  });
  el.bankConfigForm?.addEventListener("input", () => {
    state.bankFormDirty = true;
    state.operationConfig.packagingFee = moneyToNumber(el.bankConfigForm.elements.packaging_fee.value);
    renderBankPreview(state.operationConfig);
  });
  el.saveBankConfig?.addEventListener("click", saveBankConfig);
  el.addPaymentMethod?.addEventListener("click", addPaymentMethodCard);
  el.addDeliveryZone?.addEventListener("click", addDeliveryZoneCard);
  el.bankQrFile?.addEventListener("change", handleQrFile);
  el.paymentMethodsEditor?.addEventListener("input", updateBankConfigFromEditors);
  el.paymentMethodsEditor?.addEventListener("change", updateBankConfigFromEditors);
  el.deliveryZonesEditor?.addEventListener("input", updateBankConfigFromEditors);
  el.deliveryZonesEditor?.addEventListener("change", updateBankConfigFromEditors);
  el.paymentMethodsEditor?.addEventListener("click", removeBankEditorRow);
  el.deliveryZonesEditor?.addEventListener("click", removeBankEditorRow);
  el.tableSearch?.addEventListener("input", () => {
    state.tableSearch = el.tableSearch.value;
    renderTables();
  });
  el.tableStatusFilter?.addEventListener("change", () => {
    state.tableStatusFilter = el.tableStatusFilter.value;
    renderTables();
  });
  el.selectAllOrders?.addEventListener("change", toggleAllVisibleOrders);
  el.bulkOrderStatus?.addEventListener("change", () => updateBulkOrderToolbar());
  el.applyBulkOrderStatus?.addEventListener("click", applyBulkOrderStatus);
  el.deleteOrdersRecords?.addEventListener("click", deleteOrdersRecords);
  el.newOrderAlertClose?.addEventListener("click", hideNewOrderAlert);
  el.newOrderAlertOpen?.addEventListener("click", openNewOrders);
  el.notificationPermission?.addEventListener("click", enableAdminAlerts);
  el.orderDetailClose?.addEventListener("click", closeOrderDetailModal);
  el.orderDetailModal?.addEventListener("click", event => {
    if (event.target === el.orderDetailModal) closeOrderDetailModal();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeOrderDetailModal();
  });
  el.incomeSourceFilter?.addEventListener("change", () => {
    state.incomeSourceFilter = el.incomeSourceFilter.value;
    renderKpis();
    renderIncome();
  });

  el.incomeDateFilter?.addEventListener("change", () => {
    state.incomeDateFilter = el.incomeDateFilter.value;
    renderKpis();
    renderIncome();
  });
  el.deleteIncomeRecords?.addEventListener("click", deleteIncomeRecords);

  el.inventoryMovementSearch?.addEventListener("input", () => {
    state.inventoryMovementSearch = el.inventoryMovementSearch.value;
    renderInventoryMovements();
  });

  el.dispatchSearch.addEventListener("input", () => {
    state.dispatchSearch = el.dispatchSearch.value;
    renderDispatchProducts();
  });
  el.backToTables?.addEventListener("click", showTablesOverview);
  document.querySelectorAll("[data-plan-whatsapp]").forEach(button => {
    button.addEventListener("click", () => openPlanWhatsApp(button.dataset.planWhatsapp));
  });
  document.querySelectorAll("[data-open-assistant]").forEach(button => {
    button.addEventListener("click", () => openSidebarAssistant(button.dataset.openAssistant));
  });
  el.sidebarChatClose?.addEventListener("click", closeSidebarAssistant);
  el.sidebarChatForm?.addEventListener("submit", handleSidebarAssistantQuestion);

  el.tableForm.addEventListener("submit", createTable);
  el.quickExpenseForm.addEventListener("submit", addQuickExpenseToTable);
  el.openCheckout.addEventListener("click", openTableCheckout);
  el.printReceipt.addEventListener("click", printSelectedReceipt);
  el.checkoutClose.addEventListener("click", closeCheckout);
  el.checkoutModal.addEventListener("click", event => {
    if (event.target === el.checkoutModal) closeCheckout();
  });
  el.checkoutForm.addEventListener("submit", checkoutTable);
  el.cancelTable.addEventListener("click", cancelSelectedTable);
  el.checkoutForm.addEventListener("input", handlePaymentInput);
  el.checkoutForm.addEventListener("change", handlePaymentInput);

  el.productForm.addEventListener("submit", saveProduct);
  el.extraForm.addEventListener("submit", saveExtra);
  el.inventoryForm.addEventListener("submit", saveInventoryItem);
  el.cashierForm.addEventListener("submit", saveCashier);

  document.querySelectorAll(".dashboard-main [data-assistant-form]").forEach(form => {
    form.addEventListener("submit", handleAssistantQuestion);
  });
  document.querySelectorAll(".dashboard-main .assistant-panel").forEach(panel => {
    panel.classList.add("assistant-collapsed");
    panel.querySelector(".panel-heading")?.addEventListener("click", () => {
      panel.classList.toggle("is-open");
      panel.classList.toggle("assistant-collapsed", !panel.classList.contains("is-open"));
    });
  });

  document.querySelectorAll("[data-kpi-detail]").forEach(card => {
    card.setAttribute("role", "button");
    card.tabIndex = 0;
    card.addEventListener("click", () => {
      card.classList.remove("is-clicked");
      void card.offsetWidth;
      card.classList.add("is-clicked");
      showKpiDetail(card.dataset.kpiDetail);
    });
    card.addEventListener("keydown", event => {
      if (!["Enter", " "].includes(event.key)) return;
      event.preventDefault();
      card.click();
    });
    card.addEventListener("animationend", () => card.classList.remove("is-clicked"));
  });

  bindSmartInternalScroll();

  [el.productForm, el.extraForm, el.inventoryForm, el.cashierForm].forEach(form => {
    form.addEventListener("input", () => updateFormChecks(form));
    form.addEventListener("change", () => updateFormChecks(form));
  });
  bindAdminMoneyInputs();

  document.querySelectorAll("[data-collapse-form]").forEach(button => {
    button.addEventListener("click", () => {
      const form = document.getElementById(button.dataset.collapseForm);
      if (form) collapseForm(form);
    });
  });

  el.newProduct.addEventListener("click", () => openFormForCreate(el.productForm, "producto"));
  el.newExtra.addEventListener("click", () => openFormForCreate(el.extraForm, "extra"));
  el.newInventory.addEventListener("click", () => openFormForCreate(el.inventoryForm, "insumo"));
  el.newCashier.addEventListener("click", () => openFormForCreate(el.cashierForm, "cajero"));

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && state.token) {
      flushPendingWrites();
      loadAdminData({ silent: true, fresh: true });
    }
  });
  window.addEventListener("online", flushPendingWrites);
  window.setInterval(flushPendingWrites, 15000);
}

function setActiveView(view, options = {}) {
  const allowed = ["mesas", "resumen", "ordenes", "carta", "extras", "inventario", "cajeros", "banco", "planes"];
  state.activeView = allowed.includes(view) ? view : "mesas";
  if (["cajeros", "banco"].includes(state.activeView) && state.cashierSession && !isBossUser()) state.activeView = "mesas";
  document.body.dataset.adminView = state.activeView;
  el.navLinks.forEach(link => link.classList.toggle("active", link.dataset.view === state.activeView));
  history.replaceState(null, "", `#${state.activeView}`);
  renderSection(state.activeView);
  if (options.load && state.token) loadActiveSectionData({ silent: true });
}

async function loadAuthInfo() {
  if (state.authInfoLoaded) return;
  try {
    const url = new URL(API_URL);
    url.searchParams.set("action", "authInfo");
    url.searchParams.set("_", Date.now().toString());
    const response = await fetchWithTimeout(url.toString(), { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.error || `HTTP ${response.status}`);
    state.hasBoss = payload.data?.hasBoss !== false;
    state.authInfoLoaded = true;
    updateLoginMode();
  } catch (error) {
    console.warn("No se pudo verificar estado de login", error);
    state.hasBoss = true;
    state.authInfoLoaded = true;
    updateLoginMode();
  }
}

function loadLocalAdminState() {
  if (state.localStateLoaded) return;
  state.localStateLoaded = true;
  state.pendingWrites = readPendingWrites();
  state.inventoryMovements = readLocalJson("chanchos_inventory_movements_v1", []);
  state.selectedTableId = localStorage.getItem("chanchos_selected_table") || "";
}

function readLocalJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function updateLoginMode() {
  state.loginMode = state.hasBoss ? "login" : "createBoss";
  const creating = state.loginMode === "createBoss";
  el.loginModeLabel.textContent = creating ? "Primer acceso" : "Acceso seguro";
  el.loginTitle.textContent = creating ? "Crear jefe principal" : "Entrar al panel";
  el.loginCopy.textContent = creating
    ? "No hay jefe registrado. Crea el primer usuario principal para administrar el negocio."
    : "Ingresa con el correo y la contraseña creados para el equipo.";
  el.loginSubmit.textContent = creating ? "Crear jefe" : "Entrar";
  el.loginHelper.textContent = creating ? "Oscar's Parrilla Admin v4.0 | Primer acceso principal" : "Oscar's Parrilla Admin v4.0";
  el.firstBossName.classList.toggle("hidden", !creating);
  el.loginForm.elements.nombre.required = creating;
}

function showLoginError(message) {
  if (!el.loginError) return;
  el.loginError.textContent = message;
  el.loginError.classList.remove("hidden");
}

function clearLoginError() {
  if (!el.loginError) return;
  el.loginError.textContent = "";
  el.loginError.classList.add("hidden");
}

function loginErrorMessage(error) {
  const text = String(error?.message || "").trim();
  if (/correo/i.test(text) && /no existe|registrado|encontr/i.test(text)) return "Ese correo no está registrado.";
  if (/contrasena|clave/i.test(text) && /incorrect/i.test(text)) return "La contraseña es incorrecta.";
  if (/inactivo|desactiv/i.test(text)) return "Este usuario está inactivo. Pide a un jefe que lo active.";
  if (/correo/i.test(text) && /contrasena|clave/i.test(text)) return "Revisa el correo y la contraseña.";
  return text || "No pudimos validar el acceso. Intenta de nuevo.";
}

function toggleLoginPassword() {
  const input = el.loginForm.elements.clave;
  const showing = input.type === "text";
  input.type = showing ? "password" : "text";
  el.loginPasswordToggle.setAttribute("aria-pressed", String(!showing));
  el.loginPasswordToggle.setAttribute("aria-label", showing ? "Mostrar contraseña" : "Ocultar contraseña");
  input.focus();
}

async function submitLogin(event) {
  event.preventDefault();
  clearLoginError();
  const data = getFormObject(el.loginForm);
  const correo = String(data.correo || "").trim().toLowerCase();
  const clave = String(data.clave || "").trim();
  const nombre = String(data.nombre || "").trim();
  if (!correo) {
    showLoginError("El correo está vacío o mal escrito.");
    el.loginForm.elements.correo.focus();
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    showLoginError("El correo está mal escrito.");
    el.loginForm.elements.correo.focus();
    return;
  }
  if (!clave) {
    showLoginError("La contraseña está vacía.");
    el.loginForm.elements.clave.focus();
    return;
  }

  el.loginSubmit.disabled = true;
  el.loginSubmit.textContent = state.loginMode === "createBoss" ? "Creando..." : "Entrando...";
  try {
    const action = state.loginMode === "createBoss" ? "createFirstBoss" : "loginStaff";
    const response = await fetchWithTimeout(API_URL, {
      method: "POST",
      body: JSON.stringify({ action, correo, clave, nombre })
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.error || `HTTP ${response.status}`);
    startSession(payload.data);
    hideLoginGate();
    setStatus("Cargando panel...");
    applyCachedAdminData();
    loadActiveSectionData({ silent: true })
      .finally(() => loadAdminData({ silent: true, background: true }))
      .finally(startOrderPolling);
    toast(`Bienvenido, ${state.cashierSession.nombre}.`);
  } catch (error) {
    console.warn("Validacion de acceso pendiente", error);
    if (state.loginMode === "login" && !state.authInfoLoaded) await loadAuthInfo();
    const message = state.loginMode === "createBoss"
      ? "No hay jefe principal registrado. Completa el nombre y crea el primer acceso."
      : loginErrorMessage(error);
    showLoginError(message);
    toast(message);
  } finally {
    el.loginSubmit.disabled = false;
    updateLoginMode();
  }
}

function startSession(data = {}) {
  state.token = data.token || "";
  state.cashierSession = data.user || data.cashier || null;
  loadLocalAdminState();
  sessionStorage.setItem("chanchos_admin_token", state.token);
  sessionStorage.setItem("chanchos_cashier_session", JSON.stringify(state.cashierSession));
  updateSessionUi();
  applyRoleAccess();
  updateNotificationPermissionUi();
  setActiveView(state.activeView, { load: false });
  armSoundUnlock();
}

function logoutAdmin() {
  state.token = "";
  state.cashierSession = null;
  sessionStorage.removeItem("chanchos_admin_token");
  sessionStorage.removeItem("chanchos_cashier_session");
  window.clearInterval(state.pollTimer);
  updateSessionUi();
  updateLoginMode();
  showLoginGate();
  setStatus("Sesión cerrada. Inicia sesión para continuar.");
}

function showLoginGate() {
  document.body.classList.add("login-open");
  el.loginGate.classList.add("is-visible");
  el.loginGate.setAttribute("aria-hidden", "false");
  window.setTimeout(() => el.loginForm.elements.correo?.focus(), 80);
}

function hideLoginGate() {
  document.body.classList.remove("login-open");
  el.loginGate.classList.remove("is-visible");
  el.loginGate.setAttribute("aria-hidden", "true");
}

function updateSessionUi() {
  const user = state.cashierSession;
  el.sessionRole.textContent = user ? labelFromId(user.rol || "cajero") : "Sesión";
  el.sessionUser.textContent = user ? user.nombre || user.correo || "Usuario" : "Sin iniciar";
  applyRoleAccess();
}

function sessionStatusText() {
  const user = state.cashierSession;
  if (!user) return "Inicia sesión para cargar el panel.";
  return `Última sesión: ${formatDateTime(user.ultimo_acceso || new Date().toISOString())}`;
}

function applyRoleAccess() {
  const canManageUsers = !state.cashierSession || isBossUser();
  el.navLinks.forEach(link => {
    if (["cajeros", "banco"].includes(link.dataset.view)) link.classList.toggle("hidden", !canManageUsers);
  });
  if (el.newCashier) el.newCashier.disabled = !canManageUsers;
  if (el.cashierForm) el.cashierForm.classList.toggle("hidden", !canManageUsers);
  if (["cajeros", "banco"].includes(state.activeView) && !canManageUsers) setActiveView("mesas");
}

function isBossUser() {
  const role = normalize(state.cashierSession?.rol || "");
  return role === "jefe" || role === "admin" || role === "administrador";
}

async function loadAdminData(options = {}) {
  if (!state.token) {
    setStatus("Inicia sesión para cargar el panel.");
    return;
  }
  if (state.syncInProgress && options.silent) return;

  if (!options.silent) setStatus("Actualizando información...");
  state.syncInProgress = true;
  try {
    const url = new URL(API_URL);
    url.searchParams.set("action", "adminData");
    url.searchParams.set("token", state.token);
    if (options.fresh) url.searchParams.set("fresh", "1");
    url.searchParams.set("_", Date.now().toString());
    const response = await fetchWithTimeout(url.toString(), { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.error || `HTTP ${response.status}`);

    hydrateAdminData(payload.data);
    applyPendingWrites();
    flushPendingWrites();
    cacheAdminData();
    renderSyncedData(options);
    if (!options.silent) setStatus(sessionStatusText());
  } catch (error) {
    console.warn("Actualización en segundo plano pendiente", error);
    setStatus("Panel listo con información guardada.");
  } finally {
    state.syncInProgress = false;
  }
}

async function loadActiveSectionData(options = {}) {
  const section = state.activeView || "mesas";
  if (!state.token || state.sectionSyncInProgress === section) return;
  state.sectionSyncInProgress = section;
  if (!options.silent) setStatus("Cargando sección...");

  try {
    const url = new URL(API_URL);
    url.searchParams.set("action", "adminSectionData");
    url.searchParams.set("section", section);
    url.searchParams.set("token", state.token);
    url.searchParams.set("_", Date.now().toString());
    const response = await fetchWithTimeout(url.toString(), { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.error || `HTTP ${response.status}`);

    hydrateAdminData(payload.data || {});
    applyPendingWrites();
    cacheAdminData();
    if (section === state.activeView) renderSection(section);
    if (!options.silent) setStatus(sessionStatusText());
  } catch (error) {
    console.warn("Carga rápida de sección pendiente", error);
    if (section === state.activeView) renderSection(section);
  } finally {
    if (state.sectionSyncInProgress === section) state.sectionSyncInProgress = "";
  }
}

function hydrateAdminData(data = {}) {
  if (Object.prototype.hasOwnProperty.call(data, "products")) state.products = normalizeProductsForAdmin(data.products || []);
  if (Object.prototype.hasOwnProperty.call(data, "extras")) state.extras = normalizeExtrasForAdmin(data.extras || []);
  if (Object.prototype.hasOwnProperty.call(data, "orders")) {
    const nextOrders = normalizeOrdersForAdmin(data.orders || []);
    notifyIfNewOrders(nextOrders);
    state.orders = nextOrders;
  }
  if (Object.prototype.hasOwnProperty.call(data, "tables")) state.tables = mergePendingTables(normalizeTables(data.tables || []));
  if (Object.prototype.hasOwnProperty.call(data, "payments")) state.payments = normalizePayments(data.payments || []);
  if (Object.prototype.hasOwnProperty.call(data, "inventory")) state.inventory = normalizeInventory(data.inventory || []);
  if (Object.prototype.hasOwnProperty.call(data, "inventoryMovements")) {
    state.inventoryMovements = mergeInventoryMovements(data.inventoryMovements || []);
    localStorage.setItem("chanchos_inventory_movements_v1", JSON.stringify(state.inventoryMovements.slice(0, 200)));
  }
  if (Object.prototype.hasOwnProperty.call(data, "cashiers")) state.cashiers = normalizeCashiers(data.cashiers || []);
  if (Object.prototype.hasOwnProperty.call(data, "operationConfig")) {
    state.operationConfig = normalizeOperationConfig(data.operationConfig || {});
    state.bankFormDirty = false;
  }
  if (Object.prototype.hasOwnProperty.call(data, "kpis")) state.kpis = data.kpis || {};
  applyRoleAccess();
  if (Object.prototype.hasOwnProperty.call(data, "tables") && (!state.selectedTableId || !state.tables.some(table => table.table_id === state.selectedTableId))) {
    state.selectedTableId = state.tables[0]?.table_id || "";
  }
}

function readPendingWrites() {
  try {
    const raw = localStorage.getItem(ADMIN_PENDING_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePendingWrites() {
  try {
    localStorage.setItem(ADMIN_PENDING_KEY, JSON.stringify(state.pendingWrites.slice(-80)));
  } catch (error) {
    console.warn("No se pudo guardar cola local admin", error);
  }
}

function queuePendingWrite(action, data) {
  const pending = {
    action,
    data,
    id: pendingIdFor(action, data),
    createdAt: Date.now()
  };
  state.pendingWrites = state.pendingWrites.filter(item => !(item.action === action && item.id === pending.id));
  state.pendingWrites.push(pending);
  savePendingWrites();
  return pending;
}

function pendingIdFor(action, data = {}) {
  if (action === "bulkUpdateOrderStatus") return data.operation_key || `${data.estado}:${[...(data.order_ids || [])].sort().join(",")}`;
  if (data.product?.producto_id || data.producto_id) return data.product?.producto_id || data.producto_id;
  if (data.extra?.extra_id || data.extra_id) return data.extra?.extra_id || data.extra_id;
  if (data.item?.inventory_id || data.inventory_id) return data.item?.inventory_id || data.inventory_id;
  if (data.cashier?.cashier_id || data.cashier_id) return data.cashier?.cashier_id || data.cashier_id;
  if (data.operationConfig || data.operation_config) return "operation_config";
  if (data.table?.table_id) return data.table.table_id;
  if (data.table_id) return data.table_id;
  if (data.payment?.payment_id) return data.payment.payment_id;
  if (data.order_id) return data.order_id;
  return `${action}-${Date.now()}`;
}

function applyPendingWrites() {
  const fresh = [];
  state.pendingWrites.forEach(pending => {
    if (!pendingAlreadySynced(pending)) applyPendingWrite(pending);
    fresh.push(pending);
  });
  state.pendingWrites = fresh;
  savePendingWrites();
}

async function flushPendingWrites() {
  if (!state.token || !state.pendingWrites.length || state.pendingFlushInProgress) return;
  state.pendingFlushInProgress = true;
  const queue = [...state.pendingWrites];
  const queueKeys = new Set(queue.map(item => `${item.action}:${item.id}`));
  const remaining = [];
  try {
    for (const pending of queue) {
      try {
        await postAdmin(pending.action, pending.data);
      } catch (error) {
        console.warn("Guardado en cola pendiente", error);
        remaining.push(pending);
      }
    }
    const stillCurrent = new Set(state.pendingWrites.map(item => `${item.action}:${item.id}`));
    const validRemaining = remaining.filter(item => stillCurrent.has(`${item.action}:${item.id}`));
    const addedWhileSending = state.pendingWrites.filter(item => !queueKeys.has(`${item.action}:${item.id}`));
    state.pendingWrites = dedupePendingWrites([...validRemaining, ...addedWhileSending]);
    savePendingWrites();
    cacheAdminData();
    if (state.pendingWrites.length) schedulePendingRetry();
  } finally {
    state.pendingFlushInProgress = false;
  }
}

function schedulePendingRetry() {
  window.clearTimeout(schedulePendingRetry.timer);
  schedulePendingRetry.attempt = Math.min((schedulePendingRetry.attempt || 0) + 1, 5);
  const delay = Math.min(1200 * (2 ** (schedulePendingRetry.attempt - 1)), 12000);
  schedulePendingRetry.timer = window.setTimeout(() => flushPendingWrites(), delay);
}

function dedupePendingWrites(items) {
  const map = new Map();
  items.forEach(item => map.set(`${item.action}:${item.id}`, item));
  return [...map.values()].slice(-80);
}

function pendingAlreadySynced(pending) {
  const data = pending.data || {};
  if (pending.action === "deleteProduct") return !state.products.some(item => item.producto_id === data.producto_id);
  if (pending.action === "deleteExtra") return !state.extras.some(item => item.extra_id === data.extra_id);
  if (pending.action === "deleteInventory") return !state.inventory.some(item => item.inventory_id === data.inventory_id);
  if (pending.action === "deleteCashier") return !state.cashiers.some(item => item.cashier_id === data.cashier_id);
  if (pending.action === "deleteTable") return !state.tables.some(item => item.table_id === data.table_id);
  if (pending.action === "checkoutTable") return state.payments.some(item => item.payment_id === data.payment?.payment_id);
  if (pending.action === "updateOrderStatus") {
    const order = state.orders.find(item => item.order_id === data.order_id);
    return order && normalize(order.estado) === normalize(data.estado);
  }
  if (pending.action === "bulkUpdateOrderStatus") {
    return (data.order_ids || []).every(orderId => {
      const order = state.orders.find(item => item.order_id === orderId);
      return order && normalize(order.estado) === normalize(data.estado);
    });
  }
  if (pending.action === "upsertProduct") return state.products.some(item => item.producto_id === data.product?.producto_id && sameMeaningfulJson(item, data.product));
  if (pending.action === "upsertExtra") return state.extras.some(item => item.extra_id === data.extra?.extra_id && sameMeaningfulJson(item, data.extra));
  if (pending.action === "upsertInventory") return state.inventory.some(item => item.inventory_id === data.item?.inventory_id && sameMeaningfulJson(item, data.item));
  if (pending.action === "upsertCashier") return state.cashiers.some(item => item.cashier_id === data.cashier?.cashier_id && sameMeaningfulJson(item, data.cashier));
  if (pending.action === "upsertOperationConfig") return sameMeaningfulJson(state.operationConfig, data.operationConfig || data.operation_config || {});
  if (pending.action === "upsertTable" || pending.action === "cancelTable") return state.tables.some(item => item.table_id === data.table?.table_id && sameMeaningfulJson(item, data.table));
  if (pending.action === "recordInventoryMovement") return state.inventoryMovements.some(item => item.movement_id === data.movement?.movement_id);
  return false;
}

function applyPendingWrite(pending) {
  const data = pending.data || {};
  if (pending.action === "upsertProduct" && data.product) upsertLocal("products", "producto_id", data.product);
  if (pending.action === "upsertExtra" && data.extra) upsertLocal("extras", "extra_id", data.extra);
  if (pending.action === "upsertInventory" && data.item) upsertLocal("inventory", "inventory_id", data.item);
  if (pending.action === "upsertCashier" && data.cashier) upsertLocal("cashiers", "cashier_id", data.cashier);
  if (pending.action === "upsertOperationConfig") state.operationConfig = normalizeOperationConfig(data.operationConfig || data.operation_config || {});
  if ((pending.action === "upsertTable" || pending.action === "cancelTable") && data.table) upsertLocal("tables", "table_id", data.table);
  if (pending.action === "recordInventoryMovement" && data.movement) upsertLocal("inventoryMovements", "movement_id", data.movement);
  if (pending.action === "checkoutTable") {
    if (data.payment) upsertLocal("payments", "payment_id", data.payment);
    if (data.table) upsertLocal("tables", "table_id", data.table);
  }
  if (pending.action === "deleteProduct") state.products = state.products.filter(item => item.producto_id !== data.producto_id);
  if (pending.action === "deleteExtra") state.extras = state.extras.filter(item => item.extra_id !== data.extra_id);
  if (pending.action === "deleteInventory") state.inventory = state.inventory.filter(item => item.inventory_id !== data.inventory_id);
  if (pending.action === "deleteCashier") state.cashiers = state.cashiers.filter(item => item.cashier_id !== data.cashier_id);
  if (pending.action === "deleteTable") state.tables = state.tables.filter(item => item.table_id !== data.table_id);
  if (pending.action === "updateOrderStatus") {
    const order = state.orders.find(item => item.order_id === data.order_id);
    if (order) order.estado = data.estado;
  }
  if (pending.action === "bulkUpdateOrderStatus") {
    const ids = new Set(data.order_ids || []);
    state.orders.forEach(order => {
      if (ids.has(order.order_id)) order.estado = data.estado;
    });
  }
}

function mergePendingTables(remoteTables) {
  const tableWrites = state.pendingWrites
    .filter(pending => pending.action === "upsertTable" && pending.data?.table)
    .map(pending => pending.data.table);
  if (!tableWrites.length) return remoteTables;

  const localById = new Map(state.tables.map(table => [table.table_id, table]));
  const pendingById = new Map(tableWrites.map(table => [table.table_id, table]));
  const merged = remoteTables.map(remoteTable => {
    const pendingTable = pendingById.get(remoteTable.table_id);
    if (!pendingTable) return remoteTable;

    const localTable = localById.get(remoteTable.table_id);
    const localItems = tableItems(localTable);
    const pendingItems = tableItems(pendingTable);
    const remoteItems = tableItems(remoteTable);
    const shouldKeepLocal = localItems.length || pendingItems.length || !sameMeaningfulJson(remoteItems, pendingItems);
    return shouldKeepLocal ? { ...remoteTable, ...pendingTable, items: pendingItems.length ? pendingItems : localItems } : remoteTable;
  });

  pendingById.forEach((table, tableId) => {
    if (!merged.some(item => item.table_id === tableId)) merged.push(table);
  });
  return merged;
}

function applyCachedAdminData() {
  try {
    const raw = localStorage.getItem(ADMIN_CACHE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    hydrateAdminData(data);
    applyPendingWrites();
    state.knownOrderIds = new Set(state.orders.map(order => String(order.order_id || "")));
    state.liveOrdersReady = state.orders.length > 0;
    renderAll();
    setStatus("Panel listo con información guardada.");
  } catch (error) {
    console.warn("No se pudo cargar cache admin", error);
  }
}

function cacheAdminData() {
  try {
    localStorage.setItem(ADMIN_CACHE_KEY, JSON.stringify({
      products: state.products,
      extras: state.extras,
      orders: state.orders,
      tables: state.tables,
      payments: state.payments,
      inventory: state.inventory,
      inventoryMovements: state.inventoryMovements,
      cashiers: state.cashiers,
      operationConfig: state.operationConfig,
      kpis: state.kpis,
      updatedAt: new Date().toISOString()
    }));
  } catch (error) {
    console.warn("No se pudo guardar cache admin", error);
  }
}

function renderAll() {
  renderKpis();
  renderIncome();
  renderOrders();
  renderProducts();
  renderExtras();
  renderTables();
  renderTableTicket();
  renderDispatchProducts();
  renderInventory();
  renderInventoryMovements();
  renderCashiers();
  renderBankConfig();
  seedAssistantMessages();
}

function renderSection(view = state.activeView) {
  if (view === "mesas") {
    renderKpis();
    renderTables();
    renderTableTicket();
    renderDispatchProducts();
    return;
  }
  if (view === "resumen") {
    renderKpis();
    renderIncome();
    return;
  }
  if (view === "ordenes") {
    renderKpis();
    renderIncome();
    renderOrders();
    return;
  }
  if (view === "carta") {
    renderProducts();
    return;
  }
  if (view === "extras") {
    renderExtras();
    return;
  }
  if (view === "inventario") {
    renderInventory();
    renderInventoryMovements();
    return;
  }
  if (view === "cajeros") {
    renderCashiers();
    return;
  }
  if (view === "banco") {
    renderBankConfig();
  }
}

function renderSyncedData(options = {}) {
  if (!(options.silent && state.activeView === "mesas" && hasPendingTableWrite())) {
    renderAll();
    return;
  }

  renderKpis();
  renderIncome();
  renderOrders();
  renderProducts();
  renderExtras();
  renderDispatchProducts();
  renderInventory();
  renderInventoryMovements();
  renderCashiers();
  renderBankConfig();
  seedAssistantMessages();
}

function hasPendingTableWrite(tableId = state.selectedTableId) {
  return state.pendingWrites.some(pending => {
    if (pending.action !== "upsertTable") return false;
    if (!tableId) return true;
    return pending.data?.table?.table_id === tableId;
  });
}

function renderBankConfig() {
  if (!el.bankConfigForm || state.bankFormDirty) return;
  const config = normalizeOperationConfig(state.operationConfig);
  el.bankConfigForm.elements.packaging_fee.value = formatMoney(config.packagingFee);
  if (el.bankConfigForm.elements.qr_image) el.bankConfigForm.elements.qr_image.value = config.qrImage || "";
  renderQrPickerPreview(config.qrImage);
  renderPaymentMethodsEditor(config.paymentMethods);
  renderDeliveryZonesEditor(config.deliveryZones);
  renderBankPreview(config);
}

function openCategoryCoverModal() {
  const categories = getAdminProductCategories();
  if (!categories.length) {
    toast("Primero agrega productos para tener categorias.");
    return;
  }
  state.selectedCoverCategory = state.selectedCoverCategory || categories[0].id;
  clearCategoryCoverFile();
  renderCategoryCoverModal();
  openLayer(el.categoryCoverModal);
}

function closeCategoryCoverModal() {
  clearCategoryCoverFile();
  closeLayer(el.categoryCoverModal);
}

function getAdminProductCategories() {
  const counts = state.products.reduce((acc, product) => {
    const key = product.categoria_id || "general";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  return Object.keys(counts)
    .sort(categorySort)
    .map(id => ({ id, label: labelFromId(id), count: counts[id] }));
}

function renderCategoryCoverModal() {
  const categories = getAdminProductCategories();
  if (!categories.some(category => category.id === state.selectedCoverCategory)) {
    state.selectedCoverCategory = categories[0]?.id || "";
  }
  if (el.categoryCoverSelect) {
    el.categoryCoverSelect.innerHTML = categories.map(category => `
      <option value="${escapeAttr(category.id)}" ${category.id === state.selectedCoverCategory ? "selected" : ""}>${escapeHtml(category.label)} (${category.count})</option>
    `).join("");
  }
  const cover = getCategoryCover(state.selectedCoverCategory);
  const preview = state.categoryCoverPreviewUrl || cover?.image_url || adminCategoryFallbackImage(state.selectedCoverCategory);
  if (el.categoryCoverPreview) {
    el.categoryCoverPreview.innerHTML = preview
      ? `<img src="${escapeAttr(preview)}" alt="Portada de ${escapeAttr(labelFromId(state.selectedCoverCategory))}">`
      : `<span>Sin portada configurada</span>`;
  }
  if (el.categoryCoverFileMeta && !state.categoryCoverFile) {
    el.categoryCoverFileMeta.textContent = cover?.image_url ? "Portada actual. Puedes reemplazarla." : "PNG, JPG o WEBP hasta 4 MB";
  }
  setCategoryCoverProgress(0);
}

function getCategoryCover(categoryId) {
  return normalizeCategoryCovers(state.operationConfig?.categoryCovers || [])
    .find(cover => cover.category_id === categoryId);
}

function adminCategoryFallbackImage(categoryId) {
  const product = state.products.find(item => item.categoria_id === categoryId && item.imagen);
  return product ? productVisualImage(product) : "./images/logo.png";
}

function handleCategoryCoverFile(file) {
  if (!file) return;
  if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
    toast("Usa una imagen PNG, JPG o WEBP.");
    return;
  }
  if (file.size > 4 * 1024 * 1024) {
    toast("La portada debe pesar máximo 4 MB.");
    return;
  }
  clearCategoryCoverFile();
  state.categoryCoverFile = file;
  state.categoryCoverPreviewUrl = URL.createObjectURL(file);
  if (el.categoryCoverFileMeta) {
    el.categoryCoverFileMeta.textContent = `${file.name} · ${formatFileSize(file.size)}`;
  }
  renderCategoryCoverModal();
}

function clearCategoryCoverFile() {
  if (state.categoryCoverPreviewUrl) URL.revokeObjectURL(state.categoryCoverPreviewUrl);
  state.categoryCoverFile = null;
  state.categoryCoverPreviewUrl = "";
  if (el.categoryCoverFile) el.categoryCoverFile.value = "";
}

function setCategoryCoverProgress(percent) {
  if (!el.categoryCoverProgress) return;
  el.categoryCoverProgress.classList.toggle("is-active", percent > 0 && percent < 100);
  const bar = el.categoryCoverProgress.querySelector("span");
  if (bar) bar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
}

async function saveCategoryCover() {
  if (!state.selectedCoverCategory) return;
  if (!state.categoryCoverFile && getCategoryCover(state.selectedCoverCategory)?.image_url) {
    toast("Selecciona una nueva imagen para reemplazar la portada.");
    return;
  }
  if (!state.categoryCoverFile) {
    toast("Selecciona una imagen de portada.");
    return;
  }
  let uploaded = "";
  try {
    setCategoryCoverProgress(20);
    const categoryId = state.selectedCoverCategory;
    const current = getCategoryCover(categoryId);
    uploaded = await uploadSupabaseImage(state.categoryCoverFile, "category-covers", categoryId);
    setCategoryCoverProgress(78);
    const categoryCovers = normalizeCategoryCovers(state.operationConfig.categoryCovers || [])
      .filter(cover => cover.category_id !== categoryId);
    categoryCovers.push({
      category_id: categoryId,
      image_url: uploaded,
      storage_path: storagePathFromPublicUrl(uploaded),
      orden: categoryOrderIndex(categoryId) + 1,
      updated_at: new Date().toISOString()
    });
    state.operationConfig = normalizeOperationConfig({
      ...state.operationConfig,
      categoryCovers
    });
    state.bankFormDirty = false;
    clearCategoryCoverFile();
    renderCategoryCoverModal();
    cacheAdminData();
    await postAdmin("upsertOperationConfig", { operationConfig: state.operationConfig });
    if (current?.storage_path && current.storage_path !== storagePathFromPublicUrl(uploaded)) {
      void removeSupabaseImage(current.storage_path);
    }
    void cleanupCategoryCoverUploads(categoryId, storagePathFromPublicUrl(uploaded));
    setCategoryCoverProgress(100);
    toast("Portada guardada.");
  } catch (error) {
    console.warn("No se pudo guardar portada", error);
    if (uploaded) {
      removeSupabaseImage(storagePathFromPublicUrl(uploaded)).catch(cleanupError => {
        console.warn("No se pudo revertir la portada subida", cleanupError);
      });
    }
    toast(`No se pudo guardar la portada: ${error.message}`);
  } finally {
    window.setTimeout(() => setCategoryCoverProgress(0), 600);
  }
}

function renderQrPickerPreview(src = "") {
  if (!el.qrPickerPreview) return;
  el.qrPickerPreview.innerHTML = src ? `<img src="${escapeAttr(src)}" alt="QR configurado">` : "";
  el.qrPickerPreview.classList.toggle("has-image", Boolean(src));
  if (el.qrPickerCaption) {
    el.qrPickerCaption.textContent = src ? "QR cargado. Puedes cambiarlo seleccionando otra imagen." : "PNG, JPG o WEBP desde este computador";
  }
}

function renderPaymentMethodsEditor(methods = []) {
  if (!el.paymentMethodsEditor) return;
  el.paymentMethodsEditor.innerHTML = methods.map((method, index) => `
    <article class="bank-edit-card" data-bank-row="payment" data-index="${index}">
      <input name="nombre" value="${escapeAttr(method.nombre)}" placeholder="Nombre">
      <select name="tipo">
        <option value="transferencia" ${method.tipo !== "efectivo" ? "selected" : ""}>Transferencia</option>
        <option value="efectivo" ${method.tipo === "efectivo" ? "selected" : ""}>Efectivo</option>
      </select>
      <input name="detalle" value="${escapeAttr(method.detalle || "")}" placeholder="Número, llave o cuenta">
      <input name="titular" value="${escapeAttr(method.titular || "")}" placeholder="Titular">
      <select name="activo">
        <option value="true" ${method.activo ? "selected" : ""}>Activo</option>
        <option value="false" ${!method.activo ? "selected" : ""}>Inactivo</option>
      </select>
      <button class="icon-btn danger" type="button" data-remove-bank-row aria-label="Eliminar método">X</button>
    </article>
  `).join("");
}

function renderDeliveryZonesEditor(zones = []) {
  if (!el.deliveryZonesEditor) return;
  el.deliveryZonesEditor.innerHTML = zones.map((zone, index) => `
    <article class="bank-edit-card zone-card" data-bank-row="zone" data-index="${index}">
      <input name="nombre" value="${escapeAttr(zone.nombre)}" placeholder="Barrio o zona">
      <select name="sector">
        ${["Sector 1", "Sector 2", "Sector 3", "Sector 4", "Sector 5", "Sector 6", "Sector 7", "Sector 8"].map(sector => `<option value="${sector}" ${zone.sector === sector ? "selected" : ""}>${sector}</option>`).join("")}
      </select>
      <input name="precio" value="${formatMoney(zone.precio)}" inputmode="numeric" placeholder="$ 0">
      <input name="aliases" value="${escapeAttr((zone.aliases || []).join(", "))}" placeholder="Alias separados por coma">
      <select name="activo">
        <option value="true" ${zone.activo ? "selected" : ""}>Activo</option>
        <option value="false" ${!zone.activo ? "selected" : ""}>Inactivo</option>
      </select>
      <button class="icon-btn danger" type="button" data-remove-bank-row aria-label="Eliminar barrio">X</button>
    </article>
  `).join("");
}

function renderBankPreview(config = state.operationConfig) {
  if (!el.bankPreview) return;
  const safeConfig = normalizeOperationConfig(config);
  el.bankPreview.innerHTML = `
    <div class="bank-preview-grid">
      <article class="bank-preview-card">
        <span class="eyebrow">Empaque</span>
        <h3>${formatMoney(safeConfig.packagingFee)} por producto</h3>
        ${safeConfig.qrImage ? `<img src="${escapeAttr(safeConfig.qrImage)}" alt="QR configurado">` : `<p>Sin QR cargado.</p>`}
      </article>
      <article class="bank-preview-card">
        <span class="eyebrow">Métodos activos</span>
        <p>${safeConfig.paymentMethods.filter(item => item.activo).map(item => `${escapeHtml(item.nombre)} (${escapeHtml(item.tipo)})`).join("<br>") || "Sin métodos activos"}</p>
      </article>
    </div>
    <article class="bank-preview-card">
      <span class="eyebrow">Domicilios</span>
      <p>${safeConfig.deliveryZones.filter(item => item.activo).map(item => `${escapeHtml(item.nombre)}: ${formatMoney(item.precio)}`).join(" · ") || "Sin barrios activos"}</p>
    </article>
  `;
}

function parseBankForm() {
  const form = el.bankConfigForm;
  return normalizeOperationConfig({
    packagingFee: moneyToNumber(form.elements.packaging_fee.value),
    qrImage: form.elements.qr_image?.value.trim() || state.operationConfig.qrImage || "",
    categoryCovers: state.operationConfig.categoryCovers || [],
    paymentMethods: readPaymentMethodsEditor(),
    deliveryZones: readDeliveryZonesEditor()
  });
}

function readPaymentMethodsEditor() {
  return [...(el.paymentMethodsEditor?.querySelectorAll("[data-bank-row='payment']") || [])].map((row, index) => ({
    method_id: slugify(row.querySelector("[name='nombre']")?.value || `metodo-${index + 1}`),
    nombre: row.querySelector("[name='nombre']")?.value.trim() || `Método ${index + 1}`,
    tipo: row.querySelector("[name='tipo']")?.value || "transferencia",
    detalle: row.querySelector("[name='detalle']")?.value.trim() || "",
    titular: row.querySelector("[name='titular']")?.value.trim() || "",
    activo: row.querySelector("[name='activo']")?.value !== "false",
    orden: index + 1
  }));
}

function readDeliveryZonesEditor() {
  return [...(el.deliveryZonesEditor?.querySelectorAll("[data-bank-row='zone']") || [])].map((row, index) => ({
    zone_id: slugify(`${row.querySelector("[name='sector']")?.value || "sector"}-${row.querySelector("[name='nombre']")?.value || index + 1}`),
    nombre: row.querySelector("[name='nombre']")?.value.trim() || `Barrio ${index + 1}`,
    sector: row.querySelector("[name='sector']")?.value || "",
    precio: moneyToNumber(row.querySelector("[name='precio']")?.value),
    aliases: String(row.querySelector("[name='aliases']")?.value || "").split(",").map(item => item.trim()).filter(Boolean),
    activo: row.querySelector("[name='activo']")?.value !== "false",
    orden: index + 1
  }));
}

function updateBankConfigFromEditors() {
  state.bankFormDirty = true;
  state.operationConfig = parseBankForm();
  renderBankPreview(state.operationConfig);
}

function addPaymentMethodCard() {
  state.operationConfig = parseBankForm();
  state.operationConfig.paymentMethods.push({ method_id: makeId("paymethod"), nombre: "Nuevo método", tipo: "transferencia", detalle: "", titular: "Oscar's Parrilla", activo: true, orden: state.operationConfig.paymentMethods.length + 1 });
  state.bankFormDirty = false;
  renderBankConfig();
}

function addDeliveryZoneCard() {
  state.operationConfig = parseBankForm();
  state.operationConfig.deliveryZones.push({ zone_id: makeId("zone"), nombre: "Nuevo barrio", sector: "Sector 1", aliases: [], precio: 5000, activo: true, orden: state.operationConfig.deliveryZones.length + 1 });
  state.bankFormDirty = false;
  renderBankConfig();
}

function removeBankEditorRow(event) {
  const button = event.target.closest("[data-remove-bank-row]");
  if (!button) return;
  button.closest("[data-bank-row]")?.remove();
  updateBankConfigFromEditors();
}

function handleQrFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    if (el.bankConfigForm.elements.qr_image) el.bankConfigForm.elements.qr_image.value = String(reader.result || "");
    state.operationConfig = parseBankForm();
    state.operationConfig.qrImage = String(reader.result || "");
    state.bankFormDirty = true;
    renderQrPickerPreview(state.operationConfig.qrImage);
    renderBankPreview(state.operationConfig);
    toast("QR cargado. Guarda la configuración para publicarlo.");
  };
  reader.readAsDataURL(file);
}

function parsePaymentMethodsText(text) {
  return String(text || "").split(/\r?\n/).map((line, index) => {
    const [nombre, tipo = "transferencia", detalle = "", titular = "", estado = "activo"] = line.split("|").map(item => item.trim());
    if (!nombre) return null;
    return {
      method_id: slugify(nombre),
      nombre,
      tipo: normalize(tipo) === "efectivo" ? "efectivo" : "transferencia",
      detalle,
      titular,
      activo: !/inactivo|desactivado|false|no/i.test(estado),
      orden: index + 1
    };
  }).filter(Boolean);
}

function parseDeliveryZonesText(text) {
  return String(text || "").split(/\r?\n/).map((line, index) => {
    const [nombre, precio = "0", aliases = "", estado = "activo"] = line.split("|").map(item => item.trim());
    if (!nombre) return null;
    return {
      zone_id: slugify(nombre),
      nombre,
      precio: moneyToNumber(precio),
      aliases: aliases.split(",").map(item => item.trim()).filter(Boolean),
      activo: !/inactivo|desactivado|false|no/i.test(estado),
      orden: index + 1
    };
  }).filter(Boolean);
}

function normalizeOperationConfig(config = {}) {
  const deliveryZones = Array.isArray(config.deliveryZones || config.delivery_zones)
    ? (config.deliveryZones || config.delivery_zones)
    : DEFAULT_OPERATION_CONFIG.deliveryZones;
  const paymentMethods = Array.isArray(config.paymentMethods || config.payment_methods)
    ? (config.paymentMethods || config.payment_methods)
    : DEFAULT_OPERATION_CONFIG.paymentMethods;
  const categoryCovers = Array.isArray(config.categoryCovers || config.category_covers)
    ? (config.categoryCovers || config.category_covers)
    : DEFAULT_OPERATION_CONFIG.categoryCovers;
  return {
    packagingFee: Math.max(0, moneyToNumber(config.packagingFee ?? config.packaging_fee ?? DEFAULT_OPERATION_CONFIG.packagingFee)),
    qrImage: String(config.qrImage || config.qr_image || "").trim(),
    categoryCovers: normalizeCategoryCovers(categoryCovers),
    deliveryZones: deliveryZones.map((zone, index) => ({
      zone_id: zone.zone_id || zone.id || slugify(zone.nombre || zone.name || `zona-${index + 1}`),
      nombre: zone.nombre || zone.name || `Zona ${index + 1}`,
      aliases: Array.isArray(zone.aliases) ? zone.aliases : String(zone.aliases || "").split(",").map(item => item.trim()).filter(Boolean),
      precio: Math.max(0, moneyToNumber(zone.precio ?? zone.price)),
      activo: zone.activo !== false,
      orden: moneyToNumber(zone.orden) || index + 1
    })).sort(sortByOrderThenName),
    paymentMethods: paymentMethods.map((method, index) => ({
      method_id: method.method_id || method.id || slugify(method.nombre || method.name || `metodo-${index + 1}`),
      nombre: method.nombre || method.name || `Método ${index + 1}`,
      tipo: normalize(method.tipo || method.type || "transferencia") === "efectivo" ? "efectivo" : "transferencia",
      detalle: method.detalle || method.detail || method.cuenta || "",
      titular: method.titular || method.owner || "",
      activo: method.activo !== false,
      orden: moneyToNumber(method.orden) || index + 1
    })).sort(sortByOrderThenName)
  };
}

function normalizeCategoryCovers(covers = []) {
  const list = Array.isArray(covers) ? covers : [];
  return list
    .map((cover, index) => ({
      category_id: slugify(cover.category_id || cover.categoria_id || cover.id || ""),
      image_url: String(cover.image_url || cover.imagen || cover.url || cover.image || "").trim(),
      storage_path: String(cover.storage_path || cover.path || "").trim(),
      orden: moneyToNumber(cover.orden ?? index + 1),
      updated_at: cover.updated_at || cover.updatedAt || ""
    }))
    .filter(cover => cover.category_id && cover.image_url)
    .sort((a, b) => moneyToNumber(a.orden) - moneyToNumber(b.orden) || a.category_id.localeCompare(b.category_id, "es"));
}

async function saveBankConfig() {
  if (!isBossUser()) {
    toast("Solo el jefe puede editar banco y domicilios.");
    return;
  }
  let operationConfig = parseBankForm();
  const qrFile = el.bankQrFile?.files?.[0];
  if (qrFile) {
    try {
      toast("Subiendo QR...");
      const uploaded = await uploadSupabaseImage(qrFile, "bank", "qr-pago");
      if (uploaded) {
        operationConfig.qrImage = uploaded;
        if (el.bankConfigForm.elements.qr_image) el.bankConfigForm.elements.qr_image.value = uploaded;
        if (el.bankQrFile) el.bankQrFile.value = "";
      }
    } catch (error) {
      toast(`No se pudo subir el QR: ${error.message}`);
      return;
    }
  }
  state.operationConfig = operationConfig;
  state.bankFormDirty = false;
  renderQrPickerPreview(operationConfig.qrImage);
  renderBankConfig();
  const pending = queuePendingWrite("upsertOperationConfig", { operationConfig });
  cacheAdminData();
  try {
    await postAdmin(pending.action, pending.data);
    state.pendingWrites = state.pendingWrites.filter(item => !(item.action === pending.action && item.id === pending.id));
    savePendingWrites();
    cacheAdminData();
    toast("Configuración de banco y domicilios guardada en Supabase.");
  } catch (error) {
    console.warn("No se pudo sincronizar banco", error);
    toast(`No se pudo guardar en Supabase: ${error.message}`);
  }
}

function renderKpis() {
  syncActiveKpiCards();

  const tableRevenue = state.payments
    .filter(payment => normalize(payment.estado) === "pagado")
    .reduce((sum, payment) => sum + moneyToNumber(payment.total), 0);
  const openTables = state.tables.filter(table => normalize(table.estado || "abierta") === "abierta" && tableTotal(table) > 0).length;
  const allIncome = incomeEntries();
  const visibleEntries = filteredIncomeEntries();
  const totalRevenue = allIncome.reduce((sum, entry) => sum + moneyToNumber(entry.total), 0);
  const todayEntries = incomeEntries().filter(entry => isToday(entry.fecha));
  const todayRevenue = todayEntries.reduce((sum, entry) => sum + moneyToNumber(entry.total), 0);
  const pendingOrders = state.orders.filter(order => ["nuevo", "pendiente", "confirmado", "en cocina", "preparando"].includes(normalize(order.estado))).length;
  const tablePayments = state.payments.filter(payment => normalize(payment.estado) === "pagado").length;
  const appOrders = state.orders.length;
  const appOrdersRevenue = state.orders.reduce((sum, order) => sum + moneyToNumber(order.total), 0);

  setText("kpi-today-revenue", formatMoney(todayRevenue));
  setText("kpi-today-orders", `${todayEntries.length} ventas realizadas`);
  setText("kpi-revenue", formatMoney(totalRevenue));
  setText("kpi-orders", incomeSourceSummary(allIncome));
  setText("kpi-open-tables", appOrders);
  document.getElementById("kpi-open-tables")?.nextElementSibling && (document.getElementById("kpi-open-tables").nextElementSibling.textContent = `Whatsapp/App ${formatMoney(appOrdersRevenue)}`);
  setText("kpi-table-revenue", formatMoney(tableRevenue));
  document.getElementById("kpi-table-revenue")?.nextElementSibling && (document.getElementById("kpi-table-revenue").nextElementSibling.textContent = `${tablePayments} pagos de mesa`);
  setText("kpi-pending", pendingOrders);
  document.getElementById("kpi-pending")?.nextElementSibling && (document.getElementById("kpi-pending").nextElementSibling.textContent = `${pendingOrders} órdenes pendientes`);
}

function renderIncome() {
  if (!el.incomeList) return;
  const entries = filteredIncomeEntries();
  const total = entries.reduce((sum, entry) => sum + moneyToNumber(entry.total), 0);
  el.incomeList.innerHTML = entries.length ? `
    <div class="income-total-line">
      <span>${entries.length} movimientos</span>
      <strong>${formatMoney(total)}</strong>
    </div>
    ${entries.map(entry => `
      <article class="income-row income-${escapeAttr(entry.source)}">
        <div>
          <h3>${escapeHtml(entry.title)}</h3>
          <p>${escapeHtml(entry.detail)}</p>
          <small>${escapeHtml(formatDateTime(entry.fecha))} | ${escapeHtml(entry.cajero || "Caja")}</small>
        </div>
        <span class="status-pill income-badge income-${escapeAttr(entry.source)}">${escapeHtml(entry.sourceLabel)}</span>
        ${entry.source === "mesas" ? `<span class="status-pill payment-badge payment-${escapeAttr(paymentMethodClass(entry.paymentMethod))}">${escapeHtml(entry.paymentMethod || "Pago")}</span>` : ""}
        <strong>${formatMoney(entry.total)}</strong>
      </article>
    `).join("")}
  ` : `<div class="empty-state">No hay ingresos para este filtro.</div>`;
}

function incomeEntries() {
  const orderEntries = state.orders
    .filter(order => moneyToNumber(order.total) > 0)
    .map(order => ({
      id: order.order_id,
      source: "ordenes",
      sourceLabel: "Orden",
      title: order.cliente || `Orden #${order.order_number || ""}`,
      detail: orderItemsLabel(order.items),
      fecha: order.fecha,
      cajero: "Venta externa",
      total: order.total
    }));
  const tableEntries = state.payments
    .filter(payment => normalize(payment.estado) === "pagado")
    .map(payment => ({
      id: payment.payment_id,
      source: "mesas",
      sourceLabel: "Mesa",
      title: payment.origen || payment.table_name || "Mesa",
      detail: `${payment.metodo || "Pago"}${payment.notas ? ` | ${payment.notas}` : ""}`,
      fecha: payment.fecha,
      cajero: payment.cajero,
      paymentMethod: paymentMethodLabel(payment),
      total: payment.total
    }));
  return [...tableEntries, ...orderEntries].sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));
}

function filteredIncomeEntries() {
  return incomeEntries()
    .filter(entry => state.incomeSourceFilter === "todos" || entry.source === state.incomeSourceFilter)
    .filter(entry => incomeDateMatches(entry.fecha));
}

function paymentMethodLabel(payment = {}) {
  const first = payment.metodo_uno || payment.metodo_principal || payment.metodo || "";
  const second = payment.metodo_dos || "";
  if (first && second && moneyToNumber(payment.valor_dos) > 0) return `${first} + ${second}`;
  return first || "Pago";
}

function paymentMethodClass(value = "") {
  const text = normalize(value);
  if (text.includes("bancolombia")) return "bancolombia";
  if (text.includes("nequi")) return "nequi";
  if (text.includes("daviplata") || text.includes("davivienda")) return "daviplata";
  if (text.includes("tarjeta") || text.includes("datafono") || text.includes("datáfono")) return "tarjeta";
  if (text.includes("efectivo")) return "efectivo";
  if (text.includes("+") || text.includes("mixto")) return "mixto";
  return "otro";
}

function incomeDateMatches(value) {
  if (state.incomeDateFilter === "todos") return true;
  const date = new Date(value || 0);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  if (state.incomeDateFilter === "hoy") return isToday(value);
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  return date >= weekAgo;
}

function isToday(value) {
  const date = new Date(value || 0);
  return !Number.isNaN(date.getTime()) && date.toDateString() === new Date().toDateString();
}

function incomeSourceSummary(entries) {
  const tableCount = entries.filter(entry => entry.source === "mesas").length;
  const orderCount = entries.filter(entry => entry.source === "ordenes").length;
  if (!entries.length) return "Sin ingresos en este filtro";
  if (state.incomeSourceFilter === "mesas") return `${tableCount} ventas de mesas`;
  if (state.incomeSourceFilter === "ordenes") return `${orderCount} ventas de órdenes`;
  return `${entries.length} ingresos: ${tableCount} mesas · ${orderCount} órdenes`;
}

function showKpiDetail(type) {
  state.activeKpiDetail = type;
  syncActiveKpiCards();
  if (type === "today") {
    state.incomeDateFilter = "hoy";
    state.incomeSourceFilter = "todos";
    el.incomeDateFilter.value = "hoy";
    el.incomeSourceFilter.value = "todos";
    renderKpis();
    renderIncome();
    toast("Mostrando ingresos realizados hoy.");
    return;
  }
  if (type === "total") {
    state.incomeDateFilter = "todos";
    state.incomeSourceFilter = "todos";
    el.incomeDateFilter.value = "todos";
    el.incomeSourceFilter.value = "todos";
    renderKpis();
    renderIncome();
    toast("Mostrando todos los ingresos.");
    return;
  }
  if (type === "tables") {
    state.incomeDateFilter = "todos";
    state.incomeSourceFilter = "ordenes";
    el.incomeDateFilter.value = "todos";
    el.incomeSourceFilter.value = "ordenes";
    renderKpis();
    renderIncome();
    toast("Mostrando ingresos de Whatsapp/App.");
    return;
  }
  if (type === "cash") {
    state.incomeDateFilter = "todos";
    state.incomeSourceFilter = "mesas";
    el.incomeDateFilter.value = "todos";
    el.incomeSourceFilter.value = "mesas";
    renderKpis();
    renderIncome();
    toast("Mostrando ingresos de mesas.");
    return;
  }
  if (type === "pending") {
    setActiveView("ordenes");
    state.orderFilter = "pendientes";
    el.orderFilter.value = "pendientes";
    renderOrders();
    toast("Mostrando órdenes pendientes.");
  }
}

function syncActiveKpiCards() {
  document.querySelectorAll("[data-kpi-detail]").forEach(card => {
    card.classList.toggle("is-active", card.dataset.kpiDetail === state.activeKpiDetail);
  });
}

function renderOrders() {
  const orders = state.orders
    .filter(order => {
      if (state.orderFilter === "todas") return true;
      if (state.orderFilter === "pendientes") return ["nuevo", "pendiente", "confirmado", "en cocina", "preparando"].includes(normalize(order.estado));
      const status = normalize(order.estado || "nuevo");
      if (state.orderFilter === "en cocina") return ["en cocina", "cocina", "preparando"].includes(status);
      if (state.orderFilter === "despachado") return ["despachado"].includes(status);
      if (state.orderFilter === "entregado") return status === "entregado";
      if (state.orderFilter === "cancelado") return ["cancelado", "anulado"].includes(status);
      return status === normalize(state.orderFilter);
    })
    .sort(sortOrdersAscending);

  el.ordersList.innerHTML = orders.length ? `
    <div class="crud-table orders-table">
      <div class="crud-head">
        <span></span><span>#</span><span>Cliente</span><span>Pedido</span><span>Total</span><span>Estado</span><span>Siguiente paso</span>
      </div>
      ${orders.map(order => `
        <article class="crud-row order-row ${isNewOrder(order) ? "new-order" : ""}" data-order-detail="${escapeAttr(order.order_id)}">
          <label class="order-selector" aria-label="Seleccionar orden ${escapeAttr(order.order_number || order.displayNumber)}">
            <input type="checkbox" data-select-order="${escapeAttr(order.order_id)}" ${state.selectedOrderIds.has(order.order_id) ? "checked" : ""}>
            <span></span>
          </label>
          <strong class="order-number">${escapeHtml(order.order_number || order.displayNumber)}</strong>
          <div>
            <h3>${escapeHtml(order.cliente || "Cliente")}</h3>
            <p class="date-nowrap">${escapeHtml(formatDate(order.fecha))}</p>
            <div class="order-mini-badges">
              <span>${escapeHtml(order.telefono || "Sin teléfono")}</span>
              <span>${escapeHtml(labelFromId(order.metodo || "recoger"))}</span>
              <span>${escapeHtml(order.pago || "Pago por confirmar")}</span>
            </div>
          </div>
          ${orderItemsSummaryTemplate(order.items)}
          <strong>${formatMoney(order.total)}</strong>
          <span class="status-pill order-status ${escapeAttr(orderStatusClass(order.estado))}">${escapeHtml(orderStatusLabel(order.estado))}</span>
          <div class="row-actions">
            <button class="secondary-btn" type="button" data-status="${escapeAttr(order.order_id)}">${escapeHtml(nextOrderStatusLabel(order.estado))}</button>
          </div>
        </article>
      `).join("")}
    </div>
  ` : `<div class="empty-state">Aún no hay órdenes registradas.</div>`;

  el.ordersList.querySelectorAll("[data-status]").forEach(button => {
    button.addEventListener("click", () => cycleOrderStatus(button.dataset.status));
  });
  el.ordersList.querySelectorAll("[data-select-order]").forEach(input => {
    input.addEventListener("change", () => {
      if (input.checked) state.selectedOrderIds.add(input.dataset.selectOrder);
      else state.selectedOrderIds.delete(input.dataset.selectOrder);
      updateBulkOrderToolbar(orders);
    });
  });
  el.ordersList.querySelectorAll("[data-order-detail]").forEach(row => {
    row.addEventListener("click", event => {
      if (event.target.closest("button, input, label, select, a")) return;
      openOrderDetailModal(row.dataset.orderDetail);
    });
  });
  updateBulkOrderToolbar(orders);
}

function openOrderDetailModal(orderId) {
  const order = state.orders.find(item => item.order_id === orderId);
  if (!order || !el.orderDetailModal || !el.orderDetailContent) return;
  const items = parseOrderItems(order.items);
  const orderTotals = orderAdminTotals(order, items);
  const cleanNotes = cleanOrderNotes(order.notas || order.note || "");
  el.orderDetailContent.innerHTML = `
    <span class="eyebrow">Detalle de orden</span>
    <div class="order-detail-heading">
      <div>
        <h2>Orden #${escapeHtml(order.order_number || order.displayNumber || "")}</h2>
        <p class="date-nowrap">${escapeHtml(formatDateTime(order.fecha))}</p>
      </div>
      <span class="status-pill order-status ${escapeAttr(orderStatusClass(order.estado))}">${escapeHtml(orderStatusLabel(order.estado))}</span>
    </div>
    <div class="order-detail-grid">
      <section>
        <h3>Cliente</h3>
        <p><strong>${escapeHtml(order.cliente || "Cliente")}</strong></p>
        <p>${escapeHtml(order.telefono || "Sin telefono")}</p>
        <p>${escapeHtml(order.direccion || order.address || "Sin direccion registrada")}</p>
      </section>
      <section>
        <h3>Entrega y pago</h3>
        <p>${escapeHtml(labelFromId(order.metodo || "recoger"))}</p>
        <p>${escapeHtml(order.pago || "Pago por confirmar")}</p>
        ${orderTotals.barrio ? `<p>Barrio/zona: ${escapeHtml(orderTotals.barrio)}</p>` : ""}
        <p>Empaque para llevar: ${formatMoney(orderTotals.empaque)}</p>
        <p>Domicilio: ${orderTotals.domicilio ? formatMoney(orderTotals.domicilio) : "Sin costo o por confirmar"}</p>
        <p>${escapeHtml(cleanNotes || "Sin notas")}</p>
      </section>
    </div>
    <div class="order-detail-items">
      <h3>Productos <small>${items.length ? `${items.length} línea${items.length === 1 ? "" : "s"}` : ""}</small></h3>
      ${items.length ? items.map(item => `
        <div class="order-detail-item">
          <div>
            <strong>${escapeHtml(item.nombre || item.title || item.name || "Producto")}</strong>
            <small>${escapeHtml(item.detalle || item.option || item.opcion || "")}</small>
          </div>
          <span>${orderItemQty(item)} x ${formatMoney(item.precio || item.price)}</span>
          <strong>${formatMoney(orderItemLineTotal(item))}</strong>
        </div>
      `).join("") : `<div class="empty-state">Sin productos detallados.</div>`}
    </div>
    <div class="order-detail-total order-detail-totals">
      <span>Productos</span><strong>${formatMoney(orderTotals.productos)}</strong>
      <span>Empaque para llevar</span><strong>${formatMoney(orderTotals.empaque)}</strong>
      <span>Domicilio${orderTotals.barrio ? ` ${escapeHtml(orderTotals.barrio)}` : ""}</span><strong>${orderDeliveryTotalLabel(order, orderTotals)}</strong>
      <span>Total</span><strong>${formatMoney(orderTotals.total)}</strong>
    </div>
  `;
  el.orderDetailModal.classList.remove("hidden");
  el.orderDetailModal.setAttribute("aria-hidden", "false");
}

function closeOrderDetailModal() {
  el.orderDetailModal?.classList.add("hidden");
  el.orderDetailModal?.setAttribute("aria-hidden", "true");
}

function toggleAllVisibleOrders() {
  const visibleIds = [...el.ordersList.querySelectorAll("[data-select-order]")].map(input => input.dataset.selectOrder);
  visibleIds.forEach(orderId => {
    if (el.selectAllOrders.checked) state.selectedOrderIds.add(orderId);
    else state.selectedOrderIds.delete(orderId);
  });
  renderOrders();
}

function updateBulkOrderToolbar(visibleOrders) {
  const selectedCount = state.selectedOrderIds.size;
  if (el.selectedOrdersCount) el.selectedOrdersCount.textContent = `${selectedCount} seleccionada${selectedCount === 1 ? "" : "s"}`;
  if (el.applyBulkOrderStatus) el.applyBulkOrderStatus.disabled = !selectedCount || !el.bulkOrderStatus?.value;
  const visibleIds = (visibleOrders || []).map(order => order.order_id);
  const checkedVisible = visibleIds.filter(id => state.selectedOrderIds.has(id)).length;
  if (el.selectAllOrders) {
    el.selectAllOrders.checked = Boolean(visibleIds.length && checkedVisible === visibleIds.length);
    el.selectAllOrders.indeterminate = checkedVisible > 0 && checkedVisible < visibleIds.length;
  }
}

function orderItemsSummaryTemplate(itemsValue) {
  const items = parseOrderItems(itemsValue);
  if (!items.length) return `<div class="order-products-summary"><span>Sin productos detallados</span></div>`;
  const visible = items.slice(0, 2);
  const remaining = Math.max(0, items.length - visible.length);
  return `
    <div class="order-products-summary" title="${escapeAttr(orderItemsLabel(itemsValue))}">
      ${visible.map(item => {
        const qty = orderItemQty(item);
        const name = item.nombre || item.title || item.name || "Producto";
        const option = item.detalle || item.option || item.opcion || "";
        const flavor = item.sabor || item.flavor || item.flavor_label || "";
        const detail = [option, flavor ? `Sabor: ${flavor}` : ""].filter(Boolean).join(" · ");
        return `<span><strong>${qty}x ${escapeHtml(name)}</strong>${detail ? `<small>${escapeHtml(detail)}</small>` : ""}</span>`;
      }).join("")}
      ${remaining ? `<em>+${remaining} más</em>` : ""}
    </div>
  `;
}

function orderItemQty(item = {}) {
  return moneyToNumber(item.qty || item.cantidad || 1) || 1;
}

function orderItemLineTotal(item = {}) {
  const qty = orderItemQty(item);
  const base = moneyToNumber(item.precio || item.price) * qty;
  const extras = Array.isArray(item.extras)
    ? item.extras.reduce((sum, extra) => sum + moneyToNumber(extra.precio || extra.price) * (moneyToNumber(extra.qty || extra.cantidad || 1) || 1), 0)
    : 0;
  return base + extras;
}

function orderAdminTotals(order = {}, items = parseOrderItems(order.items)) {
  const productos = moneyToNumber(order.subtotal) || items.reduce((sum, item) => sum + orderItemLineTotal(item), 0);
  const empaque = moneyToNumber(order.empaque) || extractMoneyFromNotes(order.notas || order.note || "", /empaque\s*:\s*([\d.,]+)/i);
  const domicilio = moneyToNumber(order.domicilio);
  const total = moneyToNumber(order.total) || productos + empaque + domicilio;
  const barrio = order.barrio || extractTextFromNotes(order.notas || order.note || "", /barrio\/zona\s*:\s*([^\n|]+)/i);
  return { productos, empaque, domicilio, total, barrio };
}

function orderDeliveryTotalLabel(order = {}, totals = orderAdminTotals(order)) {
  if (totals.domicilio) return formatMoney(totals.domicilio);
  return normalize(order.metodo || "") === "domicilio" ? "Por confirmar" : "$ 0";
}

function cleanOrderNotes(notes = "") {
  return String(notes || "")
    .split(/\n|\|/)
    .map(line => line.trim())
    .filter(line => line && !/^empaque\s*:/i.test(line) && !/^barrio\/zona\s*:/i.test(line))
    .join("\n");
}

function applyBulkOrderStatus() {
  const orderIds = [...state.selectedOrderIds].filter(orderId => state.orders.some(order => order.order_id === orderId));
  const estado = el.bulkOrderStatus?.value;
  if (!orderIds.length || !estado) return;

  state.orders.forEach(order => {
    if (state.selectedOrderIds.has(order.order_id)) order.estado = estado;
  });
  const data = {
    order_ids: orderIds,
    estado,
    operation_key: `bulk-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  };
  queueBulkOrderWrite(data);
  state.selectedOrderIds.clear();
  el.bulkOrderStatus.value = "";
  cacheAdminData();
  renderOrders();
  renderKpis();
  renderIncome();
  toast(`${orderIds.length} órdenes actualizadas. Guardando en segundo plano...`);
  sendBulkOrderWrite(data);
}

function queueBulkOrderWrite(data) {
  const changingIds = new Set(data.order_ids || []);
  const rebuilt = [];
  state.pendingWrites.forEach(pending => {
    if (pending.action === "updateOrderStatus" && changingIds.has(pending.data?.order_id)) return;
    if (pending.action !== "bulkUpdateOrderStatus") {
      rebuilt.push(pending);
      return;
    }
    const remainingIds = (pending.data?.order_ids || []).filter(orderId => !changingIds.has(orderId));
    if (!remainingIds.length) return;
    const nextData = { ...pending.data, order_ids: remainingIds, operation_key: `${pending.data.operation_key}-remaining` };
    rebuilt.push({ ...pending, data: nextData, id: pendingIdFor("bulkUpdateOrderStatus", nextData) });
  });
  state.pendingWrites = rebuilt;
  queuePendingWrite("bulkUpdateOrderStatus", data);
}

function sendBulkOrderWrite(data) {
  if (!state.token) return;
  postAdmin("bulkUpdateOrderStatus", data)
    .then(() => {
      state.pendingWrites = state.pendingWrites.filter(item => !(item.action === "bulkUpdateOrderStatus" && item.id === pendingIdFor("bulkUpdateOrderStatus", data)));
      savePendingWrites();
      schedulePendingRetry.attempt = 0;
    })
    .catch(error => {
      console.warn("Cambio masivo guardado para reintento", error);
      schedulePendingRetry();
    });
}

function orderCleanupScope() {
  const value = el.orderCleanupScope?.value || "current";
  return value === "current" ? (state.orderFilter || "todas") : value;
}

function orderCleanupStatuses(scope) {
  const normalized = normalize(scope || "todas");
  if (["all", "todas", "todos"].includes(normalized)) return [];
  if (normalized === "pendientes") return ["nuevo", "pendiente", "confirmado", "en cocina", "preparando"];
  if (normalized === "nuevo") return ["nuevo", "pendiente"];
  if (normalized === "en cocina") return ["en cocina", "cocina", "preparando"];
  if (normalized === "despachado") return ["despachado"];
  if (normalized === "entregado") return ["entregado"];
  if (normalized === "cancelado") return ["cancelado", "anulado"];
  return [normalized];
}

function orderMatchesCleanupScope(order, scope) {
  const normalizedScope = normalize(scope || "todas");
  if (["all", "todas", "todos"].includes(normalizedScope)) return true;
  return orderCleanupStatuses(normalizedScope).includes(normalize(order.estado || "nuevo"));
}

function ordersForCleanup(scope) {
  return state.orders.filter(order => orderMatchesCleanupScope(order, scope));
}

function cleanupScopeLabel(scope) {
  const labels = {
    all: "todas las ordenes",
    todas: "todas las ordenes",
    pendientes: "ordenes pendientes",
    nuevo: "ordenes nuevas",
    confirmado: "ordenes confirmadas",
    "en cocina": "ordenes en cocina",
    despachado: "ordenes despachadas",
    entregado: "ordenes entregadas",
    cancelado: "ordenes canceladas"
  };
  return labels[normalize(scope || "")] || `ordenes en estado ${scope}`;
}

async function deleteOrdersRecords() {
  const scope = orderCleanupScope();
  const orders = ordersForCleanup(scope);
  const orderIds = orders.map(order => order.order_id).filter(Boolean);
  if (!orderIds.length && !["all", "todas", "todos"].includes(normalize(scope))) {
    toast("No hay ordenes para eliminar con ese filtro.");
    return;
  }

  const isAll = ["all", "todas", "todos"].includes(normalize(scope));
  const confirmed = await smartConfirm({
    title: "Eliminar registros de ordenes",
    message: isAll
      ? "¿En realidad desea borrar definitivamente todas las ordenes guardadas en Supabase? Esta accion no se puede deshacer."
      : `¿En realidad desea borrar definitivamente ${orderIds.length} ${cleanupScopeLabel(scope)}? Esta accion no se puede deshacer.`,
    confirmText: "Eliminar registros",
    danger: true
  });
  if (!confirmed) return;

  setCleanupBusy(el.deleteOrdersRecords, true, "Eliminando...");
  try {
    const localIds = new Set(orderIds);
    if (isAll) state.orders = [];
    else state.orders = state.orders.filter(order => !localIds.has(order.order_id));
    state.selectedOrderIds.clear();
    removePendingDeletedRecords(localIds, new Set());
    savePendingWrites();
    cacheAdminData();
    renderKpis();
    renderIncome();
    renderOrders();

    await postAdmin("deleteOrdersRecords", {
      scope,
      statuses: orderCleanupStatuses(scope),
      order_ids: isAll ? [] : orderIds
    });
    await loadAdminData({ silent: true, fresh: true });
    toast(isAll ? "Todas las ordenes fueron eliminadas." : `${orderIds.length} ordenes eliminadas.`);
  } catch (error) {
    console.warn("No se pudieron eliminar las ordenes", error);
    toast(`No se pudieron eliminar las ordenes: ${error.message}`);
    loadAdminData({ silent: true, fresh: true });
  } finally {
    setCleanupBusy(el.deleteOrdersRecords, false, "Borrar");
  }
}

function incomeCleanupSelection() {
  const scope = el.incomeCleanupScope?.value || "current";
  const entries = scope === "current" ? filteredIncomeEntries() : incomeEntries();
  const orderIds = new Set();
  const paymentIds = new Set();

  if (scope === "orders" || scope === "all") {
    state.orders.forEach(order => {
      if (order.order_id) orderIds.add(order.order_id);
    });
  }
  if (scope === "payments" || scope === "all") {
    state.payments.forEach(payment => {
      if (payment.payment_id) paymentIds.add(payment.payment_id);
    });
  }
  if (scope === "current") {
    entries.forEach(entry => {
      if (entry.source === "ordenes" && entry.id) orderIds.add(entry.id);
      if (entry.source === "mesas" && entry.id) paymentIds.add(entry.id);
    });
  }

  return {
    scope,
    orderIds: [...orderIds],
    paymentIds: [...paymentIds],
    entriesCount: entries.length
  };
}

async function deleteIncomeRecords() {
  const selection = incomeCleanupSelection();
  const orderCount = selection.orderIds.length;
  const paymentCount = selection.paymentIds.length;
  const deletesAll = selection.scope === "all";
  if (!orderCount && !paymentCount && !deletesAll) {
    toast("No hay ingresos para eliminar con ese filtro.");
    return;
  }

  const confirmed = await smartConfirm({
    title: "Reiniciar ingresos",
    message: deletesAll
      ? "¿En realidad desea borrar todas las ordenes y pagos de mesa para dejar ingresos en cero? Esta accion no se puede deshacer."
      : `¿En realidad desea borrar ${orderCount} ordenes y ${paymentCount} pagos de mesa? Esta accion deja esos ingresos en cero y no se puede deshacer.`,
    confirmText: "Reiniciar registros",
    danger: true
  });
  if (!confirmed) return;

  setCleanupBusy(el.deleteIncomeRecords, true, "Reiniciando...");
  try {
    const orderIds = new Set(selection.orderIds);
    const paymentIds = new Set(selection.paymentIds);
    if (deletesAll || selection.scope === "orders") state.orders = [];
    else state.orders = state.orders.filter(order => !orderIds.has(order.order_id));
    if (deletesAll || selection.scope === "payments") state.payments = [];
    else state.payments = state.payments.filter(payment => !paymentIds.has(payment.payment_id));
    state.selectedOrderIds.clear();
    removePendingDeletedRecords(orderIds, paymentIds);
    savePendingWrites();
    cacheAdminData();
    renderKpis();
    renderIncome();
    renderOrders();

    await postAdmin("deleteIncomeRecords", {
      scope: selection.scope,
      order_ids: deletesAll || selection.scope === "orders" ? [] : selection.orderIds,
      payment_ids: deletesAll || selection.scope === "payments" ? [] : selection.paymentIds
    });
    await loadAdminData({ silent: true, fresh: true });
    toast("Registros de ingresos reiniciados.");
  } catch (error) {
    console.warn("No se pudieron reiniciar los ingresos", error);
    toast(`No se pudieron reiniciar los ingresos: ${error.message}`);
    loadAdminData({ silent: true, fresh: true });
  } finally {
    setCleanupBusy(el.deleteIncomeRecords, false, "Borrar");
  }
}

function removePendingDeletedRecords(orderIds = new Set(), paymentIds = new Set()) {
  state.pendingWrites = state.pendingWrites.flatMap(pending => {
    const data = pending.data || {};
    if (pending.action === "updateOrderStatus" && orderIds.has(data.order_id)) return [];
    if (pending.action === "bulkUpdateOrderStatus") {
      const remaining = (data.order_ids || []).filter(orderId => !orderIds.has(orderId));
      if (!remaining.length) return [];
      return [{ ...pending, data: { ...data, order_ids: remaining } }];
    }
    if (pending.action === "checkoutTable" && paymentIds.has(data.payment?.payment_id)) return [];
    return [pending];
  });
}

function setCleanupBusy(button, busy, label) {
  if (!button) return;
  button.disabled = busy;
  button.textContent = label;
}

function renderProducts() {
  renderProductCategoryStrip();
  const term = normalize(state.productSearch);
  const products = state.productCategoryFilter === "todas"
    ? state.products
    : state.products.filter(product => product.categoria_id === state.productCategoryFilter);
  const filteredProducts = products.filter(product => {
    if (state.productStatusFilter === "activos" && !product.activo) return false;
    if (state.productStatusFilter === "inactivos" && product.activo) return false;
    if (!term) return true;
    return normalize(`${product.nombre} ${product.descripcion} ${product.categoria_id} ${labelFromId(product.categoria_id)} ${product.precio} ${(product.sabores || []).join(" ")}`).includes(term);
  });

  el.productsTable.innerHTML = filteredProducts.length ? `
    <div class="crud-table products-table">
      <div class="crud-head">
        <span>Foto</span><span>Producto</span><span>Categoria</span><span>Precio</span><span>Estado</span><span>Acciones</span>
      </div>
      ${filteredProducts.map(product => `
        <article class="crud-row product-table-row ${product.activo ? "" : "inactive"}">
          <img class="admin-product-thumb" src="${escapeAttr(productVisualImage(product))}" alt="" onerror="this.onerror=null;this.src='./images/pizza1.png';">
          <div><h3>${escapeHtml(product.nombre)}</h3><p>${escapeHtml(product.descripcion || "Producto de la carta")} | orden ${Number(product.orden || 0)}${product.sabores?.length ? ` | sabores: ${escapeHtml(product.sabores.join(", "))}` : ""}</p></div>
          <span>${escapeHtml(labelFromId(product.categoria_id))}</span>
          <strong>${formatMoney(product.precio)}</strong>
          <span class="status-pill">${product.activo ? "Activo" : "Inactivo"}</span>
          <div class="row-actions">
            <button class="secondary-btn" type="button" data-edit-product="${escapeAttr(product.producto_id)}">Editar</button>
            <button class="danger-btn" type="button" data-delete-product="${escapeAttr(product.producto_id)}">Eliminar</button>
          </div>
        </article>
      `).join("")}
    </div>
  ` : `<div class="empty-state">No hay productos en esta categoría.</div>`;

  el.productsTable.querySelectorAll("[data-edit-product]").forEach(button => {
    button.addEventListener("click", () => fillProductForm(button.dataset.editProduct));
  });
  el.productsTable.querySelectorAll("[data-delete-product]").forEach(button => {
    button.addEventListener("click", () => deleteProduct(button.dataset.deleteProduct));
  });
}

function renderProductCategoryStrip() {
  const counts = state.products.reduce((acc, product) => {
    const key = product.categoria_id || "general";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const categories = [
    { id: "todas", label: "Todas", count: state.products.length },
    ...Object.keys(counts)
      .sort(categorySort)
      .map(id => ({ id, label: labelFromId(id), count: counts[id] }))
  ];
  if (!categories.some(category => category.id === state.productCategoryFilter)) {
    state.productCategoryFilter = "todas";
  }
  el.productCategoryStrip.innerHTML = categories.map(category => `
    <button class="category-chip ${category.id === state.productCategoryFilter ? "active" : ""}" type="button" data-product-category="${escapeAttr(category.id)}">
      ${escapeHtml(category.label)} <span>${category.count}</span>
    </button>
  `).join("");
  el.productCategoryStrip.querySelectorAll("[data-product-category]").forEach(button => {
    button.addEventListener("click", () => {
      state.productCategoryFilter = button.dataset.productCategory;
      renderProducts();
    });
  });
}

function categorySort(a, b) {
  return categoryOrderIndex(a) - categoryOrderIndex(b) || labelFromId(a).localeCompare(labelFromId(b), "es");
}

function categoryOrderIndex(id) {
  const index = MENU_CATEGORY_ORDER.indexOf(String(id || ""));
  return index === -1 ? MENU_CATEGORY_ORDER.length : index;
}

function renderExtras() {
  const term = normalize(state.extraSearch);
  const extras = state.extras.filter(extra => {
    if (state.extraStatusFilter === "activos" && !extra.activo) return false;
    if (state.extraStatusFilter === "inactivos" && extra.activo) return false;
    if (!term) return true;
    return normalize(`${extra.nombre} ${extra.precio} ${extra.activo ? "activo" : "inactivo"}`).includes(term);
  });
  el.extrasTable.innerHTML = extras.length ? `
    <div class="crud-table extras-table">
      <div class="crud-head">
        <span>Extra</span><span>Precio</span><span>Estado</span><span>Acciones</span>
      </div>
      ${extras.map(extra => `
        <article class="crud-row ${extra.activo ? "" : "inactive"}">
          <div><h3>${escapeHtml(extra.nombre)}</h3><p>Disponible para pedidos y mesas</p></div>
          <strong>${formatMoney(extra.precio)}</strong>
          <span class="status-pill">${extra.activo ? "Activo" : "Inactivo"}</span>
          <div class="row-actions">
            <button class="secondary-btn" type="button" data-edit-extra="${escapeAttr(extra.extra_id)}">Editar</button>
            <button class="danger-btn" type="button" data-delete-extra="${escapeAttr(extra.extra_id)}">Eliminar</button>
          </div>
        </article>
      `).join("")}
    </div>
  ` : `<div class="empty-state">No hay extras cargados.</div>`;

  el.extrasTable.querySelectorAll("[data-edit-extra]").forEach(button => {
    button.addEventListener("click", () => fillExtraForm(button.dataset.editExtra));
  });
  el.extrasTable.querySelectorAll("[data-delete-extra]").forEach(button => {
    button.addEventListener("click", () => deleteExtra(button.dataset.deleteExtra));
  });
}

function renderTables() {
  const term = normalize(state.tableSearch);
  const tables = state.tables
    .filter(table => {
      const total = tableTotal(table);
      if (state.tableStatusFilter === "ocupadas" && total <= 0) return false;
      if (state.tableStatusFilter === "libres" && total > 0) return false;
      if (!term) return true;
      const itemsText = tableItems(table).map(item => `${item.nombre} ${item.qty} ${item.precio}`).join(" ");
      return normalize(`${table.nombre} ${table.cajero} ${formatMoney(total)} ${total} ${itemsText} ${total > 0 ? "ocupada" : "libre"}`).includes(term);
    })
    .sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), "es", { numeric: true }));
  el.tablesGrid.innerHTML = tables.length ? tables.map(table => {
    const total = tableTotal(table);
    const isSelected = table.table_id === state.selectedTableId;
    const hasAccount = total > 0;
    return `
      <article class="table-card ${isSelected ? "active" : ""} ${hasAccount ? "has-account" : "is-free"}" title="${hasAccount ? "Mesa ocupada" : "Mesa libre"}">
        <button class="table-card-main" type="button" data-table="${escapeAttr(table.table_id)}">
          <span>${escapeHtml(table.nombre)}</span>
          <strong>${formatMoney(total)}</strong>
          <small>${hasAccount ? `${tableItems(table).length} consumos | ${escapeHtml(table.cajero || cashierName())}` : "Mesa libre"}</small>
        </button>
        <div class="table-card-actions">
          <button class="table-door-btn" type="button" data-open-table="${escapeAttr(table.table_id)}" aria-label="Abrir productos para ${escapeAttr(table.nombre)}" title="${hasAccount ? "Mesa ocupada. Abrir productos" : "Mesa libre. Abrir productos"}"><span aria-hidden="true"></span></button>
          <button type="button" data-edit-table="${escapeAttr(table.table_id)}">Editar</button>
          <button type="button" data-delete-table="${escapeAttr(table.table_id)}">Eliminar</button>
        </div>
      </article>
    `;
  }).join("") : `<div class="empty-state">Crea la primera mesa para empezar a tomar pedidos internos.</div>`;

  el.tablesGrid.querySelectorAll("[data-table]").forEach(button => {
    button.addEventListener("click", () => selectTable(button.dataset.table));
    button.addEventListener("dblclick", () => openTableDispatch(button.dataset.table));
  });
  el.tablesGrid.querySelectorAll("[data-open-table]").forEach(button => {
    button.addEventListener("click", () => openTableDispatch(button.dataset.openTable));
  });
  el.tablesGrid.querySelectorAll("[data-edit-table]").forEach(button => {
    button.addEventListener("click", () => editTableName(button.dataset.editTable));
  });
  el.tablesGrid.querySelectorAll("[data-delete-table]").forEach(button => {
    button.addEventListener("click", () => deleteTable(button.dataset.deleteTable));
  });
}

function renderTableTicket() {
  const table = selectedTable();
  if (!table) {
    el.selectedTableTitle.textContent = "Selecciona una mesa";
    el.tableTicket.innerHTML = `<div class="empty-state">Elige o crea una mesa para agregar consumo.</div>`;
    el.openCheckout.disabled = true;
    el.printReceipt.disabled = true;
    return;
  }

  const items = tableItems(table);
  const total = tableTotal(table);
  el.selectedTableTitle.textContent = table.nombre;
  el.openCheckout.disabled = total <= 0;
  el.printReceipt.disabled = total <= 0;
  el.tableTicket.innerHTML = `
    <div class="ticket-meta">
      <span>Atiende: ${escapeHtml(table.cajero || cashierName())}</span>
      <span>Inicio: ${escapeHtml(formatDate(table.fecha_apertura || table.fecha))}</span>
    </div>
    ${items.length ? items.map(item => `
      <div class="ticket-row">
        <div>
          <strong>${escapeHtml(item.nombre)}</strong>
          <small>${item.qty} x ${formatMoney(item.precio)}</small>
        </div>
        <div class="ticket-actions">
          <button class="icon-btn" type="button" data-dec-item="${escapeAttr(item.line_id)}">-</button>
          <button class="icon-btn" type="button" data-inc-item="${escapeAttr(item.line_id)}">+</button>
          <button class="icon-btn danger" type="button" data-remove-item="${escapeAttr(item.line_id)}">x</button>
        </div>
        <strong>${formatMoney(lineTotal(item))}</strong>
      </div>
    `).join("") : `<div class="empty-state">Esta mesa está libre. Agrega productos desde el despacho.</div>`}
    <div class="ticket-total"><span>Total mesa</span><strong>${formatMoney(total)}</strong></div>
  `;

  el.tableTicket.querySelectorAll("[data-dec-item]").forEach(button => {
    button.addEventListener("click", () => adjustTableItem(button.dataset.decItem, -1));
  });
  el.tableTicket.querySelectorAll("[data-inc-item]").forEach(button => {
    button.addEventListener("click", () => adjustTableItem(button.dataset.incItem, 1));
  });
  el.tableTicket.querySelectorAll("[data-remove-item]").forEach(button => {
    button.addEventListener("click", () => removeTableItem(button.dataset.removeItem));
  });
}

function renderDispatchProducts() {
  const term = normalize(state.dispatchSearch);
  const products = state.products
    .filter(product => product.activo)
    .filter(product => !term || normalize(`${product.nombre} ${product.descripcion} ${product.categoria_id}`).includes(term))
    .slice(0, 80);

  const extras = state.extras
    .filter(extra => extra.activo)
    .filter(extra => !term || normalize(extra.nombre).includes(term))
    .slice(0, 20);

  el.dispatchProducts.innerHTML = [
    ...products.map(product => dispatchProductTemplate(product, "product")),
    ...extras.map(extra => dispatchProductTemplate({
      producto_id: extra.extra_id,
      nombre: extra.nombre,
      precio: extra.precio,
      descripcion: "Extra para la mesa",
      orden: extra.orden,
      imagen: "pizza8.png"
    }, "extra"))
  ].join("") || `<div class="empty-state">No encontramos productos activos con esa búsqueda.</div>`;

  el.dispatchProducts.querySelectorAll("[data-add-menu-item]").forEach(button => {
    button.addEventListener("click", () => addMenuItemToTable(button.dataset.addMenuItem, button.dataset.itemType));
  });
}

function dispatchProductTemplate(product, type) {
  return `
    <article class="dispatch-card">
      <img src="${escapeAttr(productVisualImage(product))}" alt="" onerror="this.onerror=null;this.src='./images/pizza1.png';">
      <div>
        <h3>${escapeHtml(product.nombre)}</h3>
        <p>${escapeHtml(product.descripcion || "Producto listo para mesa")}</p>
      </div>
      <strong>${formatMoney(product.precio)}</strong>
      <button class="primary-btn" type="button" data-add-menu-item="${escapeAttr(product.producto_id)}" data-item-type="${escapeAttr(type)}">Agregar</button>
    </article>
  `;
}

function renderInventory() {
  renderInventoryKpis();
  el.inventoryTable.innerHTML = state.inventory.length ? `
    <div class="crud-table inventory-table">
      <div class="crud-head"><span>Insumo</span><span>Cantidad</span><span>Mínimo</span><span>Costo</span><span>Producción</span><span>Estado</span><span>Acciones</span></div>
      ${state.inventory.map(item => `
        <article class="crud-row ${item.activo ? "" : "inactive"} ${moneyToNumber(item.cantidad) <= moneyToNumber(item.minimo) ? "low-stock" : ""}">
          <div><h3>${escapeHtml(item.nombre)}</h3><p>${escapeHtml(item.categoria || "Inventario general")}</p></div>
          <strong>${escapeHtml(item.cantidad)} ${escapeHtml(item.unidad || "")}</strong>
          <span>${escapeHtml(item.minimo || 0)} ${escapeHtml(item.unidad || "")}</span>
          <strong>${formatMoney(item.costo)}</strong>
          <div class="stock-controls">
            <button class="icon-btn danger" type="button" data-stock-out="${escapeAttr(item.inventory_id)}">-</button>
            <button class="icon-btn" type="button" data-stock-in="${escapeAttr(item.inventory_id)}">+</button>
          </div>
          <span class="status-pill">${moneyToNumber(item.cantidad) <= moneyToNumber(item.minimo) ? "Revisar" : item.activo ? "Activo" : "Archivado"}</span>
          <div class="row-actions">
            <button class="secondary-btn" type="button" data-edit-inventory="${escapeAttr(item.inventory_id)}">Editar</button>
            <button class="danger-btn" type="button" data-delete-inventory="${escapeAttr(item.inventory_id)}">Eliminar</button>
          </div>
        </article>
      `).join("")}
    </div>
  ` : `<div class="empty-state">Agrega insumos para controlar compras y alertas de stock.</div>`;

  el.inventoryTable.querySelectorAll("[data-edit-inventory]").forEach(button => {
    button.addEventListener("click", () => fillInventoryForm(button.dataset.editInventory));
  });
  el.inventoryTable.querySelectorAll("[data-delete-inventory]").forEach(button => {
    button.addEventListener("click", () => deleteInventoryItem(button.dataset.deleteInventory));
  });
  el.inventoryTable.querySelectorAll("[data-stock-out]").forEach(button => {
    button.addEventListener("click", () => moveInventoryStock(button.dataset.stockOut, -1));
  });
  el.inventoryTable.querySelectorAll("[data-stock-in]").forEach(button => {
    button.addEventListener("click", () => moveInventoryStock(button.dataset.stockIn, 1));
  });
}

function renderInventoryKpis() {
  if (!el.inventoryKpis) return;
  const active = state.inventory.filter(item => item.activo);
  const low = active.filter(item => moneyToNumber(item.cantidad) <= moneyToNumber(item.minimo));
  const outMovements = state.inventoryMovements.filter(move => move.tipo === "retiro");
  const recent = outMovements[0];
  el.inventoryKpis.innerHTML = `
    <button class="inventory-kpi" type="button" data-inventory-kpi="active"><span>Activos</span><strong>${active.length}</strong><small>insumos en control</small></button>
    <button class="inventory-kpi" type="button" data-inventory-kpi="low"><span>Alertas</span><strong>${low.length}</strong><small>por debajo del mínimo</small></button>
    <button class="inventory-kpi" type="button" data-inventory-kpi="moves"><span>Retiros</span><strong>${outMovements.length}</strong><small>${recent ? formatDateTime(recent.fecha) : "sin movimientos"}</small></button>
  `;
  el.inventoryKpis.querySelectorAll("[data-inventory-kpi]").forEach(button => {
    button.addEventListener("click", () => showInventoryKpiDetail(button.dataset.inventoryKpi));
  });
}

function renderInventoryMovements() {
  if (!el.inventoryMovements) return;
  const term = normalize(state.inventoryMovementSearch);
  const moves = state.inventoryMovements
    .filter(move => !term || normalize(`${move.nombre} ${move.usuario} ${move.tipo} ${move.cantidad}`).includes(term))
    .slice(0, 40);
  el.inventoryMovements.innerHTML = moves.length ? moves.map(move => `
    <article class="movement-row">
      <div>
        <h3>${escapeHtml(move.nombre)}</h3>
        <p>${escapeHtml(move.tipo === "retiro" ? "Salida a producción" : "Entrada o ajuste")} | ${escapeHtml(move.cantidad)} ${escapeHtml(move.unidad || "")}</p>
        <small>${escapeHtml(formatDateTime(move.fecha))} | ${escapeHtml(move.usuario || "Usuario")}</small>
      </div>
      <strong>${move.tipo === "retiro" ? "-" : "+"}${escapeHtml(move.cantidad)}</strong>
    </article>
  `).join("") : `<div class="empty-state">No hay movimientos recientes.</div>`;
}

async function moveInventoryStock(itemId, direction) {
  const item = state.inventory.find(row => row.inventory_id === itemId);
  if (!item) return;
  const verb = direction < 0 ? "retirar para producción" : "agregar al inventario";
  const raw = await smartPrompt({
    title: direction < 0 ? "Retiro a producción" : "Entrada de inventario",
    message: `Cantidad a ${verb} de ${item.nombre}.`,
    label: "Cantidad",
    value: "1",
    confirmText: direction < 0 ? "Revisar retiro" : "Revisar entrada",
    inputMode: "decimal"
  });
  if (!raw) return;
  const amount = moneyToNumber(raw);
  if (!amount) {
    toast("Escribe una cantidad valida.");
    return;
  }
  if (direction < 0 && moneyToNumber(item.cantidad) < amount) {
    toast("No hay suficiente cantidad para retirar.");
    return;
  }
  const confirmed = await smartConfirm({
    title: "Confirmar movimiento",
    message: `${amount} ${item.unidad || ""} de ${item.nombre} se va a ${verb}.`,
    confirmText: "Confirmar"
  });
  if (!confirmed) return;
  item.cantidad = Math.max(0, moneyToNumber(item.cantidad) + amount * direction);
  item.actualizado = new Date().toISOString();
  recordInventoryMovement(item, amount, direction < 0 ? "retiro" : "entrada");
  persistAndRender("upsertInventory", { item }, direction < 0 ? "Retiro registrado." : "Entrada registrada.");
}

function recordInventoryMovement(item, amount, tipo) {
  const movement = {
    movement_id: makeId("mov"),
    inventory_id: item.inventory_id,
    nombre: item.nombre,
    cantidad: amount,
    unidad: item.unidad || "",
    tipo,
    fecha: new Date().toISOString(),
    usuario: cashierName()
  };
  state.inventoryMovements = [movement, ...state.inventoryMovements].slice(0, 200);
  localStorage.setItem("chanchos_inventory_movements_v1", JSON.stringify(state.inventoryMovements));
  if (state.token) {
    postAdmin("recordInventoryMovement", { movement }).catch(error => {
      queuePendingWrite("recordInventoryMovement", { movement });
      console.warn("Movimiento pendiente en segundo plano", error);
    });
  } else {
    queuePendingWrite("recordInventoryMovement", { movement });
  }
}

function showInventoryKpiDetail(type) {
  const active = state.inventory.filter(item => item.activo).length;
  const low = state.inventory.filter(item => item.activo && moneyToNumber(item.cantidad) <= moneyToNumber(item.minimo)).length;
  const withdrawals = state.inventoryMovements.filter(move => move.tipo === "retiro").length;
  const messages = {
    active: `Tienes ${active} insumos activos para producción.`,
    low: `${low} insumos necesitan revisión por stock mínimo.`,
    moves: `Hay ${withdrawals} retiros registrados recientemente. Mira el panel de movimientos para fecha, hora y usuario.`
  };
  toast(messages[type] || "Detalle de inventario listo.");
}

function seedAssistantMessages() {
  ["ingresos", "mesas", "carta", "inventario"].forEach(section => {
    const box = document.getElementById(`assistant-${section}-messages`);
    if (!box || box.dataset.ready) return;
    box.dataset.ready = "true";
    box.innerHTML = `<div class="assistant-message">Hola, puedo ayudarte con ${assistantSectionLabel(section)} usando los datos visibles de esta sección.</div>`;
  });
}

function openSidebarAssistant(section = state.activeView) {
  const assistantSection = normalizeAssistantSection(section);
  el.sidebarChat.dataset.section = assistantSection;
  el.sidebarChatTitle.textContent = assistantName(assistantSection);
  el.sidebarChat.classList.remove("hidden");
  el.sidebarChat.setAttribute("aria-hidden", "false");
  if (!el.sidebarChatMessages.dataset.section || el.sidebarChatMessages.dataset.section !== assistantSection) {
    el.sidebarChatMessages.dataset.section = assistantSection;
    el.sidebarChatMessages.innerHTML = `<div class="assistant-message">Hola, soy ${assistantName(assistantSection)}. Estoy listo para ayudarte con ${assistantSectionLabel(assistantSection)}.</div>`;
  }
  window.setTimeout(() => el.sidebarChatForm.elements.question?.focus(), 80);
}

function closeSidebarAssistant() {
  el.sidebarChat.classList.add("hidden");
  el.sidebarChat.setAttribute("aria-hidden", "true");
}

function handleSidebarAssistantQuestion(event) {
  event.preventDefault();
  const section = el.sidebarChat.dataset.section || normalizeAssistantSection(state.activeView);
  const input = el.sidebarChatForm.elements.question;
  const question = String(input.value || "").trim();
  if (!question) return;
  el.sidebarChatMessages.insertAdjacentHTML("beforeend", `<div class="assistant-message user">${escapeHtml(question)}</div>`);
  el.sidebarChatMessages.insertAdjacentHTML("beforeend", `<div class="assistant-message">${escapeHtml(answerAssistant(section, question))}</div>`);
  input.value = "";
  el.sidebarChatMessages.scrollTop = el.sidebarChatMessages.scrollHeight;
}

function normalizeAssistantSection(section) {
  if (section === "resumen") return "ingresos";
  if (section === "extras") return "carta";
  if (["mesas", "ingresos", "carta", "inventario"].includes(section)) return section;
  return "ingresos";
}

function assistantName(section) {
  if (section === "ingresos") return "Asistente Ingresos";
  if (section === "mesas") return "Asistente Mesas";
  if (section === "carta") return "Asistente Carta";
  if (section === "inventario") return "Asistente Inventario";
  return "Asistente Oscar's Parrilla";
}

function handleAssistantQuestion(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const section = form.dataset.assistantForm;
  const input = form.elements.question;
  const question = String(input.value || "").trim();
  if (!question) return;
  const box = document.getElementById(`assistant-${section}-messages`);
  if (!box) return;
  box.insertAdjacentHTML("beforeend", `<div class="assistant-message user">${escapeHtml(question)}</div>`);
  box.insertAdjacentHTML("beforeend", `<div class="assistant-message">${escapeHtml(answerAssistant(section, question))}</div>`);
  input.value = "";
  box.scrollTop = box.scrollHeight;
}

function answerAssistant(section, question) {
  const q = normalize(question);
  if (section === "ingresos") {
    const entries = filteredIncomeEntries();
    const total = entries.reduce((sum, entry) => sum + moneyToNumber(entry.total), 0);
    const top = entries[0];
    if (q.includes("mesa")) return `En el filtro actual hay ${entries.filter(entry => entry.source === "mesas").length} ingresos de mesas. Total visible: ${formatMoney(total)}.`;
    if (q.includes("orden")) return `En el filtro actual hay ${entries.filter(entry => entry.source === "ordenes").length} ingresos por órdenes.`;
    return top ? `Veo ${entries.length} movimientos por ${formatMoney(total)}. El más reciente es ${top.title}, registrado ${formatDateTime(top.fecha)}.` : "No hay ingresos visibles con este filtro.";
  }
  if (section === "mesas") {
    const open = state.tables.filter(table => tableTotal(table) > 0);
    const table = selectedTable();
    if (table && q.includes("esta")) return `${table.nombre} tiene ${tableItems(table).length} lineas y suma ${formatMoney(tableTotal(table))}.`;
    return `${open.length} mesas tienen cuenta activa. La suma abierta es ${formatMoney(open.reduce((sum, table) => sum + tableTotal(table), 0))}.`;
  }
  if (section === "carta") {
    const active = state.products.filter(product => product.activo);
    const inactive = state.products.length - active.length;
    return `La carta tiene ${state.products.length} productos: ${active.length} activos y ${inactive} ocultos. Puedes filtrar por categoría y editar uno; al tocar editar, el formulario sube automáticamente.`;
  }
  if (section === "inventario") {
    const low = state.inventory.filter(item => item.activo && moneyToNumber(item.cantidad) <= moneyToNumber(item.minimo));
    const last = state.inventoryMovements[0];
    return last ? `Hay ${low.length} alertas de stock. El último movimiento fue ${last.tipo} de ${last.cantidad} ${last.unidad} en ${last.nombre}, por ${last.usuario}, ${formatDateTime(last.fecha)}.` : `Hay ${low.length} alertas de stock y todavía no hay retiros recientes registrados.`;
  }
  return "Puedo ayudarte revisando los datos actuales de esta sección.";
}

function assistantSectionLabel(section) {
  if (section === "ingresos") return "los ingresos";
  if (section === "mesas") return "las mesas";
  if (section === "carta") return "la carta";
  if (section === "inventario") return "el inventario";
  return "esta sección";
}

function renderCashiers() {
  const term = normalize(state.cashierSearch);
  const cashiers = state.cashiers.filter(cashier => {
    const role = normalize(cashier.rol);
    if (state.cashierStatusFilter === "activos" && !cashier.activo) return false;
    if (state.cashierStatusFilter === "inactivos" && cashier.activo) return false;
    if (state.cashierStatusFilter === "jefes" && !["jefe", "admin", "administrador"].includes(role)) return false;
    if (state.cashierStatusFilter === "cajeros" && role !== "cajero") return false;
    if (!term) return true;
    return normalize(`${cashier.nombre} ${cashier.correo} ${cashier.rol} ${cashier.activo ? "activo" : "inactivo"} ${formatDate(cashier.ultimo_acceso)}`).includes(term);
  });
  el.cashiersTable.innerHTML = cashiers.length ? `
    <div class="crud-table cashiers-table">
      <div class="crud-head"><span>Usuario</span><span>Rol</span><span>Estado</span><span>Último acceso</span><span>Acciones</span></div>
      ${cashiers.map(cashier => `
        <article class="crud-row ${cashier.activo ? "" : "inactive"}">
          <div><h3>${escapeHtml(cashier.nombre)}</h3><p>${escapeHtml(cashier.correo || "Sin correo")}</p></div>
          <strong>${escapeHtml(labelFromId(cashier.rol || "cajero"))}</strong>
          <span class="status-pill">${cashier.activo ? "Activo" : "Inactivo"}</span>
          <span>${escapeHtml(formatDate(cashier.ultimo_acceso))}</span>
          <div class="row-actions">
            <button class="secondary-btn" type="button" data-edit-cashier="${escapeAttr(cashier.cashier_id)}">Editar</button>
            <button class="danger-btn" type="button" data-delete-cashier="${escapeAttr(cashier.cashier_id)}">Eliminar</button>
          </div>
        </article>
      `).join("")}
    </div>
  ` : `<div class="empty-state">Crea cajeros con correo y contraseña para controlar los accesos.</div>`;

  el.cashiersTable.querySelectorAll("[data-edit-cashier]").forEach(button => {
    button.addEventListener("click", () => fillCashierForm(button.dataset.editCashier));
  });
  el.cashiersTable.querySelectorAll("[data-delete-cashier]").forEach(button => {
    button.addEventListener("click", () => deleteCashier(button.dataset.deleteCashier));
  });
}

function createTable(event) {
  event.preventDefault();
  const data = getFormObject(el.tableForm);
  const table = {
    table_id: makeId("mesa"),
    nombre: data.table_name.trim(),
    estado: "abierta",
    fecha_apertura: new Date().toISOString(),
    cajero: cashierName(),
    items: []
  };
  state.tables = [table, ...state.tables];
  state.selectedTableId = table.table_id;
  localStorage.setItem("chanchos_selected_table", state.selectedTableId);
  el.tableForm.reset();
  renderTables();
  renderTableTicket();
  persistTableQuietly(table);
  toast("Mesa creada.");
}

function addQuickExpenseToTable(event) {
  event.preventDefault();
  const table = selectedTable();
  if (!table) {
    toast("Primero selecciona o crea una mesa.");
    return;
  }
  const data = getFormObject(el.quickExpenseForm);
  const amount = moneyToNumber(data.expense_amount);
  if (!amount) {
    toast("Escribe el valor del gasto.");
    return;
  }
  const items = tableItems(table);
  items.push({
    line_id: makeId("gasto"),
    source_id: "gasto-rapido",
    tipo: "gasto",
    nombre: data.expense_name.trim() || "Gasto de mesa",
    precio: amount,
    qty: 1
  });
  table.items = items;
  table.estado = "abierta";
  table.cajero = cashierName();
  el.quickExpenseForm.reset();
  persistAndRender("upsertTable", { table }, "Gasto agregado a la mesa.");
}

function selectTable(tableId) {
  state.selectedTableId = tableId;
  localStorage.setItem("chanchos_selected_table", tableId);
  renderTables();
  renderTableTicket();
}

function openTableDispatch(tableId) {
  state.selectedTableId = tableId;
  localStorage.setItem("chanchos_selected_table", tableId);
  renderTables();
  renderTableTicket();
  showTableDispatch();
}

function showTableDispatch() {
  document.querySelector(".admin-view-tables")?.classList.add("dispatch-mode");
  window.setTimeout(() => el.dispatchSearch?.focus(), 160);
}

function showTablesOverview() {
  document.querySelector(".admin-view-tables")?.classList.remove("dispatch-mode");
}

function bindSmartInternalScroll() {
  const selector = ".table-ticket, .products-table, .income-list, .inventory-movements, .assistant-messages, .dispatch-products, .crud-table";
  document.addEventListener("wheel", event => {
    const scroller = event.target.closest?.(selector);
    if (!scroller) return;
    const canScroll = scroller.scrollHeight > scroller.clientHeight || scroller.scrollWidth > scroller.clientWidth;
    if (!canScroll) return;
    const vertical = Math.abs(event.deltaY) >= Math.abs(event.deltaX);
    const delta = vertical ? event.deltaY : event.deltaX;
    const max = vertical ? scroller.scrollHeight - scroller.clientHeight : scroller.scrollWidth - scroller.clientWidth;
    const current = vertical ? scroller.scrollTop : scroller.scrollLeft;
    const atStart = current <= 0;
    const atEnd = current >= max - 1;
    const wantsPageScroll = (delta < 0 && atStart) || (delta > 0 && atEnd);

    if (!wantsPageScroll) {
      event.stopPropagation();
    }
  }, { passive: false });
}

function openPlanWhatsApp(planValue) {
  const [planName, planPrice] = String(planValue || "").split("|");
  const message = [
    "Hola, quiero implementar el sistema administrativo para mi negocio.",
    `Estoy interesado en el plan: ${planName || "Plan seleccionado"}.`,
    `Valor: ${planPrice || "por confirmar"}.`,
    "Me gustaría recibir información para iniciar la implementación y coordinar los siguientes pasos."
  ].join("\n");
  window.open(`https://wa.me/573246394689?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
}

async function editTableName(tableId) {
  const table = state.tables.find(item => item.table_id === tableId);
  if (!table) return;
  const nextName = await smartPrompt({
    title: "Editar mesa",
    message: "Escribe el nuevo nombre para identificar esta mesa.",
    label: "Nombre de la mesa",
    value: table.nombre,
    confirmText: "Actualizar"
  });
  if (!nextName || !nextName.trim() || nextName.trim() === table.nombre) return;
  table.nombre = nextName.trim();
  persistAndRender("upsertTable", { table }, "Mesa actualizada.");
}

async function deleteTable(tableId) {
  const table = state.tables.find(item => item.table_id === tableId);
  if (!table) return;
  if (tableTotal(table) > 0) {
    toast("Primero libera o paga la cuenta antes de eliminar la mesa.");
    return;
  }
  const confirmed = await smartConfirm({
    title: "Eliminar mesa",
    message: `${table.nombre} se eliminara manualmente del salon.`,
    confirmText: "Eliminar",
    danger: true
  });
  if (!confirmed) return;
  state.tables = state.tables.filter(item => item.table_id !== tableId);
  if (state.selectedTableId === tableId) {
    state.selectedTableId = state.tables[0]?.table_id || "";
    localStorage.setItem("chanchos_selected_table", state.selectedTableId);
  }
  persistAndRender("deleteTable", { table_id: tableId, hardDelete: true }, "Mesa eliminada.");
}

function addMenuItemToTable(itemId, type) {
  const table = selectedTable();
  if (!table) {
    toast("Primero selecciona o crea una mesa.");
    return;
  }
  const source = type === "extra"
    ? state.extras.find(extra => extra.extra_id === itemId)
    : state.products.find(product => product.producto_id === itemId);
  if (!source) return;

  const items = tableItems(table);
  const existing = items.find(item => item.source_id === itemId);
  if (existing) {
    existing.qty += 1;
  } else {
    items.push({
      line_id: makeId("line"),
      source_id: itemId,
      tipo: type,
      nombre: source.nombre,
      precio: moneyToNumber(source.precio),
      qty: 1
    });
  }
  table.items = items;
  table.estado = "abierta";
  table.cajero = cashierName();
  renderTables();
  renderTableTicket();
  persistTableQuietly(table);
}

function adjustTableItem(lineId, delta) {
  const table = selectedTable();
  if (!table) return;
  const items = tableItems(table);
  const item = items.find(row => row.line_id === lineId);
  if (!item) return;
  item.qty = Math.max(0, moneyToNumber(item.qty) + delta);
  table.items = items.filter(row => row.qty > 0);
  renderTables();
  renderTableTicket();
  persistTableQuietly(table);
}

function removeTableItem(lineId) {
  const table = selectedTable();
  if (!table) return;
  table.items = tableItems(table).filter(item => item.line_id !== lineId);
  renderTables();
  renderTableTicket();
  persistTableQuietly(table);
}

function openTableCheckout() {
  const table = selectedTable();
  if (!table || tableTotal(table) <= 0) {
    toast("La mesa no tiene consumo para pagar.");
    return;
  }
  el.checkoutForm.reset();
  el.checkoutTitle.textContent = `Pago de ${table.nombre}`;
  el.checkoutTotal.textContent = formatMoney(tableTotal(table));
  syncPaymentFields();
  openLayer(el.checkoutModal);
}

function closeCheckout() {
  closeLayer(el.checkoutModal);
}

async function checkoutTable(event) {
  event.preventDefault();
  const table = selectedTable();
  if (!table) return;
  const total = tableTotal(table);
  const data = getFormObject(el.checkoutForm);
  const primary = data.method_primary || "Efectivo";
  const isMixed = primary === "Pago mixto";
  const payment = {
    payment_id: makeId("pay"),
    table_id: table.table_id,
    table_name: table.nombre,
    origen: `Mesa ${table.nombre}`,
    fecha: new Date().toISOString(),
    cajero: cashierName(),
    metodo: isMixed ? `${data.method_one}: ${formatMoney(data.amount_one)} + ${data.method_two}: ${formatMoney(data.amount_two)}` : primary,
    metodo_principal: primary,
    metodo_uno: isMixed ? data.method_one : primary,
    valor_uno: isMixed ? moneyToNumber(data.amount_one) : total,
    metodo_dos: isMixed ? data.method_two : "",
    valor_dos: isMixed ? moneyToNumber(data.amount_two) : 0,
    total,
    estado: "pagado",
    notas: data.notes || "",
    items: JSON.stringify(tableItems(table))
  };

  if (isMixed && payment.valor_uno + payment.valor_dos !== total) {
    toast("El pago mixto debe completar exactamente el total.");
    syncPaymentFields();
    return;
  }

  const shouldPrintReceipt = await smartConfirm({
    title: "Pago confirmado",
    message: "¿Deseas imprimir el recibo de esta mesa ahora?",
    confirmText: "Imprimir recibo",
    cancelText: "Solo guardar"
  });
  if (shouldPrintReceipt) printReceiptForTable(table);
  state.payments = [payment, ...state.payments];
  table.estado = "pagada";
  table.fecha_cierre = new Date().toISOString();
  table.items = [];
  closeCheckout();
  showTablesOverview();
  renderAll();
  persistCheckoutQuietly(table, payment);
  toast("Mesa pagada y liberada.");
}

async function cancelSelectedTable() {
  const table = selectedTable();
  if (!table) return;
  const confirmed = await smartConfirm({
    title: "Cancelar mesa",
    message: "La cuenta se liberara sin registrar ingreso en caja.",
    confirmText: "Cancelar mesa",
    danger: true
  });
  if (!confirmed) return;
  table.estado = "cancelada";
  table.fecha_cierre = new Date().toISOString();
  table.items = [];
  closeCheckout();
  showTablesOverview();
  persistAndRender("cancelTable", { table }, "Mesa cancelada y liberada.");
}

function handlePaymentInput(event) {
  const changedName = event?.target?.name || "";
  syncPaymentFields(changedName);
}

function syncPaymentFields(changedName = "") {
  const table = selectedTable();
  const total = tableTotal(table);
  const form = el.checkoutForm;
  const primary = form.elements.method_primary.value;
  const mixed = primary === "Pago mixto";
  el.mixedPaymentFields.classList.toggle("active", mixed);
  if (!mixed) return;

  const oneInput = form.elements.amount_one;
  const twoInput = form.elements.amount_two;
  const one = moneyToNumber(oneInput.value);
  const two = moneyToNumber(twoInput.value);

  if (changedName === "amount_two") {
    oneInput.value = formatMoney(Math.max(0, total - two));
  } else {
    twoInput.value = formatMoney(Math.max(0, total - one));
  }
}

function printSelectedReceipt() {
  const table = selectedTable();
  if (!table || tableTotal(table) <= 0) {
    toast("La mesa no tiene consumo para imprimir.");
    return;
  }
  printReceiptForTable(table);
}

function printReceiptForTable(table) {
  const printWindow = window.open("", "_blank", "width=900,height=1100");
  if (!printWindow) {
    toast("Permite ventanas emergentes para imprimir el recibo.");
    return;
  }
  const rows = tableItems(table).map(item => `
    <tr><td>${escapeHtml(item.qty)} x ${escapeHtml(item.nombre)}</td><td>${formatMoney(lineTotal(item))}</td></tr>
  `).join("");
  printWindow.document.write(`
    <!doctype html><html><head><title>Recibo ${escapeHtml(table.nombre)}</title>
    <style>
      @page{size:A4;margin:6mm}
      *{box-sizing:border-box;text-transform:uppercase;letter-spacing:.4px}
      body{margin:0;padding:0;color:#000;background:#fff;font-family:"Courier New",monospace;font-size:18px;font-weight:800;line-height:1.28}
      .receipt{width:100%;min-height:100%;padding:6mm}
      h1{font-size:34px;margin:0 0 4px;text-align:center;font-weight:900}
      .brand{display:grid;place-items:center;gap:8px;text-align:center;border-bottom:3px dashed #000;padding-bottom:14px}
      .brand img{width:150px;height:150px;object-fit:contain}
      .meta{border-bottom:3px dashed #000;margin:16px 0;padding-bottom:14px}
      table{width:100%;border-collapse:collapse;margin:18px 0}
      td{border-bottom:2px dotted #888;padding:10px 0;vertical-align:top}
      td:last-child{text-align:right;white-space:nowrap}
      .total{border:3px dashed #000;margin-top:22px;padding:18px;font-size:38px;font-weight:900;text-align:center}
      .small{color:#000;font-size:16px;text-align:center;margin-top:22px}
    </style>
    </head><body>
    <div class="receipt">
    <div class="brand"><img src="./images/logo-factura.png" alt=""><h1>Oscar's Parrilla</h1><div class="small">${BUSINESS_RECEIPT_INFO.map(escapeHtml).join("<br>")}</div></div>
    <p class="meta"><strong>${escapeHtml(table.nombre)}</strong><br>Atiende: ${escapeHtml(table.cajero || cashierName())}<br>${escapeHtml(formatDateTime(new Date().toISOString()))}</p>
    <table>${rows}</table>
    <p class="total">Total<br>${formatMoney(tableTotal(table))}</p>
    <p class="small">Gracias por tu compra.<br>Conserve este recibo.</p>
    </div>
    <script>window.onload=function(){window.print();};<\/script>
    </body></html>
  `);
  printWindow.document.close();
}

function fillProductForm(productId) {
  const product = state.products.find(item => item.producto_id === productId);
  if (!product) return;
  openEditorForm(el.productForm, `Editando: ${product.nombre}`);
  setFormValues(el.productForm, {
    producto_id: product.producto_id,
    categoria_id: product.categoria_id,
    nombre: product.nombre,
    precio: formatMoney(product.precio),
    descripcion: product.descripcion,
    imagen: product.imagen,
    opciones: formatProductOptionsForInput(product.opciones),
    sabores: formatProductFlavorsForInput(product.sabores),
    orden: product.orden,
    activo: String(Boolean(product.activo))
  });
  updateSubmitLabels(el.productForm);
  updateFormChecks(el.productForm);
  setActiveView("carta");
  el.productForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function fillExtraForm(extraId) {
  const extra = state.extras.find(item => item.extra_id === extraId);
  if (!extra) return;
  openEditorForm(el.extraForm, `Editando: ${extra.nombre}`);
  setFormValues(el.extraForm, {
    extra_id: extra.extra_id,
    nombre: extra.nombre,
    precio: formatMoney(extra.precio),
    orden: extra.orden,
    activo: String(Boolean(extra.activo))
  });
  updateFormChecks(el.extraForm);
  setActiveView("extras");
}

function fillInventoryForm(itemId) {
  const item = state.inventory.find(row => row.inventory_id === itemId);
  if (!item) return;
  openEditorForm(el.inventoryForm, `Editando: ${item.nombre}`);
  setFormValues(el.inventoryForm, {
    inventory_id: item.inventory_id,
    nombre: item.nombre,
    categoria: item.categoria,
    cantidad: item.cantidad,
    unidad: item.unidad,
    costo: formatMoney(item.costo),
    minimo: item.minimo,
    activo: String(Boolean(item.activo))
  });
  updateFormChecks(el.inventoryForm);
}

function fillCashierForm(cashierId) {
  const cashier = state.cashiers.find(row => row.cashier_id === cashierId);
  if (!cashier) return;
  openEditorForm(el.cashierForm, `Editando: ${cashier.nombre}`);
  setFormValues(el.cashierForm, {
    cashier_id: cashier.cashier_id,
    nombre: cashier.nombre,
    correo: cashier.correo,
    clave: cashier.clave,
    rol: cashier.rol || "cajero",
    activo: String(Boolean(cashier.activo))
  });
  updateFormChecks(el.cashierForm);
}

async function saveProduct(event) {
  event.preventDefault();
  const data = getFormObject(el.productForm);
  const editing = Boolean(data.producto_id);
  const product = {
    producto_id: data.producto_id || makeId("prod"),
    categoria_id: data.categoria_id,
    nombre: data.nombre,
    precio: moneyToNumber(data.precio),
    descripcion: data.descripcion,
    imagen: data.imagen || suggestedProductImage(),
    opciones: parseFriendlyOptions(data.opciones),
    sabores: parseFriendlyFlavors(data.sabores),
    orden: moneyToNumber(data.orden),
    activo: data.activo === "true"
  };
  upsertLocal("products", "producto_id", product);
  collapseForm(el.productForm);
  await persistAndRender("upsertProduct", { product }, editing ? "Producto actualizado." : "Producto agregado.");
}

async function saveExtra(event) {
  event.preventDefault();
  const data = getFormObject(el.extraForm);
  const extra = {
    extra_id: data.extra_id || makeId("extra"),
    nombre: data.nombre,
    precio: moneyToNumber(data.precio),
    orden: moneyToNumber(data.orden),
    activo: data.activo === "true"
  };
  upsertLocal("extras", "extra_id", extra);
  collapseForm(el.extraForm);
  await persistAndRender("upsertExtra", { extra }, "Extra guardado.");
}

async function saveInventoryItem(event) {
  event.preventDefault();
  const data = getFormObject(el.inventoryForm);
  const item = {
    inventory_id: data.inventory_id || makeId("inv"),
    nombre: data.nombre,
    categoria: data.categoria,
    cantidad: moneyToNumber(data.cantidad),
    unidad: data.unidad,
    costo: moneyToNumber(data.costo),
    minimo: moneyToNumber(data.minimo),
    activo: data.activo === "true",
    actualizado: new Date().toISOString()
  };
  upsertLocal("inventory", "inventory_id", item);
  collapseForm(el.inventoryForm);
  await persistAndRender("upsertInventory", { item }, "Insumo guardado.");
}

async function saveCashier(event) {
  event.preventDefault();
  if (!isBossUser()) {
    toast("Solo un jefe puede crear o editar usuarios.");
    return;
  }
  const data = getFormObject(el.cashierForm);
  const correo = String(data.correo || "").trim().toLowerCase();
  const clave = String(data.clave || "").trim();
  if (!correo || !clave || clave.length < 4) {
    toast("Escribe un correo y una contraseña de mínimo 4 caracteres.");
    return;
  }
  const cashier = {
    cashier_id: data.cashier_id || makeId("cash"),
    nombre: data.nombre,
    correo,
    clave,
    rol: data.rol || "cajero",
    activo: data.activo === "true",
    ultimo_acceso: ""
  };
  upsertLocal("cashiers", "cashier_id", cashier);
  collapseForm(el.cashierForm);
  await persistAndRender("upsertCashier", { cashier }, "Cajero guardado.");
}

async function deleteProduct(productId) {
  const confirmed = await smartConfirm({
    title: "Eliminar producto",
    message: "Este producto dejara de aparecer en la carta.",
    confirmText: "Eliminar",
    danger: true
  });
  if (!confirmed) return;
  state.products = state.products.filter(product => product.producto_id !== productId);
  await persistAndRender("deleteProduct", { producto_id: productId, hardDelete: true }, "Producto eliminado.");
}

async function deleteExtra(extraId) {
  const confirmed = await smartConfirm({
    title: "Eliminar extra",
    message: "Este extra dejara de estar disponible en la carta.",
    confirmText: "Eliminar",
    danger: true
  });
  if (!confirmed) return;
  state.extras = state.extras.filter(extra => extra.extra_id !== extraId);
  await persistAndRender("deleteExtra", { extra_id: extraId, hardDelete: true }, "Extra eliminado.");
}

async function deleteInventoryItem(itemId) {
  const confirmed = await smartConfirm({
    title: "Eliminar insumo",
    message: "Este insumo saldra del control de inventario.",
    confirmText: "Eliminar",
    danger: true
  });
  if (!confirmed) return;
  state.inventory = state.inventory.filter(item => item.inventory_id !== itemId);
  await persistAndRender("deleteInventory", { inventory_id: itemId, hardDelete: true }, "Insumo eliminado.");
}

async function deleteCashier(cashierId) {
  if (!isBossUser()) {
    toast("Solo un jefe puede eliminar usuarios.");
    return;
  }
  const confirmed = await smartConfirm({
    title: "Eliminar cajero",
    message: "Este usuario perdera acceso al panel.",
    confirmText: "Eliminar",
    danger: true
  });
  if (!confirmed) return;
  state.cashiers = state.cashiers.filter(cashier => cashier.cashier_id !== cashierId);
  await persistAndRender("deleteCashier", { cashier_id: cashierId, hardDelete: true }, "Cajero eliminado.");
}

async function cycleOrderStatus(orderId) {
  const order = state.orders.find(item => item.order_id === orderId);
  const statuses = ["nuevo", "confirmado", "en cocina", "despachado"];
  const currentIndex = statuses.indexOf(normalize(order?.estado || "nuevo"));
  const nextStatus = statuses[(currentIndex + 1) % statuses.length];
  if (order) order.estado = nextStatus;
  await persistAndRender("updateOrderStatus", { order_id: orderId, estado: nextStatus }, "Estado actualizado.");
}

async function persistAndRender(action, data, successMessage) {
  const savingOverlay = showSectionSaving(action, data);
  queuePendingWrite(action, data);
  cacheAdminData();
  renderAll();
  toast(successMessage);
  if (!state.token) {
    window.setTimeout(() => hideSectionSaving(savingOverlay), 900);
    return;
  }
  postAdmin(action, data)
    .then(() => {
      state.pendingWrites = state.pendingWrites.filter(item => !(item.action === action && item.id === pendingIdFor(action, data)));
      savePendingWrites();
      scheduleBackgroundRefresh();
    })
    .catch(error => {
      console.warn("Guardado pendiente en segundo plano", error);
    })
    .finally(() => {
      window.setTimeout(() => hideSectionSaving(savingOverlay), 260);
    });
}

function persistTableQuietly(table) {
  const action = "upsertTable";
  const data = { table };
  const pending = queuePendingWrite(action, data);
  cacheAdminData();

  if (!state.token) return;
  persistTableQuietly.timers = persistTableQuietly.timers || new Map();
  window.clearTimeout(persistTableQuietly.timers.get(table.table_id));
  persistTableQuietly.timers.set(table.table_id, window.setTimeout(() => {
    postAdmin(action, data)
      .then(() => {
        state.pendingWrites = state.pendingWrites.filter(item => {
          return !(item.action === action && item.id === pending.id && item.createdAt === pending.createdAt);
        });
        savePendingWrites();
        cacheAdminData();
        scheduleBackgroundRefresh();
      })
      .catch(error => {
        console.warn("Mesa guardada localmente; backend pendiente", error);
      })
      .finally(() => {
        persistTableQuietly.timers.delete(table.table_id);
      });
  }, 180));
}

function persistCheckoutQuietly(table, payment) {
  const action = "checkoutTable";
  const data = { table, payment };
  const pending = queuePendingWrite(action, data);
  cacheAdminData();

  if (!state.token) return;
  postAdmin(action, data)
    .then(() => {
      state.pendingWrites = state.pendingWrites.filter(item => {
        return !(item.action === action && item.id === pending.id && item.createdAt === pending.createdAt);
      });
      savePendingWrites();
      cacheAdminData();
      scheduleBackgroundRefresh();
    })
    .catch(error => {
      console.warn("Pago de mesa guardado localmente; backend pendiente", error);
    });
}

function showSectionSaving(action, data = {}) {
  const target = savingTargetForAction(action, data);
  if (!target) return null;
  target.dataset.savingCount = String(moneyToNumber(target.dataset.savingCount) + 1);
  target.classList.add("section-saving");
  let overlay = target.querySelector(":scope > .section-saving-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "section-saving-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
      <span class="neon-circle-loader" aria-hidden="true"></span>
      <strong>Guardando</strong>
    `;
    target.appendChild(overlay);
  }
  return { target, overlay };
}

function hideSectionSaving(handle) {
  if (!handle?.target) return;
  const nextCount = Math.max(0, moneyToNumber(handle.target.dataset.savingCount) - 1);
  handle.target.dataset.savingCount = String(nextCount);
  if (nextCount > 0) return;
  handle.target.classList.remove("section-saving");
  handle.overlay?.remove();
}

function savingTargetForAction(action, data = {}) {
  if (["upsertProduct", "deleteProduct"].includes(action)) return document.querySelector("#carta");
  if (["upsertExtra", "deleteExtra"].includes(action)) return document.querySelector("#extras");
  if (["upsertInventory", "deleteInventory", "recordInventoryMovement"].includes(action)) return document.querySelector("#inventario > .dashboard-panel");
  if (["upsertCashier", "deleteCashier"].includes(action)) return document.querySelector("#cajeros .dashboard-panel");
  if (["updateOrderStatus"].includes(action)) return document.querySelector("#ordenes");
  if (["checkoutTable", "cancelTable"].includes(action)) return document.querySelector("#mesas .selected-table-panel");
  if (["deleteTable"].includes(action)) return document.querySelector("#mesas .tables-layout > .dashboard-panel:first-child");
  if (action === "upsertTable") {
    const table = data.table || {};
    const hasItems = tableItems(table).length > 0;
    return document.querySelector(hasItems ? "#mesas .selected-table-panel" : "#mesas .tables-layout > .dashboard-panel:first-child");
  }
  return document.querySelector(".admin-view:not([style*='display: none']) .dashboard-panel");
}

function scheduleBackgroundRefresh() {
  window.clearTimeout(scheduleBackgroundRefresh.timer);
  scheduleBackgroundRefresh.timer = window.setTimeout(() => {
    if (state.token && !document.hidden) loadAdminData({ silent: true, fresh: true });
  }, 1400);
}

async function postAdmin(action, data) {
  const response = await fetchWithTimeout(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action,
      token: state.token,
      password: state.token,
      cashier: state.cashierSession,
      ...data
    })
  });
  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error || `HTTP ${response.status}`);
  }
}

function selectedTable() {
  return state.tables.find(table => table.table_id === state.selectedTableId);
}

function tableItems(table) {
  if (!table) return [];
  if (Array.isArray(table.items)) return table.items;
  try {
    const parsed = JSON.parse(table.items || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function tableTotal(table) {
  return tableItems(table).reduce((sum, item) => sum + lineTotal(item), 0);
}

function lineTotal(item) {
  return moneyToNumber(item.precio) * Math.max(1, moneyToNumber(item.qty));
}

function todayPaymentsTotal() {
  const today = new Date().toLocaleDateString("es-CO");
  return state.payments
    .filter(payment => normalize(payment.estado) === "pagado")
    .filter(payment => new Date(payment.fecha || 0).toLocaleDateString("es-CO") === today)
    .reduce((sum, payment) => sum + moneyToNumber(payment.total), 0);
}

function cashierName() {
  return state.cashierSession?.nombre || "Caja principal";
}

function openLayer(layer) {
  layer.classList.remove("hidden");
  layer.setAttribute("aria-hidden", "false");
}

function closeLayer(layer) {
  layer.classList.add("hidden");
  layer.setAttribute("aria-hidden", "true");
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
    el.smartDialogKicker.textContent = options.kicker || "Oscar's Parrilla Admin";
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

function upsertLocal(collection, idKey, item) {
  const index = state[collection].findIndex(current => current[idKey] === item[idKey]);
  if (index >= 0) {
    state[collection][index] = item;
  } else {
    state[collection] = [item, ...state[collection]];
  }
}

function normalizeProductsForAdmin(products) {
  return products.map((product, index) => ({
    producto_id: product.producto_id || makeId("prod"),
    categoria_id: product.categoria_id || "pizzas",
    nombre: product.nombre || "Producto Oscar's Parrilla",
    precio: moneyToNumber(product.precio),
    descripcion: product.descripcion || "",
    imagen: product.imagen || `pizza${(index % 8) + 1}.png`,
    opciones: product.opciones || "",
    sabores: normalizeProductFlavors(productFlavorSource(product)),
    orden: moneyToNumber(product.orden) || index + 1,
    activo: product.activo !== false && String(product.activo).toLowerCase() !== "false"
  })).sort(sortByOrderThenName);
}

function normalizeExtrasForAdmin(extras) {
  return extras.map((extra, index) => ({
    extra_id: extra.extra_id || makeId("extra"),
    nombre: extra.nombre || "Extra Oscar's Parrilla",
    precio: moneyToNumber(extra.precio),
    orden: moneyToNumber(extra.orden) || index + 1,
    activo: extra.activo !== false && String(extra.activo).toLowerCase() !== "false"
  })).sort(sortByOrderThenName);
}

function normalizeOrdersForAdmin(orders) {
  return orders
    .map((order, index) => normalizeOrderForAdmin(order, index))
    .sort(sortOrdersAscending)
    .map((order, index) => ({
      ...order,
      displayNumber: moneyToNumber(order.order_number) || index + 1
    }));
}

function normalizeOrderForAdmin(order, index = 0) {
  const notes = String(order.notas || order.notes || "");
  const legacyPackaging = extractMoneyFromNotes(notes, /empaque\s*:\s*([\d.,]+)/i);
  const legacyZone = extractTextFromNotes(notes, /barrio\/zona\s*:\s*([^\n|]+)/i);
  return {
    ...order,
    subtotal: moneyToNumber(order.subtotal),
    domicilio: moneyToNumber(order.domicilio),
    empaque: moneyToNumber(order.empaque) || legacyPackaging,
    barrio: order.barrio || legacyZone || "",
    total: moneyToNumber(order.total),
    displayNumber: moneyToNumber(order.order_number) || index + 1
  };
}

function extractMoneyFromNotes(notes, pattern) {
  const match = String(notes || "").match(pattern);
  return match ? moneyToNumber(match[1]) : 0;
}

function extractTextFromNotes(notes, pattern) {
  const match = String(notes || "").match(pattern);
  return match ? match[1].trim() : "";
}

function normalizeTables(tables) {
  return tables.map((table, index) => ({
    table_id: table.table_id || makeId("mesa"),
    nombre: table.nombre || table.table_name || `Mesa ${index + 1}`,
    estado: table.estado || "abierta",
    fecha_apertura: table.fecha_apertura || table.fecha || new Date().toISOString(),
    fecha_cierre: table.fecha_cierre || "",
    cajero: table.cajero || "Caja principal",
    items: tableItems(table)
  }));
}

function normalizePayments(payments) {
  return payments.map(payment => ({
    payment_id: payment.payment_id || makeId("pay"),
    table_id: payment.table_id || "",
    table_name: payment.table_name || "",
    origen: payment.origen || payment.table_name || "Mesa",
    fecha: payment.fecha || new Date().toISOString(),
    cajero: payment.cajero || "Caja principal",
    metodo: payment.metodo || payment.metodo_principal || "Efectivo",
    metodo_principal: payment.metodo_principal || payment.metodo || "Efectivo",
    metodo_uno: payment.metodo_uno || "",
    valor_uno: moneyToNumber(payment.valor_uno),
    metodo_dos: payment.metodo_dos || "",
    valor_dos: moneyToNumber(payment.valor_dos),
    total: moneyToNumber(payment.total),
    estado: payment.estado || "pagado",
    notas: payment.notas || "",
    items: payment.items || "[]"
  }));
}

function normalizeInventory(items) {
  return items.map((item, index) => ({
    inventory_id: item.inventory_id || makeId("inv"),
    nombre: item.nombre || `Insumo ${index + 1}`,
    categoria: item.categoria || "General",
    cantidad: moneyToNumber(item.cantidad),
    unidad: item.unidad || "unidades",
    costo: moneyToNumber(item.costo),
    minimo: moneyToNumber(item.minimo),
    activo: item.activo !== false && String(item.activo).toLowerCase() !== "false",
    actualizado: item.actualizado || ""
  }));
}

function normalizeInventoryMovements(movements) {
  return movements.map(move => ({
    movement_id: move.movement_id || makeId("mov"),
    inventory_id: move.inventory_id || "",
    nombre: move.nombre || "Insumo",
    cantidad: moneyToNumber(move.cantidad),
    unidad: move.unidad || "",
    tipo: move.tipo || "retiro",
    fecha: move.fecha || new Date().toISOString(),
    usuario: move.usuario || move.cajero || "Usuario"
  })).sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));
}

function mergeInventoryMovements(serverMovements = []) {
  let localMovements = [];
  try {
    localMovements = JSON.parse(localStorage.getItem("chanchos_inventory_movements_v1") || "[]");
  } catch {
    localMovements = [];
  }
  const map = new Map();
  normalizeInventoryMovements([...serverMovements, ...localMovements]).forEach(move => {
    map.set(move.movement_id, move);
  });
  return [...map.values()]
    .sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0))
    .slice(0, 200);
}

function normalizeCashiers(cashiers) {
  return cashiers.map(cashier => ({
    cashier_id: cashier.cashier_id || makeId("cash"),
    nombre: cashier.nombre || "Cajero",
    correo: String(cashier.correo || cashier.email || "").trim().toLowerCase(),
    clave: String(cashier.clave || cashier.password || ""),
    rol: cashier.rol || "cajero",
    activo: cashier.activo !== false && String(cashier.activo).toLowerCase() !== "false",
    ultimo_acceso: cashier.ultimo_acceso || ""
  }));
}

function sortOrdersAscending(a, b) {
  const byNumber = moneyToNumber(a.order_number) - moneyToNumber(b.order_number);
  if (byNumber) return byNumber;
  const byDate = new Date(a.fecha || 0).getTime() - new Date(b.fecha || 0).getTime();
  if (byDate) return byDate;
  return String(a.order_id || "").localeCompare(String(b.order_id || ""));
}

function sortByOrderThenName(a, b) {
  return moneyToNumber(a.orden) - moneyToNumber(b.orden) || String(a.nombre || "").localeCompare(String(b.nombre || ""), "es");
}

function orderStatusLabel(status) {
  const value = normalize(status || "nuevo");
  if (value === "confirmado") return "Confirmado";
  if (value === "en cocina" || value === "cocina" || value === "preparando") return "En cocina";
  if (value === "despachado" || value === "entregado") return "Despachado";
  if (value === "cancelado" || value === "anulado") return "Cancelado";
  return "Nuevo";
}

function orderStatusClass(status) {
  const value = normalize(status || "nuevo");
  if (value === "confirmado") return "is-confirmed";
  if (value === "en cocina" || value === "cocina" || value === "preparando") return "is-kitchen";
  if (value === "despachado" || value === "entregado") return "is-dispatched";
  return "is-new";
}

function nextOrderStatusLabel(status) {
  const value = normalize(status || "nuevo");
  if (value === "nuevo") return "Confirmar";
  if (value === "confirmado") return "Enviar a cocina";
  if (value === "en cocina" || value === "cocina" || value === "preparando") return "Despachar";
  return "Reabrir";
}

function notifyIfNewOrders(nextOrders) {
  const nextIds = new Set(nextOrders.map(order => String(order.order_id || "")));
  const newOrders = state.liveOrdersReady
    ? nextOrders.filter(order => order.order_id && isNewOrder(order) && !state.knownOrderIds.has(String(order.order_id)))
    : [];
  state.knownOrderIds = nextIds;
  if (!state.liveOrdersReady) {
    state.liveOrdersReady = true;
    return;
  }
  if (newOrders.length) {
    playOrderAlert();
    showNewOrderAlert(newOrders);
    showSystemOrderNotification(newOrders);
    markOrderTabAlert(newOrders.length);
  }
}

function isNewOrder(order) {
  return ["nuevo", "pendiente"].includes(normalize(order.estado || "nuevo"));
}

function showNewOrderAlert(newOrders) {
  if (!el.newOrderAlert) return;
  const latest = newOrders[newOrders.length - 1];
  el.newOrderAlertTitle.textContent = newOrders.length === 1
    ? `Nueva orden #${latest.order_number || latest.displayNumber || ""}`
    : `${newOrders.length} órdenes nuevas`;
  el.newOrderAlertDetail.textContent = newOrders.length === 1
    ? `${latest.cliente || "Cliente"} · ${formatMoney(latest.total)}`
    : "Hay varios pedidos esperando revisión.";
  el.newOrderAlert.classList.remove("hidden");
  el.newOrderAlert.classList.remove("is-entering");
  void el.newOrderAlert.offsetWidth;
  el.newOrderAlert.classList.add("is-entering");
}

function hideNewOrderAlert() {
  el.newOrderAlert?.classList.add("hidden");
}

function openNewOrders() {
  clearOrderTabAlert();
  setActiveView("ordenes");
  state.orderFilter = "nuevo";
  el.orderFilter.value = "nuevo";
  renderOrders();
  hideNewOrderAlert();
}

async function enableAdminAlerts() {
  await unlockSound();
  await requestNotificationPermission();
  updateNotificationPermissionUi();
  if (state.soundReady && (!("Notification" in window) || Notification.permission === "granted")) {
    toast("Sonido y notificaciones activados.");
  } else if (state.soundReady) {
    toast("Sonido activo. Las notificaciones del navegador están bloqueadas.");
  }
}

async function requestNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission !== "default") return Notification.permission;
  return Notification.requestPermission().catch(() => "denied");
}

function updateNotificationPermissionUi() {
  if (!el.notificationPermission || !el.notificationPermissionLabel) return;
  const notificationsGranted = !("Notification" in window) || Notification.permission === "granted";
  const fullyEnabled = state.soundReady && notificationsGranted;
  el.notificationPermission.classList.toggle("is-enabled", fullyEnabled);
  el.notificationPermission.classList.toggle("is-blocked", "Notification" in window && Notification.permission === "denied");
  el.notificationPermission.setAttribute("aria-pressed", String(fullyEnabled));
  el.notificationPermissionLabel.textContent = fullyEnabled
    ? "Avisos activos"
    : state.soundReady
      ? "Permitir notificaciones"
      : "Activar sonido y avisos";
}

function showSystemOrderNotification(newOrders) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const latest = newOrders[newOrders.length - 1];
  const notification = new Notification(newOrders.length === 1 ? "Nueva orden" : `${newOrders.length} órdenes nuevas`, {
    body: `${latest.cliente || "Cliente"} · ${formatMoney(latest.total)}`,
    icon: "./images/logo.png",
    badge: "./images/logo.png",
    requireInteraction: document.hidden,
    tag: `oscars-parrilla-new-order-${latest.order_id || Date.now()}`
  });
  notification.onclick = () => {
    window.focus();
    openNewOrders();
    notification.close();
  };
}

function markOrderTabAlert(count = 1) {
  state.unseenOrderAlerts += count;
  document.title = `(${state.unseenOrderAlerts}) Nueva orden - ${ADMIN_PAGE_TITLE}`;
}

function clearOrderTabAlert() {
  state.unseenOrderAlerts = 0;
  document.title = ADMIN_PAGE_TITLE;
}

function armSoundUnlock() {
  if (state.soundUnlockArmed) return;
  state.soundUnlockArmed = true;
  document.addEventListener("pointerdown", unlockSound, { once: true });
  document.addEventListener("keydown", unlockSound, { once: true });
}

function unlockSound() {
  state.soundUnlockArmed = false;
  if (!el.alertSound || state.soundReady) {
    updateNotificationPermissionUi();
    return Promise.resolve(state.soundReady);
  }
  el.alertSound.volume = 0.85;
  el.alertSound.muted = true;
  return el.alertSound.play()
    .then(() => {
      el.alertSound.pause();
      el.alertSound.currentTime = 0;
      el.alertSound.muted = false;
      el.alertSound.volume = 0.85;
      state.soundReady = true;
      updateNotificationPermissionUi();
      return true;
    })
    .catch(() => {
      el.alertSound.muted = false;
      state.soundReady = false;
      updateNotificationPermissionUi();
      return false;
    });
}

function playOrderAlert() {
  if (!el.alertSound) return;
  el.alertSound.currentTime = 0;
  el.alertSound.play().catch(() => {
    toast("Nueva orden recibida. Activa el sonido con Entrar o Recargar.");
  });
}

function startOrderPolling() {
  window.clearInterval(state.pollTimer);
  if (state.token) loadOrdersRealtime();
  state.pollTimer = window.setInterval(() => {
    if (state.token) loadOrdersRealtime();
  }, API_REALTIME_POLL_MS);
}

async function loadOrdersRealtime() {
  if (!state.token || state.orderSyncInProgress) return;
  state.orderSyncInProgress = true;
  try {
    const url = new URL(API_URL);
    url.searchParams.set("action", "ordersData");
    url.searchParams.set("token", state.token);
    url.searchParams.set("_", Date.now().toString());
    const response = await fetchWithTimeout(url.toString(), { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.error || `HTTP ${response.status}`);
    const nextOrders = normalizeOrdersForAdmin(payload.data?.orders || []);
    notifyIfNewOrders(nextOrders);
    state.orders = nextOrders;
    applyPendingWrites();
    cacheAdminData();
    renderKpis();
    renderIncome();
    renderOrders();
  } catch (error) {
    console.warn("Consulta rápida de órdenes pendiente", error);
  } finally {
    state.orderSyncInProgress = false;
  }
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort("api-timeout"), API_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error.name === "AbortError" || controller.signal.aborted) {
      throw new Error("La conexión tardó más de lo esperado. Reintenta en unos segundos.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function friendlyNetworkError(error) {
  const message = String(error?.message || error || "");
  if (/aborted|abort|signal/i.test(message)) {
    return "La conexión tardó más de lo esperado. Reintenta en unos segundos.";
  }
  if (/Failed to fetch|NetworkError|Load failed/i.test(message)) {
    return "No hay respuesta de red. Se mantiene el trabajo local.";
  }
  return message || "No hubo respuesta de conexión.";
}

function setStatus(message) {
  el.status.textContent = message;
}

function toast(message) {
  el.toast.textContent = message;
  el.toast.classList.add("show");
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => el.toast.classList.remove("show"), 3200);
}

function setText(id, value) {
  const target = document.getElementById(id);
  if (target) target.textContent = value;
}

function setFormValues(form, values) {
  Object.entries(values).forEach(([key, value]) => {
    if (form.elements[key]) form.elements[key].value = value ?? "";
  });
  formatMoneyFieldsIn(form);
}

function resetForm(form) {
  form.reset();
  form.querySelectorAll("input[type='hidden']").forEach(input => {
    input.value = "";
  });
  updateFormChecks(form);
}

function openFormForCreate(form, entityLabel) {
  resetForm(form);
  if (form === el.productForm) form.elements.imagen.value = suggestedProductImage();
  if (form === el.cashierForm) {
    form.elements.rol.value = "cajero";
  }
  openEditorForm(form, `Nuevo ${entityLabel}`);
  form.querySelector("input:not([type='hidden']), textarea, select")?.focus();
}

function openEditorForm(form, title) {
  form.classList.remove("collapsed");
  form.dataset.editorTitle = title;
  updateSubmitLabels(form);
  updateFormChecks(form);
}

function collapseForm(form) {
  resetForm(form);
  form.classList.add("collapsed");
  form.dataset.editorTitle = "";
  updateSubmitLabels(form);
}

function updateSubmitLabels(form) {
  if (form === el.productForm && el.productSubmit) {
    el.productSubmit.textContent = form.elements.producto_id?.value ? "Actualizar producto" : "Agregar producto";
  }
}

function updateFormChecks(form) {
  form.querySelectorAll("label").forEach(label => {
    const field = label.querySelector("input:not([type='hidden']), textarea, select");
    if (!field) return;
    const hasValue = field.tagName === "SELECT" ? Boolean(field.value) : Boolean(String(field.value || "").trim());
    label.classList.toggle("field-ok", hasValue);
  });
}

function getFormObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function bindAdminMoneyInputs() {
  document.querySelectorAll("input[name='precio'], input[name='costo'], input[name='expense_amount'], input[name='amount_one'], input[name='amount_two']").forEach(input => {
    input.addEventListener("input", () => formatMoneyInput(input));
    input.addEventListener("blur", () => formatMoneyInput(input));
  });
  el.productForm?.elements?.opciones?.addEventListener("blur", event => {
    event.currentTarget.value = formatFriendlyOptionsInput(event.currentTarget.value);
  });
  el.productForm?.elements?.sabores?.addEventListener("blur", event => {
    event.currentTarget.value = formatProductFlavorsForInput(event.currentTarget.value);
  });
}

function formatMoneyFieldsIn(form) {
  form.querySelectorAll("input[name='precio'], input[name='costo'], input[name='expense_amount'], input[name='amount_one'], input[name='amount_two']").forEach(formatMoneyInput);
  if (form === el.productForm && form.elements.opciones) {
    form.elements.opciones.value = formatFriendlyOptionsInput(form.elements.opciones.value);
  }
  if (form === el.productForm && form.elements.sabores) {
    form.elements.sabores.value = formatProductFlavorsForInput(form.elements.sabores.value);
  }
}

function formatMoneyInput(input) {
  const amount = moneyToNumber(input.value);
  input.value = amount > 0 ? formatMoney(amount) : "";
}

function parseFriendlyOptions(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? JSON.stringify(parsed) : "";
  } catch {}

  const options = text
    .split(/\n|,/)
    .map(part => part.trim())
    .filter(Boolean)
    .map((part, index) => {
      const match = part.match(/^(.+?)(?::|-)\s*\$?\s*([\d.,]+)/);
      if (!match) return null;
      const label = match[1].trim();
      return {
        id: `opt-${slugify(label || `opcion-${index + 1}`)}`,
        label,
        price: moneyToNumber(match[2])
      };
    })
    .filter(Boolean);

  return options.length ? JSON.stringify(options) : "";
}

function formatProductOptionsForInput(value) {
  let raw = value;
  if (typeof raw === "string") {
    const text = raw.trim();
    if (!text) return "";
    try {
      raw = JSON.parse(text);
    } catch {
      return text;
    }
  }
  if (!Array.isArray(raw)) return "";
  return raw.filter(option => option && option.label).map(option => `${option.label}: ${formatMoney(option.price)}`).join(", ");
}

function parseFriendlyFlavors(value) {
  return normalizeProductFlavors(value);
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
    .map(item => {
      if (item && typeof item === "object") return item.label || item.nombre || item.name || item.sabor || "";
      return item;
    })
    .map(item => String(item || "").trim())
    .filter(item => {
      const key = normalize(item);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function formatProductFlavorsForInput(value) {
  return normalizeProductFlavors(value).join(", ");
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
  return candidates.find(value => Array.isArray(value) ? value.length > 0 : String(value || "").trim()) || "";
}

function formatFriendlyOptionsInput(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return formatProductOptionsForInput(parsed);
  } catch {}
  return text
    .split(/\n|,/)
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => {
      const match = part.match(/^(.+?)(?::|-)\s*(?:COP\s*)?\$?\s*([\d.,]+)/i);
      if (!match) return part;
      return `${match[1].trim()}: ${formatMoney(match[2])}`;
    })
    .join(", ");
}

function orderItemsLabel(itemsValue) {
  if (Array.isArray(itemsValue)) {
    if (!itemsValue.length) return "Sin detalle de productos";
    return itemsValue.map(orderItemLabel).join(", ");
  }
  if (itemsValue && typeof itemsValue === "object") {
    return orderItemLabel(itemsValue);
  }
  try {
    const items = JSON.parse(itemsValue || "[]");
    if (!Array.isArray(items) || !items.length) return "Sin detalle de productos";
    return items.map(orderItemLabel).join(", ");
  } catch {
    return String(itemsValue || "").trim() || "Sin detalle de productos";
  }
}

function orderItemLabel(item = {}) {
  const detail = [item.opcion || item.option || "", item.sabor ? `Sabor: ${item.sabor}` : ""].filter(Boolean).join(" · ");
  return `${item.cantidad || item.qty || 1}x ${item.nombre || item.title || "Producto"}${detail ? ` (${detail})` : ""}`;
}

function parseOrderItems(itemsValue) {
  if (Array.isArray(itemsValue)) return itemsValue;
  try {
    const parsed = JSON.parse(itemsValue || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    const text = String(itemsValue || "").trim();
    return text ? [{ nombre: text, qty: 1, precio: 0 }] : [];
  }
}

function suggestedProductImage() {
  const nextIndex = (state.products.length % 8) + 1;
  return `pizza${nextIndex}.png`;
}

function productVisualImage(product) {
  const image = String(product?.imagen || "").trim();
  const beverageImage = getBeverageProductImage(product);
  if (beverageImage && (!image || isPizzaPlaceholderImage(image))) return `./images/${beverageImage}`;
  if (/^pizza([1-8])\.png$/i.test(image)) return `./images/${image}`;
  if (/^https?:\/\//i.test(image) || image.startsWith("data:")) return image;
  if (image.startsWith("./")) return image;
  if (image.startsWith("images/")) return `./${image}`;
  if (image) return `./images/${image}`;
  const order = moneyToNumber(product?.orden);
  const index = order > 0 ? ((order - 1) % 8) + 1 : 1;
  return `./images/pizza${index}.png`;
}

function getBeverageProductImage(product) {
  if (String(product?.categoria_id || "").trim().toLowerCase() !== "bebidas") return "";
  const primaryText = normalizeImageKey(product?.nombre || "");
  const fullText = normalizeImageKey(`${primaryText} ${product?.descripcion || ""}`);
  const primaryCompact = primaryText.replace(/\s+/g, "");
  const fullCompact = fullText.replace(/\s+/g, "");
  const ranked = BEVERAGE_PRODUCT_IMAGES
    .map(item => ({ image: item.image, score: beverageImageScore(item, primaryText, fullText, primaryCompact, fullCompact) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.image || "";
}

function beverageImageScore(item, primaryText, fullText, primaryCompact, fullCompact) {
  const typeKey = normalizeImageKey(item.type);
  const typeCompact = typeKey.replace(/\s+/g, "");
  const typeInPrimary = primaryText.split(" ").includes(typeKey) || primaryCompact.includes(typeCompact);
  const typeInFull = fullText.split(" ").includes(typeKey) || fullCompact.includes(typeCompact);
  let score = 0;

  item.aliases.forEach(alias => {
    const aliasKey = normalizeImageKey(alias);
    const aliasCompact = aliasKey.replace(/\s+/g, "");
    if (primaryText.split(" ").includes(aliasKey) || primaryCompact.includes(aliasCompact)) score = Math.max(score, 100 + aliasCompact.length);
    if (fullText.split(" ").includes(aliasKey) || fullCompact.includes(aliasCompact)) score = Math.max(score, 45 + aliasCompact.length);
  });

  if (!score && typeInPrimary) score = 12;
  if (!score && typeInFull) score = 6;
  return score;
}

function isPizzaPlaceholderImage(value) {
  return /(?:^|\/)pizza\d+\.png$/i.test(String(value || ""));
}

function normalizeImageKey(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
}

function formatMoney(value) {
  return `$ ${moneyToNumber(value).toLocaleString("es-CO")}`;
}

function moneyToNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, Math.round(value));
  const parsed = Number(String(value ?? "0").replace(/[^\d-]/g, ""));
  return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : 0;
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
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
      if (["updatedAt", "actualizado"].includes(key)) return acc;
      acc[key] = normalizeComparable(value[key]);
      return acc;
    }, {});
}

function labelFromId(value) {
  const id = String(value || "general");
  if (MENU_CATEGORY_LABELS[id]) return MENU_CATEGORY_LABELS[id];
  return id
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());
}

function makeId(prefix) {
  const random = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${random}`.toLowerCase();
}

function slugify(value) {
  return String(value || "opcion")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "opcion";
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

// Extension Supabase: carga de imagenes para productos y extras.
document.addEventListener("DOMContentLoaded", () => {
  patchSupabaseImageInputs();
});

function patchSupabaseImageInputs() {
  const productForm = document.getElementById("product-form");
  if (productForm && !productForm.elements.image_file) {
    productForm.querySelector("input[name='imagen']")?.insertAdjacentHTML(
      "afterend",
      imagePickerTemplate("Imagen del producto")
    );
  }

  const extraForm = document.getElementById("extra-form");
  if (extraForm && !extraForm.elements.image_file) {
    if (!extraForm.elements.imagen) {
      extraForm.insertAdjacentHTML("afterbegin", '<input type="hidden" name="imagen">');
    }
    extraForm.querySelector("input[name='orden']")?.insertAdjacentHTML(
      "afterend",
      imagePickerTemplate("Imagen del extra")
    );
  }

  bindImagePicker(productForm);
  bindImagePicker(extraForm);
}

function imagePickerTemplate(label) {
  return `
    <label class="wide image-picker">
      <span class="image-picker-title">${escapeAttr(label)}</span>
      <span class="image-picker-control">
        <span class="image-picker-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M4 17.5V6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5Z"/>
            <path d="m7 16 3.2-3.2 2.5 2.5 1.8-1.8L18 17"/>
            <circle cx="15.5" cy="8.5" r="1.3"/>
          </svg>
        </span>
        <span class="image-picker-text">Seleccionar imagen</span>
        <span class="image-picker-file" data-image-file-name>PNG, JPG o WEBP</span>
      </span>
      <input name="image_file" type="file" accept="image/png,image/jpeg,image/webp,image/gif">
    </label>
  `;
}

function bindImagePicker(form) {
  const input = form?.elements?.image_file;
  if (!input || input.dataset.imagePickerBound) return;
  input.dataset.imagePickerBound = "true";
  input.addEventListener("change", () => {
    const fileName = input.files?.[0]?.name || "PNG, JPG o WEBP";
    const target = input.closest(".image-picker")?.querySelector("[data-image-file-name]");
    if (target) target.textContent = fileName;
  });
}

async function uploadSupabaseImage(file, folder, id) {
  if (!file) return "";
  const config = window.OSCARS_SUPABASE || {};
  const client = window.supabase.createClient(config.url, config.anonKey);
  const bucket = config.imageBucket || "product-images";
  const ext = String(file.name || "image.png").split(".").pop().toLowerCase();
  const path = `${folder}/${id}-${Date.now()}.${ext}`;
  const { error } = await client.storage.from(bucket).upload(path, file, {
    upsert: true,
    cacheControl: "3600"
  });
  if (error) throw error;
  return client.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

function storagePathFromPublicUrl(url) {
  const bucket = (window.OSCARS_SUPABASE || {}).imageBucket || "product-images";
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = String(url || "").indexOf(marker);
  return index >= 0 ? decodeURIComponent(String(url).slice(index + marker.length)) : "";
}

async function removeSupabaseImage(path) {
  if (!path) return;
  const config = window.OSCARS_SUPABASE || {};
  const client = window.supabase.createClient(config.url, config.anonKey);
  const bucket = config.imageBucket || "product-images";
  const { error } = await client.storage.from(bucket).remove([path]);
  if (error) throw error;
}

async function cleanupCategoryCoverUploads(categoryId, keepPath) {
  const config = window.OSCARS_SUPABASE || {};
  const client = window.supabase.createClient(config.url, config.anonKey);
  const bucket = config.imageBucket || "product-images";
  const folder = "category-covers";
  const { data, error } = await client.storage.from(bucket).list(folder, { limit: 200 });
  if (error || !Array.isArray(data)) {
    if (error) console.warn("No se pudieron listar portadas antiguas", error);
    return;
  }
  const prefix = `${categoryId}-`;
  const stalePaths = data
    .map(item => String(item.name || ""))
    .filter(name => name.startsWith(prefix))
    .map(name => name.startsWith(`${folder}/`) ? name : `${folder}/${name}`)
    .filter(path => path !== keepPath);
  if (!stalePaths.length) return;
  const { error: removeError } = await client.storage.from(bucket).remove(stalePaths);
  if (removeError) console.warn("No se pudieron limpiar portadas antiguas", removeError);
}

function formatFileSize(bytes = 0) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

async function saveProduct(event) {
  event.preventDefault();
  const data = getFormObject(el.productForm);
  const editing = Boolean(data.producto_id);
  const productId = data.producto_id || makeId("prod");
  let image = data.imagen || suggestedProductImage();

  try {
    const uploaded = await uploadSupabaseImage(el.productForm.elements.image_file?.files?.[0], "products", productId);
    if (uploaded) image = uploaded;
  } catch (error) {
    toast(`No se pudo subir la imagen: ${error.message}`);
    return;
  }

  const product = {
    producto_id: productId,
    categoria_id: data.categoria_id,
    nombre: data.nombre,
    precio: moneyToNumber(data.precio),
    descripcion: data.descripcion,
    imagen: image,
    opciones: parseFriendlyOptions(data.opciones),
    sabores: parseFriendlyFlavors(data.sabores),
    orden: moneyToNumber(data.orden),
    activo: data.activo === "true"
  };
  upsertLocal("products", "producto_id", product);
  collapseForm(el.productForm);
  await persistAndRender("upsertProduct", { product }, editing ? "Producto actualizado." : "Producto agregado.");
}

async function saveExtra(event) {
  event.preventDefault();
  const data = getFormObject(el.extraForm);
  const extraId = data.extra_id || makeId("extra");
  let image = data.imagen || "";

  try {
    const uploaded = await uploadSupabaseImage(el.extraForm.elements.image_file?.files?.[0], "extras", extraId);
    if (uploaded) image = uploaded;
  } catch (error) {
    toast(`No se pudo subir la imagen: ${error.message}`);
    return;
  }

  const extra = {
    extra_id: extraId,
    nombre: data.nombre,
    precio: moneyToNumber(data.precio),
    imagen: image,
    orden: moneyToNumber(data.orden),
    activo: data.activo === "true"
  };
  upsertLocal("extras", "extra_id", extra);
  collapseForm(el.extraForm);
  await persistAndRender("upsertExtra", { extra }, "Extra guardado.");
}

