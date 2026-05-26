import Comment from '../models/comment.model.js';

export const getComments = async (req, res) => {
  try {
    const comments = await Comment.findMany({
      include: {
        post: {
          select: { id: true, title: true, slug: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve comments.' });
  }
};

export const getCommentsByPostId = async (req, res) => {
  const postId = parseInt(req.params.postId);

  try {
    const comments = await Comment.findMany({
      where: {
        postId,
        status: 'APPROVED'
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve comments for this post.' });
  }
};

export const createComment = async (req, res) => {
  const { authorName, authorEmail, content, postId } = req.body;

  if (!authorName || !authorEmail || !content || !postId) {
    return res.status(400).json({ error: 'All comment fields and Post ID are required.' });
  }

  try {
    const comment = await Comment.create({
      data: {
        authorName,
        authorEmail,
        content,
        postId: parseInt(postId),
        status: 'PENDING'
      }
    });
    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit comment.' });
  }
};

export const moderateComment = async (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body; // APPROVED or PENDING

  if (!status || !['APPROVED', 'PENDING'].includes(status)) {
    return res.status(400).json({ error: 'Valid status (APPROVED/PENDING) is required.' });
  }

  try {
    const comment = await Comment.update({
      where: { id },
      data: { status }
    });
    res.json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to moderate comment.' });
  }
};

export const deleteComment = async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    await Comment.delete({
      where: { id }
    });
    res.json({ message: 'Comment deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete comment.' });
  }
};
