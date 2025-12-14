import { PRODUCTS, EMPLOYEES, CUSTOMERS, USERS, SALES } from '../mockData';
import { QueryResult } from '../types';

// In a real application, this service would make fetch calls to your MCP Server
// running locally or in the cloud, which would then call Ollama.
// Here, we simulate the LLM's "Thinking" and SQL generation process.

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const createChartConfig = (title: string, x: any[], y: any[], type: 'bar' | 'line' | 'pie' = 'bar', color?: string | string[]) => ({
  data: [{
    x, y, type,
    marker: { color: color || '#3b82f6' },
    // For pie charts, Plotly uses 'labels' and 'values' instead of x and y
    ...(type === 'pie' ? { labels: x, values: y, x: undefined, y: undefined } : {})
  }],
  layout: {
    title,
    autosize: true,
    height: 300,
    margin: { l: 50, r: 20, t: 40, b: 40 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Inter' }
  }
});

// Coordinates for simulation (Mapping regions to Madrid, Spain)
const REGION_COORDS: Record<string, { lat: number, lon: number, name: string }> = {
  'Centro': { lat: 40.4168, lon: -3.7038, name: 'Madrid Centro (Sol)' },
  'Oeste': { lat: 40.4354, lon: -3.7300, name: 'Moncloa / Casa de Campo' },
  'Este': { lat: 40.4300, lon: -3.6200, name: 'San Blas / Ciudad Lineal' },
  'Sur': { lat: 40.3800, lon: -3.7100, name: 'Usera / Villaverde' },
  'Norte': { lat: 40.4800, lon: -3.6900, name: 'Chamartín / Fuencarral' }
};

export const executeNaturalLanguageQuery = async (prompt: string, lang: 'en' | 'es' = 'en'): Promise<QueryResult> => {
  await delay(1200); // Simulate network/LLM latency

  const lowerPrompt = prompt.toLowerCase();
  const isDesc = lowerPrompt.includes('desc') || lowerPrompt.includes('top') || lowerPrompt.includes('high') || lowerPrompt.includes('most') || lowerPrompt.includes('mayor');
  const isAsc = lowerPrompt.includes('asc') || lowerPrompt.includes('bottom') || lowerPrompt.includes('low') || lowerPrompt.includes('least') || lowerPrompt.includes('menor') || lowerPrompt.includes('cheap');

  // Helper to get text based on lang
  const t = (en: string, es: string) => lang === 'es' ? es : en;

  // --- NEW: Geo/Map MCP Logic (Madrid Focused) ---
  if (lowerPrompt.includes('map') || lowerPrompt.includes('region') || lowerPrompt.includes('ubicacion') || lowerPrompt.includes('donde') || lowerPrompt.includes('location') || lowerPrompt.includes('madrid')) {
    
    // Aggregate Sales by Region
    const regionStats: Record<string, number> = {};
    
    SALES.forEach(sale => {
      const customer = CUSTOMERS.find(c => c.customer_id === sale.customer_id);
      if (customer && customer.region) {
        regionStats[customer.region] = (regionStats[customer.region] || 0) + sale.total;
      }
    });

    const regions = Object.keys(regionStats);
    const salesValues = Object.values(regionStats);
    
    // Prepare Map Data
    const lats = [];
    const lons = [];
    const text = [];
    const sizes = [];

    // Find max for scaling
    const maxSale = Math.max(...salesValues);
    const topRegion = regions[salesValues.indexOf(maxSale)];

    for (const region of regions) {
      const coords = REGION_COORDS[region] || { lat: 40.4168, lon: -3.7038, name: region };
      lats.push(coords.lat);
      lons.push(coords.lon);
      text.push(`${coords.name}: $${regionStats[region].toLocaleString()}`);
      sizes.push(Math.max(20, (regionStats[region] / maxSale) * 50)); 
    }

    return {
      sql: `SELECT c.region, SUM(s.total) as total_sales 
FROM sales s 
JOIN customers c ON s.customer_id = c.customer_id 
GROUP BY c.region;`,
      explanation: t(
        "I used the **Google Maps MCP** to project your sales onto the Madrid map. The size of the bubbles represents revenue volume.",
        "He utilizado el **Google Maps MCP** para proyectar tus ventas sobre el mapa de Madrid. El tamaño de las burbujas representa el volumen de facturación."
      ),
      analysis: t(
        `Geospatial Analysis:\n- **Top Performing Region**: ${topRegion} ($${maxSale.toFixed(2)}).\n- **Distribution**: Sales are concentrated in central and northern districts.\n- **Strategy**: Consider targeted marketing in the southern districts to boost presence.`,
        `Análisis Geoespacial:\n- **Región con Mayor Rendimiento**: ${topRegion} ($${maxSale.toFixed(2)}).\n- **Distribución**: Las ventas se concentran en distritos centro y norte.\n- **Estrategia**: Considerar marketing focalizado en los distritos del sur para aumentar la presencia.`
      ),
      columns: ['region', 'latitude', 'longitude', 'total_sales'],
      rows: regions.map((r, i) => ({
        region: r,
        latitude: lats[i],
        longitude: lons[i],
        total_sales: salesValues[i].toFixed(2)
      })),
      chartConfig: {
        data: [{
          type: 'scattermapbox',
          lat: lats,
          lon: lons,
          text: text,
          mode: 'markers',
          marker: {
            size: sizes,
            color: salesValues,
            colorscale: 'Portland',
            opacity: 0.8,
            showscale: true,
          }
        }],
        layout: {
          title: t('Geographic Distribution (Madrid)', 'Distribución Geográfica (Madrid)'),
          autosize: true,
          hovermode: 'closest',
          mapbox: {
            style: "open-street-map",
            center: { lat: 40.4168, lon: -3.7038 },
            zoom: 11
          },
          height: 400,
          margin: { l: 0, r: 0, t: 40, b: 0 },
          paper_bgcolor: 'rgba(0,0,0,0)',
        }
      },
      externalContext: {
        source: "Google Maps / OpenStreetMap MCP",
        content: t("Rendered Map: Madrid, Spain.", "Mapa renderizado: Madrid, España."),
      }
    };
  }

  // --- NEW: Financial MCP - Forex / Currency ---
  if (lowerPrompt.includes('euro') || lowerPrompt.includes('mxn') || lowerPrompt.includes('currency') || lowerPrompt.includes('divisa') || lowerPrompt.includes('convert')) {
    const totalRevenueUSD = SALES.reduce((acc, curr) => acc + curr.total, 0);
    const rates = { EUR: 0.92, MXN: 17.05, GBP: 0.79 };
    
    return {
      sql: "SELECT SUM(total) FROM sales; -- Converted via Forex API",
      explanation: t(
        "I calculated your total revenue and used the **Forex MCP** to convert it into multiple currencies using today's rates.",
        "He calculado tus ingresos totales y he utilizado el **Forex MCP** para convertirlos a múltiples divisas con las tasas de hoy."
      ),
      analysis: t(
        `Currency Impact:\n- **Base Revenue**: $${totalRevenueUSD.toLocaleString()}\n- **EUR Strength**: The Euro conversion indicates strong purchasing power parity.\n- **MXN Volatility**: Rate used (17.05) is stable compared to last week.`,
        `Impacto Cambiario:\n- **Ingreso Base**: $${totalRevenueUSD.toLocaleString()}\n- **Fortaleza EUR**: La conversión a Euro indica paridad de poder adquisitivo fuerte.\n- **Volatilidad MXN**: La tasa usada (17.05) es estable comparada con la semana pasada.`
      ),
      columns: ['currency', 'rate', 'total_value'],
      rows: [
        { currency: 'USD (Base)', rate: 1.0, total_value: totalRevenueUSD.toFixed(2) },
        { currency: 'EUR (€)', rate: rates.EUR, total_value: (totalRevenueUSD * rates.EUR).toFixed(2) },
        { currency: 'MXN ($)', rate: rates.MXN, total_value: (totalRevenueUSD * rates.MXN).toFixed(2) },
        { currency: 'GBP (£)', rate: rates.GBP, total_value: (totalRevenueUSD * rates.GBP).toFixed(2) },
      ],
      chartConfig: createChartConfig(
        t('Revenue in Different Currencies', 'Ingresos en Diferentes Divisas'),
        ['USD', 'EUR', 'MXN', 'GBP'],
        [totalRevenueUSD, totalRevenueUSD * rates.EUR, totalRevenueUSD * rates.MXN, totalRevenueUSD * rates.GBP],
        'bar',
        ['#3b82f6', '#6366f1', '#10b981', '#f43f5e']
      ),
      externalContext: {
        source: "Open Exchange Rates API (MCP)",
        content: t("Rates updated: 1 USD = 0.92 EUR.", "Tasas actualizadas: 1 USD = 0.92 EUR."),
      }
    };
  }

  // --- NEW: Financial MCP - Stripe / Payment Status ---
  if (lowerPrompt.includes('stripe') || lowerPrompt.includes('payment') || lowerPrompt.includes('pago') || lowerPrompt.includes('banco')) {
    const recentSales = SALES.slice(0, 5);
    const enrichedRows = recentSales.map(s => ({
      sale_id: s.sale_id,
      amount: s.total,
      stripe_status: s.payment_method === 'Efectivo' ? 'N/A (Cash)' : (Math.random() > 0.2 ? 'succeeded' : 'pending'),
      risk_score: Math.floor(Math.random() * 100)
    }));
    
    const pendingCount = enrichedRows.filter(r => r.stripe_status === 'pending').length;

    return {
      sql: "SELECT sale_id, total, payment_method FROM sales LIMIT 5;",
      explanation: t(
        "I crossed your internal sales records with the **Stripe MCP** to verify the real fund status.",
        "He cruzado tus registros de ventas internos con el **Stripe MCP** para verificar el estado real de los fondos."
      ),
      analysis: t(
        `Risk & Liquidity Report:\n- **Pending Transactions**: ${pendingCount} require attention.\n- **Average Risk Score**: Low.\n- **Recommendation**: Verify 'Pending' statuses manually in the Stripe Dashboard.`,
        `Reporte de Riesgo y Liquidez:\n- **Transacciones Pendientes**: ${pendingCount} requieren atención.\n- **Puntaje de Riesgo Promedio**: Bajo.\n- **Recomendación**: Verificar estados 'Pendientes' manualmente en el Dashboard de Stripe.`
      ),
      columns: ['sale_id', 'amount', 'stripe_status', 'risk_score'],
      rows: enrichedRows,
      externalContext: {
        source: "Stripe API (MCP)",
        content: t("Real-time status check complete.", "Verificación de estado en tiempo real completada."),
      }
    };
  }

  // --- NEW: Financial MCP - Crypto/Stock Correlation ---
  if (lowerPrompt.includes('bitcoin') || lowerPrompt.includes('crypto') || lowerPrompt.includes('stock') || lowerPrompt.includes('aapl')) {
     const salesTrend = [1200, 1500, 1100, 1800, 2200];
     const cryptoTrend = [42000, 43500, 41000, 44000, 46000];
     
     return {
       sql: "SELECT date, SUM(total) FROM sales GROUP BY date;",
       explanation: t(
         "Comparing your internal sales against Bitcoin price using the **Alpha Vantage MCP**.",
         "Comparando tus ventas internas contra el precio de Bitcoin usando el **Alpha Vantage MCP**."
       ),
       analysis: t(
         "Correlation Analysis:\n- **Coefficient**: +0.65 (Positive Correlation).\n- **Insight**: Your sales seem to increase when the crypto market is bullish. This might indicate your customer base is tech-savvy or holds crypto assets.",
         "Análisis de Correlación:\n- **Coeficiente**: +0.65 (Correlación Positiva).\n- **Insight**: Tus ventas parecen aumentar cuando el mercado cripto está al alza. Esto podría indicar que tu base de clientes es experta en tecnología."
       ),
       columns: ['period', 'your_sales', 'btc_price'],
       rows: [
         { period: 'Q1', your_sales: 1200, btc_price: 42000 },
         { period: 'Q2', your_sales: 1500, btc_price: 43500 },
         { period: 'Q3', your_sales: 1100, btc_price: 41000 },
       ],
       chartConfig: {
         data: [
           { x: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], y: salesTrend, type: 'bar', name: t('Your Sales ($)', 'Tus Ventas ($)'), marker: { color: '#3b82f6' } },
           { x: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], y: cryptoTrend, type: 'scatter', mode: 'lines', name: 'Bitcoin (BTC)', yaxis: 'y2', line: { color: '#f59e0b' } }
         ],
         layout: {
           title: t('Sales Correlation with Bitcoin', 'Correlación de Ventas con Bitcoin'),
           yaxis: { title: t('Sales Volume', 'Volumen Ventas') },
           yaxis2: { title: 'BTC Price', overlaying: 'y', side: 'right' },
           height: 300,
           margin: { l: 50, r: 50, t: 40, b: 40 },
           showlegend: true,
           paper_bgcolor: 'rgba(0,0,0,0)',
           plot_bgcolor: 'rgba(0,0,0,0)',
         }
       },
       externalContext: {
         source: "CoinGecko / Alpha Vantage MCP",
         content: t("Market data retrieved.", "Datos de mercado recuperados."),
       }
     };
  }

  // --- NEW: Brave Search MCP Simulation (Market Trends) ---
  if (lowerPrompt.includes('trend') || lowerPrompt.includes('tendencia') || lowerPrompt.includes('market') || lowerPrompt.includes('mercado')) {
     const salesByDate = SALES.slice(0, 5).map(s => ({ date: s.date, total: s.total }));
     
     return {
       sql: "SELECT date, SUM(total) FROM sales GROUP BY date ORDER BY date DESC LIMIT 5;",
       explanation: t(
         "I analyzed your internal sales and used the **Brave Search MCP** to search for external market context.",
         "He analizado tus ventas internas y he utilizado el **Brave Search MCP** para buscar contexto de mercado externo."
       ),
       analysis: t(
         "Market Benchmark:\n- **Your Trend**: Steady growth in Q2.\n- **Global Market**: Retail is growing at 4.5%.\n- **Verdict**: You are outperforming the industry average by approximately 2% based on recent transaction volume.",
         "Benchmark de Mercado:\n- **Tu Tendencia**: Crecimiento sostenido en Q2.\n- **Mercado Global**: Retail crece al 4.5%.\n- **Veredicto**: Estás superando el promedio de la industria en aproximadamente un 2% basado en el volumen reciente."
       ),
       columns: ['date', 'total_sales'],
       rows: salesByDate,
       chartConfig: createChartConfig(
         t('Internal Sales vs Market Trend', 'Ventas Internas vs Tendencia Mercado'),
         salesByDate.map(s => s.date),
         salesByDate.map(s => s.total),
         'line',
         '#8b5cf6'
       ),
       externalContext: {
         source: "Brave Search API",
         content: t("Retail market trends 2025.", "Tendencias mercado retail 2025."),
         url: "https://search.brave.com/search?q=retail+market+trends+2025"
       }
     };
  }

  // --- NEW: Filesystem MCP Simulation (Export) ---
  if (lowerPrompt.includes('export') || lowerPrompt.includes('guardar') || lowerPrompt.includes('save') || lowerPrompt.includes('pdf') || lowerPrompt.includes('csv')) {
    return {
      sql: "-- Filesystem Operation Triggered",
      explanation: t(
        "✅ I used the **Filesystem MCP** to generate the report.",
        "✅ He utilizado el **Filesystem MCP** para generar el reporte."
      ),
      analysis: t(
        "File Operation:\n- **Path**: /users/docs/reports/\n- **Format**: CSV (UTF-8)\n- **Security**: File permissions set to read-only for group 'sales'.",
        "Operación de Archivo:\n- **Ruta**: /users/docs/reports/\n- **Formato**: CSV (UTF-8)\n- **Seguridad**: Permisos establecidos en solo lectura para grupo 'ventas'."
      ),
      columns: ['status', 'file_path', 'size'],
      rows: [{ status: 'Success', file_path: '/users/docs/reports/sales_report_2025.csv', size: '45KB' }],
      externalContext: {
        source: "Local Filesystem",
        content: t("File saved successfully.", "Archivo guardado exitosamente."),
      }
    };
  }

  // 0. Special Request: Schema Design & Graphing
  if ((lowerPrompt.includes('esquema') || lowerPrompt.includes('schema')) && 
      (lowerPrompt.includes('postgres') || lowerPrompt.includes('base de datos'))) {
    
    // Calculate category sales for the chart
    const salesByCategory: Record<string, number> = {};
    SALES.forEach(sale => {
      const product = PRODUCTS.find(p => p.product_id === sale.product_id);
      if (product) {
        salesByCategory[product.category] = (salesByCategory[product.category] || 0) + sale.total;
      }
    });

    return {
      sql: "-- SQL Schema Generation Script",
      columns: [],
      rows: [],
      chartConfig: createChartConfig(
        t('Total Sales by Category', 'Ventas Totales por Categoría'), 
        Object.keys(salesByCategory), 
        Object.values(salesByCategory), 
        'bar', 
        ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b']
      ),
      explanation: t(
        "Here is the optimized PostgreSQL architecture based on your CSVs and the ETL load script.",
        "Aquí tienes la arquitectura optimizada para PostgreSQL basada en tus CSVs y el script de carga ETL."
      ),
      analysis: t(
        "Schema Analysis:\n- **Normalization**: 3rd Normal Form achieved.\n- **Optimization**: Added indexes on `customer_id` and `date` to speed up reporting queries by 40%.\n- **Integrity**: Foreign keys enforcement enabled.",
        "Análisis del Esquema:\n- **Normalización**: 3ra Forma Normal alcanzada.\n- **Optimización**: Índices añadidos en `customer_id` y `date` para acelerar reportes un 40%.\n- **Integridad**: Claves foráneas activadas."
      )
    };
  }
  
  // 1. Employee Queries
  if (lowerPrompt.includes('employee') || lowerPrompt.includes('staff') || lowerPrompt.includes('salary') || lowerPrompt.includes('empleado')) {
    let sortedEmployees = [...EMPLOYEES];
    let explanation = t("Fetching general employee list.", "Obteniendo lista general de empleados.");
    let sql = "SELECT * FROM employees LIMIT 10;";
    let chartTitle = t("Employee Salaries", "Salarios de Empleados");
    let analysisText = t("Showing standard list.", "Mostrando lista estándar.");

    if (isDesc) {
      sortedEmployees.sort((a, b) => b.salary - a.salary);
      explanation = t("Showing top employees by salary (Descending).", "Mostrando empleados con mayor salario (Descendente).");
      sql = "SELECT first_name, last_name, position, salary FROM employees ORDER BY salary DESC LIMIT 5;";
      chartTitle = t("Top 5 Highest Salaries", "Top 5 Salarios Más Altos");
      analysisText = t(
        `Payroll Insight:\n- **Highest Earner**: ${sortedEmployees[0].first_name} ($${sortedEmployees[0].salary}).\n- **Gap**: The top earner makes ${(sortedEmployees[0].salary / sortedEmployees[sortedEmployees.length-1].salary).toFixed(1)}x more than the lowest.`,
        `Insight de Nómina:\n- **Mayor Salario**: ${sortedEmployees[0].first_name} ($${sortedEmployees[0].salary}).\n- **Brecha**: El salario más alto es ${(sortedEmployees[0].salary / sortedEmployees[sortedEmployees.length-1].salary).toFixed(1)}x mayor que el más bajo.`
      );
    } else if (isAsc) {
      sortedEmployees.sort((a, b) => a.salary - b.salary);
      explanation = t("Showing lowest paid employees (Ascending).", "Mostrando empleados con menor salario (Ascendente).");
      sql = "SELECT first_name, last_name, position, salary FROM employees ORDER BY salary ASC LIMIT 5;";
      chartTitle = t("Bottom 5 Salaries", "Top 5 Salarios Más Bajos");
      analysisText = t("Operational Staff detected at the bottom of the bracket.", "Personal operativo detectado en la parte baja de la franja.");
    }

    const rows = sortedEmployees.slice(0, 5);
    
    return {
      sql,
      explanation,
      analysis: analysisText,
      columns: ['first_name', 'last_name', 'position', 'salary'],
      rows: rows,
      chartConfig: createChartConfig(
        chartTitle,
        rows.map(e => `${e.first_name} ${e.last_name}`),
        rows.map(e => e.salary),
        'bar',
        isDesc ? '#10b981' : '#f43f5e'
      )
    };
  }

  // 2. Product Queries
  if (lowerPrompt.includes('product') || lowerPrompt.includes('item') || lowerPrompt.includes('price') || lowerPrompt.includes('producto')) {
    let sortedProducts = [...PRODUCTS];
    let explanation = t("Fetching product list.", "Obteniendo lista de productos.");
    let sql = "SELECT * FROM products LIMIT 10;";
    let chartTitle = t("Product Prices", "Precios de Productos");
    let analysisText = t("Catalog Overview.", "Resumen del catálogo.");

    if (lowerPrompt.includes('toy') || lowerPrompt.includes('juguetes')) {
       const toys = PRODUCTS.filter(p => p.category === 'Juguetes');
       return {
        sql: "SELECT * FROM products WHERE category = 'Juguetes';",
        explanation: t("Filtering products by category 'Juguetes'.", "Filtrando productos por categoría 'Juguetes'."),
        analysis: t(
          `Category Analysis (Toys):\n- **Count**: ${toys.length} items.\n- **Avg Price**: $${(toys.reduce((a,b)=>a+b.unit_price,0)/toys.length).toFixed(2)}.`,
          `Análisis de Categoría (Juguetes):\n- **Cantidad**: ${toys.length} ítems.\n- **Precio Promedio**: $${(toys.reduce((a,b)=>a+b.unit_price,0)/toys.length).toFixed(2)}.`
        ),
        columns: Object.keys(PRODUCTS[0]),
        rows: toys,
        chartConfig: createChartConfig(
            t('Toy Prices', 'Precios de Juguetes'),
            toys.map(t => t.product_name),
            toys.map(t => t.unit_price),
            'bar',
            '#f59e0b'
        )
      };
    }

    if (isDesc) {
        sortedProducts.sort((a, b) => b.unit_price - a.unit_price);
        explanation = t("List of most expensive products (Descending).", "Lista de productos más caros (Descendente).");
        sql = "SELECT * FROM products ORDER BY unit_price DESC LIMIT 5;";
        chartTitle = t("Top 5 Most Expensive Products", "Top 5 Productos Más Caros");
        analysisText = t(
          `Pricing Strategy:\n- **Premium Item**: ${sortedProducts[0].product_name}.\n- **Margin Potential**: High on top 3 items.`,
          `Estrategia de Precios:\n- **Ítem Premium**: ${sortedProducts[0].product_name}.\n- **Potencial de Margen**: Alto en los 3 primeros.`
        );
    } else if (isAsc) {
        sortedProducts.sort((a, b) => a.unit_price - b.unit_price);
        explanation = t("List of cheapest products (Ascending).", "Lista de productos más baratos (Ascendente).");
        sql = "SELECT * FROM products ORDER BY unit_price ASC LIMIT 5;";
        chartTitle = t("Top 5 Cheapest Products", "Top 5 Productos Más Baratos");
        analysisText = t("Entry-level inventory identified.", "Inventario de entrada identificado.");
    }

    const rows = sortedProducts.slice(0, 5);

    return {
      sql,
      explanation,
      analysis: analysisText,
      columns: Object.keys(PRODUCTS[0]),
      rows: rows,
      chartConfig: createChartConfig(
        chartTitle,
        rows.map(p => p.product_name),
        rows.map(p => p.unit_price),
        'bar',
        isDesc ? '#8b5cf6' : '#3b82f6'
      )
    };
  }

  // 3. Sales Queries
  if (lowerPrompt.includes('sale') || lowerPrompt.includes('revenue') || lowerPrompt.includes('sold') || lowerPrompt.includes('transaction') || lowerPrompt.includes('venta')) {
    const totalRevenue = SALES.reduce((acc, curr) => acc + curr.total, 0);
    
    if (lowerPrompt.includes('total') && !isDesc && !isAsc) {
       return {
        sql: "SELECT SUM(total) as total_revenue, COUNT(*) as count FROM sales;",
        explanation: t("Aggregating total sales revenue.", "Agregando ingresos totales por ventas."),
        analysis: t(
          `Financial Summary:\n- **Total Revenue**: $${totalRevenue.toFixed(2)}\n- **Transaction Volume**: ${SALES.length} sales recorded.\n- **Avg Ticket**: $${(totalRevenue/SALES.length).toFixed(2)}.`,
          `Resumen Financiero:\n- **Ingresos Totales**: $${totalRevenue.toFixed(2)}\n- **Volumen**: ${SALES.length} ventas registradas.\n- **Ticket Promedio**: $${(totalRevenue/SALES.length).toFixed(2)}.`
        ),
        columns: ['total_revenue', 'count'],
        rows: [{ total_revenue: totalRevenue.toFixed(2), count: SALES.length }],
        chartConfig: createChartConfig(
            t('Revenue Distribution', 'Distribución de Ingresos'),
            ['Revenue', 'Est. Cost', 'Profit'],
            [totalRevenue, totalRevenue * 0.65, totalRevenue * 0.35],
            'pie'
        )
      };
    }

    let sortedSales = [...SALES];
    let explanation = t("Showing recent sales transactions.", "Mostrando transacciones de ventas recientes.");
    let sql = "SELECT * FROM sales ORDER BY date DESC LIMIT 10;";
    let chartTitle = t("Recent Sales Values", "Valores de Ventas Recientes");
    let analysisText = t("Latest transactional activity.", "Actividad transaccional reciente.");

    if (isDesc) {
        sortedSales.sort((a, b) => b.total - a.total);
        explanation = t("Top sales transactions by value (High to Low).", "Mejores transacciones por valor (Alto a Bajo).");
        sql = "SELECT * FROM sales ORDER BY total DESC LIMIT 5;";
        chartTitle = t("Top 5 Highest Value Sales", "Top 5 Ventas de Mayor Valor");
        analysisText = t("Key Account Activity identified in top transactions.", "Actividad de Cuentas Clave identificada en las transacciones superiores.");
    } else if (isAsc) {
        sortedSales.sort((a, b) => a.total - b.total);
        explanation = t("Lowest sales transactions by value (Low to High).", "Transacciones de menor valor (Bajo a Alto).");
        sql = "SELECT * FROM sales ORDER BY total ASC LIMIT 5;";
        chartTitle = t("Bottom 5 Lowest Value Sales", "Top 5 Ventas de Menor Valor");
        analysisText = t("Micro-transactions detected.", "Micro-transacciones detectadas.");
    }

    const rows = sortedSales.slice(0, 5);

    return {
      sql,
      explanation,
      analysis: analysisText,
      columns: Object.keys(SALES[0]),
      rows: rows,
      chartConfig: createChartConfig(
        chartTitle,
        rows.map(s => `Sale #${s.sale_id} (${s.sales_channel})`),
        rows.map(s => s.total),
        'bar',
        isDesc ? '#10b981' : '#f43f5e'
      )
    };
  }

  // 4. Customer Queries
  if (lowerPrompt.includes('customer') || lowerPrompt.includes('client') || lowerPrompt.includes('cliente')) {
    return {
      sql: "SELECT * FROM customers LIMIT 10;",
      explanation: t("Fetching customer database.", "Obteniendo base de datos de clientes."),
      analysis: t(
        `CRM Snapshot:\n- **Total Customers**: ${CUSTOMERS.length}.\n- **Geo Coverage**: ${new Set(CUSTOMERS.map(c=>c.region)).size} distinct regions.`,
        `Snapshot CRM:\n- **Total Clientes**: ${CUSTOMERS.length}.\n- **Cobertura Geo**: ${new Set(CUSTOMERS.map(c=>c.region)).size} regiones distintas.`
      ),
      columns: Object.keys(CUSTOMERS[0]),
      rows: CUSTOMERS
    };
  }

  // Default fallback simulating Llama confusion or general query
  return {
    sql: "SELECT * FROM employees LIMIT 5; -- Fallback",
    explanation: t(
      "I wasn't sure exactly what table you wanted, so here is a sample of your employees.",
      "No estaba seguro de qué tabla querías exactamente, así que aquí hay una muestra de tus empleados."
    ),
    analysis: t("Ambiguous query. Defaulting to Employee Directory.", "Consulta ambigua. Mostrando Directorio de Empleados por defecto."),
    columns: Object.keys(EMPLOYEES[0]),
    rows: EMPLOYEES.slice(0, 5)
  };
};

export const getTableData = async (tableName: string): Promise<any[]> => {
  await delay(300);
  switch (tableName) {
    case 'products': return PRODUCTS;
    case 'employees': return EMPLOYEES;
    case 'customers': return CUSTOMERS;
    case 'sales': return SALES;
    case 'users': return USERS;
    default: return [];
  }
};