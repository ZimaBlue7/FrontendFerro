const API_URL = import.meta.env.VITE_API_URL;

const PRODUCT_OVERRIDES_KEY = "ferroelectricos_product_overrides";
const PRODUCT_CREATED_KEY = "ferroelectricos_product_created";
const CATEGORY_CHANGES_KEY = "ferroelectricos_category_changes";
const BRAND_CHANGES_KEY = "ferroelectricos_brand_changes";

const unwrapList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || "No se pudo completar la solicitud.");
  }

  return data;
};

export const storage = {
  get(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
};

const applyProductOverrides = (products) => {
  const overrides = storage.get(PRODUCT_OVERRIDES_KEY, {});
  const created = storage.get(PRODUCT_CREATED_KEY, []);
  const merged = products.map((product) => ({
    ...product,
    ...(overrides[product.id] || {}),
  }));

  created.forEach((product) => {
    if (!merged.some((item) => String(item.id) === String(product.id))) {
      merged.unshift({
        ...product,
        ...(overrides[product.id] || {}),
      });
    }
  });

  return merged;
};

const getEntityChanges = (key) =>
  storage.get(key, {
    created: [],
    updated: {},
    deleted: [],
  });

const saveEntityChanges = (key, changes) => storage.set(key, changes);

const createLocalId = () => -Date.now();

const applyEntityChanges = (items, key) => {
  const changes = getEntityChanges(key);
  const deleted = new Set(changes.deleted.map(String));
  const merged = items
    .filter((item) => !deleted.has(String(item.id)))
    .map((item) => ({
      ...item,
      ...(changes.updated[item.id] || {}),
    }));

  changes.created.forEach((item) => {
    if (!deleted.has(String(item.id)) && !merged.some((current) => String(current.id) === String(item.id))) {
      merged.unshift({
        ...item,
        ...(changes.updated[item.id] || {}),
      });
    }
  });

  return merged;
};

const saveLocalCreate = (key, payload) => {
  const changes = getEntityChanges(key);
  const item = {
    ...payload,
    id: payload.id && payload.id !== 0 ? payload.id : createLocalId(),
    localOnly: true,
  };

  saveEntityChanges(key, {
    ...changes,
    created: [item, ...changes.created],
  });

  return item;
};

const saveLocalUpdate = (key, payload) => {
  const changes = getEntityChanges(key);
  const created = changes.created.map((item) =>
    String(item.id) === String(payload.id) ? { ...item, ...payload, localOnly: true } : item
  );

  saveEntityChanges(key, {
    ...changes,
    created,
    updated: {
      ...changes.updated,
      [payload.id]: { ...payload, localOnly: true },
    },
  });

  return { ...payload, localOnly: true };
};

const saveLocalDelete = (key, id) => {
  const changes = getEntityChanges(key);

  saveEntityChanges(key, {
    ...changes,
    created: changes.created.filter((item) => String(item.id) !== String(id)),
    deleted: Array.from(new Set([...changes.deleted.map(String), String(id)])),
  });
};

export const productOverrides = {
  getAll() {
    return storage.get(PRODUCT_OVERRIDES_KEY, {});
  },
  create(values) {
    const created = storage.get(PRODUCT_CREATED_KEY, []);
    const product = {
      ...values,
      id: values.id && values.id !== 0 ? values.id : createLocalId(),
      localOnly: true,
    };

    storage.set(PRODUCT_CREATED_KEY, [product, ...created]);
    return product;
  },
  set(productId, values) {
    const overrides = storage.get(PRODUCT_OVERRIDES_KEY, {});
    storage.set(PRODUCT_OVERRIDES_KEY, {
      ...overrides,
      [productId]: {
        ...(overrides[productId] || {}),
        ...values,
      },
    });
  },
};

export const productsApi = {
  async list() {
    return applyProductOverrides(unwrapList(await request("/article/all")));
  },
  get(id) {
    return request(`/article/?id=${id}`);
  },
  create(payload) {
    return request("/article/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  update(payload) {
    return request(`/article/?id=${payload.id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
};

export const categoriesApi = {
  async list() {
    return applyEntityChanges(unwrapList(await request("/category/all")), CATEGORY_CHANGES_KEY);
  },
  async create(payload) {
    try {
      return await request("/category/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch {
      return saveLocalCreate(CATEGORY_CHANGES_KEY, payload);
    }
  },
  async update(payload) {
    try {
      return await request(`/category/?id=${payload.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    } catch {
      return saveLocalUpdate(CATEGORY_CHANGES_KEY, payload);
    }
  },
  async remove(id) {
    try {
      return await request(`/category/?id=${id}`, { method: "DELETE" });
    } catch {
      saveLocalDelete(CATEGORY_CHANGES_KEY, id);
      return { status: "local", id };
    }
  },
};

export const brandsApi = {
  async list() {
    return applyEntityChanges(unwrapList(await request("/brand/all")), BRAND_CHANGES_KEY);
  },
  async create(payload) {
    try {
      return await request("/brand/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch {
      return saveLocalCreate(BRAND_CHANGES_KEY, payload);
    }
  },
  async update(payload) {
    try {
      return await request(`/brand/?id=${payload.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    } catch {
      return saveLocalUpdate(BRAND_CHANGES_KEY, payload);
    }
  },
  async remove(id) {
    try {
      return await request(`/brand/?id=${id}`, { method: "DELETE" });
    } catch {
      saveLocalDelete(BRAND_CHANGES_KEY, id);
      return { status: "local", id };
    }
  },
};

export const articleSalesApi = {
  async list({ start = "2020-01-01T00:00:00", end = "2035-12-31T23:59:59" } = {}) {
    const params = new URLSearchParams({ start, end });
    return unwrapList(await request(`/article_sale/all?${params.toString()}`));
  },
  get(id) {
    return request(`/article_sale/?id=${id}`);
  },
  create(payload) {
    return request("/article_sale/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  remove(id) {
    return request(`/article_sale/?id=${id}`, { method: "DELETE" });
  },
};

export const authApi = {
  async login({ email, password }) {
    const candidates = ["/auth/login", "/login", "/user/login"];

    for (const path of candidates) {
      try {
        return await request(path, {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
      } catch (error) {
        if (path === candidates.at(-1)) throw error;
      }
    }
  },
};
