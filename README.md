# 📊 BẢN TÓM TẮT CẤU TRÚC DỰ ÁN ECOMMERCE

## 1. 📁 CẤU TRÚC CỎ CÂY THƯ MỤC

### Backend
```
backend/
├── src/main/java/com/tientoan21/
│   ├── ComApplication.java (Main entry point)
│   ├── config/
│   │   ├── CustomUserDetailsService.java
│   │   ├── JwtUtils.java
│   │   └── UserDetail.java
│   ├── controller/ (7 controllers)
│   │   ├── AuthController.java
│   │   ├── ProductController.java
│   │   ├── CartController.java
│   │   ├── OrderController.java
│   │   ├── UserController.java
│   │   ├── AddressController.java
│   │   └── ReviewController.java
│   ├── dto/
│   │   ├── request/ (13 request DTOs)
│   │   │   ├── LoginRequest, RegisterRequest
│   │   │   ├── ProductRequest, CartRequest
│   │   │   ├── OrderRequest, ReviewRequest
│   │   │   └── ...
│   │   └── response/ (13 response DTOs)
│   │       ├── TokenResponse, UserResponse
│   │       ├── ProductResponse, CartResponse
│   │       ├── OrderResponse, ReviewResponse
│   │       └── ...
│   ├── entity/ (12 JPA entities)
│   │   ├── User.java
│   │   ├── Product.java
│   │   ├── Category.java
│   │   ├── Cart.java, CartItem.java
│   │   ├── Order.java, OrderItem.java
│   │   ├── Payment.java
│   │   ├── Review.java
│   │   ├── Address.java
│   │   ├── RefreshToken.java
│   │   └── BaseEntity.java (superclass)
│   ├── enums/ (5 enum classes)
│   │   ├── UserRole.java
│   │   ├── OrderStatus.java
│   │   ├── PaymentStatus.java
│   │   ├── PaymentMethod.java
│   │   └── ErrorCode.java
│   ├── exception/ (Custom exceptions)
│   ├── mapper/ (MapStruct mappers)
│   ├── repository/ (11 Spring Data repositories)
│   │   ├── UserRepository, ProductRepository
│   │   ├── CartRepository, OrderRepository
│   │   ├── ReviewRepository, etc.
│   ├── security/ (3 security configurations)
│   │   ├── CorsConfig.java
│   │   ├── JwtAuthFilter.java
│   │   └── SecurityConfig.java
│   ├── service/ (9 business services)
│   │   ├── AuthService, UserService
│   │   ├── ProductService, CartService
│   │   ├── OrderService, ReviewService
│   │   └── ...
│   └── specification/ (JPA Specifications for filtering)
├── src/main/resources/
│   ├── application.yml (Configuration)
│   ├── db/migration/ (Flyway migration scripts)
│   ├── static/, templates/
├── pom.xml (Maven config)
├── Dockerfile
└── target/ (Build output)
```

### Frontend
```
frontend/
├── src/
│   ├── components/ (2 reusable UI components)
│   │   ├── Header.tsx
│   │   └── ProductCard.tsx
│   ├── hooks/ (Custom React hooks)
│   │   ├── useCart.ts
│   │   └── useProducts.ts
│   ├── layouts/ (Page layout wrappers)
│   │   ├── AdminLayout.tsx
│   │   └── MainLayout.tsx
│   ├── pages/ (Page components)
│   │   ├── Home.tsx
│   │   └── product/
│   │       ├── ProductListPage.tsx
│   │       └── ProductDetail.tsx
│   ├── services/ (API client services)
│   │   ├── api.ts (Axios instance, base config)
│   │   ├── auth.ts (auth endpoints)
│   │   ├── product.ts (product endpoints)
│   │   ├── cart.ts (cart endpoints)
│   │   ├── order.ts (order endpoints)
│   │   ├── user.ts (user endpoints)
│   │   ├── address.ts (address endpoints)
│   │   └── review.ts (review endpoints)
│   ├── types/ (TypeScript type definitions)
│   │   ├── user.ts, product.ts
│   │   ├── cart.ts, order.ts
│   │   ├── apiresponse.ts
│   │   └── ...
│   ├── utils/ (Utility functions)
│   │   └── format.ts
│   ├── styles/ (Global styles)
│   ├── assets/ (Images, icons, etc.)
│   ├── App.tsx (Root component)
│   ├── main.tsx (React entry point)
│   └── index.css, App.css (Styles)
├── package.json (Dependencies)
├── tsconfig.json (TypeScript config)
├── vite.config.ts (Vite build config)
└── index.html
```

