# Phone Accessories - E-commerce Frontend

Ứng dụng web bán phụ kiện điện thoại được xây dựng bằng React, TypeScript, và Vite.

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Cài đặt](#-cài-đặt)
- [Biến môi trường](#-biến-môi-trường)
- [Chạy dự án](#-chạy-dự-án)
- [Scripts](#-scripts)
- [Tính năng](#-tính-năng)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)

## 🎯 Tổng quan

Phone Accessories là một nền tảng thương mại điện tử chuyên cung cấp phụ kiện điện thoại chính hãng. Ứng dụng hỗ trợ:

- 🛒 Mua sắm trực tuyến với giỏ hàng
- 👤 Quản lý tài khoản người dùng
- 📦 Theo dõi đơn hàng
- 🔍 Tìm kiếm và lọc sản phẩm
- 💳 Thanh toán đa phương thức
- 🛡️ Xác thực JWT với refresh token

## 🛠 Công nghệ sử dụng

### Core
- **React 19** - UI Library
- **TypeScript 5.9** - Type Safety
- **Vite 7** - Build Tool & Dev Server

### State Management
- **Redux Toolkit** - State Management
- **Redux Persist** - Persist State to LocalStorage
- **React Redux** - React Bindings

### UI & Styling
- **Ant Design 6** - UI Component Library
- **Tailwind CSS 4** - Utility-first CSS Framework

### Forms & Validation
- **React Hook Form** - Form Management
- **Zod** - Schema Validation
- **@hookform/resolvers** - Integration

### HTTP & API
- **Axios** - HTTP Client
- **Axios Retry** - Automatic Retry

### Routing
- **React Router DOM 7** - Client-side Routing

### Utilities
- **Day.js** - Date Manipulation
- **Lodash** - Utility Functions
- **js-cookie** - Cookie Management
- **jwt-decode** - JWT Decoding
- **Recharts** - Charts & Visualization

## 📁 Cấu trúc dự án

```
src/
├── apis/                 # API service functions
│   ├── auth.ts          # Authentication API
│   ├── cart.ts          # Cart API
│   ├── product.ts       # Product API
│   └── user.ts          # User API
│
├── apps/                 # Redux store configuration
│   ├── hooks.ts         # Typed Redux hooks
│   ├── middleware.ts    # Custom middleware
│   ├── rootReducer.ts   # Root reducer
│   └── store.ts         # Store configuration
│
├── assets/              # Static assets (images, fonts)
│
├── components/          # Reusable components
│   ├── common/          # Common UI components
│   │   ├── ButtonCommon.tsx
│   │   ├── LoaderCommon.tsx
│   │   └── ModalCommon.tsx
│   └── layout/          # Layout components
│       ├── FooterLayout.tsx
│       ├── HeaderLayout.tsx
│       └── SidebarLayout.tsx
│
├── configs/             # App configuration
│   └── env.ts           # Environment variables
│
├── constants/           # Constants & enums
│   └── constant.ts      # App constants
│
├── features/            # Redux feature slices
│   ├── auth/            # Authentication feature
│   │   ├── authSlices.ts
│   │   ├── authThunks.ts
│   │   └── authTypes.ts
│   ├── order/           # Order feature
│   │   ├── orderSlices.ts
│   │   ├── orderThunks.ts
│   │   └── orderTypes.ts
│   ├── product/         # Product feature
│   │   ├── productSlices.ts
│   │   ├── productThunks.ts
│   │   └── productTypes.ts
│   └── user/            # User feature
│       ├── userSlices.ts
│       ├── userThunks.ts
│       └── userTypes.ts
│
├── hooks/               # Custom React hooks
│   ├── useAuth.ts       # Authentication hook
│   ├── useDebounce.ts   # Debounce hook
│   ├── useOrder.ts      # Order management hook
│   ├── useProduct.ts    # Product management hook
│   └── useUser.ts       # User management hook
│
├── pages/               # Page components
│   ├── Cart.tsx         # Shopping cart page
│   ├── Home.tsx         # Home page
│   └── Login.tsx        # Login page
│
├── routes/              # Routing configuration
│   └── route.ts         # Route definitions
│
├── services/            # External services
│   └── apiClient.ts     # Axios instance & interceptors
│
├── types/               # TypeScript type definitions
│   ├── api.ts           # API response types
│   ├── common.ts        # Common types
│   └── pagination.ts    # Pagination types
│
├── utils/               # Utility functions
│   ├── formatCurrency.ts # Currency formatting
│   ├── storage.ts       # Storage utilities
│   └── validator.ts     # Form validation schemas
│
├── App.tsx              # Root component
├── App.css              # Global styles
├── main.tsx             # Entry point
└── index.css            # Tailwind imports
```

## 🚀 Cài đặt

### Yêu cầu hệ thống

- Node.js >= 18.x
- npm >= 9.x hoặc yarn >= 1.22.x

### Bước 1: Clone repository

```bash
git clone https://github.com/your-username/phone-accessories-fe.git
cd phone-accessories-fe
```

### Bước 2: Cài đặt dependencies

```bash
npm install
# hoặc
yarn install
```

### Bước 3: Cấu hình môi trường

```bash
cp .env.example .env
```

Chỉnh sửa file `.env` với các giá trị phù hợp.

## 🔐 Biến môi trường

Tạo file `.env` ở thư mục gốc với nội dung:

```env
# API Configuration
VITE_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=Phone Accessories
```

| Biến | Mô tả | Bắt buộc |
|------|-------|----------|
| `VITE_BASE_URL` | URL của Backend API | ✅ |
| `VITE_APP_NAME` | Tên ứng dụng | ❌ |

## 💻 Chạy dự án

### Development mode

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

### Production build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## 📜 Scripts

| Script | Mô tả |
|--------|-------|
| `npm run dev` | Chạy development server |
| `npm run build` | Build production với type checking |
| `npm run typecheck` | Kiểm tra TypeScript |
| `npm run lint` | Chạy ESLint |
| `npm run preview` | Preview production build |

## ✨ Tính năng

### Authentication
- ✅ Đăng nhập / Đăng ký
- ✅ JWT với Refresh Token
- ✅ Persistent login state
- ✅ Protected routes

### Products
- ✅ Danh sách sản phẩm với phân trang
- ✅ Lọc theo danh mục, giá, brand
- ✅ Tìm kiếm sản phẩm
- ✅ Chi tiết sản phẩm

### Shopping Cart
- ✅ Thêm/Xóa sản phẩm
- ✅ Cập nhật số lượng
- ✅ Tính tổng tiền

### Orders
- ✅ Tạo đơn hàng
- ✅ Lịch sử đơn hàng
- ✅ Chi tiết đơn hàng
- ✅ Hủy đơn hàng

### User Profile
- ✅ Xem thông tin cá nhân
- ✅ Cập nhật profile
- ✅ Đổi mật khẩu
- ✅ Quản lý địa chỉ

## 📡 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Endpoints

#### Authentication
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/auth/login` | Đăng nhập |
| POST | `/auth/register` | Đăng ký |
| POST | `/auth/logout` | Đăng xuất |
| POST | `/auth/refresh-token` | Refresh token |

#### Products
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/products` | Danh sách sản phẩm |
| GET | `/products/:id` | Chi tiết sản phẩm |
| GET | `/products/categories` | Danh sách danh mục |
| GET | `/products/search` | Tìm kiếm sản phẩm |

#### Cart
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/cart` | Lấy giỏ hàng |
| POST | `/cart/add` | Thêm vào giỏ |
| PUT | `/cart/update` | Cập nhật số lượng |
| DELETE | `/cart/remove/:id` | Xóa sản phẩm |

#### Orders
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/orders` | Danh sách đơn hàng |
| GET | `/orders/:id` | Chi tiết đơn hàng |
| POST | `/orders` | Tạo đơn hàng |
| PUT | `/orders/:id/cancel` | Hủy đơn hàng |

## 🎨 Quy ước code

### Naming Convention
- **Components**: PascalCase (e.g., `ButtonCommon.tsx`)
- **Hooks**: camelCase với prefix "use" (e.g., `useAuth.ts`)
- **Utils**: camelCase (e.g., `formatCurrency.ts`)
- **Types**: PascalCase (e.g., `AuthState`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `API_ENDPOINTS`)

### File Structure
- Mỗi feature có thư mục riêng chứa: slices, thunks, types
- Components được tổ chức theo chức năng (common, layout)
- Hooks tái sử dụng đặt trong `/hooks`

### Import Order
1. React imports
2. Third-party imports
3. Absolute imports (using `@/` alias)
4. Relative imports
5. Type imports

## 🤝 Contributing

1. Fork repository
2. Tạo branch mới: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add some feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Tạo Pull Request

### Commit Convention

Sử dụng [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: thêm tính năng mới
fix: sửa lỗi
docs: cập nhật documentation
style: format code
refactor: refactor code
test: thêm tests
chore: cập nhật config
```

## 📄 License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 👥 Team

- **SDN302 Team** - *Development*

---

Made with ❤️ by SDN302 Team
