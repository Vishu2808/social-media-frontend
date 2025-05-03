const express = require('express');
const router = express.Router();
const hashtagController = require('../controllers/hashtagController');
const auth = require('../middleware/auth');

/**
 * @route   GET /api/hashtags/trending
 * @desc    Get trending hashtags
 * @access  Public
 */
router.get('/trending', hashtagController.getTrendingHashtags);

/**
 * @route   GET /api/hashtags/:hashtag/posts
 * @desc    Get posts by hashtag name
 * @access  Public
 * @params  hashtag - The hashtag name (without #)
 * @query   page - Page number (default: 1)
 * @query   limit - Posts per page (default: 10)
 */
router.get('/:hashtag/posts', hashtagController.getPostsByHashtag);

/**
 * @route   GET /api/hashtags/search
 * @desc    Search for hashtags
 * @access  Public
 * @query   q - Search query
 */
router.get('/search', hashtagController.searchHashtags);

/**
 * @route   POST /api/hashtags/:hashtag/follow
 * @desc    Follow a hashtag
 * @access  Private (requires authentication)
 * @params  hashtag - The hashtag name to follow (without #)
 */
router.post('/:hashtag/follow', auth, hashtagController.followHashtag);

/**
 * @route   DELETE /api/hashtags/:hashtag/follow
 * @desc    Unfollow a hashtag
 * @access  Private (requires authentication)
 * @params  hashtag - The hashtag name to unfollow (without #)
 */
router.delete('/:hashtag/follow', auth, hashtagController.unfollowHashtag);

/**
 * @route   GET /api/hashtags/following
 * @desc    Get hashtags followed by the current user
 * @access  Private (requires authentication)
 */
router.get('/following', auth, hashtagController.getFollowedHashtags);

module.exports = router;