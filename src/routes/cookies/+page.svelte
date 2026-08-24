<script>
  import { ArrowLeft, Cookie } from "@lucide/svelte";
</script>

<svelte:head>
  <title>Política de Cookies — NovaTab</title>
  <meta name="description" content="Política de cookies de NovaTab. NovaTab no utiliza cookies de seguimiento ni publicidad de terceros." />
  <link rel="canonical" href="https://start.moisesvalero.es/cookies" />
</svelte:head>

<main class="legal-container">
  <div class="legal-card glass-card">
    <a href="/" class="back-link">
      <ArrowLeft size={16} /> Volver a NovaTab
    </a>

    <header class="legal-header">
      <div class="icon-wrap">
        <Cookie size={28} color="#38bdf8" />
      </div>
      <h1>Política de Cookies</h1>
      <p class="subtitle">Última actualización: 24 de agosto de 2026</p>
    </header>

    <article class="legal-content">
      <section>
        <h2>1. Uso de Cookies en NovaTab</h2>
        <p>NovaTab <strong>NO utiliza cookies de publicidad, rastreo ni elaboración de perfiles</strong>.</p>
      </section>

      <section>
        <h2>2. Almacenamiento Local (LocalStorage)</h2>
        <p>En lugar de cookies tradicionales enviadas a servidores, NovaTab utiliza la tecnología estándar de <code>LocalStorage</code> del navegador web con fines estrictamente técnicos y de preferencia del usuario:</p>
        <ul>
          <li>Guardar el tema y fondo de pantalla seleccionado.</li>
          <li>Recordar tus marcadores y enlaces rápidos.</li>
          <li>Mantener tus notas rápidas y ajustes del temporizador Pomodoro.</li>
        </ul>
      </section>

      <section>
        <h2>3. Cómo gestionar o borrar tus preferencias</h2>
        <p>Puedes eliminar en cualquier momento todas las preferencias almacenadas borrando los datos de navegación de tu explorador o utilizando el botón "Restaurar Por Defecto" en el cajón de configuración de NovaTab.</p>
      </section>

      <section>
        <h2>4. Contacto</h2>
        <p>Si tienes preguntas sobre nuestra política de almacenamiento y cookies, contáctanos en <a href="mailto:contacto@moisesvalero.es" class="text-link">contacto@moisesvalero.es</a>.</p>
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
