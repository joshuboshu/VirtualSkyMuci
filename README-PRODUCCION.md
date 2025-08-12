# Guía para Subir a Producción - VirtualSky Project

### 1. Preparación para Build
```bash
# Instalar dependencias
npm install

# Build para producción
npm run build

```

### 2. Verificación Post-Build
Después de `npm run build`, verifica que `/dist` contenga:
- index.html (con referencias actualizadas)
- main.js, main.css (procesados por Vite)
- virtualsky.js, virtualsky-planets.js, stuquery.js (copiados)
- Todos los assets necesarios


### 3. Desplegar al hosting
Subir la carpeta `/dist` al hosting y configurar los .env