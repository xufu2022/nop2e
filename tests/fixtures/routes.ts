export const routes = {
  admin: {
    login: '/login',
    dashboard: '/Admin',
    products: '/Admin/Product/List',
    productCreate: '/Admin/Product/Create',
    orders: '/Admin/Order/List',
    customers: '/Admin/Customer/List',
  },
  public: {
    home: '/',
    login: '/login',
    register: '/register',
    cart: '/cart',
    checkout: '/checkout',
    productWithReviews: '/nokia-lumia-1020',
    contactUs: '/contactus',
    passwordRecovery: '/passwordrecovery',
    electronics: '/electronics',
    cameraPhoto: '/camera-photo',
    recentlyViewed: '/recentlyviewedproducts',
    wishlist: '/wishlist',
  },
} as const;
