# Manual de Operación — Panel de Administración
## MJ Vault | Boutique Virtual & Importaciones

Bienvenido al manual oficial de administración de **MJ Vault**. Este documento detalla paso a paso el funcionamiento del panel de control de la tienda en línea, diseñado para gestionar productos, inventarios, pedidos y envíos de manera ágil y sin complicaciones técnicas.

---

## 1. Acceso al Panel de Control

### 1.1. Dirección de acceso
El panel de administración se encuentra en:
- **Producción:** `https://mj-vaultimportacionesmx.vercel.app/admin`
- **Desarrollo local:** `http://localhost:3000/admin`

*(Si no has iniciado sesión, el sistema te redirigirá automáticamente a la pantalla de ingreso en `/admin/login`).*

### 1.2. Credenciales de acceso
Ingresa el correo electrónico autorizado y la contraseña designada para tu cuenta de administrador. Una vez autenticado, tendrás acceso total a todas las herramientas de gestión.

### 1.3. Cierre de sesión
En la barra lateral izquierda, al final del menú, encontrarás el botón **Cerrar sesión**. Se recomienda utilizarlo siempre que termines tus labores operativas en dispositivos compartidos.

---

## 2. Visión General (Dashboard)

Al ingresar, el panel te muestra un resumen ejecutivo en tiempo real:
- **Ventas totales acumuladas**: Monto facturado en dólares estadounidenses (USD).
- **Pedidos registrados**: Contador de pedidos realizados por clientes.
- **Productos activos**: Total de artículos publicados y visibles en la tienda.
- **Acceso rápido**: Enlaces directos a las secciones de productos, pedidos y zonas de envío.

---

## 3. Gestión del Catálogo de Productos

La sección **Productos** (`/admin/productos`) es el núcleo comercial de tu tienda. Desde aquí puedes consultar el inventario, buscar artículos por nombre o código SKU, y añadir nuevas referencias.

### 3.1. Agregar un nuevo producto
Haz clic en el botón superior **Agregar producto** (o ingresa a `/admin/productos/nuevo`).

El formulario está organizado en módulos intuitivos:

#### A. Información General
1. **Nombre**: Título oficial del producto (ejemplo: *Gel Antibacterial PocketBac – Bath & Body Works*).
2. **URL amigable (Slug)**: Se genera automáticamente a partir del nombre en minúsculas y con guiones. Permite que el enlace sea limpio y optimizado para motores de búsqueda.
3. **Descripción corta**: Resumen breve de hasta 180 caracteres que se muestra en tarjetas y vistas previas.
4. **Descripción**: Información completa sobre beneficios, modo de uso, fragancias o especificaciones.
5. **Materiales o detalles**: Notas adicionales sobre ingredientes, presentación, origen o precauciones.

#### B. Fotografías del Producto
- **Subida optimizada**: Haz clic en **Agregar** para seleccionar una o varias fotos desde tu computadora o celular.
- **Optimización automática**: El sistema comprime y convierte automáticamente las imágenes al formato de última generación WebP, asegurando máxima nitidez sin ralentizar la carga de la tienda.
- **Portada**: La primera foto de la lista será la portada del producto.
- **Reorganizar y eliminar**: Utiliza las flechas hacia arriba/abajo para cambiar el orden de las fotos o el ícono de papelera para suprimir alguna.

#### C. Variantes (Aromas, Tallas o Tonos)
Si el producto tiene diferentes presentaciones (por ejemplo, múltiples aromas de gel PocketBac, tonos de labial o tallas):
1. Haz clic en **Agregar variante**.
2. Ingresa:
   - **Aroma / Talla**: Ejemplo: *Pink Candy*, *Japanese Cherry Blossom*, *Gummi Snacks*.
   - **Color / Tono**: Opcional.
   - **SKU de variante**: Código único identificador (ejemplo: *PB-PINK-01*).
   - **Stock**: Cantidad disponible de esa variante específica.
