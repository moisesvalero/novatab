<script>
  import { ArrowLeft, ShieldCheck } from "@lucide/svelte";
</script>

<svelte:head>
  <title>Política de Privacidad — NovaTab</title>
  <meta name="description" content="Política de privacidad de NovaTab. Sin rastreadores ni analíticas invasivas. Todos tus datos quedan en tu navegador." />
  <link rel="canonical" href="https://start.moisesvalero.es/privacidad" />
</svelte:head>

<main class="legal-container">
  <div class="legal-card glass-card">
    <a href="/" class="back-link">
      <ArrowLeft size={16} /> Volver a NovaTab
    </a>

    <header class="legal-header">
      <div class="icon-wrap">
        <ShieldCheck size={28} color="#38bdf8" />
      </div>
      <h1>Política de Privacidad</h1>
      <p class="subtitle">Última actualización: 24 de agosto de 2026</p>
    </header>

    <article class="legal-content">
      <section>
        <h2>1. Compromiso de Privacidad</h2>
        <p>NovaTab es una aplicación de nueva pestaña y página de inicio de código abierto desarrollada bajo la premisa de <strong>cero rastreo</strong> y <strong>privacidad total</strong> por diseño.</p>
      </section>

      <section>
        <h2>2. Datos Almacenados</h2>
        <p>NovaTab <strong>NO</strong> recopila, transmite ni almacena ningún dato personal en servidores externos. Todas tus configuraciones (accesos directos, preferencias de widgets, fondos seleccionados, notas locales) se almacenan exclusivamente en el <code>LocalStorage</code> de tu propio navegador web.</p>
      </section>

      <section>
        <h2>3. Servicios de Terceros</h2>
        <p>Para proporcionar funciones opcionales en tiempo real, NovaTab realiza peticiones directas desde tu cliente a los siguientes servicios:</p>
        <ul>
          <li><strong>Open-Meteo:</strong> Consulta de datos meteorológicos sin registro ni cookies de rastreo.</li>
          <li><strong>Unsplash:</strong> Carga de fotografías de alta resolución curadas.</li>
          <li><strong>Google / Motores de búsqueda:</strong> Consultas de sugerencias de autocompletado en tiempo real al escribir en la barra de búsqueda.</li>
        </ul>
      </section>

      <section>
        <h2>4. Derechos del Usuario (RGPD)</h2>
        <p>Al no almacenar ningún dato personal en bases de datos externas, tú posees el control total de tu información. Puedes borrar todos tus datos en cualquier momento haciendo clic en "Restaurar Por Defecto" en el panel de ajustes o borrando el almacenamiento local del navegador.</p>
      </section>

      <section>
        <h2>5. Contacto</h2>
        <p>Para cualquier duda sobre esta política o el proyecto NovaTab, puedes contactar al desarrollador Moisés Valero en <a href="mailto:contacto@moisesvalero.es" class="text-link">contacto@moisesvalero.es</a> o visitar el repositorio en GitHub.</p>
      </section>
    </article>
  </div>
</main>

<style>
  .legal-container {
    min-height: 100vh;
    padding: 40px 20px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    background: #080c14;
  }
  .legal-card {
    max-width: 760px;
    width: 100%;
    padding: 36px;
    border-radius: 20px;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.7;
  }
  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #38bdf8 !important;
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 24px;
    transition: transform 0.2s ease;
  }
  .back-link:hover {
    transform: translateX(-3px);
  }
  .legal-header {
    margin-bottom: 28px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    padding-bottom: 20px;
  }
  .icon-wrap {
    margin-bottom: 12px;
  }
  h1 {
    font-size: 1.8rem;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 6px;
  }
  .subtitle {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.5);
  }
  .legal-content section {
    margin-bottom: 24px;
  }
  h2 {
    font-size: 1.15rem;
    font-weight: 600;
    color: #38bdf8;
    margin-bottom: 8px;
  }
  p {
    margin-bottom: 10px;
    font-size: 0.95rem;
  }
  ul {
    padding-left: 20px;
    margin-bottom: 12px;
    font-size: 0.95rem;
  }
  li {
    margin-bottom: 6px;
  }
  .text-link {
    color: #38bdf8 !important;
    text-decoration: underline !important;
  }
</style>
