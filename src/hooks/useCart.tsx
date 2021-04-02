import { createContext, ReactNode, useContext, useState } from 'react';
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
    // const storagedCart = Buscar dados do localStorage
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const productStock: Stock = (await api.get(`/stock/${productId}`)).data;
      const productStockAmount = productStock.amount;

      let { existsOnCart, newCart } = cart.reduce<{existsOnCart: boolean, newCart: Product[]}>((acc, product) => {
        if(product.id === productId) {
          if(product.amount === productStockAmount) throw new Error('Quantidade solicitada fora de estoque');
          return {
            existsOnCart: true,
            newCart: [
              ...acc.newCart,
              {
                ...product,
                amount: product.amount + 1
              }
            ]
          };
        }
        return {
          ...acc,
          newCart: [
            ...acc.newCart,
            product
          ]
        };
      }, {
        existsOnCart: false,
        newCart: []
      });

      const product: Product = (await api.get(`/products/${productId}`)).data;

      if(!existsOnCart) newCart.push({
        ...product,
        amount: 1
      });

      setCart(newCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));

    } catch({ message }) {
      // TODO
      if(message === 'Request failed with status code 404') {
        toast.error('Erro na adição do produto')
      } else {
      toast.error(message);
    }
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const newCart = cart.filter(product => product.id !== productId);

      if(cart.length === newCart.length) throw new Error('Erro na remoção do produto');

      setCart(newCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));

    } catch({ message }) {
      // TODO
      toast.error(message);
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      if(amount <= 0) return;

      const productStockResponse: Stock = (await api.get(`/stock/${productId}`)).data;
      const productStockAmount = productStockResponse.amount;

      if(amount > productStockAmount) throw new Error('Quantidade solicitada fora de estoque')

      const newCart = cart.map(product => {
        if(product.id === productId) return {
          ...product,
          amount
        }

        return product;
      })

      setCart(newCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));

    } catch({ message }) {
      // TODO
      if(message === 'Request failed with status code 404') {
        toast.error('Erro na alteração de quantidade do produto')
      } else {
        toast.error(message);
      }
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