---

## 2. 🛠️ STACK CÔNG NGHỆ

### Backend Stack
| Thành phần | Công nghệ | Phiên bản |
|-----------|-----------|----------|
| **Framework** | Spring Boot | 4.0.5 |
| **Java Version** | Java | 21 |
| **ORM** | Spring Data JPA (Hibernate) | - |
| **Database** | PostgreSQL | 15-alpine |
| **Authentication** | JWT (jjwt) | 0.12.5 |
| **Security** | Spring Security + JWT | - |
| **Migration** | Flyway | - |
| **Mapping** | MapStruct | 1.5.5.Final |
| **Validation** | Spring Validation | - |
| **Build Tool** | Maven | - |
| **Logging** | SLF4J (default) | - |

### Frontend Stack
| Thành phần | Công nghệ | Phiên bản |
|-----------|-----------|----------|
| **Framework** | React | 19.2.5 |
| **Language** | TypeScript | ~5.9.3 |
| **Build Tool** | Vite | 8.0.1 |
| **Routing** | React Router DOM | 7.14.1 |
| **State Management** | Zustand | 5.0.12 |
| **HTTP Client** | Axios | 1.15.0 |
| **Styling** | TailwindCSS | 4.2.2 |
| **Icons** | Lucide React | 1.8.0 |
| **Linting** | ESLint | 9.39.4 |

### Deployment Stack
| Thành phần | Công nghệ |
|-----------|-----------|
| **Containerization** | Docker |
| **Orchestration** | Docker Compose 3.8 |
| **Database Container** | PostgreSQL 15-alpine |
| **Backend Container** | Spring Boot App |

### Environment Variables (docker-compose.yml)
```
Database:
- DB_USERNAME, DB_PASSWORD, DB_NAME, DB_HOST, DB_PORT

JWT:
- JWT_SECRET, JWT_EXPIRATION
```

---

## 3. 📚 MÔ TẢ CHI TIẾT TỪNG THƯ MỤC CHÍNH

### **Backend Modules**

#### `controller/` - Layer điều khiển
- **Mục đích**: Xử lý HTTP requests, định nghĩa API endpoints
- **Chứa**: 7 REST controllers
- **Trách nhiệm**: 
  - Nhận request từ client
  - Gọi service layer
  - Trả về response với format `ApiResponse<T>`

#### `service/` - Business Logic Layer
- **Mục đích**: Xử lý logic kinh doanh
- **Chứa**: 9 services (AuthService, ProductService, CartService, OrderService, etc.)
- **Trách nhiệm**:
  - Validate dữ liệu
  - Thực hiện business logic
  - Quản lý transaction
  - Gọi repository layer

#### `entity/` - Domain Models (JPA Entities)
- **Mục đích**: Đại diện cho các bảng trong database
- **Chứa**: 12 JPA entities
- **Các entity chính**:
  - `User.java` - Thông tin người dùng
  - `Product.java` - Thông tin sản phẩm
  - `Category.java` - Danh mục sản phẩm
  - `Cart.java` / `CartItem.java` - Giỏ hàng
  - `Order.java` / `OrderItem.java` - Đơn hàng
  - `Payment.java` - Thông tin thanh toán
  - `Review.java` - Đánh giá sản phẩm
  - `Address.java` - Địa chỉ giao hàng
  - `RefreshToken.java` - Token làm mới

