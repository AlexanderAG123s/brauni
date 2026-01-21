# 🐘 Migración de MySQL a PostgreSQL

## Cambios realizados:

✅ **db.js**: 
- Cambió de `mysql2/promise` a `pg`
- Ahora usa `Pool` de PostgreSQL

✅ **schema.sql**:
- `INT AUTO_INCREMENT` → `SERIAL`
- `DATETIME` → `TIMESTAMP`
- Sintaxis compatible con PostgreSQL

✅ **package.json**:
- Removido: `mysql2`
- Agregado: `pg`

✅ **.env.example**:
- `DB_PORT` = 5432 (por defecto de PostgreSQL)
- `DB_USER` = postgres (usuario por defecto)

---

## 📋 Próximos pasos:

### 1. Crear base de datos en PostgreSQL:

```sql
CREATE DATABASE brauni_db;
```

### 2. Ejecutar schema.sql:

```bash
psql -U postgres -d brauni_db -f schema.sql
```

### 3. Actualizar tu `.env` local:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=brauni_db
GROQ_API_KEY=tu_clave
PORT=3000
```

### 4. Iniciar servidor:

```bash
npm start
```

---

## 🚀 Para producción (Render/Railway):

Ambas plataformas soportan PostgreSQL gratuitamente. Solo necesitas:

1. En tu proveedor (Render/Railway), crear una instancia PostgreSQL
2. Copiar las credenciales
3. Agregar variables en el dashboard

¡Listo! PostgreSQL es más robusto y mejor para producción. 💙
