import jwt from 'jsonwebtoken';
import Post from '../models/post.model.js';
import { JWT_SECRET } from '../middlewares/auth.middleware.js';

const slugify = text => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

export const getPosts = async (req, res) => {
  const { status, category, tag, search, page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  try {
    const where = {};

    // Auth check to determine whether we can view drafts
    let showAll = false;
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          jwt.verify(token, JWT_SECRET);
          showAll = true;
        } catch (e) {}
      }
    }

    if (!showAll || status === 'PUBLISHED') {
      where.status = 'PUBLISHED';
    } else if (status) {
      where.status = status;
    }

    // Filter by Category Slug
    if (category) {
      where.category = {
        slug: category
      };
    }

    // Filter by Tag Slug
    if (tag) {
      where.tags = {
        some: {
          slug: tag
        }
      };
    }

    // Filter by Search Query
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { excerpt: { contains: search } }
      ];
    }

    const posts = await Post.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        tags: true,
        author: {
          select: { id: true, username: true, email: true }
        },
        _count: {
          select: { comments: true }
        }
      }
    });

    const total = await Post.count({ where });

    res.json({
      posts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve posts.' });
  }
};

export const getPostBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    const post = await Post.findUnique({
      where: { slug },
      include: {
        category: true,
        tags: true,
        author: {
          select: { id: true, username: true, email: true }
        },
        comments: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    // Restrict drafts unless authorized
    if (post.status !== 'PUBLISHED') {
      let authorized = false;
      const authHeader = req.headers['authorization'];
      if (authHeader) {
        const token = authHeader.split(' ')[1];
        if (token) {
          try {
            jwt.verify(token, JWT_SECRET);
            authorized = true;
          } catch (e) {}
        }
      }
      if (!authorized) {
        return res.status(403).json({ error: 'This post is a draft and cannot be viewed.' });
      }
    }

    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error retrieving post.' });
  }
};

export const createPost = async (req, res) => {
  const { title, slug, content, excerpt, status, featuredImage, categoryId, tags } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required.' });
  }

  const postSlug = slugify(slug || title);
  const postExcerpt = excerpt || content.substring(0, 150).replace(/<[^>]*>/g, '') + '...';

  // Parse tags
  const tagsArray = Array.isArray(tags) 
    ? tags.filter(Boolean) 
    : (typeof tags === 'string' 
      ? tags.split(',').map(t => t.trim()).filter(Boolean) 
      : []);

  try {
    const post = await Post.create({
      data: {
        title,
        slug: postSlug,
        content,
        excerpt: postExcerpt,
        status: status || 'DRAFT',
        featuredImage: featuredImage || null,
        categoryId: categoryId ? parseInt(categoryId) : null,
        authorId: req.user.userId,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        tags: {
          connectOrCreate: tagsArray.map(tag => ({
            where: { slug: slugify(tag) },
            create: { name: tag, slug: slugify(tag) }
          }))
        }
      },
      include: {
        category: true,
        tags: true
      }
    });

    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A post with this slug already exists.' });
    }
    res.status(500).json({ error: 'Failed to create post.' });
  }
};

export const updatePost = async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, slug, content, excerpt, status, featuredImage, categoryId, tags } = req.body;

  try {
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slugify(slug || title);
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) {
      updateData.excerpt = excerpt;
    } else if (content !== undefined) {
      updateData.excerpt = content.substring(0, 150).replace(/<[^>]*>/g, '') + '...';
    }
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'PUBLISHED') {
        updateData.publishedAt = new Date();
      }
    }
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage;
    if (categoryId !== undefined) updateData.categoryId = categoryId ? parseInt(categoryId) : null;

    if (tags !== undefined) {
      const tagsArray = Array.isArray(tags) 
        ? tags.filter(Boolean) 
        : (typeof tags === 'string' 
          ? tags.split(',').map(t => t.trim()).filter(Boolean) 
          : []);

      updateData.tags = {
        set: [],
        connectOrCreate: tagsArray.map(tag => ({
          where: { slug: slugify(tag) },
          create: { name: tag, slug: slugify(tag) }
        }))
      };
    }

    const post = await Post.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        tags: true
      }
    });

    res.json(post);
  } catch (error) {
    console.error(error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A post with this slug already exists.' });
    }
    res.status(500).json({ error: 'Failed to update post.' });
  }
};

export const deletePost = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    await Post.delete({
      where: { id }
    });
    res.json({ message: 'Post deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete post.' });
  }
};
