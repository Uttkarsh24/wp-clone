import jwt from 'jsonwebtoken';
import Page from '../models/page.model.js';
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

export const getPages = async (req, res) => {
  const { status } = req.query;

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

    const pages = await Page.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    res.json(pages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve pages.' });
  }
};

export const getPageBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    const page = await Page.findUnique({
      where: { slug }
    });

    if (!page) {
      return res.status(404).json({ error: 'Page not found.' });
    }

    // Restrict drafts unless authorized
    if (page.status !== 'PUBLISHED') {
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
        return res.status(403).json({ error: 'This page is a draft and cannot be viewed.' });
      }
    }

    res.json(page);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error retrieving page.' });
  }
};

export const createPage = async (req, res) => {
  const { title, slug, content, status } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required.' });
  }

  const pageSlug = slugify(slug || title);

  try {
    const page = await Page.create({
      data: {
        title,
        slug: pageSlug,
        content,
        status: status || 'DRAFT'
      }
    });
    res.status(201).json(page);
  } catch (error) {
    console.error(error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A page with this slug already exists.' });
    }
    res.status(500).json({ error: 'Failed to create page.' });
  }
};

export const updatePage = async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, slug, content, status } = req.body;

  try {
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slugify(slug || title);
    if (content !== undefined) updateData.content = content;
    if (status !== undefined) updateData.status = status;

    const page = await Page.update({
      where: { id },
      data: updateData
    });
    res.json(page);
  } catch (error) {
    console.error(error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A page with this slug already exists.' });
    }
    res.status(500).json({ error: 'Failed to update page.' });
  }
};

export const deletePage = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    await Page.delete({
      where: { id }
    });
    res.json({ message: 'Page deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete page.' });
  }
};
