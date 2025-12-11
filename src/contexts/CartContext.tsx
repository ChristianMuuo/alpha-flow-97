import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  type: 'ea' | 'signal' | 'indicator';
  creator: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
  totalPrice: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('apex-cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('apex-cart', JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    if (!items.find(i => i.id === item.id)) {
      setItems(prev => [...prev, item]);
    }
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const isInCart = (id: string) => items.some(item => item.id === id);

  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
  const itemCount = items.length;

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, isInCart, totalPrice, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
