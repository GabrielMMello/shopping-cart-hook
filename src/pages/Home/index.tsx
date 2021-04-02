import React, { useState, useEffect } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';

import { ProductList } from './styles';
import { api } from '../../services/api';
import { formatPrice } from '../../util/format';
import { useCart } from '../../hooks/useCart';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  const { addProduct, cart } = useCart();

  const cartItemsAmount = cart.reduce((sumAmount, product) => {
    // TODO
    sumAmount[product.id] = product.amount;
    return sumAmount;
  }, {} as CartItemsAmount)

  useEffect(() => {
    async function loadProducts() {
      // TODO
      const response = await api.get('/products');
      const products = response.data
      const productsFormatted = products.map((product: Product) => ({
          ...product,
          priceFormatted: formatPrice(product.price)
      }));
      
      setProducts(productsFormatted);
    }

    loadProducts();
  }, []);

  async function handleAddProduct(id: number) {
    // TODO
    await addProduct(id);
  }

  return (
    <ProductList>
      {products.map(product => (
        <li key={product.id}>
          <img
            src={product.image /* "https://rocketseat-cdn.s3-sa-east-1.amazonaws.com/modulo-redux/tenis1.jpg" */}
            alt={product.title /* "Tênis de Caminhada Leve Confortável" */} />
          <strong>{product.title /* Tênis de Caminhada Leve Confortável */}</strong>
          <span>{product.priceFormatted /* R$ 179,90 */}</span>
          <button
            type="button"
            data-testid="add-product-button"
            onClick={() => handleAddProduct(product.id)}
          >
            <div data-testid="cart-product-quantity">
              <MdAddShoppingCart size={16} color="#FFF" />
              {cartItemsAmount[product.id] || 0} {/* 2 */}
            </div>

            <span>ADICIONAR AO CARRINHO</span>
          </button>
        </li>
      ))}
    </ProductList>
  );
};

export default Home;
