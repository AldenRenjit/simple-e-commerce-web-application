import { Op } from 'sequelize';
import { Product, Category } from '../models/index.js';

export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const categorySlug = req.query.category || '';
    const sort = req.query.sort || '';

    const offset = (page - 1) * limit;

    // Build the query where clause
    const whereClause = {
      is_active: true // For standard storefront queries
    };

    // If an admin requests products, they can toggle seeing deleted items too,
    // let's check if the query asks for admins specifically.
    if (req.query.isAdminQuery === 'true') {
      delete whereClause.is_active; // Admin see all, active or inactive
    }

    if (search) {
      whereClause.name = {
        [Op.like]: `%${search}%`
      };
    }

    // Handle Category Filtering
    if (categorySlug) {
      const category = await Category.findOne({ where: { slug: categorySlug } });
      if (category) {
        whereClause.category_id = category.id;
      } else if (!isNaN(parseInt(categorySlug))) {
        whereClause.category_id = parseInt(categorySlug);
      }
    }

    // Determine Sorting order
    let order = [['created_at', 'DESC']];
    if (sort === 'price_asc') {
      order = [['price', 'ASC']];
    } else if (sort === 'price_desc') {
      order = [['price', 'DESC']];
    } else if (sort === 'rating_desc') {
      order = [['rating', 'DESC']];
    }

    const { count, rows } = await Product.findAndCountAll({
      where: whereClause,
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }],
      limit,
      offset,
      order
    });

    res.json({
      products: rows,
      total: count,
      page,
      pages: Math.ceil(count / limit),
      limit
    });
  } catch (err) {
    console.error('Get All Products Error:', err);
    res.status(500).json({ error: 'Failed to retrieve products.' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }]
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    res.json(product);
  } catch (err) {
    console.error('Get Product By Id Error:', err);
    res.status(500).json({ error: 'Server error retrieving product.' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category_id, stock_qty, image_url } = req.body;

    if (!name || price === undefined || stock_qty === undefined) {
      return res.status(400).json({ error: 'Name, price, and stock quantity are required.' });
    }

    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      category_id: category_id ? parseInt(category_id) : null,
      stock_qty: parseInt(stock_qty),
      image_url: image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
      is_active: true
    });

    const fullProduct = await Product.findByPk(product.id, {
      include: [{ model: Category, as: 'category' }]
    });

    res.status(201).json(fullProduct);
  } catch (err) {
    console.error('Create Product Error:', err);
    res.status(500).json({ error: 'Failed to create product.' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category_id, stock_qty, image_url, is_active } = req.body;
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    await product.update({
      name: name !== undefined ? name : product.name,
      description: description !== undefined ? description : product.description,
      price: price !== undefined ? parseFloat(price) : product.price,
      category_id: category_id !== undefined ? (category_id ? parseInt(category_id) : null) : product.category_id,
      stock_qty: stock_qty !== undefined ? parseInt(stock_qty) : product.stock_qty,
      image_url: image_url !== undefined ? image_url : product.image_url,
      is_active: is_active !== undefined ? is_active : product.is_active
    });

    const updatedProduct = await Product.findByPk(product.id, {
      include: [{ model: Category, as: 'category' }]
    });

    res.json(updatedProduct);
  } catch (err) {
    console.error('Update Product Error:', err);
    res.status(500).json({ error: 'Failed to update product.' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Soft-delete using our is_active flag
    await product.update({ is_active: false });
    res.json({ message: 'Product soft-deleted successfully.' });
  } catch (err) {
    console.error('Delete Product Error:', err);
    res.status(500).json({ error: 'Failed to delete product.' });
  }
};

/**
 * Handle CSV bulk stock updates.
 * Expected body: { csvData: "id,stock_qty\n1,50\n2,100" } or CSV text
 */
export const bulkStockUpdate = async (req, res) => {
  try {
    const { csvData } = req.body;
    if (!csvData) {
      return res.status(400).json({ error: 'CSV data is required.' });
    }

    const lines = csvData.trim().split('\n');
    if (lines.length <= 1) {
      return res.status(400).json({ error: 'CSV file contains no records.' });
    }

    // Parse headers e.g., id,stock_qty
    const headers = lines[0].toLowerCase().split(',');
    const idIdx = headers.indexOf('id');
    const stockIdx = headers.indexOf('stock_qty') !== -1 ? headers.indexOf('stock_qty') : headers.indexOf('stock');

    if (idIdx === -1 || stockIdx === -1) {
      return res.status(400).json({ error: 'CSV headers must contain "id" and "stock_qty".' });
    }

    let successCount = 0;
    let failCount = 0;

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = lines[i].split(',');
      const id = parseInt(values[idIdx]);
      const stock = parseInt(values[stockIdx]);

      if (!isNaN(id) && !isNaN(stock)) {
        const product = await Product.findByPk(id);
        if (product) {
          await product.update({ stock_qty: stock });
          successCount++;
        } else {
          failCount++;
        }
      } else {
        failCount++;
      }
    }

    res.json({
      message: 'Bulk stock update processed.',
      results: {
        success: successCount,
        failed: failCount
      }
    });
  } catch (err) {
    console.error('Bulk Stock Update Error:', err);
    res.status(500).json({ error: 'Failed to process bulk stock update.' });
  }
};