3. El cliente podrá seleccionar su presentación favorita directamente desde la página del producto.

#### D. Precios y Conversión Automática (USD a MXN)
El sistema cuenta con una **calculadora de divisas en tiempo real**:
- **Precio en Dólares (USD)**: Ingresas el valor en dólares al que compras o cotizas el producto en EE. UU. (ejemplo: `3.25`).
- **Tasa de cambio (USD a MXN)**: Viene predeterminada en `20.00` (1 USD = $20 MXN), pero puedes ajustarla en el momento si el dólar cambia.
- **Precio Final en Tienda (MXN)**: Se calcula automáticamente en pesos mexicanos (ejemplo: `3.25 * 20 = $65 MXN`).
- **Edición bidireccional**: Si prefieres escribir directamente el precio en pesos (ej. `$65`), el campo de dólares se recalcula solo.
- **Precio anterior (oferta)**: También permite ingresar en USD y auto-calcula el precio tachado en MXN (ej. `$4.00 USD` -> `$80 MXN`).
- **Lo que ve el cliente**: Los compradores en la tienda pública siempre verán los precios finales en **Pesos Mexicanos (MXN)** (ejemplo: `$65 MXN`, `$680 MXN`).
- **Costo interno opcional**: Para tu control financiero privado en MXN (nunca visible para clientes).
- **SKU e Inventario**: Código de bodega y cantidad disponible con alerta de poco stock.

#### E. Organización y Visibilidad
- **Categoría**: Selecciona a qué categoría pertenece (Belleza, Cuidado Personal, etc.).
- **Producto activo (visible en la tienda)**: Viene **activado por defecto**. Todo producto nuevo que agregues se publica inmediatamente en la vitrina. Si deseas guardarlo como borrador antes de lanzarlo, desmarca esta casilla.
- **Destacado**: Muestra el producto en las secciones principales de la página de inicio.
- **Nuevo**: Le añade la insignia de "Nuevo lanzamiento".
- **En oferta**: Añade el distintivo de promoción.

#### F. Guardado Continuo
Al presionar el botón **Guardar y agregar otro**:
- El producto se guarda y se activa inmediatamente en la tienda.
- Aparece un mensaje verde de confirmación en la parte superior.
- El formulario se limpia automáticamente para que puedas ingresar el siguiente producto sin tener que regresar al menú.

### 3.2. Acciones Rápidas en la Lista de Productos
En la tabla de productos (`/admin/productos`):
- **Buscador**: Filtra al instante por nombre o SKU.
- **Alternar visibilidad (Activo / Oculto)**: Con un solo clic puedes ocultar temporalmente un producto sin borrarlo, o volverlo a publicar.
- **Duplicar producto**: Crea una copia exacta de un producto existente con sus fotos y variantes. Es ideal cuando vas a cargar productos similares y quieres ahorrar tiempo.
- **Editar**: Abre el formulario con todos los datos cargados para modificarlos.
- **Eliminar**: Retira el producto de manera definitiva.

---

## 4. Gestión de Categorías

En la sección **Categorías** (`/admin/categorias`):
- Puedes crear nuevas categorías (ejemplo: *Moda*, *Cuidado Personal*, *Cosméticos*, *Accesorios*).
- Define nombre, descripción y orden de prioridad en los menús de navegación.
- Puedes activarlas o desactivarlas según la temporada.

---

## 5. Gestión de Pedidos y Ventas

La sección **Pedidos** (`/admin/pedidos`) registra cada orden generada por los compradores.

### 5.1. Flujo de Compra y WhatsApp
1. El cliente agrega productos al carrito y pasa al checkout.
2. Ingresa sus datos de entrega (Estados Unidos, México o Colombia) y selecciona su zona de envío.
3. El sistema valida el inventario, descuenta las unidades en base de datos y crea un pedido oficial con código único (ejemplo: `#MJ-7821`).
4. Al confirmarse, el cliente es dirigido automáticamente a una conversación de WhatsApp con tu número oficial (`+1 303 905 6030`), llevando precargado el resumen de su compra, desglose de costos y dirección de entrega.

