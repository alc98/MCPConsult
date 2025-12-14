# Documentación Completa: Llama MCP Data Explorer

## 1. Resumen Ejecutivo
Esta aplicación es un **Agente de Inteligencia de Negocios (BI)** potenciado por IA Generativa. Su objetivo es permitir que usuarios no técnicos interactúen con bases de datos empresariales utilizando lenguaje natural, obteniendo no solo tablas de datos, sino gráficos interactivos, mapas geoespaciales y análisis de contexto externo.

### Características Clave
*   **Consulta Natural**: "Dame las ventas de Madrid" vs `SELECT * FROM sales WHERE region = 'Madrid'`.
*   **Bilingüe**: Soporte nativo para Inglés y Español con traducción de interfaz en tiempo real.
*   **Análisis Automático**: Generación de insights de negocio (tendencias, máximos/mínimos) automáticos sobre los datos.
*   **Arquitectura Modular (MCP)**: Simulación de integración con herramientas externas para enriquecer la data interna.

---

## 2. Arquitectura Técnica y MCP (Model Context Protocol)

El sistema simula un entorno donde un Modelo de Lenguaje Grande (LLM) como **Llama 3** actúa como orquestador, decidiendo qué herramienta (Tool/MCP) utilizar para responder a una pregunta.

### ¿Qué es un MCP?
El **Model Context Protocol** es un estándar que permite a los modelos de IA conectarse a fuentes de datos externas de manera segura. En esta aplicación, hemos simulado los siguientes MCPs para demostrar el potencial de integración:

### Catálogo de MCPs Usados
| MCP / Herramienta | Función | ¿Por qué se usa? |
| :--- | :--- | :--- |
| **PostgreSQL (Interno)** | Acceso a Base de Datos | Es la fuente de la verdad para datos de Ventas, Empleados, Productos y Clientes. Representa el ERP de la empresa. |
| **Google Maps / OpenStreet** | Geoespacial | Permite proyectar datos de ventas (`SALES`) y clientes (`CUSTOMERS`) en un mapa interactivo de Madrid. Convierte filas de excel en inteligencia de ubicación. |
| **Forex API** | Financiero | Permite convertir los ingresos históricos a múltiples divisas (EUR, MXN) usando tasas de cambio "en vivo". Vital para empresas internacionales. |
| **Stripe API** | Fintech / Pagos | Cruza las ventas registradas con el estado real del pago en la pasarela. Detecta fraude o cobros pendientes. |
| **Alpha Vantage** | Mercado / Crypto | Compara el rendimiento interno de la empresa con activos externos como Bitcoin o acciones, buscando correlaciones ocultas. |
| **Brave Search** | Búsqueda Web | Busca noticias y tendencias globales para contextualizar si una subida/bajada de ventas corresponde a una tendencia del mercado general. |
| **Filesystem** | Sistema de Archivos | Permite al agente "guardar" reportes generados (CSV/PDF) en el disco local del usuario. |

---

## 3. Librería de Prompts (Business Prompts)

A continuación, se listan todos los comandos predefinidos disponibles en la aplicación, categorizados por área de negocio.

### Finanzas y Pagos
*   **"Convert total revenue to EUR and MXN (Forex MCP)"**: Calcula el total de ventas y lo muestra en USD, EUR, MXN y GBP.
*   **"Check Stripe status for recent sales"**: Audita las últimas 5 ventas verificando su estado en la pasarela de pagos simulada.
*   **"Compare my sales trend with Bitcoin price"**: Genera un gráfico de doble eje comparando ingresos vs precio de BTC.

### Geoespacial y Territorio
*   **"Show me a map of sales by region (Google Maps MCP)"**: Agrupa ventas por región y las renderiza sobre el mapa de Madrid con burbujas de tamaño proporcional.
*   **"List customers from the 'Centro' region"**: Filtra la base de datos de clientes por zona geográfica.
*   **"Count the number of customers per region"**: Análisis de densidad de clientes.

### Recursos Humanos (RRHH)
*   **"Show me the top 5 employees by salary (Descending)"**: Ranking de salarios más altos.
*   **"Show me the bottom 5 employees by salary (Ascending)"**: Identificación de personal base/operativo.
*   **"Identify employees with the highest generated revenue"**: (Simulado) Busca cruzar ventas con empleados para medir rendimiento.
*   **"Calculate total monthly salary cost for the company"**: Suma total de la nómina mensual.

### Ventas y Estrategia
*   **"Analyze sales distribution by channel (Online vs Physical)"**: Gráfico de pastel mostrando la partición de ventas.
*   **"Show top 5 sales transactions by total value"**: Auditoría de las ventas más grandes históricas.
*   **"How much revenue are we losing to discounts?"**: Cálculo de impacto financiero por rebajas.
*   **"Forecast sales trends for the next quarter based on history"**: Proyección simple de tendencias futuras.

### Inventario y Productos
*   **"Show me all products in Juguetes category with prices"**: Catálogo filtrado específico.
*   **"List the top 5 most expensive products"**: Identificación de inventario premium.
*   **"Identify products that have zero sales"**: Detección de stock inmovilizado ("Slow Movers").

### Sistema y Arquitectura
*   **"Diseña un esquema de base de datos optimizado en PostgreSQL y graficalo"**: Genera código SQL DDL y un script Python ETL para montar la infraestructura.
*   **"Export current sales report to CSV on local disk"**: Simula la escritura de archivos en el servidor.
*   **"Compare my sales with global market trends (Brave Search)"**: Búsqueda de contexto externo.

---

## 4. Estructura del Código

*   `services/mcpService.ts`: **El Cerebro**. Contiene la lógica que simula ser un LLM. Interpreta el texto, selecciona el "MCP" adecuado, genera el SQL y el análisis de negocio. Ahora soporta bilingüismo (EN/ES).
*   `components/ChatInterface.tsx`: **La Cara**. Interfaz de usuario que maneja el historial de chat, el toggle de idiomas y la renderización de bloques de análisis (`Analysis Block`), gráficos (`DataChart`) y tablas.
*   `mockData.ts`: **Los Datos**. Contiene los arrays JSON que actúan como nuestra base de datos PostgreSQL en memoria.
*   `types.ts`: **El Contrato**. Define las interfaces TypeScript para asegurar que el frontend y el servicio de datos hablen el mismo idioma.

## 5. Flujo de Uso Típico

1.  El usuario selecciona **Español (ES)** en el toggle superior.
2.  Escribe o dicta: *"Dame un mapa de ventas de Madrid"*.
3.  **ChatInterface** envía el prompt a **mcpService** con `lang='es'`.
4.  **mcpService**:
    *   Detecta la intención "mapa" / "madrid".
    *   Calcula los totales por región sumando datos de `SALES` y `CUSTOMERS`.
    *   Genera un objeto `chartConfig` para Plotly con coordenadas de Madrid.
    *   Genera un texto de `analysis` en Español explicando qué distritos rinden mejor.
5.  **ChatInterface** recibe la respuesta y muestra:
    *   Una burbuja de texto explicativo.
    *   Un bloque de "Análisis de Negocio IA" con insights clave.
    *   El mapa interactivo renderizado.
