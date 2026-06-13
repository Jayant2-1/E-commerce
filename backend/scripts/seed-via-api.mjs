import fs from 'node:fs/promises';
import path from 'node:path';

const apiBase = process.env.API_BASE ?? 'http://localhost:8080';
const setupKey = process.env.ADMIN_BOOTSTRAP_KEY;
const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@ecommerce.local';
const adminPassword = process.env.ADMIN_PASSWORD;
const usersCount = Number(process.env.USERS_COUNT ?? '10');
const productsFile = process.env.PRODUCTS_FILE ?? path.resolve(process.cwd(), '..', 'products_100.json');
const outputCredentials = process.env.CREDENTIALS_OUT ?? path.resolve(process.cwd(), 'docs', 'seeded-users.json');

if (!setupKey) {
  throw new Error('Missing ADMIN_BOOTSTRAP_KEY env var');
}
if (!adminPassword) {
  throw new Error('Missing ADMIN_PASSWORD env var');
}

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function randomPassword(prefix) {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}${random}A1!`;
}

async function apiFetch(url, options = {}) {
  const response = await fetch(`${apiBase}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  const raw = await response.text();
  let body = {};
  try {
    body = raw ? JSON.parse(raw) : {};
  } catch {
    body = { message: raw };
  }

  if (!response.ok) {
    const msg = body?.message ?? body?.error ?? `HTTP ${response.status}`;
    throw new Error(`${url} failed: ${msg}`);
  }

  return body;
}

async function registerAdmin() {
  const payload = {
    fullName: 'Platform Admin',
    email: adminEmail,
    password: adminPassword,
    phone: '9999999999',
  };

  try {
    await apiFetch('/api/v1/auth/register-admin', {
      method: 'POST',
      headers: { 'X-Admin-Setup-Key': setupKey },
      body: JSON.stringify(payload),
    });
    console.log('Admin created via API');
  } catch (error) {
    if (!String(error.message).includes('already registered')) {
      throw error;
    }
    console.log('Admin already exists, continuing');
  }
}

async function login(email, password) {
  const response = await apiFetch('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  return response.data;
}

async function createCategories(adminToken, products) {
  const categoryNames = [...new Set(products.map((p) => p.category))].slice(0, 10);
  const headers = { Authorization: `Bearer ${adminToken}` };

  for (const categoryName of categoryNames) {
    const slug = slugify(categoryName);
    try {
      await apiFetch('/api/v1/admin/categories', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: categoryName,
          slug,
          description: `${categoryName} products`,
          imageUrl: null,
          parentId: null,
        }),
      });
    } catch (error) {
      if (!String(error.message).includes('already exists')) {
        throw error;
      }
    }
  }

  const treeResponse = await apiFetch('/api/v1/categories/tree');
  const map = new Map();
  for (const category of treeResponse.data) {
    map.set(category.name, category.id);
  }

  console.log(`Categories ready: ${map.size}`);
  return map;
}

async function createProducts(adminToken, products, categoryIdMap) {
  const headers = { Authorization: `Bearer ${adminToken}` };
  let created = 0;

  for (const [index, product] of products.entries()) {
    const categoryId = categoryIdMap.get(product.category);
    if (!categoryId) continue;

    const slugBase = slugify(product.name);
    const slug = `${slugBase}-${index + 1}`;
    const sku = `SKU-${String(index + 1).padStart(5, '0')}`;

    try {
      await apiFetch('/api/v1/admin/products', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: product.name,
          slug,
          description: `${product.name} in ${product.category}`,
          price: Number(product.price),
          discountPrice: null,
          active: true,
          brand: product.category,
          sku,
          categoryId,
          imageUrls: [],
          stockQuantity: Number(product.quantity),
          lowStockThreshold: 5,
        }),
      });
      created += 1;
    } catch (error) {
      if (!String(error.message).includes('already exists')) {
        throw error;
      }
    }
  }

  console.log(`Products processed: ${products.length}, created new: ${created}`);
}

async function createUsersAndValidateCarts(products) {
  const credentials = [];
  const cartIds = new Set();

  for (let i = 1; i <= usersCount; i += 1) {
    const email = `user${i}@ecommerce.local`;
    const password = randomPassword(`User${i}-`);

    try {
      await apiFetch('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: `User ${i}`,
          email,
          password,
          phone: `9000000${String(i).padStart(3, '0')}`,
        }),
      });
      credentials.push({ email, password });
      console.log(`User created: ${email}`);
    } catch (error) {
      if (!String(error.message).includes('already registered')) {
        throw error;
      }
      credentials.push({ email, password: null });
      console.log(`User exists: ${email}`);
    }
  }

  const searchable = await apiFetch('/api/v1/products/search?page=0&size=100');
  const productIds = (searchable.data?.content ?? []).map((p) => p.id);

  for (const user of credentials) {
    if (!user.password) {
      console.log(`Skipping cart validation for existing user ${user.email} (password unknown)`);
      continue;
    }

    const session = await login(user.email, user.password);
    const authHeader = { Authorization: `Bearer ${session.accessToken}` };

    const pick = productIds[Math.floor(Math.random() * productIds.length)];
    if (pick) {
      await apiFetch('/api/v1/cart/items', {
        method: 'POST',
        headers: authHeader,
        body: JSON.stringify({ productId: pick, quantity: 1 }),
      });
    }

    const cartResponse = await apiFetch('/api/v1/cart', { headers: authHeader });
    const cartId = cartResponse.data?.id;
    if (!cartId) {
      throw new Error(`No cart found for ${user.email}`);
    }
    if (cartIds.has(cartId)) {
      throw new Error(`Duplicate cart detected: ${cartId}`);
    }
    cartIds.add(cartId);
  }

  await fs.mkdir(path.dirname(outputCredentials), { recursive: true });
  await fs.writeFile(outputCredentials, JSON.stringify({ adminEmail, adminPassword, users: credentials }, null, 2));
  console.log(`Credentials written to ${outputCredentials}`);
  console.log(`Validated unique carts for ${cartIds.size} newly-created users.`);
}

async function main() {
  const raw = await fs.readFile(productsFile, 'utf8');
  const products = JSON.parse(raw).slice(0, 100);

  await registerAdmin();
  const adminSession = await login(adminEmail, adminPassword);
  const categoryMap = await createCategories(adminSession.accessToken, products);
  await createProducts(adminSession.accessToken, products, categoryMap);
  await createUsersAndValidateCarts(products);

  console.log('API-only seeding completed successfully.');
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
