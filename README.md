# Llama MCP Data Explorer 🦙

Una interfaz de Inteligencia de Negocios (BI) potenciada por IA que simula la interacción con múltiples fuentes de datos (MCPs) como PostgreSQL, Stripe, Google Maps y APIs financieras.

## 🚀 ¿Cómo funciona esta demo?

Esta aplicación es una **SPA (Single Page Application)** construida con React 19 y TypeScript.
Actualmente corre en modo "Serverless/Mock", lo que significa que:

1.  **Base de Datos**: Simulada en memoria (`mockData.ts`). No requiere instalación de Postgres real.
2.  **IA (LLM)**: La latencia y respuestas de Llama 3 están simuladas en `mcpService.ts` mediante lógica heurística avanzada.
3.  **MCPs**: Las conexiones a APIs externas (Stripe, Maps, Forex) están emuladas para propósitos de demostración inmediata.

---

## 💻 Instalación Local (Paso a Paso)

Para ejecutar este proyecto en tu propia máquina, recomendamos usar **Vite**.

### 1. Requisitos Previos
*   Node.js (v18+)
*   npm o yarn

### 2. Inicializar Proyecto
Abre tu terminal y ejecuta:

```bash
# Crear proyecto con plantilla React + TypeScript
npm create vite@latest llama-mcp-app -- --template react-ts

# Entrar al directorio
cd llama-mcp-app

# Instalar dependencias base
npm install
```

### 3. Instalar Dependencias del Proyecto
Necesitas instalar las librerías de iconos y utilidades que usamos:

```bash
npm install lucide-react clsx tailwind-merge
```

### 4. Migrar Código
Copia los archivos de este repositorio a tu carpeta `src/`:

*   `types.ts` -> `src/types.ts`
*   `mockData.ts` -> `src/mockData.ts`
*   `services/` -> `src/services/`
*   `components/` -> `src/components/`
*   `App.tsx` -> `src/App.tsx`

### 5. Configurar Estilos
Para mantener la simplicidad, puedes agregar Tailwind vía CDN en tu `index.html` (dentro de la carpeta pública de Vite) o configurar Tailwind PostCSS si prefieres una instalación robusta.

**Opción Rápida (CDN en index.html):**
```html
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>
<script>
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          primary: { 500: '#3b82f6', 600: '#2563eb' }
        }
      }
    }
  }
</script>
```

### 6. Ejecutar
```bash
npm run dev
```

Abre `http://localhost:5173` en tu navegador.

---

## 🛠️ Stack Tecnológico

*   **Frontend**: React 19, TypeScript
*   **Estilos**: Tailwind CSS
*   **Visualización**: Plotly.js
*   **Iconos**: Lucide React
*   **Arquitectura**: Cliente Rico (Thick Client) con simulación de servicios.

