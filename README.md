# MJ Vault

E-commerce responsive para una boutique 100% virtual. Incluye catálogo conectado a Supabase, carrito persistente, checkout con creación segura de pedido y continuación por WhatsApp, inventario por variantes y un panel administrativo protegido.

## Requisitos

- Node.js 20.9 o superior
- npm
- Proyecto de Supabase
- Cuenta de Vercel para producción

## Instalación

```bash
npm install
cp .env.example .env.local
npm run dev
```

La tienda estará disponible en `http://localhost:3000` y el acceso administrativo en `http://localhost:3000/admin/login`.

## Variables de entorno

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_NUMBER=573001234567
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon
SUPABASE_SERVICE_ROLE_KEY=tu_clave_service_role
```

`SUPABASE_SERVICE_ROLE_KEY` es exclusivamente de servidor. Nunca debe llevar el prefijo `NEXT_PUBLIC_` ni exponerse en el navegador.

## Base de datos y almacenamiento

1. Crea un proyecto en Supabase.
2. Abre **SQL Editor** y ejecuta `supabase/migrations/202609120001_initial_schema.sql`.
3. La migración crea tablas, índices, restricciones, funciones transaccionales, políticas RLS, el bucket `product-images` y el catálogo inicial extraído de las referencias proporcionadas.
4. Los productos iniciales tienen stock `0` porque las capturas no especifican existencias. Asigna stock real desde el administrador antes de venderlos.

El pedido se crea mediante una función PostgreSQL transaccional que vuelve a consultar y bloquea el inventario, descuenta stock y guarda snapshots de producto, variante y precio. Si se cancela un pedido, el inventario se restaura una sola vez.

## Crear la primera administradora

No existe registro público. En Supabase:

1. Ve a **Authentication → Users → Add user** y crea la cuenta con correo confirmado.
2. Copia el UUID de la usuaria.
3. Ejecuta en SQL Editor:

```sql
insert into public.profiles (id, role, full_name)
values ('UUID_DE_LA_USUARIA', 'ADMIN', 'Nombre de la propietaria');
```

Las rutas administrativas comprueban sesión y rol en servidor. RLS limita las operaciones sensibles a perfiles `ADMIN`.

## Uso del administrador

- **Dashboard:** inventario, productos y pedidos recientes.
- **Productos:** crear, editar, duplicar, ocultar y eliminar productos; subir y ordenar imágenes; manejar tallas, colores y stock por combinación.
- **Categorías:** crear y organizar categorías dinámicas.
- **Pedidos:** consultar datos completos, contactar por WhatsApp y cambiar estado.
- **Configuración:** WhatsApp, redes, portada, banner y políticas.

El número de WhatsApp puede configurarse en el panel. Si está vacío, se usa `NEXT_PUBLIC_WHATSAPP_NUMBER`.

## Comprobaciones

```bash
npm run lint
npm run typecheck
npm run build
```

## Despliegue en Vercel

1. Importa el repositorio en Vercel.
2. Configura las cinco variables indicadas arriba y usa la URL final como `NEXT_PUBLIC_SITE_URL`.
3. Ejecuta la migración en el proyecto Supabase de producción y crea la administradora.
4. Despliega. Vercel detectará Next.js y ejecutará `npm run build`.
5. En Supabase, agrega la URL de producción en **Authentication → URL Configuration**.

## Seguridad

- No confirmes secretos ni archivos `.env` en Git.
- Rota inmediatamente cualquier clave que se haya expuesto.
- Mantén RLS habilitado.
- Revisa y publica las políticas comerciales reales antes del lanzamiento.
- Los endpoints validan datos en servidor, limitan intentos de checkout y verifican tipo, firma y tamaño de las imágenes.
