import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/Card';
import Modal from '../components/Modal';import { API_BASE_URL } from '../config';import { Search, Filter, Star, Book, Plus, Loader2, Upload, X } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BookCatalog = () => {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookId, setSelectedBookId] = useState(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
      title: '', author: '', isbn: '', category: '', cover_color: '#3b82f6'
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Fetch books on mount
  useEffect(() => {
     fetchBooks();

     const handleUpdate = () => fetchBooks();
     window.addEventListener('library-updated', handleUpdate);
     return () => window.removeEventListener('library-updated', handleUpdate);
  }, []);

  const fetchBooks = async () => {
     try {
        const res = await fetch(`${API_BASE_URL}/api/books?t=${Date.now()}`);
        if (res.ok) {
           const data = await res.json();
           setBooks(data);
        }
     } catch (err) {
        console.error('Failed to fetch books', err);
     } finally {
        setLoading(false);
     }
  };

  const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          setSelectedImage(file);
          const url = URL.createObjectURL(file);
          setPreviewUrl(url);
      }
  };

  const handleAddBook = async (e) => {
      e.preventDefault();
      setFormLoading(true);

      const submitData = new FormData();
      Object.keys(formData).forEach(key => submitData.append(key, formData[key]));
      if (selectedImage) {
          submitData.append('image', selectedImage);
      }

      try {
          const res = await fetch(`${API_BASE_URL}/api/books`, {
              method: 'POST',
              body: submitData // Fetch sets Content-Type header specific to Boundary 
          });

          if (res.ok) {
              const newBook = await res.json();
              setBooks(prev => [newBook, ...prev]);
              setIsModalOpen(false);
              // Reset
              setFormData({ title: '', author: '', isbn: '', category: '', cover_color: '#3b82f6' });
              setSelectedImage(null);
              setPreviewUrl(null);
          } else {
              alert('Error creating book');
          }
      } catch (err) {
          alert('Connection Error');
      } finally {
          setFormLoading(false);
      }
  };

  const handleDeleteBook = async (bookId) => {
      if (!window.confirm('¿Estás seguro de que quieres eliminar este libro?')) return;

      try {
          const res = await fetch(`${API_BASE_URL}/api/books/${bookId}`, {
              method: 'DELETE'
          });

          if (res.ok) {
              setBooks(prev => prev.filter(b => b.id !== bookId));
              setSelectedBookId(null);
              toast.success('✅ Libro eliminado exitosamente', {
                  position: 'top-right',
                  autoClose: 3000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
              });
          } else {
              toast.error('❌ Error eliminando libro', {
                  position: 'top-right',
                  autoClose: 3000,
              });
          }
      } catch (err) {
          toast.error('❌ Error de conexión', {
              position: 'top-right',
              autoClose: 3000,
          });
      }
  };

  // Derive categories dynamically
  const categories = ['Todos', ...new Set(books.map(b => b.category).filter(Boolean))];

  const filteredBooks = books.filter(book => {
     const matchesCategory = activeCategory === 'Todos' || book.category === activeCategory;
     const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           book.author.toLowerCase().includes(searchQuery.toLowerCase());
     return matchesCategory && matchesSearch;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
         <div>
            <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Catálogo de Libros</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Explora nuestra colección y ediciones especiales</p>
         </div>
         <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
               <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
               <input 
                 type="text" 
                 placeholder="Buscar título..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 style={{ 
                    padding: '10px 10px 10px 36px', 
                    borderRadius: 'var(--radius-full)', 
                    border: '1px solid var(--border-subtle)', 
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    minWidth: '250px'
                 }} 
               />
            </div>
            <button 
                onClick={() => setIsModalOpen(true)}
                style={{ 
                   display: 'flex', alignItems: 'center', gap: '8px',
                   padding: '10px 20px', 
                   background: '#ffffff', // Explicit white
                   color: '#000000',      // Explicit black for contrast
                   borderRadius: 'var(--radius-md)', 
                   fontWeight: '600',
                   cursor: 'pointer',
                   border: 'none',
                   transition: 'transform 0.1s'
                }}
            >
                <Plus size={18} />
                <span>Añadir Libro</span>
            </button>
         </div>
      </div>

      {/* Categories Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: 'var(--space-xl)', overflowX: 'auto', paddingBottom: '4px' }}>
         {categories.map(cat => (
            <button
               key={cat}
               onClick={() => setActiveCategory(cat)}
               style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  background: activeCategory === cat ? 'var(--text-primary)' : 'transparent',
                  color: activeCategory === cat ? 'var(--bg-app)' : 'var(--text-secondary)',
                  border: activeCategory === cat ? 'none' : '1px solid var(--border-subtle)'
               }}
            >
               {cat}
            </button>
         ))}
      </div>

      {/* Books Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
           <Loader2 className="animate-spin" size={32} color="var(--primary)" />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '30px' }}>
           {filteredBooks.map(book => {
              // Priority: cover_image (server) -> cover_color (gradient)
              const hasImage = !!book.cover_image;
              const bgStyle = hasImage 
                  ? { backgroundImage: `url(https://brauni-backend.onrender.com${book.cover_image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { background: `linear-gradient(135deg, ${book.cover_color || '#334155'}, #020617)` };
              
              return (
              <div key={book.id} className="book-card-container">
                 {/* Cover */}
                 <div 
                    className="book-cover" 
                    style={bgStyle}
                    onClick={() => setSelectedBookId(selectedBookId === book.id ? null : book.id)}
                 >
                    {!hasImage && <Book size={40} color="white" style={{ opacity: 0.3 }} />}

                    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                       {book.status !== 'Available' && (
                          <span style={{ 
                             background: 'rgba(0,0,0,0.6)', color: 'white', 
                             fontSize: '10px', padding: '4px 8px', borderRadius: '4px',
                             fontWeight: '600'
                          }}>
                             {book.status === 'Loaned' ? 'PRESTADO' : book.status}
                          </span>
                       )}
                    </div>
                    {/* Spine Effect */}
                    <div className="book-spine"></div>

                    {/* Options Overlay */}
                    {selectedBookId === book.id && (
                       <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(0,0,0,0.85)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '12px',
                          borderRadius: '4px 12px 12px 4px',
                          padding: '16px'
                       }}>
                          <button
                             onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteBook(book.id);
                             }}
                             style={{
                                width: '100%',
                                padding: '10px',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                             }}
                             onMouseEnter={(e) => e.target.style.background = '#dc2626'}
                             onMouseLeave={(e) => e.target.style.background = '#ef4444'}
                          >
                             🗑️ Eliminar
                          </button>
                       </div>
                    )}
                 </div>

                 {/* Book Details */}
                 <div style={{ marginTop: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px', lineHeight: '1.4' }}>{book.title}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{book.author}</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{book.category}</span>
                    </div>
                 </div>
              </div>
           )})}
        </div>
      )}

      {/* Add Book Modal */}
      <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          title="Añadir Nuevo Libro"
       >
          <form onSubmit={handleAddBook} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
             
             {/* Image Upload Area */}
             <div 
                onClick={() => fileInputRef.current.click()}
                style={{ 
                   height: '150px', border: '2px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)',
                   display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                   cursor: 'pointer', background: previewUrl ? `url(${previewUrl}) center/contain no-repeat` : 'var(--bg-app)',
                   position: 'relative', overflow: 'hidden'
                 }}
             >
                {!previewUrl && (
                    <>
                       <Upload size={24} color="var(--text-tertiary)" style={{ marginBottom: '8px' }} />
                       <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Click para subir portada</span>
                    </>
                )}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                />
                {previewUrl && (
                    <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); setPreviewUrl(null); setSelectedImage(null); }}
                        style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '4px', color: 'white' }}
                    >
                        <X size={14} />
                    </button>
                )}
             </div>

             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                   <label className="input-label">Título</label>
                   <input className="modal-input" name="title" value={formData.title} onChange={handleInputChange} required placeholder="El Principito" />
                </div>
                <div>
                   <label className="input-label">Autor</label>
                   <input className="modal-input" name="author" value={formData.author} onChange={handleInputChange} required placeholder="Antoine..." />
                </div>
                <div>
                   <label className="input-label">ISBN</label>
                   <input className="modal-input" name="isbn" value={formData.isbn} onChange={handleInputChange} required placeholder="978-..." />
                </div>
                <div>
                   <label className="input-label">Categoría</label>
                   <input className="modal-input" name="category" value={formData.category} onChange={handleInputChange} placeholder="Ficción" />
                </div>
             </div>
             
             <div>
                <label className="input-label">Color de Portada (Si no hay img)</label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                   {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map(color => (
                      <div 
                         key={color} 
                         onClick={() => setFormData(prev => ({ ...prev, cover_color: color }))}
                         style={{ 
                             width: '24px', height: '24px', borderRadius: '50%', background: color, 
                             cursor: 'pointer', border: formData.cover_color === color ? '2px solid white' : 'none',
                             outline: formData.cover_color === color ? '2px solid var(--primary)' : 'none'
                         }}
                      ></div>
                   ))}
                </div>
             </div>

             <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                 <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px', color: 'var(--text-secondary)' }}>Cancelar</button>
                 <button type="submit" disabled={formLoading} style={{ padding: '10px 24px', background: 'var(--primary)', color: 'var(--bg-app)', borderRadius: '6px', fontWeight: 'bold', opacity: formLoading ? 0.7 : 1 }}>
                    {formLoading ? 'Guardando...' : 'Añadir Libro'}
                 </button>
             </div>
          </form>
      </Modal>

      <style>{`
         .book-card-container {
            group;
            cursor: pointer;
         }
         .book-cover {
            height: 280px;
            border-radius: 4px 12px 12px 4px;
            box-shadow: 
               -2px 0 4px rgba(0,0,0,0.4), /* Spine shadow */
               5px 5px 15px rgba(0,0,0,0.3); /* Drop shadow */
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
         }
         .book-card-container:hover .book-cover {
            transform: translateY(-8px) rotateY(-5deg);
            box-shadow: 
               -2px 0 4px rgba(0,0,0,0.4),
               10px 15px 25px rgba(0,0,0,0.4);
         }
         .book-spine {
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 12px;
            background: linear-gradient(90deg, rgba(255,255,255,0.1), rgba(0,0,0,0.2) 40%, rgba(255,255,255,0.05));
            border-radius: 4px 0 0 4px;
         }
         .animate-spin {
             animation: spin 1s linear infinite;
         }
         @keyframes spin {
             from { transform: rotate(0deg); }
             to { transform: rotate(360deg); }
         }
         .input-label { /* Reused from other file, should be global but works here due to scoped style tag in loop */
             display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;
         }
         .modal-input {
             width: 100%; padding: 10px; background: var(--bg-app); border: 1px solid var(--border-subtle); borderRadius: 6px; color: var(--text-primary);
         }
      `}</style>

      {/* Toast Notifications */}
      <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
      />

      <style>{`
         /* Toast Customization - Dark Theme */
         .Toastify__toast-container {
            padding: 0;
            width: auto;
         }
         .Toastify__toast {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: var(--radius-md);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
            font-family: inherit;
            padding: 16px;
            margin-bottom: 12px;
         }
         .Toastify__toast--success {
            background: var(--bg-card);
            border-left: 4px solid var(--status-success);
         }
         .Toastify__toast--error {
            background: var(--bg-card);
            border-left: 4px solid var(--status-danger);
         }
         .Toastify__toast--warning {
            background: var(--bg-card);
            border-left: 4px solid var(--status-warning);
         }
         .Toastify__toast-body {
            color: #ffffff;
            font-weight: 500;
            padding: 0;
         }
         .Toastify__progress-bar {
            background: linear-gradient(90deg, var(--status-success), var(--status-warning));
         }
         .Toastify__toast--success .Toastify__progress-bar {
            background: var(--status-success);
         }
         .Toastify__toast--error .Toastify__progress-bar {
            background: var(--status-danger);
         }
         .Toastify__close-button {
            color: #ffffff;
            opacity: 0.7;
         }
         .Toastify__close-button:hover {
            opacity: 1;
         }
      `}</style>
    </div>
  );
};

export default BookCatalog;