### 5.2. Detalle del Pedido
Al dar clic sobre cualquier pedido en la lista, accederás a su expediente:
- **Datos del comprador**: Nombre completo, teléfono, correo (si aplica).
- **Ubicación de entrega**: País, Estado/Departamento, Ciudad, Dirección completa, Referencia/ZIP y notas particulares.
- **Desglose de compra**: Productos solicitados, variantes elegidas, cantidades y subtotales.
- **Tarifa de envío aplicada**: Costo de flete o confirmación de *Envío Gratis*.
- **Total a liquidar en Pesos Mexicanos (MXN)**.

### 5.3. Estados del Pedido
En la parte superior derecha de cada pedido puedes actualizar su estado según avance la operación:
- `Pendiente`: Pedido recién generado en espera de comprobante o acuerdo de pago.
- `Confirmado`: Pago verificado.
- `En preparación`: Artículos empacados y listos en almacén.
- `Enviado`: Guía de paquetería emitida y en tránsito.
- `Entregado`: Entrega completada exitosamente al cliente.
- `Cancelado`: En caso de anulación (restituye el stock al inventario).

### 5.4. Botón Directo a WhatsApp
En la ficha del pedido encontrarás un botón para abrir WhatsApp directamente con el cliente. Esto facilita enviar guías de rastreo, resolver dudas de entrega o compartir cuentas bancarias/Zelle/Stripe de manera ágil.

---

## 6. Configuración de Zonas de Envío

En la sección **Envíos** (`/admin/envios`):
Puedes definir las tarifas de entrega según la región geográfica de tus clientes:
- **Nombre de la zona**: Ejemplo: *Estados Unidos Continental*, *México Nacional*, *Colombia Nacional*, o *Envío Local*.
- **Tarifa en Pesos Mexicanos (MXN)**: Costo fijo de envío para esa zona (ejemplo: `$150 MXN` o `$250 MXN`).
- **Umbral de Envío Gratis**: Monto mínimo de compra a partir del cual el costo de flete se vuelve automáticamente `$0` (ejemplo: si colocas `$1,500 MXN`, las compras de $1,500 MXN o más no pagarán envío).
- **Activar / Desactivar**: Si una zona no tiene cobertura temporal, puedes apagarla con un clic sin tener que eliminarla.

---

## 7. Configuración General

En la sección **Configuración** (`/admin/configuracion`):
- **Teléfono de WhatsApp**: Número oficial internacional donde se reciben las órdenes (actualmente configurado en `13039056030`).
- **Moneda de la tienda**: Toda la vitrina comercial y transacciones operan en **Pesos Mexicanos (MXN)**.
- **Enlaces de redes sociales**: Canales oficiales de contacto y soporte.

---

## 8. Buenas Prácticas y Recomendaciones Operativas

1. **Fotografías con fondo limpio**: Para mantener la línea visual premium y sofisticada de MJ Vault, procura utilizar imágenes con buena iluminación natural, fondos neutros o tomas de producto en plano detalle.
2. **Promociones en la descripción**: Si tienes promociones por volumen (ejemplo: *"1 por $65 o 5 por $245"*), menciónalo claramente en la descripción corta y en la descripción principal del producto.
3. **Control de inventario**: Cuando recibas mercancía nueva, actualiza las unidades directamente en el campo *Stock* o en las *Variantes* correspondientes. La tienda bloqueará automáticamente compras de productos agotados para evitar ventas sin disponibilidad.
4. **Verificación antes de archivar**: Al despachar un pedido, asegúrate de cambiar su estado a `Enviado` y finalmente a `Entregado` para mantener tus estadísticas de ventas al día.

---
*MJ Vault — Plataforma de Comercio Electrónico y Gestión Administrativa.*