#### `dto/` - Data Transfer Objects
- **Mục đích**: Transfer dữ liệu giữa layers, tách biệt entity và API
- **Chứa**: 
  - `request/` - 13 request DTOs (LoginRequest, ProductRequest, etc.)
  - `response/` - 13 response DTOs (TokenResponse, ProductResponse, etc.)
- **Lợi ích**: 
  - Bảo vệ entity internal structure
  - Validate input
  - Tùy chỉnh response format

#### `repository/` - Data Access Layer
- **Mục đích**: Giao tiếp với database
- **Chứa**: 11 Spring Data repositories
- **Tính năng**:
  - CRUD operations (automatically generated)
  - Custom query methods (nếu có)
  - JPA Specification support

#### `security/` - Bảo mật
- **Chứa**: 
  - `SecurityConfig.java` - Cấu hình Spring Security
  - `JwtAuthFilter.java` - JWT authentication filter
  - `CorsConfig.java` - CORS configuration
- **Tính năng**:
  - JWT token generation & validation
  - CORS for frontend communication
  - Request authentication

#### `config/` - Cấu hình ứng dụng
- **Chứa**:
  - `CustomUserDetailsService.java` - Load user info từ database
  - `JwtUtils.java` - JWT utility methods
  - `UserDetail.java` - Spring Security UserDetails impl

#### `enums/` - Các giá trị cố định
- **Chứa**:
  - `UserRole.java` - ADMIN, USER, etc.
  - `OrderStatus.java` - PENDING, CONFIRMED, DELIVERED, etc.
  - `PaymentStatus.java` - PENDING, COMPLETED, FAILED, etc.
  - `PaymentMethod.java` - CREDIT_CARD, PAYPAL, BANK_TRANSFER, etc.
  - `ErrorCode.java` - Custom error codes

#### `exception/` - Xử lý lỗi
- **Mục đích**: Custom exception classes cho business logic
- **Ví dụ**: ResourceNotFoundException, ValidationException, etc.

#### `mapper/` - DTO Mapping (MapStruct)
- **Mục đích**: Tự động map entity ↔ DTO
- **Công cụ**: MapStruct (compile-time mapping)

#### `specification/` - JPA Specifications
- **Mục đích**: Dynamic query building
- **Tính năng**: Advanced filtering, sorting trên product list

---

### **Frontend Modules**

#### `components/` - Reusable UI Components
- **Header.tsx** - Navigation bar
- **ProductCard.tsx** - Hiển thị thông tin sản phẩm (dùng trong danh sách)

#### `pages/` - Page Components (Screen)
- **Home.tsx** - Trang chủ
- **product/ProductListPage.tsx** - Danh sách sản phẩm
- **product/ProductDetail.tsx** - Chi tiết sản phẩm

#### `layouts/` - Page Layout Wrappers
- **MainLayout.tsx** - Layout chính cho user
- **AdminLayout.tsx** - Layout cho admin

#### `services/` - API Client Layer
- **api.ts** - Axios instance, base URL, default headers, interceptors
- **auth.ts** - Authentication endpoints
- **product.ts** - Product endpoints
- **cart.ts** - Shopping cart endpoints
- **order.ts** - Order endpoints
- **user.ts** - User profile endpoints
- **address.ts** - Address endpoints
- **review.ts** - Product review endpoints

#### `hooks/` - Custom React Hooks
- **useCart.ts** - Quản lý cart state
- **useProducts.ts** - Fetch & cache product data

#### `types/` - TypeScript Type Definitions
- **Mục đích**: Type safety cho toàn bộ app
- **Chứa**: Interfaces/types cho từng domain
  - `user.ts` - User type definitions
  - `product.ts` - Product types
  - `cart.ts` - Cart/CartItem types
  - `order.ts` - Order types
  - `apiresponse.ts` - API response wrapper type
  - `payment.ts` - Payment types
  - `address.ts` - Address types
  - `review.ts` - Review types

