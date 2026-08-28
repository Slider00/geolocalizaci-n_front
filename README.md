# SIG-Terremotos Colombia - Frontend Dashboard

Aplicación web desarrollada con **Next.js 16 (React)**, **TypeScript** y **Leaflet** para la visualización en tiempo real y la gestión logística de damnificados por terremotos en Colombia.

---

## 🎨 Características Clave

* **Mapa Interactivo Oscuro**: Implementa mosaicos vectoriales oscuros de **Esri (Dark Gray Canvas)** con todas las etiquetas geográficas de departamentos y municipios sin marcas de agua.
* **Ondas Sísmicas Animadas**: Representación visual de sismos mediante marcadores de tipo radar con ondas concéntricas animadas en CSS que cambian de tamaño y color según su magnitud ($Mw$).
* **Filtros en Tiempo Real**: Búsqueda por región, filtrado por rango de fechas (con arranque predeterminado del día de hoy), magnitud mínima y estados de atención de reportes.
* **Cómputo Dinámico de Ayuda**: Dashboard derecho interactivo que consolida la suma total de suministros humanitarios (agua, comida, carpas) y víctimas graves/leves calculados a partir de los reportes del terreno.
* **Registro de Damnificados**: Formulario integrado para reportar afectados, viviendas averiadas y suministros requeridos en coordenadas capturadas con un doble clic en el mapa.

---

## ⚙️ Configuración del Entorno

El frontend se conecta al servidor backend Express. Debes configurar el endpoint en el archivo de variables de entorno en la raíz de `front_end/`.

Crea los archivos `.env.development` y `.env.production` con el siguiente formato:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## 🚀 Instalación y Ejecución

Sigue estos pasos para correr el frontend localmente:

### 1. Instalar dependencias
Desde la carpeta `front_end/`, ejecuta:
```bash
npm install
```

### 2. Ejecutar en modo desarrollo
Inicia el servidor Next.js en caliente:
```bash
npm run dev
```
La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

### 3. Compilar para producción
Para compilar la aplicación optimizando rendimiento y código estático:
```bash
# Compilar código
npm run build

# Levantar servidor optimizado
npm run start
```
