(function () {
  const cfg = window.OSCARS_SUPABASE || {};
  const db = window.supabase.createClient(cfg.url, cfg.anonKey);
  const APPS_SCRIPT_RE = /script\.google\.com\/macros\/s\//i;
  const SETTINGS_FALLBACK_KEY = "oscars_business_settings_fallback_v1";

  const originalFetch = window.fetch.bind(window);

  window.fetch = async function patchedFetch(input, options = {}) {
    const url = typeof input === "string" ? input : input?.url || "";
    if (!APPS_SCRIPT_RE.test(url)) return originalFetch(input, options);

    try {
      const method = String(options.method || "GET").toUpperCase();
      const body = method === "POST" ? JSON.parse(options.body || "{}") : {};
      const query = new URL(url).searchParams;
      const action = method === "POST" ? body.action : query.get("action") || "menu";
      const payload = method === "POST"
        ? await handlePost(action, body)
        : await handleGet(action, query);
      return jsonResponse(payload);
    } catch (error) {
      console.error(error);
      return jsonResponse({ ok: false, error: error?.message || String(error) }, 500);
    }
  };

  async function handleGet(action, query) {
    if (action === "menu" || action === "read") {
      return { ok: true, data: await menuData() };
    }
    if (action === "ping") {
      return { ok: true, data: { status: "online", updatedAt: now() } };
    }
    if (action === "authInfo") {
      return { ok: true, data: { hasBoss: await hasBoss(), updatedAt: now() } };
    }
    if (action === "adminData") {
      return { ok: true, data: await adminData() };
    }
    if (action === "adminSectionData") {
      return { ok: true, data: await adminSectionData(query.get("section") || "mesas") };
    }
    if (action === "ordersData") {
      return { ok: true, data: { orders: await rows("orders", { order: ["fecha", false], limit: 300 }), updatedAt: now() } };
    }
    return { ok: false, error: `Accion GET no soportada: ${action}` };
  }

  async function handlePost(action, body) {
    if (action === "loginStaff") return loginStaff(body);
    if (action === "createFirstBoss") return createFirstBoss(body);

    if (["upsertProduct", "addProduct", "editProduct"].includes(action)) {
      const product = normalizeProduct(body.product || body.producto || body);
      await upsert("products", product, "producto_id");
      return { ok: true, data: { product } };
    }
    if (["upsertExtra", "addExtra", "editExtra"].includes(action)) {
      const extra = normalizeExtra(body.extra || body);
      await upsert("extras", extra, "extra_id");
      return { ok: true, data: { extra } };
    }
    if (action === "deleteProduct") {
      await deactivate("products", "producto_id", body.producto_id || body.product_id);
      return { ok: true, data: { producto_id: body.producto_id || body.product_id } };
    }
    if (action === "deleteExtra") {
      await deactivate("extras", "extra_id", body.extra_id);
      return { ok: true, data: { extra_id: body.extra_id } };
    }
    if (action === "createOrder") {
      const order = normalizeOrder(body.order || body);
      const { data } = await insertOrderCompat(order);
      return { ok: true, data: { order: data || order } };
    }
    if (action === "upsertOperationConfig") {
      const operationConfig = normalizeOperationConfig(body.operationConfig || body.operation_config || body.config || {});
      await upsertSetting("operation_config", operationConfig);
      return { ok: true, data: { operationConfig } };
    }
    if (action === "updateOrderStatus") {
      const { data } = await update("orders", { estado: clean(body.estado) }, "order_id", body.order_id);
      return { ok: true, data: { order: Array.isArray(data) ? data[0] : data } };
    }
    if (action === "bulkUpdateOrderStatus") {
      const ids = Array.isArray(body.order_ids) ? body.order_ids : [];
      await db.from("orders").update({ estado: clean(body.estado) }).in("order_id", ids);
      return { ok: true, data: { updated_ids: ids, missing_ids: [], operation_key: clean(body.operation_key) } };
    }
    if (action === "deleteOrdersRecords") {
      const result = await deleteOrdersRecords(body);
      return { ok: true, data: result };
    }
    if (action === "deleteIncomeRecords") {
      const result = await deleteIncomeRecords(body);
      return { ok: true, data: result };
    }
    if (["upsertTable", "createTable"].includes(action)) {
      const table = normalizeTable(body.table || body);
      await upsert("tables", table, "table_id");
      return { ok: true, data: { table } };
    }
    if (action === "checkoutTable") {
      const table = normalizeTable(body.table || {});
      const payment = normalizePayment(body.payment || body);
      await upsert("payments", payment, "payment_id");
      await upsert("tables", table, "table_id");
      return { ok: true, data: { table, payment } };
    }
    if (action === "cancelTable") {
      const table = normalizeTable(body.table || {});
      await upsert("tables", table, "table_id");
      return { ok: true, data: { table } };
    }
    if (action === "deleteTable") {
      await deactivateOrDeleteTable(body.table_id);
      return { ok: true, data: { table_id: body.table_id } };
    }
    if (action === "upsertInventory") {
      const item = normalizeInventory(body.item || body);
      await upsert("inventory", item, "inventory_id");
      return { ok: true, data: { item } };
    }
    if (action === "recordInventoryMovement") {
      const movement = normalizeInventoryMovement(body.movement || body);
      await upsert("inventory_movements", movement, "movement_id");
      return { ok: true, data: { movement } };
    }
    if (action === "deleteInventory") {
      await deactivate("inventory", "inventory_id", body.inventory_id);
      return { ok: true, data: { inventory_id: body.inventory_id } };
    }
    if (action === "upsertCashier") {
      const cashier = normalizeCashier(body.cashier || body);
      await upsert("cashiers", cashier, "cashier_id");
      return { ok: true, data: { cashier } };
    }
    if (action === "deleteCashier") {
      await deactivate("cashiers", "cashier_id", body.cashier_id);
      return { ok: true, data: { cashier_id: body.cashier_id } };
    }
    if (action === "setup") return { ok: true, data: { message: "Tablas listas en Supabase" } };
    return { ok: false, error: `Accion POST no soportada: ${action}` };
  }

  async function adminData() {
    const [products, extras, orders, tables, payments, inventory, inventoryMovements, cashiers, operationConfig] = await Promise.all([
      rows("products", { order: ["orden", true] }),
      rows("extras", { order: ["orden", true] }),
      rows("orders", { order: ["fecha", false], limit: 300 }),
      rows("tables", { order: ["fecha_apertura", false] }),
      rows("payments", { order: ["fecha", false], limit: 300 }),
      rows("inventory", { order: ["nombre", true] }),
      rows("inventory_movements", { order: ["fecha", false], limit: 200 }),
      rows("cashiers", { order: ["nombre", true] }),
      getSetting("operation_config")
    ]);
    return {
      products,
      extras,
      orders,
      tables,
      payments,
      inventory,
      inventoryMovements,
      cashiers,
      operationConfig,
      kpis: buildKpis(products, orders, tables, payments),
      updatedAt: now()
    };
  }

  async function adminSectionData(section) {
    const data = { updatedAt: now() };
    if (section === "mesas") Object.assign(data, {
      products: await rows("products", { order: ["orden", true] }),
      extras: await rows("extras", { order: ["orden", true] }),
      tables: await rows("tables", { order: ["fecha_apertura", false] }),
      payments: await rows("payments", { order: ["fecha", false], limit: 300 })
    });
    if (section === "resumen") Object.assign(data, {
      orders: await rows("orders", { order: ["fecha", false], limit: 300 }),
      tables: await rows("tables", { order: ["fecha_apertura", false] }),
      payments: await rows("payments", { order: ["fecha", false], limit: 300 })
    });
    if (section === "ordenes") data.orders = await rows("orders", { order: ["fecha", false], limit: 300 });
    if (section === "carta") data.products = await rows("products", { order: ["orden", true] });
    if (section === "extras") data.extras = await rows("extras", { order: ["orden", true] });
    if (section === "inventario") Object.assign(data, {
      inventory: await rows("inventory", { order: ["nombre", true] }),
      inventoryMovements: await rows("inventory_movements", { order: ["fecha", false], limit: 200 })
    });
    if (section === "cajeros") data.cashiers = await rows("cashiers", { order: ["nombre", true] });
    if (section === "banco") data.operationConfig = await getSetting("operation_config");
    return data;
  }

  async function menuData() {
    const [products, extras, operationConfig] = await Promise.all([
      rows("products", { activeOnly: true, order: ["orden", true] }),
      rows("extras", { activeOnly: true, order: ["orden", true] }),
      getSetting("operation_config")
    ]);
    return { products, extras, operationConfig, updatedAt: now() };
  }

  async function loginStaff(body) {
    const correo = clean(body.correo).toLowerCase();
    const clave = clean(body.clave);
    const { data, error } = await db.from("cashiers").select("*").eq("correo", correo).limit(1);
    if (error) throw error;
    const staff = data?.[0];
    if (!staff) throw new Error("El correo no existe o no esta registrado.");
    if (!staff.activo) throw new Error("Usuario inactivo.");
    if (String(staff.clave).trim() !== clave) throw new Error("Contrasena incorrecta.");
    await db.from("cashiers").update({ ultimo_acceso: now() }).eq("cashier_id", staff.cashier_id);
    return { ok: true, data: { token: `supabase:${staff.cashier_id}:${Date.now()}`, user: publicCashier(staff) } };
  }

  async function createFirstBoss(body) {
    if (await hasBoss()) throw new Error("Ya existe un jefe registrado.");
    const cashier = normalizeCashier({
      cashier_id: makeId("cash"),
      nombre: body.nombre || "Jefe principal",
      correo: body.correo,
      clave: body.clave,
      rol: "jefe",
      activo: true,
      ultimo_acceso: now()
    });
    await upsert("cashiers", cashier, "cashier_id");
    return { ok: true, data: { token: `supabase:${cashier.cashier_id}:${Date.now()}`, user: publicCashier(cashier) } };
  }

  async function rows(table, options = {}) {
    let query = db.from(table).select("*");
    if (options.activeOnly) query = query.eq("activo", true);
    if (options.order) query = query.order(options.order[0], { ascending: options.order[1] });
    if (options.limit) query = query.limit(options.limit);
    const { data, error } = await query;
    if (error) throw error;
    const items = Array.isArray(data) ? data.map(fixMojibakeDeep) : [];
    if (table === "tables") return items.filter(item => clean(item.estado).toLowerCase() !== "eliminada");
    return items;
  }

  async function insert(table, item) {
    const { data, error } = await db.from(table).insert(item).select("*").single();
    if (error) throw error;
    return { data };
  }

  async function insertOrderCompat(order) {
    try {
      return await insert("orders", order);
    } catch (error) {
      if (!isMissingOrderColumnError(error)) throw error;
      const legacyOrder = { ...order };
      const systemNotes = [];
      if (legacyOrder.empaque) systemNotes.push(`Empaque: ${legacyOrder.empaque}`);
      if (legacyOrder.barrio) systemNotes.push(`Barrio/zona: ${legacyOrder.barrio}`);
      delete legacyOrder.empaque;
      delete legacyOrder.barrio;
      if (systemNotes.length) {
        legacyOrder.notas = [legacyOrder.notas, systemNotes.join(" | ")].filter(Boolean).join("\n");
      }
      return insert("orders", legacyOrder);
    }
  }

  function isMissingOrderColumnError(error) {
    const text = `${error?.message || ""} ${error?.details || ""} ${error?.hint || ""} ${error?.code || ""}`.toLowerCase();
    return text.includes("orders") &&
      (text.includes("empaque") || text.includes("barrio"));
  }

  async function update(table, patch, key, value) {
    const { data, error } = await db.from(table).update(patch).eq(key, value).select("*");
    if (error) throw error;
    return { data };
  }

  async function upsert(table, item, key) {
    if (!item[key]) item[key] = makeId(key.split("_")[0]);
    const { error } = await db.from(table).upsert(item);
    if (error) throw error;
  }

  async function getSetting(settingKey) {
    const { data, error } = await db.from("business_settings").select("value").eq("setting_key", settingKey).limit(1);
    if (error) {
      console.warn("No se pudo leer configuración", error);
      return readLocalSetting(settingKey);
    }
    return data?.[0]?.value || readLocalSetting(settingKey);
  }

  async function upsertSetting(settingKey, value) {
    const { error } = await db.from("business_settings").upsert({
      setting_key: settingKey,
      value,
      updated_at: now()
    });
    if (error) {
      writeLocalSetting(settingKey, value);
      if (isMissingSettingsTableError(error)) return;
      throw error;
    }
  }

  function readLocalSetting(settingKey) {
    try {
      const settings = JSON.parse(localStorage.getItem(SETTINGS_FALLBACK_KEY) || "{}");
      return settings[settingKey] || {};
    } catch {
      return {};
    }
  }

  function writeLocalSetting(settingKey, value) {
    try {
      const settings = JSON.parse(localStorage.getItem(SETTINGS_FALLBACK_KEY) || "{}");
      settings[settingKey] = value;
      localStorage.setItem(SETTINGS_FALLBACK_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn("No se pudo guardar configuraciÃ³n local", error);
    }
  }

  function isMissingSettingsTableError(error) {
    const text = `${error?.message || ""} ${error?.details || ""} ${error?.code || ""}`.toLowerCase();
    return text.includes("business_settings") && (text.includes("not find") || text.includes("does not exist") || text.includes("schema cache") || text.includes("42p01"));
  }

  async function deactivate(table, key, id) {
    if (!id) throw new Error(`Falta ${key}`);
    const { error } = await db.from(table).update({ activo: false }).eq(key, id);
    if (error) throw error;
  }

  async function deactivateOrDeleteTable(tableId) {
    if (!tableId) throw new Error("Falta table_id");
    const { error } = await db.from("tables").delete().eq("table_id", tableId);
    if (error) throw error;
  }

  async function deleteOrdersRecords(body = {}) {
    const scope = clean(body.scope || "all").toLowerCase();
    const orderIds = arrayOfClean(body.order_ids);
    const statuses = arrayOfClean(body.statuses).map(status => status.toLowerCase());

    if (orderIds.length) {
      const { error } = await db.from("orders").delete().in("order_id", orderIds);
      if (error) throw error;
      return { deleted_order_ids: orderIds };
    }
    if (["all", "todas", "todos"].includes(scope)) {
      await deleteAllRows("orders", "order_id");
      return { deleted_scope: "all" };
    }
    if (statuses.length) {
      const { error } = await db.from("orders").delete().in("estado", statuses);
      if (error) throw error;
      return { deleted_statuses: statuses };
    }
    return { deleted_order_ids: [] };
  }

  async function deleteIncomeRecords(body = {}) {
    const scope = clean(body.scope || "current").toLowerCase();
    const orderIds = arrayOfClean(body.order_ids);
    const paymentIds = arrayOfClean(body.payment_ids);

    if (["all", "orders"].includes(scope) && !orderIds.length) {
      await deleteAllRows("orders", "order_id");
    } else if (orderIds.length) {
      const { error } = await db.from("orders").delete().in("order_id", orderIds);
      if (error) throw error;
    }

    if (["all", "payments"].includes(scope) && !paymentIds.length) {
      await deleteAllRows("payments", "payment_id");
    } else if (paymentIds.length) {
      const { error } = await db.from("payments").delete().in("payment_id", paymentIds);
      if (error) throw error;
    }

    return { deleted_order_ids: orderIds, deleted_payment_ids: paymentIds, deleted_scope: scope };
  }

  async function deleteAllRows(table, key) {
    const { error } = await db.from(table).delete().neq(key, "");
    if (error) throw error;
  }

  async function hasBoss() {
    const cashiers = await rows("cashiers");
    return cashiers.some(user => user.activo && ["jefe", "admin", "administrador"].includes(clean(user.rol).toLowerCase()));
  }

  function buildKpis(products, orders, tables, payments) {
    const todayKey = new Date().toISOString().slice(0, 10);
    const todayOrders = orders.filter(order => String(order.fecha || "").slice(0, 10) === todayKey);
    const todayPayments = payments.filter(payment => String(payment.fecha || "").slice(0, 10) === todayKey);
    const ordersRevenue = orders.reduce((sum, order) => sum + number(order.total), 0);
    const paymentsRevenue = payments.reduce((sum, payment) => sum + number(payment.total), 0);
    return {
      products: products.length,
      activeProducts: products.filter(product => product.activo).length,
      orders: orders.length,
      todayOrders: todayOrders.length + todayPayments.length,
      revenue: ordersRevenue + paymentsRevenue,
      todayRevenue: todayOrders.reduce((sum, order) => sum + number(order.total), 0) + todayPayments.reduce((sum, payment) => sum + number(payment.total), 0),
      pending: orders.filter(order => ["nuevo", "pendiente", "confirmado", "en cocina", "preparando"].includes(clean(order.estado).toLowerCase())).length,
      averageTicket: orders.length ? Math.round(ordersRevenue / orders.length) : 0,
      tableRevenue: paymentsRevenue,
      openTables: tables.length
    };
  }

  function normalizeProduct(product) {
    return {
      producto_id: clean(product.producto_id || product.id || makeId("prod")),
      categoria_id: slug(product.categoria_id || product.category || "general"),
      nombre: required(product.nombre || product.title, "nombre"),
      precio: number(product.precio || product.price),
      descripcion: clean(product.descripcion || product.desc),
      imagen: clean(product.imagen || product.image),
      opciones: normalizeOptions(product.opciones || product.options || product.sizes),
      sabores: normalizeFlavors(flavorSource(product)),
      orden: number(product.orden),
      activo: bool(product.activo)
    };
  }

  function normalizeExtra(extra) {
    return {
      extra_id: clean(extra.extra_id || extra.id || makeId("extra")),
      nombre: required(extra.nombre || extra.name, "nombre"),
      precio: number(extra.precio || extra.price),
      imagen: clean(extra.imagen || extra.image),
      orden: number(extra.orden),
      activo: bool(extra.activo)
    };
  }

  function normalizeOrder(order) {
    return {
      order_id: clean(order.order_id || makeId("ord")),
      cliente: required(order.cliente || order.name, "cliente"),
      telefono: required(order.telefono || order.phone, "telefono"),
      metodo: clean(order.metodo || order.method || "recoger"),
      direccion: clean(order.direccion || order.address),
      pago: clean(order.pago || order.payment),
      subtotal: number(order.subtotal),
      domicilio: number(order.domicilio || order.delivery),
      empaque: number(order.empaque || order.packaging),
      barrio: clean(order.barrio || order.zone),
      total: number(order.total),
      estado: clean(order.estado || "nuevo"),
      notas: clean(order.notas || order.notes),
      items: Array.isArray(order.items) ? order.items : safeJson(order.items, [])
    };
  }

  function normalizeTable(table) {
    return {
      table_id: clean(table.table_id || makeId("mesa")),
      nombre: required(table.nombre || table.table_name, "nombre mesa"),
      estado: clean(table.estado || "abierta"),
      fecha_apertura: clean(table.fecha_apertura || table.fecha || now()),
      fecha_cierre: clean(table.fecha_cierre) || null,
      cajero: clean(table.cajero || "Caja principal"),
      items: Array.isArray(table.items) ? table.items : safeJson(table.items, []),
      total: number(table.total)
    };
  }

  function normalizePayment(payment) {
    return {
      payment_id: clean(payment.payment_id || makeId("pay")),
      table_id: clean(payment.table_id),
      table_name: clean(payment.table_name),
      origen: clean(payment.origen || payment.table_name || "Mesa"),
      fecha: clean(payment.fecha || now()),
      cajero: clean(payment.cajero || "Caja principal"),
      metodo: clean(payment.metodo || payment.metodo_principal || "Efectivo"),
      metodo_principal: clean(payment.metodo_principal || payment.metodo || "Efectivo"),
      metodo_uno: clean(payment.metodo_uno),
      valor_uno: number(payment.valor_uno),
      metodo_dos: clean(payment.metodo_dos),
      valor_dos: number(payment.valor_dos),
      total: number(payment.total),
      estado: clean(payment.estado || "pagado"),
      notas: clean(payment.notas),
      items: Array.isArray(payment.items) ? payment.items : safeJson(payment.items, [])
    };
  }

  function normalizeOperationConfig(config) {
    const deliveryZones = Array.isArray(config.deliveryZones || config.delivery_zones)
      ? (config.deliveryZones || config.delivery_zones)
      : [];
    const paymentMethods = Array.isArray(config.paymentMethods || config.payment_methods)
      ? (config.paymentMethods || config.payment_methods)
      : [];
    const categoryCovers = Array.isArray(config.categoryCovers || config.category_covers)
      ? (config.categoryCovers || config.category_covers)
      : [];
    return {
      packagingFee: number(config.packagingFee ?? config.packaging_fee ?? 1000),
      qrImage: clean(config.qrImage || config.qr_image),
      categoryCovers: categoryCovers.map((cover, index) => ({
        category_id: slug(cover.category_id || cover.categoria_id || cover.id),
        image_url: clean(cover.image_url || cover.imagen || cover.url || cover.image),
        storage_path: clean(cover.storage_path || cover.path),
        orden: number(cover.orden) || index + 1,
        updated_at: clean(cover.updated_at || cover.updatedAt || now())
      })).filter(cover => cover.category_id && cover.image_url),
      deliveryZones: deliveryZones.map((zone, index) => ({
        zone_id: clean(zone.zone_id || zone.id || makeId("zone")),
        nombre: clean(zone.nombre || zone.name),
        aliases: Array.isArray(zone.aliases) ? zone.aliases.map(clean).filter(Boolean) : arrayOfClean(String(zone.aliases || "").split(",")),
        precio: number(zone.precio ?? zone.price),
        activo: bool(zone.activo),
        orden: number(zone.orden) || index + 1
      })).filter(zone => zone.nombre),
      paymentMethods: paymentMethods.map((method, index) => ({
        method_id: clean(method.method_id || method.id || makeId("paymethod")),
        nombre: clean(method.nombre || method.name),
        tipo: clean(method.tipo || method.type || "transferencia").toLowerCase(),
        detalle: clean(method.detalle || method.detail || method.cuenta),
        titular: clean(method.titular || method.owner),
        activo: bool(method.activo),
        orden: number(method.orden) || index + 1
      })).filter(method => method.nombre)
    };
  }

  function normalizeInventory(item) {
    return {
      inventory_id: clean(item.inventory_id || makeId("inv")),
      nombre: required(item.nombre || item.name, "nombre"),
      categoria: clean(item.categoria || "General"),
      cantidad: number(item.cantidad),
      unidad: clean(item.unidad || "unidades"),
      costo: number(item.costo),
      minimo: number(item.minimo),
      activo: bool(item.activo),
      actualizado: clean(item.actualizado || now())
    };
  }

  function normalizeInventoryMovement(movement) {
    return {
      movement_id: clean(movement.movement_id || makeId("mov")),
      inventory_id: clean(movement.inventory_id),
      nombre: clean(movement.nombre || "Insumo"),
      cantidad: number(movement.cantidad),
      unidad: clean(movement.unidad),
      tipo: clean(movement.tipo || "retiro"),
      fecha: clean(movement.fecha || now()),
      usuario: clean(movement.usuario || movement.cajero || "Usuario")
    };
  }

  function normalizeCashier(cashier) {
    return {
      cashier_id: clean(cashier.cashier_id || makeId("cash")),
      nombre: required(cashier.nombre || cashier.name, "nombre"),
      correo: clean(cashier.correo || cashier.email).toLowerCase(),
      clave: clean(cashier.clave || cashier.password || cashier.pin),
      rol: clean(cashier.rol || "cajero").toLowerCase(),
      activo: bool(cashier.activo),
      ultimo_acceso: clean(cashier.ultimo_acceso) || null
    };
  }

  function normalizeOptions(value) {
    if (Array.isArray(value)) return value.map((option, index) => ({
      id: clean(option.id || option.option_id || `opcion-${index + 1}`),
      label: clean(option.label || option.nombre || option.name || `Opcion ${index + 1}`),
      price: number(option.price || option.precio),
      image: clean(option.image || option.imagen)
    }));
    return safeJson(value, []);
  }

  function normalizeFlavors(value) {
    let raw = value;
    if (typeof raw === "string") {
      const text = raw.trim();
      if (!text) return [];
      raw = safeJson(text, text.split(/\n|,|;/));
    }
    if (!Array.isArray(raw)) return [];
    const seen = new Set();
    return raw
      .map(item => clean(item && typeof item === "object"
        ? item.label || item.nombre || item.name || item.sabor
        : item))
      .filter(label => {
        const key = slug(label);
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }

  function flavorSource(product = {}) {
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
    return candidates.find(value => Array.isArray(value) ? value.length > 0 : clean(value)) || "";
  }

  function publicCashier(cashier) {
    return {
      cashier_id: cashier.cashier_id,
      nombre: cashier.nombre,
      correo: cashier.correo,
      rol: cashier.rol,
      activo: cashier.activo,
      ultimo_acceso: cashier.ultimo_acceso
    };
  }

  function jsonResponse(payload, status = 200) {
    return new Response(JSON.stringify(payload), {
      status,
      headers: { "Content-Type": "application/json" }
    });
  }

  function safeJson(value, fallback) {
    if (Array.isArray(value)) return value;
    try {
      const parsed = JSON.parse(String(value || ""));
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }

  function required(value, label) {
    const output = clean(value);
    if (!output) throw new Error(`Falta el campo ${label}`);
    return output;
  }

  function clean(value) {
    return String(value == null ? "" : value).trim();
  }

  function arrayOfClean(value) {
    return Array.isArray(value) ? value.map(clean).filter(Boolean) : [];
  }

  function fixMojibakeDeep(value) {
    if (Array.isArray(value)) return value.map(fixMojibakeDeep);
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, fixMojibakeDeep(item)]));
    }
    return typeof value === "string" ? fixMojibake(value) : value;
  }

  function fixMojibake(value) {
    return String(value)
      .replace(/Descripci�n/g, "Descripción")
      .replace(/Subcategor�a/g, "Subcategoría")
      .replace(/men�/g, "menú")
      .replace(/Lim�n/g, "Limón")
      .replace(/Maracuy�/g, "Maracuyá")
      .replace(/Guan�bana/g, "Guanábana")
      .replace(/carb�n/g, "carbón")
      .replace(/B�falo/g, "Búfalo")
      .replace(/Champi�ones/g, "Champiñones")
      .replace(/Jalape�os/g, "Jalapeños")
      .replace(/tel�fono/g, "teléfono")
      .replace(/�rdenes/g, "órdenes")
      .replace(/A�n/g, "Aún")
      .replace(/qued�/g, "quedó");
  }

  function number(value) {
    if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, Math.round(value));
    const parsed = Number(clean(value).replace(/[^\d-]/g, ""));
    return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : 0;
  }

  function bool(value) {
    if (typeof value === "boolean") return value;
    return !["false", "0", "no", "inactivo", "inactive", "archivado"].includes(clean(value || "true").toLowerCase());
  }

  function slug(value) {
    return clean(value || "general")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "general";
  }

  function makeId(prefix) {
    return `${prefix}-${crypto.randomUUID()}`.toLowerCase();
  }

  function now() {
    return new Date().toISOString();
  }
})();
