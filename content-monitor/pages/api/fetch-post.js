import Snoowrap from 'snoowrap';


const r = new Snoowrap({
    userAgent: 'ddd',   
    clientId: 'wwid93PKEjyWSGOZ_d7qoA',   
    clientSecret: 'g7b4U3Ufw1JyLvSuarJtsvuqzPrZJw',   
    refreshToken: '103191020185632-33fnsu5dr1uwZTzOEXqgZoXYMKZb-g',
});

export default async function handler(req, res) {
  const { url } = req.body;

  try {
    const postIdMatch = url.match(/comments\/([a-z0-9]+)/i);
    if (!postIdMatch || postIdMatch.length < 2) {
      throw new Error('Invalid post ID');
    }

    const postId = postIdMatch[1];
    const post = await r.getSubmission(postId).fetch();

    const postDetails = {
      title: post.title,
      author: post.author.name,
      created_utc: post.created_utc,
      upvotes: post.ups,
      comments: post.num_comments,
      views: post.view_count || 'N/A',
      is_deleted: post.author.name === '[deleted]',
    };

    res.status(200).json(postDetails);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch post', error: error.message });
  }
}