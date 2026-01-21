# 🚀 Guía de Deploy en Netlify

## Frontend (React/Vite) - En Netlify

### Paso 1: Conectar GitHub a Netlify
1. Ve a [netlify.com](https://netlify.com)
2. Login con GitHub
3. Click en "New site from Git"
4. Selecciona tu repositorio `brauni`
5. En Build Command: `npm run build`
6. En Publish directory: `dist`

### Paso 2: Configurar Variables de Entorno
1. En Netlify Dashboard → Site Settings → Build & Deploy → Environment
2. Agrega:
   - `VITE_API_URL` = `https://tu-backend-url.com`

### Paso 3: Deploy Automático
Cada push a `main` en GitHub deployará automáticamente.

---

## Backend (Node.js) - En Railway o Render

### Opción A: Railway (Recomendado - más fácil)

1. Ve a [railway.app](https://railway.app)
2. Login con GitHub
3. Click "New Project"
4. Selecciona "Deploy from GitHub repo"
5. Conecta `brauni`
6. Railway detectará `server/` automáticamente

**Configura Variables:**
- Click en "Variables"
- Agrega:
  ```
  DB_HOST = (tu host MySQL)
  DB_USER = root
  DB_PASSWORD = (tu password)
  DB_NAME = brauni_db
  GROQ_API_KEY = (tu clave)
  PORT = 3000
  ```

7. Railway generará una URL como: `https://brauni-production.up.railway.app`

### Opción B: Render.com

1. Ve a [render.com](https://render.com)
2. Login con GitHub
3. "New +" → "Web Service"
4. Conecta `brauni`
5. Configura:
   - Build Command: `cd server && npm install`
   - Start Command: `node index.js`
   - Root Directory: `server`
6. Agrega variables en "Environment"
7. Deploy

---

## Actualizar URLs en Netlify

Una vez tengas la URL del backend:

1. En Netlify Dashboard → Site Settings → Build & Deploy → Environment
2. Actualiza `VITE_API_URL` con tu URL de backend

Ejemplo:
- Frontend: `https://brauni-xyz.netlify.app`
- Backend: `https://brauni-production.up.railway.app`

---

## Verificar que todo funciona

1. Abre tu sitio Netlify
2. Intenta:
   - Hacer login
   - Ver libros
   - Eliminar un libro (debe aparecer notificación toast)
   - Agregar usuario

Si hay errores de CORS, edita `server/index.js`:

```javascript
app.use(cors({
    origin: 'https://brauni-xyz.netlify.app',
    credentials: true
}));
```

---

## Archivos importantes

- `netlify.toml` - Configuración de build para Netlify
- `.env.example` - Guía de variables
- `package.json` - Dependencias del frontend
- `server/package.json` - Dependencias del backend
