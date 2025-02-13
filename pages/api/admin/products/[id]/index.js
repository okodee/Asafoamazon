import { getToken } from 'next-auth/jwt';
import Product from '../../../../../models/Product';
import db from '../../../../../utils/db';

const handler = async (req, res) => {
  const user = await getToken({ req });
  if (!user || (user && !user.isAdmin)) {
    return res.status(401).json({ message: 'Signin required' });
  }

  if (req.method === 'GET') {
    return getHandler(req, res);
  } else if (req.method === 'PUT') {
    return putHandler(req, res);
  } else if (req.method === 'DELETE') {
    return deleteHandler(req, res);
  } else {
    return res.status(400).json({ message: 'Method not allowed' });
  }
};

const getHandler = async (req, res) => {
  await db.connect();
  const product = await Product.findById(req.query.id);
  await db.disconnect();

  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

const putHandler = async (req, res) => {
  await db.connect();
  const product = await Product.findById(req.query.id);

  if (product) {
    // Check if slug is already in use by another product
    const existingProduct = await Product.findOne({ slug: req.body.slug });
    if (existingProduct && existingProduct._id.toString() !== req.query.id) {
      await db.disconnect();
      return res
        .status(400)
        .json({ message: 'Slug already exists. Choose another one.' });
    }

    // Update product details
    product.name = req.body.name;
    product.slug = req.body.slug;
    product.price = req.body.price;
    product.category = req.body.category;
    product.image = req.body.image;
    product.brand = req.body.brand;
    product.countInStock = req.body.countInStock;
    product.description = req.body.description;

    await product.save();
    await db.disconnect();

    res.json({ message: 'Product updated successfully' });
  } else {
    await db.disconnect();
    res.status(404).json({ message: 'Product not found' });
  }
};

const deleteHandler = async (req, res) => {
  await db.connect();
  const product = await Product.findById(req.query.id);

  if (product) {
    await Product.deleteOne({ _id: product._id }); // ✅ Fixed the `remove()` issue
    await db.disconnect();
    res.json({ message: 'Product deleted successfully' });
  } else {
    await db.disconnect();
    res.status(404).json({ message: 'Product not found' });
  }
};

export default handler;
