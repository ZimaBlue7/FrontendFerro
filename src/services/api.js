const API_URL = import.meta.env.VITE_API_URL;

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

export const productsApi = {
  async list() {
    return unwrapList(await request("/article/all"));
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
    return request("/article/", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
};

export const categoriesApi = {
  async list() {
    return unwrapList(await request("/category/all"));
  },
  create(payload) {
    return request("/category/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  update(payload) {
    return request("/category/", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  remove(id) {
    return request(`/category/?id=${id}`, { method: "DELETE" });
  },
};

export const brandsApi = {
  async list() {
    return unwrapList(await request("/brand/all"));
  },
  create(payload) {
    return request("/brand/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  update(payload) {
    return request("/brand/", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  remove(id) {
    return request(`/brand/?id=${id}`, { method: "DELETE" });
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