#### `utils/` - Utility Functions
- **format.ts** - Formatting functions (currency, date, etc.)

#### `styles/` - CSS/Styling
- **index.css, App.css** - Global & component styles
- **TailwindCSS** - Utility-first CSS framework

---

## 4. 🔌 API ENDPOINTS

### **Authentication Endpoints** (`/api/auth`)
| Method | Endpoint | Mục đích | Request | Response |
|--------|----------|---------|---------|----------|
| `POST` | `/api/auth/login` | Đăng nhập | LoginRequest | TokenResponse |
| `POST` | `/api/auth/register` | Đăng ký | RegisterRequest | UserResponse |
| `POST` | `/api/auth/refresh` | Làm mới token | token (param) | RefreshTokenResponse |

---

### **Product Endpoints** (`/api/products`)
| Method | Endpoint | Mục đích | Request | Response |
|--------|----------|---------|---------|----------|
| `GET` | `/api/products` | Lấy tất cả sản phẩm (có phân trang) | Pageable | Page<ProductResponse> |
| `GET` | `/api/products/{id}` | Lấy chi tiết sản phẩm | Path param: id | ProductResponse |
| `GET` | `/api/products/category/{categoryId}` | Lấy sản phẩm theo danh mục | Path param: categoryId | Page<ProductResponse> |
| `POST` | `/api/products` | Tạo sản phẩm mới | ProductRequest | ProductResponse |
| `PUT` | `/api/products/{id}` | Cập nhật sản phẩm | ProductRequest | ProductResponse |
| `DELETE` | `/api/products/{id}` | Xóa sản phẩm | Path param: id | String (message) |

---

### **Cart Endpoints** (`/api/cart`)
| Method | Endpoint | Mục đích | Request | Response |
|--------|----------|---------|---------|----------|
| `GET` | `/api/cart/user/{userId}` | Lấy giỏ hàng của user | Path param: userId | CartResponse |
| `GET` | `/api/cart/{id}/items` | Lấy các item trong giỏ | Path param: id | List<CartItemResponse> |
| `POST` | `/api/cart` | Thêm sản phẩm vào giỏ | CartRequest | CartResponse |
| `PUT` | `/api/cart/{id}` | Cập nhật số lượng item | UpdateQuantityRequest | CartResponse |
| `DELETE` | `/api/cart/user/{userId}` | Xóa giỏ hàng | Path param: userId | String (message) |

---

### **Order Endpoints** (`/api/order`)
| Method | Endpoint | Mục đích | Request | Response |
|--------|----------|---------|---------|----------|
| `GET` | `/api/order` | Lấy tất cả đơn hàng (phân trang) | Pageable | Page<OrderResponse> |
| `GET` | `/api/order/my_order` | Lấy đơn hàng của user hiện tại | Pageable | Page<OrderResponse> |
| `GET` | `/api/order/{id}` | Lấy chi tiết đơn hàng | Path param: id | OrderResponse |
| `POST` | `/api/order` | Tạo đơn hàng mới | OrderRequest | OrderResponse |
| `PUT` | `/api/order/{id}` | Cập nhật trạng thái đơn hàng | UpdateOrderStatus | OrderResponse |
| `DELETE` | `/api/order/{id}` | Hủy đơn hàng | Path param: id | OrderResponse |

---

### **User Endpoints** (`/api/user`)
| Method | Endpoint | Mục đích | Request | Response |
|--------|----------|---------|---------|----------|
| `GET` | `/api/user` | Lấy tất cả users (phân trang) | Pageable | Page<UserResponse> |
| `GET` | `/api/user/{id}` | Lấy thông tin user | Path param: id | UserResponse |
| `GET` | `/api/user/profile` | Lấy profile & lịch sử đơn hàng của user hiện tại | - | UserResponse |
| `POST` | `/api/user` | Tạo user mới | UserRequest | UserResponse |
| `POST` | `/api/user/{id}` | Cập nhật user | UserRequest | UserResponse |
| `DELETE` | `/api/user/{id}` | Xóa user | Path param: id | String (message) |

