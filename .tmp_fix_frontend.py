from pathlib import Path

root = Path('/Users/apple/Deployed/E-commerce')

# App shell
path = root / 'frontend/src/App.jsx'
text = path.read_text()
text = text.replace("import { CartProvider } from './context/CartContext.jsx';\n", "import { CartProvider } from './context/CartContext.jsx';\nimport { ThemeProvider } from './context/ThemeContext.jsx';\n")
text = text.replace("    <BrowserRouter>\n      <AuthProvider>\n        <CartProvider>\n          <AppRoutes />\n        </CartProvider>\n      </AuthProvider>\n    </BrowserRouter>", "    <BrowserRouter>\n      <ThemeProvider>\n        <AuthProvider>\n          <CartProvider>\n            <AppRoutes />\n          </CartProvider>\n        </AuthProvider>\n      </ThemeProvider>\n    </BrowserRouter>")
path.write_text(text)

# User layout
path = root / 'frontend/src/layouts/UserLayout/index.jsx'
text = path.read_text()
text = text.replace("import { ShoppingCart, User, LogOut } from 'lucide-react';\n", "import { ShoppingCart, User, LogOut } from 'lucide-react';\nimport ThemeToggle from '../../components/common/ThemeToggle';\n")
text = text.replace("            <Link to=\"/cart\" className={styles.iconLink}>\n              <ShoppingCart size={20} />\n            </Link>\n            {user ? (", "            <Link to=\"/cart\" className={styles.iconLink}>\n              <ShoppingCart size={20} />\n            </Link>\n            <ThemeToggle compact />\n            {user ? (")
path.write_text(text)

# Admin layout
path = root / 'frontend/src/layouts/AdminLayout/index.jsx'
text = path.read_text()
text = text.replace("import { LayoutDashboard, Package, ShoppingBag, Users, Tag, LogOut, Menu } from 'lucide-react';\n", "import { LayoutDashboard, Package, ShoppingBag, Users, Tag, LogOut, Menu } from 'lucide-react';\nimport ThemeToggle from '../../components/common/ThemeToggle';\n")
text = text.replace("          <div className={styles.topbarRight}>\n            <span className={styles.adminGreeting}>Hello, {user?.name || 'Admin'}</span>\n            <Link to=\"/\" className={styles.storefrontLink}>View Storefront</Link>\n          </div>", "          <div className={styles.topbarRight}>\n            <ThemeToggle compact />\n            <span className={styles.adminGreeting}>Hello, {user?.name || 'Admin'}</span>\n            <Link to=\"/\" className={styles.storefrontLink}>View Storefront</Link>\n          </div>")
path.write_text(text)

# theme tokens
path = root / 'frontend/src/styles/design-tokens.css'
text = path.read_text()
text = text.replace("  --color-surface-glass-border: rgba(255, 255, 255, 0.4);\n", "  --color-surface-glass-border: rgba(255, 255, 255, 0.4);\n  --color-surface: #FFFFFF;\n  --border-color: rgba(15, 23, 42, 0.12);\n  --shadow-sm: 0 4px 12px rgba(15, 23, 42, 0.08);\n")
text = text.replace("  --color-surface-glass-border: rgba(255, 255, 255, 0.08);\n  --color-text-primary: #F8FAFC;\n", "  --color-surface-glass-border: rgba(255, 255, 255, 0.08);\n  --color-surface: rgba(15, 23, 42, 0.88);\n  --border-color: rgba(148, 163, 184, 0.22);\n  --shadow-sm: 0 4px 12px rgba(0, 0, 0, 0.28);\n  --color-text-primary: #F8FAFC;\n")
path.write_text(text)

# global styles
path = root / 'frontend/src/styles/global.css'
text = path.read_text()
text = text.replace("  min-height: 100vh;\n}\n", "  min-height: 100vh;\n  transition: background var(--transition-normal), color var(--transition-normal);\n}\n\nbody.dark-mode {\n  color-scheme: dark;\n}\n")
path.write_text(text)

# API client
path = root / 'frontend/src/api/client.js'
path.write_text("import axios from 'axios';\n\nconst client = axios.create({\n  baseURL: '/api/v1',\n  headers: {\n    'Content-Type': 'application/json',\n  },\n});\n\nclient.interceptors.request.use(\n  (config) => {\n    const token = localStorage.getItem('token');\n    if (token) {\n      config.headers.Authorization = `Bearer ${token}`;\n    }\n    return config;\n  },\n  (error) => Promise.reject(error)\n);\n\nclient.interceptors.response.use(\n  (response) => response,\n  (error) => {\n    if (error.response && error.response.status === 401) {\n      localStorage.removeItem('token');\n    }\n    return Promise.reject(error);\n  }\n);\n\nexport default client;\n")

# Product service
path = root / 'frontend/src/api/services/product.service.js'
path.write_text("import client from '../client';\n\nexport const productService = {\n  getAllProducts: async (params) => {\n    const response = await client.get('/products/search', { params });\n    return response.data;\n  },\n\n  getProductById: async (id) => {\n    const response = await client.get(`/products/${id}`);\n    return response.data;\n  },\n\n  getCategories: async () => {\n    const response = await client.get('/categories/tree');\n    return response.data;\n  },\n\n  searchProducts: async (params) => {\n    const response = await client.get('/products/search', { params });\n    return response.data;\n  },\n\n  getFeaturedProducts: async (limit = 10) => {\n    const response = await client.get('/products/featured', { params: { limit } });\n    return response.data;\n  },\n};\n")
