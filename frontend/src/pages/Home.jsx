import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Folder, Tag, Calendar, User, ArrowRight } from 'lucide-react';
import { API_BASE } from '../App';

function Home() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchVal, setSearchVal] = useState(searchParams.get('search') || '');

  const currentCategory = searchParams.get('category');
  const currentTag = searchParams.get('tag');
  const currentSearch = searchParams.get('search');

  useEffect(() => {
    setLoading(true);
    let url = `${API_BASE}/posts?status=PUBLISHED`;
    if (currentCategory) url += `&category=${currentCategory}`;
    if (currentTag) url += `&tag=${currentTag}`;
    if (currentSearch) url += `&search=${currentSearch}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setPosts(data.posts || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [currentCategory, currentTag, currentSearch]);

  useEffect(() => {
    // Load categories & tags for sidebar
    fetch(`${API_BASE}/categories`)
      .then(res => res.json())
      .then(data => setCategories(data || []));

    fetch(`${API_BASE}/tags`)
      .then(res => res.json())
      .then(data => setTags(data || []));
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      setSearchParams({ search: searchVal.trim() });
    } else {
      searchParams.delete('search');
      setSearchParams(searchParams);
    }
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearchVal('');
  };

  return (
    <div className="container" style={{ display: 'flex', gap: '48px' }}>
      {/* Blog Posts Column */}
      <div style={{ flexGrow: 1, maxWidth: '800px' }}>
        <div style={{ marginBottom: '40px' }}>
          {currentCategory && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
              <Folder size={18} />
              <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Category: {currentCategory}</h2>
              <button onClick={clearFilters} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px', marginLeft: 'auto' }}>Clear Filter</button>
            </div>
          )}
          {currentTag && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
              <Tag size={18} />
              <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Tag: {currentTag}</h2>
              <button onClick={clearFilters} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px', marginLeft: 'auto' }}>Clear Filter</button>
            </div>
          )}
          {currentSearch && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
              <Search size={18} />
              <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Search results for: "{currentSearch}"</h2>
              <button onClick={clearFilters} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px', marginLeft: 'auto' }}>Clear Filter</button>
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading posts...</div>
        ) : posts.length === 0 ? (
          <div style={{ padding: '80px 40px', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
            No posts found. Try clearing filter or adding some articles in the admin console.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            {posts.map((post) => (
              <article key={post.id} className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                {post.featuredImage && (
                  <div style={{ width: '100%', height: '320px', overflow: 'hidden' }}>
                    <img 
                      src={`http://localhost:5000${post.featuredImage}`} 
                      alt={post.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'var(--transition)' }}
                    />
                  </div>
                )}
                
                <div style={{ padding: '40px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={14} /> {post.author.username}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} /> {new Date(post.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </span>
                    {post.category && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)' }}>
                        <Folder size={14} /> {post.category.name}
                      </span>
                    )}
                  </div>

                  <Link to={`/post/${post.slug}`} style={{ display: 'block', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: 800, lineHeight: 1.3, letterSpacing: '-0.5px' }}>
                      {post.title}
                    </h2>
                  </Link>

                  <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginBottom: '24px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {post.excerpt}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link to={`/post/${post.slug}`} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}>
                      <span>Read More</span>
                      <ArrowRight size={14} />
                    </Link>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {post.tags.slice(0, 3).map(tag => (
                        <Link key={tag.id} to={`/?tag=${tag.slug}`} style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-surface-elevated)', color: 'var(--text-muted)' }}>
                          #{tag.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar Column */}
      <aside style={{ width: '320px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {/* Search Widget */}
        <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Search Articles</h3>
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              className="form-control"
              style={{ paddingRight: '40px' }}
            />
            <button type="submit" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <Search size={18} />
            </button>
          </form>
        </div>

        {/* Categories Widget */}
        <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Categories</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {categories.map((cat) => (
              <Link 
                key={cat.id} 
                to={`/?category=${cat.slug}`} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontSize: '15px', 
                  color: currentCategory === cat.slug ? 'var(--primary)' : 'var(--text-muted)' 
                }}
              >
                <span>{cat.name}</span>
                <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '10px', backgroundColor: 'var(--bg-surface-elevated)' }}>
                  {cat._count?.posts || 0}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Tags Widget */}
        <div className="glass" style={{ padding: '24px', borderRadius: 'var(--radius-md)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Popular Tags</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {tags.map((tag) => (
              <Link 
                key={tag.id} 
                to={`/?tag=${tag.slug}`} 
                style={{ 
                  fontSize: '13px', 
                  padding: '6px 12px', 
                  borderRadius: 'var(--radius-sm)', 
                  backgroundColor: currentTag === tag.slug ? 'var(--primary)' : 'var(--bg-surface-elevated)', 
                  color: currentTag === tag.slug ? 'white' : 'var(--text-muted)',
                  border: '1px solid var(--border)'
                }}
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

export default Home;