---

### **Review Endpoints** (`/api/review`)
| Method | Endpoint | Mục đích | Request | Response |
|--------|----------|---------|---------|----------|
| `GET` | `/api/review/{id}` | Lấy review theo ID | Path param: id | ReviewResponse |
| `GET` | `/api/review/product/{productId}` | Lấy reviews của sản phẩm | Path param: productId | Page<ReviewResponse> |
| `GET` | `/api/review/my_review` | Lấy reviews của user hiện tại | Pageable | Page<ReviewResponse> |
| `POST` | `/api/review` | Tạo review mới | ReviewRequest | ReviewResponse |
| `PUT` | `/api/review/{id}` | Cập nhật review | UpdateReview | ReviewResponse |
| `DELETE` | `/api/review/{id}` | Xóa review | Path param: id | String (message) |

---

### **Address Endpoints** (`/api/address`)
| Method | Endpoint | Mục đích | Request | Response |
|--------|----------|---------|---------|----------|
| `PUT` | `/api/address` | Cập nhật địa chỉ của user | AddressRequest | AddressResponse |

---

## 5. 📋 TÓMLÕI CẤU TRÚC

```
┌─────────────────────────────────────────────────────────────┐
│          E-COMMERCE PLATFORM ARCHITECTURE                  │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐             ┌──────────────────┐
│   FRONTEND       │             │    BACKEND       │
│  (React + Vite)  │             │  (Spring Boot)   │
├──────────────────┤             ├──────────────────┤
│ - Home Page      │  ◄──────►   │ - Auth Service   │
│ - Product List   │  (REST API) │ - Product Mgmt   │
│ - Product Detail │  (Axios)    │ - Cart Mgmt      │
│ - Cart           │             │ - Order Mgmt     │
│ - Checkout       │             │ - Review Mgmt    │
│ - User Profile   │             │ - User Mgmt      │
│ - Admin Panel    │             │ - Address Mgmt   │
└──────────────────┘             └──────────────────┘
                                       │
                                       │
                            ┌──────────▼──────────┐
                            │   PostgreSQL DB     │
                            │   (Tables: User,    │
                            │    Product, Order,  │
                            │    Cart, Payment,   │
                            │    Review, etc.)    │
                            └─────────────────────┘

Deployment: Docker + Docker Compose
- Backend: Spring Boot Container (Port 8080)
- Database: PostgreSQL Container (Port 5432)
```

---

## 6. 🔐 BẢO MẬT & XÁC THỰC

- **Authentication**: JWT (JSON Web Tokens)
- **Authorization**: Spring Security with roles (USER, ADMIN)
- **Password**: Bcrypt hashing (via Spring Security)
- **Token Refresh**: Refresh token mechanism
- **CORS**: Configured for frontend communication
- **Validation**: Request validation via Jakarta Validation

---

## 7. 📊 DATABASE SCHEMA (CHÍNH)

```
Users (User)
├── id (PK)
├── email, password
├── name, phone
├── role (enum)
└── timestamps

Products
├── id (PK)
├── name, description, price
├── categoryId (FK)
├── quantity, images
└── timestamps

Orders
├── id (PK)
├── userId (FK)
├── status, totalPrice
├── items (1:Many OrderItems)
└── timestamps

Cart
├── id (PK)
├── userId (FK)
└── items (1:Many CartItems)

Reviews
├── id (PK)
├── productId (FK)
├── userId (FK)
├── rating, content
└── timestamps

Payments
├── id (PK)
├── orderId (FK)
├── amount, status
└── timestamps
```

---

## 📝 Tóm lược

Dự án này là một **full-stack e-commerce platform** hoàn chỉnh với:
✅ RESTful API backend  
✅ Modern React frontend  
✅ PostgreSQL database  
✅ JWT authentication  
✅ Docker containerization  

Sẵn sàng để mở rộng hoặc tích hợp với các dịch vụ khác.
