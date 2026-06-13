import { create } from 'zustand';

const useCinemaStore = create((set) => ({
  openingComplete: false,
  setOpeningComplete: () => set({ openingComplete: true }),

  navbarVisible: false,
  setNavbarVisible: (v) => set({ navbarVisible: v }),

  cursorType: 'default',
  setCursorType: (type) => set({ cursorType: type }),

  sceneIndex: 0,
  setSceneIndex: (i) => set({ sceneIndex: i }),

  cartOpen: false,
  setCartOpen: (v) => set({ cartOpen: v }),
  cartCount: 0,
  setCartCount: (n) => set({ cartCount: n }),

  activeCategory: null,
  setActiveCategory: (c) => set({ activeCategory: c }),
}));

export default useCinemaStore;