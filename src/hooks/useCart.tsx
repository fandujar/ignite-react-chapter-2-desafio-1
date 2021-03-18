import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  useEffect(() => {
    localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
  }, [cart])

  const addProduct = async (productId: number) => {
    try {
      const response = await api.get<Stock>('/stock/' + productId)
      const stock = response.data;

      let products = [...cart];
      let p = products.find((product) => product.id === productId);
      if (p) {
        if (p.amount === stock.amount) {
          toast.error('Quantidade solicitada fora de estoque');
        } else {
          p.amount++;
          setCart(products)
        }
      } else {
        const response = await api.get<Product>('/products/' + productId);
        const product = response.data;
        product.amount = 1;
        setCart([...cart, product])
      }
    } catch {  
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      let products = [...cart];
      let p = products.find((product) => product.id === productId);
      if (p) {
        p.amount--;
        setCart(products)
      } else {
        toast.error('Erro na remoção do produto');
      }
    } catch {  
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
