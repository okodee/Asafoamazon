import Image from 'next/image';
import axios from 'axios';
import { useContext } from 'react';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import ProductItem from '../components/ProductItem';
import Product from '../models/Product';
import db from '../utils/db';
import { Store } from '../utils/Store';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import Link from 'next/link';

export default function Home({ products, featuredProducts }) {
  const { state, dispatch } = useContext(Store);
  const { cart } = state;

  const addToCartHandler = async (product) => {
    const existItem = cart.cartItems.find((x) => x.slug === product.slug);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);

    if (data.countInStock < quantity) {
      return toast.error('Sorry. Product is out of stock');
    }
    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });

    toast.success('Product added to the cart');
  };

  return (
    <Layout title="Home Page">
      <Carousel showThumbs={false} autoPlay>
        {featuredProducts.map((product) => (
          <div key={product._id}>
            <Link href={`/product/${product.slug}`} passHref className="flex">
              {product.image ? (
                <Image
                  src={
                    product.image.includes('res.cloudinary.com')
                      ? product.image
                      : `https://res.cloudinary.com/diqaci6rs/image/upload/${product.image}`
                  }
                  alt={product.name}
                  width={500}
                  height={500}
                  sizes="(max-width: 768px) 100vw, 500px"
                  onError={(e) =>
                    console.error(`Image failed to load: ${product.image}`, e)
                  }
                />
              ) : (
                <p className="text-red-500">Image not available</p>
              )}
            </Link>
          </div>
        ))}
      </Carousel>

      <h2 className="h2 my-4">Latest Products</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductItem
            product={product}
            key={product.slug}
            addToCartHandler={addToCartHandler}
          ></ProductItem>
        ))}
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  await db.connect();
  const products = await Product.find().lean();
  const featuredProducts = await Product.find({ isFeatured: true }).lean();

  const featuredProductsWithImages = featuredProducts.map((product) => ({
    ...product,
    image: product.image
      ? `https://res.cloudinary.com/${
          process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        }/image/upload${product.image.startsWith('/') ? '' : '/'}${
          product.image
        }`
      : '',
  }));

  return {
    props: {
      featuredProducts: featuredProductsWithImages.map(db.convertDocToObj),
      products: products.map(db.convertDocToObj),
    },
  };
}
