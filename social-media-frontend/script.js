// DOM Elements
const postsContainer = document.getElementById('posts-container');
const trendingHashtagsList = document.getElementById('trending-hashtags');
const suggestedUsersList = document.getElementById('suggested-users');
const userProfilePic = document.getElementById('user-profile-pic');
const usernameElement = document.getElementById('username');

// Sample Data (Replace with actual API calls to your backend)
let currentUser = {
    user_id: 1,
    username: 'johndoe',
    profile_photo_url: 'https://picsum.photos/100',
    bio: 'Digital creator | Photography enthusiast',
    email: 'john@example.com'
};

let posts = [
    {
        post_id: 1,
        user_id: 2,
        username: 'janedoe',
        profile_photo_url: 'https://picsum.photos/101',
        photo_url: 'https://picsum.photos/500',
        caption: 'Enjoying the beautiful sunset! #sunset #nature',
        location: 'Malibu, CA',
        created_at: '2023-05-15T18:30:00',
        likes: 124,
        comments: 23,
        is_liked: false,
        hashtags: ['sunset', 'nature']
    },
    {
        post_id: 2,
        user_id: 3,
        username: 'traveler',
        profile_photo_url: 'https://picsum.photos/102',
        video_url: 'https://example.com/video1.mp4',
        caption: 'My latest travel vlog is up! Check it out! #travel #vlog',
        location: 'Bali, Indonesia',
        created_at: '2023-05-14T12:15:00',
        likes: 342,
        comments: 45,
        is_liked: true,
        hashtags: ['travel', 'vlog']
    }
];

let trendingHashtags = [
    {hashtag_id: 1, hashtag_name: 'summer', post_count: 12500},
    {hashtag_id: 2, hashtag_name: 'photography', post_count: 9800},
    {hashtag_id: 3, hashtag_name: 'travel', post_count: 8700},
    {hashtag_id: 4, hashtag_name: 'food', post_count: 7600},
    {hashtag_id: 5, hashtag_name: 'fitness', post_count: 6500}
];

let suggestedUsers = [
    {user_id: 4, username: 'photographer', profile_photo_url: 'https://picsum.photos/103', bio: 'Professional photographer'},
    {user_id: 5, username: 'chef', profile_photo_url: 'https://picsum.photos/104', bio: 'Food lover & chef'},
    {user_id: 6, username: 'fitnessguru', profile_photo_url: 'https://picsum.photos/105', bio: 'Fitness trainer'}
];

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Set current user info
    userProfilePic.src = currentUser.profile_photo_url;
    usernameElement.textContent = currentUser.username;
    
    // Load posts
    renderPosts();
    
    // Load trending hashtags
    renderTrendingHashtags();
    
    // Load suggested users
    renderSuggestedUsers();
});

// Render Posts
function renderPosts() {
    postsContainer.innerHTML = '';
    
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        
        let mediaContent = '';
        if (post.photo_url) {
            mediaContent = `<img src="${post.photo_url}" alt="Post image" class="post-image">`;
        } else if (post.video_url) {
            mediaContent = `<video controls class="post-video">
                              <source src="${post.video_url}" type="video/mp4">
                              Your browser does not support the video tag.
                            </video>`;
        }
        
        const likeIcon = post.is_liked ? 'fas fa-heart' : 'far fa-heart';
        
        postElement.innerHTML = `
            <div class="post-header">
                <img src="${post.profile_photo_url}" alt="${post.username}">
                <div class="post-user-info">
                    <div class="username">${post.username}</div>
                    <div class="location">${post.location}</div>
                </div>
                <div class="post-more"><i class="fas fa-ellipsis-h"></i></div>
            </div>
            <div class="post-content">
                ${mediaContent}
                <div class="post-caption">${post.caption}</div>
            </div>
            <div class="post-footer">
                <div class="post-actions">
                    <div class="post-actions-left">
                        <i class="${likeIcon}" data-post-id="${post.post_id}" onclick="toggleLike(${post.post_id})"></i>
                        <i class="far fa-comment" onclick="focusComment(${post.post_id})"></i>
                        <i class="far fa-paper-plane"></i>
                    </div>
                    <i class="far fa-bookmark"></i>
                </div>
                <div class="post-likes">${post.likes} likes</div>
                <div class="post-comments">View all ${post.comments} comments</div>
                <div class="post-time">${formatTime(post.created_at)}</div>
            </div>
        `;
        
        postsContainer.appendChild(postElement);
    });
}

// Render Trending Hashtags
function renderTrendingHashtags() {
    trendingHashtagsList.innerHTML = '';
    
    trendingHashtags.forEach(hashtag => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="#">#${hashtag.hashtag_name}</a> <span>${hashtag.post_count.toLocaleString()} posts</span>`;
        trendingHashtagsList.appendChild(li);
    });
}

// Render Suggested Users
function renderSuggestedUsers() {
    suggestedUsersList.innerHTML = '';
    
    suggestedUsers.forEach(user => {
        const li = document.createElement('li');
        li.innerHTML = `
            <img src="${user.profile_photo_url}" alt="${user.username}">
            <div class="user-info">
                <div class="username">${user.username}</div>
                <div class="bio">${user.bio}</div>
            </div>
            <div class="follow-btn">Follow</div>
        `;
        suggestedUsersList.appendChild(li);
    });
}

// Helper Functions
function formatTime(timestamp) {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diff = now - postTime;
    
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

// Event Handlers
function toggleLike(postId) {
    const post = posts.find(p => p.post_id === postId);
    if (post) {
        post.is_liked = !post.is_liked;
        post.likes += post.is_liked ? 1 : -1;
        renderPosts();
        
        // In a real app, you would make an API call here
        // fetch(`/api/posts/${postId}/like`, {
        //     method: post.is_liked ? 'POST' : 'DELETE',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${authToken}`
        //     }
        // });
    }
}

function focusComment(postId) {
    // In a real app, this would focus the comment input for the post
    console.log(`Focus comment for post ${postId}`);
}

// API Functions (These would be replaced with actual fetch calls to your backend)
async function fetchPosts() {
    try {
        // const response = await fetch('/api/posts');
        // const data = await response.json();
        // posts = data;
        // renderPosts();
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

async function fetchTrendingHashtags() {
    try {
        // const response = await fetch('/api/hashtags/trending');
        // const data = await response.json();
        // trendingHashtags = data;
        // renderTrendingHashtags();
    } catch (error) {
        console.error('Error fetching trending hashtags:', error);
    }
}

async function fetchSuggestedUsers() {
    try {
        // const response = await fetch('/api/users/suggested');
        // const data = await response.json();
        // suggestedUsers = data;
        // renderSuggestedUsers();
    } catch (error) {
        console.error('Error fetching suggested users:', error);
    }
}