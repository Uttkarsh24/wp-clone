import Category from '../models/category.model.js';

const slugify = text => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.findMany({
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve categories.' });
  }
};

export const createCategory = async (req, res) => {
  const { name, slug } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Category name is required.' });
  }

  const categorySlug = slugify(slug || name);

  try {
    const category = await Category.create({
      data: {
        name,
        slug: categorySlug
      }
    });
    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A category with this slug already exists.' });
    }
    res.status(500).json({ error: 'Failed to create category.' });
  }
};

export const deleteCategory = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    await Category.delete({
      where: { id }
    });
    res.json({ message: 'Category deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete category.' });
  }
};
