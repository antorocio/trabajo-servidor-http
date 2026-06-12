# Trabajo Servidor HTTP

Servidor backend desarrollado con **Node.js, Express, MongoDB, Mongoose y JWT**.
El proyecto implementa autenticación de usuarios, protección de rutas privadas y manejo de productos asociados al usuario autenticado.

## Tecnologías utilizadas

* Node.js
* Express
* MongoDB
* Mongoose
* JWT
* bcryptjs
* express-rate-limit
* dotenv
* cors

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/antorocio/trabajo-servidor-http.git
cd trabajo-servidor-http
```

Instalar dependencias:

```bash
npm install
```

Crear un archivo `.env` en la raíz del proyecto usando como referencia `.env.example`.

Ejemplo:

```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/db_tp_servidor
JWT_SECRET=contraseñasegurayprivada
```

Ejecutar el servidor:

```bash
npm run dev
```

El servidor queda disponible en:

```txt
http://localhost:3001
```

## Endpoints

### Autenticación

#### Registro

```http
POST /api/auth/register
```

Body:

```json
{
  "username": "Antonella",
  "email": "anto@example.com",
  "password": "Hola.123"
}
```

#### Login

```http
POST /auth/login
```

Body:

```json
{
  "email": "anto@example.com",
  "password": "Hola.123"
}
```

Respuesta:

```json
{
  "success": true,
  "data": "TOKEN_JWT",
  "message": "Token generado correctamente"
}
```

## Productos

Todas las rutas de productos requieren token JWT.

Header:

```txt
Authorization: Bearer TOKEN_JWT
```

### Obtener productos del usuario autenticado

```http
GET /products
```

### Crear producto

```http
POST /products
```

Body:

```json
{
  "name": "Citrino Natural",
  "price": 3500,
  "category": "Minerales",
  "stock": 5
}
```

### Actualizar producto

```http
PUT /products/:id
```

Body:

```json
{
  "price": 4000,
  "stock": 10
}
```

### Eliminar producto

```http
DELETE /products/:id
```

## Seguridad

* Las contraseñas se almacenan hasheadas con bcrypt.
* El login genera un token JWT.
* Las rutas de productos están protegidas mediante middleware de autenticación.
* Cada producto queda asociado al usuario autenticado.