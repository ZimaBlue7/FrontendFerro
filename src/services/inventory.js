import { articleSalesApi, productOverrides, productsApi, storage } from "./api";

export const PRODUCT_META_KEY = "ferroelectricos_product_meta";
export const ALERTS_KEY = "ferroelectricos_stock_alerts";
export const MOVEMENTS_KEY = "ferroelectricos_stock_movements";
export const PRE_SALES_KEY = "ferroelectricos_pre_sales";
export const CART_KEY = "ferroelectricos_presale_cart";

export const getProductMeta = () => storage.get(PRODUCT_META_KEY, {});

export const saveProductMeta = (meta) => storage.set(PRODUCT_META_KEY, meta);

export const getMinimumStock = (product, meta = getProductMeta()) =>
  Number(
    product.minimumStock ??
      product.minStock ??
      product.stockMinimo ??
      meta[product.id]?.minimumStock ??
      5
  );

export const isInactive = (product, meta = getProductMeta()) =>
  Boolean(product.active === false || product.status === "INACTIVE" || meta[product.id]?.inactive);

export const getProductCategories = (product) => product.categories || product.categoryList || [];

export const getProviderName = (product) =>
  product.brand?.name || product.provider?.name || product.supplier?.name || "Sin proveedor";

export const formatCurrency = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const getUserName = () => {
  const session = storage.get("ferroelectricos_session", null);
  return session?.name || session?.email || "Usuario local";
};

export const getUserId = () => {
  const session = storage.get("ferroelectricos_session", null);
  return Number(session?.id || session?.userId || 2);
};

export const generateCode = (prefix) =>
  `${prefix}-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase()}`;

export const getAlerts = () => storage.get(ALERTS_KEY, []);

export const saveAlerts = (alerts) => storage.set(ALERTS_KEY, alerts);

export const syncStockAlerts = (products) => {
  const meta = getProductMeta();
  const alerts = getAlerts();
  const now = new Date().toISOString();
  const nextAlerts = [...alerts];

  products.forEach((product) => {
    const stock = Number(product.stock || 0);
    const minimumStock = getMinimumStock(product, meta);

    if (isInactive(product, meta) || stock > minimumStock) return;

    const unresolved = nextAlerts.some(
      (alert) => String(alert.productId) === String(product.id) && alert.status !== "Resuelta"
    );

    if (!unresolved) {
      nextAlerts.unshift({
        id: generateCode("ALT"),
        productId: product.id,
        productName: product.name,
        stockPrevious: stock,
        stockCurrent: stock,
        minimumStock,
        provider: getProviderName(product),
        reason: "Stock igual o inferior al minimo configurado",
        status: "Activa",
        user: "Sistema",
        createdAt: now,
        updatedAt: now,
      });
    }
  });

  saveAlerts(nextAlerts);
  return nextAlerts;
};

export const changeAlertStatus = (alertId, status) => {
  const now = new Date().toISOString();
  const alerts = getAlerts().map((alert) =>
    alert.id === alertId
      ? {
          ...alert,
          status,
          updatedAt: now,
          handledBy: getUserName(),
        }
      : alert
  );

  saveAlerts(alerts);
  return alerts;
};

export const getMovements = () => storage.get(MOVEMENTS_KEY, []);

export const saveMovement = (movement) => {
  const movements = getMovements();
  storage.set(MOVEMENTS_KEY, [movement, ...movements]);
};

export const registerStockMovement = async ({ product, quantity, type, reason }) => {
  const stockBefore = Number(product.stock || 0);
  const delta = type === "Entrada" ? Number(quantity) : -Number(quantity);
  const stockAfter = stockBefore + delta;

  const movement = {
    id: generateCode("MOV"),
    productId: product.id,
    productName: product.name,
    type,
    quantity: Number(quantity),
    reason: reason.trim(),
    stockBefore,
    stockAfter,
    user: getUserName(),
    createdAt: new Date().toISOString(),
  };

  productOverrides.set(product.id, { stock: stockAfter });
  saveMovement(movement);

  const payload = {
    id: product.id,
    name: product.name,
    description: product.description || "",
    stock: stockAfter,
    price: Number(product.price || 0),
    brandId: Number(product.brand?.id || product.brandId || 0),
    categoryIds: getProductCategories(product).map((category) => category.id),
  };

  try {
    await productsApi.update(payload);
  } catch {
    const movements = getMovements().map((item) =>
      item.id === movement.id ? { ...item, synced: false } : item
    );
    storage.set(MOVEMENTS_KEY, movements);
  }

  return movement;
};

export const getCart = () => storage.get(CART_KEY, []);

export const saveCart = (cart) => storage.set(CART_KEY, cart);

export const addToCart = (product) => {
  const cart = getCart();
  const current = cart.find((item) => String(item.productId) === String(product.id));
  const nextCart = current
    ? cart.map((item) =>
        String(item.productId) === String(product.id)
          ? { ...item, quantity: Math.min(item.quantity + 1, Number(product.stock || 1)) }
          : item
      )
    : [
        ...cart,
        {
          productId: product.id,
          name: product.name,
          price: Number(product.price || 0),
          stock: Number(product.stock || 0),
          quantity: 1,
        },
      ];

  saveCart(nextCart);
  return nextCart;
};

export const updateCartItem = (productId, quantity) => {
  const nextCart = getCart()
    .map((item) =>
      String(item.productId) === String(productId)
        ? { ...item, quantity: Math.max(1, Math.min(Number(quantity || 1), item.stock)) }
        : item
    )
    .filter((item) => item.quantity > 0);

  saveCart(nextCart);
  return nextCart;
};

export const removeCartItem = (productId) => {
  const nextCart = getCart().filter((item) => String(item.productId) !== String(productId));
  saveCart(nextCart);
  return nextCart;
};

export const createPreSale = async (customer, cart) => {
  const saleDate = new Date().toISOString().slice(0, 19);
  const preSale = {
    id: generateCode("PRE"),
    customer,
    items: cart,
    total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    status: "Nueva",
    createdAt: saleDate,
    synced: true,
  };

  const backendSales = cart.map((item) => ({
    id: 0,
    idUser: getUserId(),
    idArticle: Number(item.productId),
    name: item.name,
    saleDate,
    amount: Number(item.quantity),
    unitPrice: Number(item.price),
  }));

  try {
    await Promise.all(backendSales.map((sale) => articleSalesApi.create(sale)));
  } catch {
    preSale.synced = false;
  }

  storage.set(PRE_SALES_KEY, [preSale, ...storage.get(PRE_SALES_KEY, [])]);
  saveCart([]);
  return preSale;
};

export const getPreSales = () => storage.get(PRE_SALES_KEY, []);

export const getBackendSales = () => articleSalesApi.list();
