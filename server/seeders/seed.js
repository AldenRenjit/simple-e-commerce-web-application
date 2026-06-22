import bcrypt from 'bcryptjs';
import { sequelize, User, Category, Product, Cart } from '../models/index.js';

export const runSeeder = async () => {
  try {
    console.log('Checking database content for seeding...');

    // 1. Seed Categories if empty
    const categoryCount = await Category.count();
    let categoriesList = [];

    if (categoryCount === 0) {
      console.log('Seeding categories...');
      categoriesList = await Category.bulkCreate([
        { name: 'Electronics', slug: 'electronics' },
        { name: 'Apparel', slug: 'apparel' },
        { name: 'Home & Kitchen', slug: 'home-kitchen' },
        { name: 'Books', slug: 'books' }
      ]);
    } else {
      categoriesList = await Category.findAll();
    }

    const catMap = {};
    categoriesList.forEach(c => {
      catMap[c.slug] = c.id;
    });

    // 2. Seed Users if empty
    const userCount = await User.count();
    if (userCount === 0) {
      console.log('Seeding default users...');
      
      const adminPassHash = await bcrypt.hash('admin123', 12);
      const userPassHash = await bcrypt.hash('user123', 12);

      const admin = await User.create({
        name: 'John Admin',
        email: 'admin@example.com',
        password_hash: adminPassHash,
        role: 'admin',
        is_active: true
      });

      const regularUser = await User.create({
        name: 'Jane Customer',
        email: 'user@example.com',
        password_hash: userPassHash,
        role: 'user',
        is_active: true
      });

      // Assign carts
      await Cart.create({ user_id: admin.id });
      await Cart.create({ user_id: regularUser.id });

      console.log('Seeded John Admin (admin@example.com / admin123)');
      console.log('Seeded Jane Customer (user@example.com / user123)');
    }

    // 3. Seed Products if empty
    const productCount = await Product.count();
    if (productCount === 0) {
      console.log('Seeding 20 products...');

      await Product.bulkCreate([
        // Electronics (5)
        {
          name: 'Wireless Noise-Cancelling Headphones',
          description: 'Premium wireless over-ear headphones with state-of-the-art active noise cancelling, 30-hour battery life, and crystal-clear sound quality.',
          price: 199.99,
          category_id: catMap['electronics'],
          stock_qty: 15,
          image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
          rating: 4.8
        },
        {
          name: 'Smart Fitness Watch',
          description: 'Sleek health & fitness watch monitoring heart rate, blood oxygen levels, sleeping patterns, GPS navigation, and 5 ATM water resistance.',
          price: 129.50,
          category_id: catMap['electronics'],
          stock_qty: 25,
          image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
          rating: 4.5
        },
        {
          name: 'Portable Bluetooth Speaker',
          description: 'Compact IPX7 waterproof speaker carrying powerful 360-degree deep bass sound, perfect for beach trips, hiking and garden parties.',
          price: 49.99,
          category_id: catMap['electronics'],
          stock_qty: 40,
          image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop&q=60',
          rating: 4.3
        },
        {
          name: 'Mechanical Ergonomic Keyboard',
          description: 'Tactile mechanical keyboard utilizing silent brown switches, RGB customizable backlighting, and an ortholinear design to reduce fatigue.',
          price: 89.95,
          category_id: catMap['electronics'],
          stock_qty: 8,
          image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60',
          rating: 4.6
        },
        {
          name: '4K Ultra-HD Webcam',
          description: 'Professional streaming camera supporting HDR resolution, noise-reducing dual microphones, and autofocus for video conferencing.',
          price: 79.99,
          category_id: catMap['electronics'],
          stock_qty: 3, // Low stock indicator test
          image_url: 'https://images.unsplash.com/photo-1610940882244-1f5e0332882c?w=500&auto=format&fit=crop&q=60',
          rating: 4.1
        },

        // Apparel (5)
        {
          name: 'Organic Cotton Crewneck T-Shirt',
          description: 'Ultra-soft sustainable organic cotton t-shirt. Breathable design, double-stitched hems, available in neutral minimalist tones.',
          price: 24.99,
          category_id: catMap['apparel'],
          stock_qty: 50,
          image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60',
          rating: 4.4
        },
        {
          name: 'Water-Resistant Windbreaker Jacket',
          description: 'Lightweight zip-up jacket carrying a packable hood, wind-blocking technology, and water-repellent zippers for outdoor adventures.',
          price: 65.00,
          category_id: catMap['apparel'],
          stock_qty: 12,
          image_url: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=500&auto=format&fit=crop&q=60',
          rating: 4.7
        },
        {
          name: 'Minimalist Canvas Backpack',
          description: 'Durable eco-friendly canvas pack with a padded 15-inch laptop sleeve, hidden magnetic clasps, and comfortable shoulder cushions.',
          price: 45.99,
          category_id: catMap['apparel'],
          stock_qty: 20,
          image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60',
          rating: 4.5
        },
        {
          name: 'All-Weather Hybrid Sneakers',
          description: 'Flexible active running shoes carrying high-grip rubber treading, breathable mesh lining, and memory foam shock-absorption soles.',
          price: 95.00,
          category_id: catMap['apparel'],
          stock_qty: 14,
          image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60',
          rating: 4.6
        },
        {
          name: 'Polarized Sport Sunglasses',
          description: 'Shatterproof sunglasses utilizing UV400 filters, anti-glare polarization, and ultra-lightweight frames for cycling or running.',
          price: 35.00,
          category_id: catMap['apparel'],
          stock_qty: 22,
          image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&auto=format&fit=crop&q=60',
          rating: 4.2
        },

        // Home & Kitchen (5)
        {
          name: 'Double-Walled French Press Coffee Maker',
          description: 'Insulated rustproof stainless steel French press keeping coffee hot for hours. Smooth filtration screen ensures zero sediment.',
          price: 39.99,
          category_id: catMap['home-kitchen'],
          stock_qty: 18,
          image_url: 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=500&auto=format&fit=crop&q=60',
          rating: 4.7
        },
        {
          name: 'Aromatic Ceramic Oil Diffuser',
          description: 'Ultrasonic air humidifier and aromatherapy oil diffuser featuring a quiet motor, seven color-changing LEDs, and auto shut-off.',
          price: 29.95,
          category_id: catMap['home-kitchen'],
          stock_qty: 35,
          image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop&q=60',
          rating: 4.4
        },
        {
          name: 'Professional 8-Inch Chef Knife',
          description: 'High-carbon Japanese stainless steel blade delivering professional-grade sharpness, custom balance, and lifetime wood handle.',
          price: 59.99,
          category_id: catMap['home-kitchen'],
          stock_qty: 4, // Low stock indicator test
          image_url: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=500&auto=format&fit=crop&q=60',
          rating: 4.9
        },
        {
          name: 'Non-Stick Ceramic Frying Pan',
          description: 'PTFE and PFOA-free ceramic skillet with a heavy-gauge aluminum core ensuring uniform heating across gas or induction stoves.',
          price: 34.50,
          category_id: catMap['home-kitchen'],
          stock_qty: 16,
          image_url: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500&auto=format&fit=crop&q=60',
          rating: 4.5
        },
        {
          name: 'Insulated Stainless Steel Flask',
          description: 'Double-walled vacuum-sealed water bottle providing 24-hour temperature retention, anti-sweat exterior coating, and leakproof loop lid.',
          price: 19.99,
          category_id: catMap['home-kitchen'],
          stock_qty: 30,
          image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60',
          rating: 4.6
        },

        // Books (5)
        {
          name: 'The Creative Act: A Way of Being',
          description: 'An inspirational look into the creative process and mindfulness by legendary producer Rick Rubin. Hardcover edition.',
          price: 16.99,
          category_id: catMap['books'],
          stock_qty: 12,
          image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=60',
          rating: 4.9
        },
        {
          name: 'Atomic Habits',
          description: 'Tiny Changes, Remarkable Results by James Clear. Discover simple strategies to form good habits, break bad ones, and claim 1% improvement.',
          price: 14.20,
          category_id: catMap['books'],
          stock_qty: 45,
          image_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&auto=format&fit=crop&q=60',
          rating: 4.8
        },
        {
          name: 'Designing Data-Intensive Applications',
          description: 'A comprehensive technical blueprint on resolving storage, distributed systems, replication, and querying by Martin Kleppmann.',
          price: 38.50,
          category_id: catMap['books'],
          stock_qty: 6,
          image_url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&auto=format&fit=crop&q=60',
          rating: 4.9
        },
        {
          name: 'Dune (Deluxe Hardcover Edition)',
          description: 'Frank Herbert’s classic sci-fi masterpiece beautifully bound in a premium collector’s clothcover with custom illustrations.',
          price: 24.99,
          category_id: catMap['books'],
          stock_qty: 15,
          image_url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=60',
          rating: 4.7
        },
        {
          name: 'Clean Code: A Handbook of Agile Software Craftsmanship',
          description: 'The foundational software engineering companion by Robert C. Martin. Learn to distinguish good code from bad, write testing grids, etc.',
          price: 32.75,
          category_id: catMap['books'],
          stock_qty: 2, // Low stock indicator test
          image_url: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=500&auto=format&fit=crop&q=60',
          rating: 4.6
        }
      ]);
      console.log('Seeded 20 core products across 4 categories.');
    } else {
      console.log('Products already seeded.');
    }

    console.log('Database verification and seeding completed successfully!');
  } catch (err) {
    console.error('Seeding Failed:', err);
  }
};
