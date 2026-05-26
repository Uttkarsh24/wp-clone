import Tag from '../models/tag.model.js';

const slugify = text => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

export const getTags = async (req, res) => {
  try {
    const tags = await Tag.findMany({
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });
    res.json(tags);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve tags.' });
  }
};

export const createTag = async (req, res) => {
  const { name, slug } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Tag name is required.' });
  }

  const tagSlug = slugify(slug || name);

  try {
    const tag = await Tag.create({
      data: {
        name,
        slug: tagSlug
      }
    });
    res.status(201).json(tag);
  } catch (error) {
    console.error(error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A tag with this slug already exists.' });
    }
    res.status(500).json({ error: 'Failed to create tag.' });
  }
};

export const deleteTag = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    await Tag.delete({
      where: { id }
    });
    res.json({ message: 'Tag deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete tag.' });
  }
};
