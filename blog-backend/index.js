// Import necessary modules
const express = require('express');
const cors = require('cors'); // Import cors for cross-origin requests
const { v4: uuidv4 } = require('uuid'); // Import uuid library for unique IDs

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || 5001; // Define the port for the server

// Middleware:
// - Enable CORS for all origins. This is crucial for the frontend (running on a different port) to communicate with the backend.
app.use(cors());
// - Parse JSON bodies in incoming requests. This allows us to receive JSON data from the frontend (e.g., for new posts or updates).
app.use(express.json());

// In-memory "database" for blog posts.
// In a real application, this would be replaced by a persistent database like MongoDB, PostgreSQL, etc.
// For this project, data will be lost when the server restarts.
let posts = [
    {
        id: '1',
        title: 'My First Blog Post',
        content: 'This is the content of my very first blog post. It\'s exciting to get started!',
        author: 'Alice',
        date: new Date().toISOString().split('T')[0] // Current date in YYYY-MM-DD format
    },
    {
        id: '2',
        title: 'Learning React Hooks',
        content: 'React Hooks have revolutionized how we write React components. useState, useEffect, useContext are just a few examples.',
        author: 'Bob',
        date: new Date().toISOString().split('T')[0]
    },
    {
        id: '3',
        title: 'Introduction to Express.js',
        content: 'Express.js is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.',
        author: 'Charlie',
        date: new Date().toISOString().split('T')[0]
    }
];

// Helper function to generate a unique ID for new posts using uuid
const generateId = () => {
    return uuidv4(); // Generates a UUID (Universally Unique Identifier)
};

// --- API Endpoints ---

// GET all blog posts
// Path: /api/posts
// Returns: An array of all blog posts
app.get('/api/posts', (req, res) => {
    console.log('GET /api/posts - All posts requested');
    res.json(posts);
});

// GET a single blog post by ID
// Path: /api/posts/:id
// Returns: The blog post object if found, or 404 Not Found if not found
app.get('/api/posts/:id', (req, res) => {
    const { id } = req.params; // Extract ID from URL parameters
    const post = posts.find(p => p.id === id); // Find the post in the array

    if (post) {
        console.log(`GET /api/posts/${id} - Post found`);
        res.json(post);
    } else {
        console.log(`GET /api/posts/${id} - Post not found`);
        res.status(404).json({ message: 'Post not found' });
    }
});

// CREATE a new blog post
// Path: /api/posts
// Method: POST
// Body: JSON object with 'title', 'content', 'author'
// Returns: The newly created post object
app.post('/api/posts', (req, res) => {
    const { title, content, author } = req.body; // Extract data from request body

    // Basic validation
    if (!title || !content || !author) {
        console.log('POST /api/posts - Missing required fields');
        return res.status(400).json({ message: 'Title, content, and author are required' });
    }

    const newPost = {
        id: generateId(), // Generate a unique ID using uuid
        title,
        content,
        author,
        date: new Date().toISOString().split('T')[0] // Set current date
    };

    posts.push(newPost); // Add the new post to our in-memory array
    console.log('POST /api/posts - New post created:', newPost.id);
    res.status(201).json(newPost); // Respond with the created post and 201 Created status
});

// UPDATE an existing blog post
// Path: /api/posts/:id
// Method: PUT
// Body: JSON object with fields to update (e.g., 'title', 'content', 'author')
// Returns: The updated post object
app.put('/api/posts/:id', (req, res) => {
    const { id } = req.params; // Extract ID from URL parameters
    const { title, content, author } = req.body; // Extract updated data from request body

    const postIndex = posts.findIndex(p => p.id === id); // Find the index of the post

    if (postIndex !== -1) {
        // Update the existing post with new data, keeping the original ID and date
        posts[postIndex] = {
            ...posts[postIndex], // Keep existing properties
            title: title || posts[postIndex].title, // Update if provided, otherwise keep original
            content: content || posts[postIndex].content,
            author: author || posts[postIndex].author
        };
        console.log(`PUT /api/posts/${id} - Post updated`);
        res.json(posts[postIndex]); // Respond with the updated post
    } else {
        console.log(`PUT /api/posts/${id} - Post not found`);
        res.status(404).json({ message: 'Post not found' });
    }
});

// DELETE a blog post
// Path: /api/posts/:id
// Method: DELETE
// Returns: 204 No Content on successful deletion, or 404 Not Found
app.delete('/api/posts/:id', (req, res) => {
    const { id } = req.params; // Extract ID from URL parameters
    const initialLength = posts.length; // Store initial length to check if a post was removed

    // Filter out the post to be deleted
    posts = posts.filter(p => p.id !== id);

    if (posts.length < initialLength) {
        console.log(`DELETE /api/posts/${id} - Post deleted`);
        res.status(204).send(); // Respond with 204 No Content for successful deletion
    } else {
        console.log(`DELETE /api/posts/${id} - Post not found`);
        res.status(404).json({ message: 'Post not found' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
