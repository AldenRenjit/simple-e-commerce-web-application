import { Cart, CartItem, Product } from '../models/index.js';

export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Retrieve or create the user's cart
    const [cart] = await Cart.findOrCreate({
      where: { user_id: userId }
    });

    // Find all items associated with this cart, with details of Products
    const items = await CartItem.findAll({
      where: { cart_id: cart.id },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'price', 'image_url', 'stock_qty', 'is_active']
      }],
      order: [['created_at', 'ASC']]
    });

    // Remove any items where the product is no longer active (soft deleted)
    const validItems = items.filter(item => item.product && item.product.is_active);

    // Calculate totals on the fly server-side for safety
    const subtotal = validItems.reduce((acc, item) => {
      return acc + (parseFloat(item.product.price) * item.quantity);
    }, 0);

    const taxRate = 0.10; // 10%
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    res.json({
      cartId: cart.id,
      items: validItems,
      totals: {
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        total: parseFloat(total.toFixed(2))
      }
    });
  } catch (err) {
    console.error('Get Cart Error:', err);
    res.status(500).json({ error: 'Failed to retrieve shopping cart.' });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: 'Product ID is required.' });
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1.' });
    }

    // Verify the product exists and is active and has sufficient stock
    const product = await Product.findByPk(product_id);
    if (!product || !product.is_active) {
      return res.status(404).json({ error: 'Product is not available.' });
    }

    if (product.stock_qty < qty) {
      return res.status(400).json({ error: `Insufficient stock. Only ${product.stock_qty} available.` });
    }

    // Get the User's Cart
    const [cart] = await Cart.findOrCreate({
      where: { user_id: userId }
    });

    // Check if the item already exists in the cart
    let cartItem = await CartItem.findOne({
      where: { cart_id: cart.id, product_id }
    });

    if (cartItem) {
      const newQuantity = cartItem.quantity + qty;
      if (product.stock_qty < newQuantity) {
        return res.status(400).json({ error: `Not enough stock. You already have ${cartItem.quantity} in cart, and cannot add ${qty} more.` });
      }
      await cartItem.update({ quantity: newQuantity });
    } else {
      cartItem = await CartItem.create({
        cart_id: cart.id,
        product_id,
        quantity: qty
      });
    }

    res.status(201).json({
      message: 'Product added to cart successfully.',
      cartItem
    });
  } catch (err) {
    console.error('Add To Cart Error:', err);
    res.status(500).json({ error: 'Failed to add item to cart.' });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.itemId;
    const { quantity } = req.body;

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1.' });
    }

    const cart = await Cart.findOne({ where: { user_id: userId } });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found.' });
    }

    const cartItem = await CartItem.findOne({
      where: { id: itemId, cart_id: cart.id },
      include: [{ model: Product, as: 'product' }]
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found.' });
    }

    // Verify stock
    if (cartItem.product.stock_qty < qty) {
      return res.status(400).json({ error: `Insufficient stock. Max available: ${cartItem.product.stock_qty}` });
    }

    await cartItem.update({ quantity: qty });
    res.json({ message: 'Cart updated successfully.', cartItem });
  } catch (err) {
    console.error('Update Cart Item Error:', err);
    res.status(500).json({ error: 'Failed to update item quantity.' });
  }
};

export const deleteCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const itemId = req.params.itemId;

    const cart = await Cart.findOne({ where: { user_id: userId } });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found.' });
    }

    const cartItem = await CartItem.findOne({
      where: { id: itemId, cart_id: cart.id }
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found.' });
    }

    await cartItem.destroy();
    res.json({ message: 'Item removed from cart.' });
  } catch (err) {
    console.error('Delete Cart Item Error:', err);
    res.status(500).json({ error: 'Failed to remove item.' });
  }
};
