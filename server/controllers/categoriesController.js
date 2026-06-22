import { Category } from '../models/index.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.json(categories);
  } catch (err) {
    console.error('Get Categories Error:', err);
    res.status(500).json({ error: 'Failed to retrieve categories.' });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required.' });
    }

    // Generate url-friendly slug
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove non-word characters (except spaces and hyphens)
      .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Trim hyphens from starts/ends

    const existingCategory = await Category.findOne({ where: { slug } });
    if (existingCategory) {
      return res.status(400).json({ error: 'A category with this name or slug already exists.' });
    }

    const category = await Category.create({ name, slug });
    res.status(201).json(category);
  } catch (err) {
    console.error('Create Category Error:', err);
    res.status(500).json({ error: 'Failed to create category.' });
  }
};
