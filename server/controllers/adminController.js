import { User, Order, Product, OrderItem } from '../models/index.js';
import { default as sequelize } from '../config/database.js';

/**
 * Get aggregated stats for the Admin Dashboard
 */
export const getAdminStats = async (req, res) => {
  try {
    // 1. Total Revenue (sum of completed/shipped/delivered or all orders)
    const totalRevenueResult = await Order.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_revenue']
      ]
    });
    const totalRevenue = parseFloat(totalRevenueResult[0]?.getDataValue('total_revenue') || 0);

    // 2. Total Orders
    const totalOrders = await Order.count();

    // 3. Active Users
    const activeUsers = await User.count({ where: { is_active: true } });

    // 4. Low-Stock Products (< 5 quantity in inventory)
    const lowStockProductsCount = await Product.count({
      where: {
        stock_qty: { [sequelize.constructor.Op.lt]: 5 },
        is_active: true
      }
    });

    // 5. Recent 10 Orders
    const recentOrders = await Order.findAll({
      limit: 10,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      order: [['created_at', 'DESC']]
    });

    // 6. Top selling products
    // We fetch OrderItems grouped by product, summing quantities
    const topSellersRaw = await OrderItem.findAll({
      attributes: [
        'product_id',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'total_sold']
      ],
      group: ['product_id'],
      order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
      limit: 5,
      include: [{ model: Product, as: 'product', attributes: ['name', 'price'] }]
    });

    const topSellingProducts = topSellersRaw.map(item => {
      return {
        id: item.product_id,
        name: item.product ? item.product.name : `Product #${item.product_id}`,
        sales: parseInt(item.getDataValue('total_sold') || 0),
        revenue: parseFloat((item.getDataValue('total_sold') || 0) * (item.product ? parseFloat(item.product.price) : 0))
      };
    });

    res.json({
      metrics: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalOrders,
        activeUsers,
        lowStockProductsCount
      },
      recentOrders,
      topSellingProducts
    });
  } catch (err) {
    console.error('Get Admin Stats Error:', err);
    res.status(500).json({ error: 'Failed to retrieve administrative statistics.' });
  }
};

/**
 * List all users with user role details, join dates, and total order counts
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'is_active', 'created_at'],
      order: [['created_at', 'DESC']]
    });

    const usersWithStats = [];

    for (const user of users) {
      const orderCount = await Order.count({ where: { user_id: user.id } });
      usersWithStats.push({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
        orderCount
      });
    }

    res.json(usersWithStats);
  } catch (err) {
    console.error('Get All Users Error:', err);
    res.status(500).json({ error: 'Failed to retrieve user listing.' });
  }
};

/**
 * Promote or demote a user (admin <-> user)
 */
export const updateUserRole = async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role value.' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Prevent demoting ourselves
    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'You are forbidden from demoting yourself.' });
    }

    await user.update({ role });
    res.json({ message: 'User role updated successfully.', user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    console.error('Update User Role Error:', err);
    res.status(500).json({ error: 'Failed to update user role.' });
  }
};

/**
 * Enable or disable a user account
 */
export const updateUserStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    const { is_active } = req.body;

    if (is_active === undefined) {
      return res.status(400).json({ error: 'Active status field is required.' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Prevent disabling ourselves
    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'You are forbidden from disabling your own account.' });
    }

    await user.update({ is_active });
    res.json({ message: `User account has been ${is_active ? 'enabled' : 'disabled'}.` });
  } catch (err) {
    console.error('Update User Status Error:', err);
    res.status(500).json({ error: 'Failed to adjust user status.' });
  }
};
