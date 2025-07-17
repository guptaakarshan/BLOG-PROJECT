// src/App.js
import React, { useState, useEffect } from "react";

// Base URL for our backend API
const API_BASE_URL = "http://localhost:5001/api/posts";

// Main App Component
const App = () => {
  // State to manage the current view: 'list', 'create', 'view', 'edit'
  const [currentView, setCurrentView] = useState("list");
  // State to store all blog posts fetched from the backend
  const [posts, setPosts] = useState([]);
  // State to store the currently selected post when viewing or editing
  const [selectedPost, setSelectedPost] = useState(null);
  // State for loading indicator
  const [loading, setLoading] = useState(false);
  // State for error messages
  const [error, setError] = useState(null);
  // State for success messages (e.g., "Post created successfully!")
  const [successMessage, setSuccessMessage] = useState(null);

  // useEffect hook to fetch all posts when the component mounts or when a post is created/updated/deleted
  useEffect(() => {
    fetchPosts();
  }, []); // Empty dependency array means this runs once on mount

  // Function to fetch all posts from the backend
  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch a single post by ID
  const fetchPostById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSelectedPost(data);
      setCurrentView("view"); // Switch to view mode after fetching
    } catch (err) {
      console.error("Error fetching post:", err);
      setError("Failed to load post details.");
      setCurrentView("list"); // Go back to list if post not found
    } finally {
      setLoading(false);
    }
  };

  // Function to handle creating a new post
  const handleCreatePost = async (postData) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }
      await response.json(); // Get the response, though we don't use it directly here
      setSuccessMessage("Post created successfully!");
      setCurrentView("list"); // Go back to list view
      fetchPosts(); // Refresh the list of posts
    } catch (err) {
      console.error("Error creating post:", err);
      setError(`Failed to create post: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle updating an existing post
  const handleUpdatePost = async (id, postData) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }
      await response.json();
      setSuccessMessage("Post updated successfully!");
      setCurrentView("list"); // Go back to list view
      fetchPosts(); // Refresh the list of posts
    } catch (err) {
      console.error("Error updating post:", err);
      setError(`Failed to update post: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle deleting a post
  const handleDeletePost = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return; // User cancelled deletion
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        // Even for 204 No Content, response.ok is true, but we might get an error if not found (404)
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setSuccessMessage("Post deleted successfully!");
      setCurrentView("list"); // Go back to list view
      fetchPosts(); // Refresh the list of posts
    } catch (err) {
      console.error("Error deleting post:", err);
      setError("Failed to delete post.");
    } finally {
      setLoading(false);
    }
  };

  // --- Components for different views ---

  // PostList Component
  const PostList = () => (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">All Blog Posts</h2>
      <button
        onClick={() => setCurrentView("create")}
        className="mb-6 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
      >
        Create New Post
      </button>

      {loading && <p className="text-indigo-600 text-lg">Loading posts...</p>}
      {error && <p className="text-red-600 text-lg font-medium">{error}</p>}
      {successMessage && (
        <p className="text-green-600 text-lg font-medium mb-4">
          {successMessage}
        </p>
      )}

      {posts.length === 0 && !loading && !error && (
        <p className="text-gray-600 text-lg">
          No posts available. Start by creating one!
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition duration-200"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {post.title}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              By {post.author} on {post.date}
            </p>
            <p className="text-gray-700 text-base mb-4 line-clamp-3">
              {post.content}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => fetchPostById(post.id)}
                className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition duration-300"
              >
                View
              </button>
              <button
                onClick={() => {
                  setSelectedPost(post);
                  setCurrentView("edit");
                }}
                className="px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-md hover:bg-yellow-600 transition duration-300"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeletePost(post.id)}
                className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 transition duration-300"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // PostDetail Component
  const PostDetail = ({ post, onBack, onEdit, onDelete }) => (
    <div className="p-8 bg-white rounded-lg shadow-xl max-w-3xl mx-auto">
      <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
        {post.title}
      </h2>
      <p className="text-lg text-gray-600 mb-6">
        By <span className="font-semibold">{post.author}</span> on{" "}
        <span className="font-semibold">{post.date}</span>
      </p>
      <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed mb-8">
        <p>{post.content}</p>
      </div>
      <div className="flex space-x-4">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75"
        >
          Back to List
        </button>
        <button
          onClick={onEdit}
          className="px-6 py-3 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-75"
        >
          Edit Post
        </button>
        <button
          onClick={() => onDelete(post.id)}
          className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
        >
          Delete Post
        </button>
      </div>
    </div>
  );

  // PostForm Component (for both Create and Edit)
  const PostForm = ({ post, onSubmit, onCancel }) => {
    const [title, setTitle] = useState(post ? post.title : "");
    const [content, setContent] = useState(post ? post.content : "");
    const [author, setAuthor] = useState(post ? post.author : "");

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!title || !content || !author) {
        alert("Please fill in all fields."); // Using alert for simplicity, consider a custom modal
        return;
      }
      onSubmit({ title, content, author });
    };

    return (
      <div className="p-8 bg-white rounded-lg shadow-xl max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          {post ? "Edit Post" : "Create New Post"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="8"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            ></textarea>
          </div>
          <div>
            <label
              htmlFor="author"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Author
            </label>
            <input
              type="text"
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
            >
              {post ? "Update Post" : "Create Post"}
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Main render logic based on currentView state
  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <header className="text-center mb-10">
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
          BlogHub
        </h1>
        <p className="text-xl text-blue-600 mt-2">
          Where thoughts find a home.
        </p>
      </header>

      <main className="container mx-auto px-4">
        {currentView === "list" && <PostList />}
        {currentView === "create" && (
          <PostForm
            onSubmit={handleCreatePost}
            onCancel={() => {
              setCurrentView("list");
              setError(null);
              setSuccessMessage(null);
            }}
          />
        )}
        {currentView === "view" && selectedPost && (
          <PostDetail
            post={selectedPost}
            onBack={() => {
              setCurrentView("list");
              setSelectedPost(null);
              setError(null);
              setSuccessMessage(null);
            }}
            onEdit={() => setCurrentView("edit")}
            onDelete={handleDeletePost}
          />
        )}
        {currentView === "edit" && selectedPost && (
          <PostForm
            post={selectedPost}
            onSubmit={(updatedData) =>
              handleUpdatePost(selectedPost.id, updatedData)
            }
            onCancel={() => {
              setCurrentView("view");
              setError(null);
              setSuccessMessage(null);
            }}
          />
        )}
      </main>
        <footer className="mt-10 py-4 text-center text-gray-600 text-sm">
        Made by Akarshan
      </footer>
    </div>
  );
};

export default App;
