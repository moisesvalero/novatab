<script>
  import { ArrowLeft, Scale } from "@lucide/svelte";
</script>

<svelte:head>
  <title>Aviso Legal y Términos — NovaTab</title>
  <meta name="description" content="Aviso legal, términos de uso y autoría del proyecto NovaTab desarrollado por Moisés Valero." />
  <link rel="canonical" href="https://start.moisesvalero.es/aviso-legal" />
</svelte:head>

<main class="legal-container">
  <div class="legal-card glass-card">
    <a href="/" class="back-link">
      <ArrowLeft size={16} /> Volver a NovaTab
    </a>

    <header class="legal-header">
      <div class="icon-wrap">
        <Scale size={28} color="#38bdf8" />
      </div>
      <h1>Aviso Legal</h1>
      <p class="subtitle">Última actualización: 24 de agosto de 2026</p>
    </header>

    <article class="legal-content">
      <section>
        <h2>1. Información General y Titularidad</h2>
        <p>En cumplimiento de los deberes de información aplicables, se informa que el proyecto <strong>NovaTab</strong> es una iniciativa de software libre desarrollada por <strong>Moisés Valero</strong> con residencia en España (Unión Europea).</p>
        <p>Contacto: <a href="mailto:contacto@moisesvalero.es" class="text-link">contacto@moisesvalero.es</a> | Web oficial: <a href="https://moisesvalero.es" target="_blank" rel="noopener noreferrer" class="text-link">moisesvalero.es</a>.</p>
      </section>

      <section>
        <h2>2. Licencia de Software (MIT)</h2>
        <p>NovaTab es un proyecto de código abierto publicado bajo la <strong>Licencia MIT</strong>. Eres libre de usar, estudiar, modificar y redistribuir el código fuente de acuerdo con las condiciones establecidas en el repositorio oficial de GitHub.</p>
      </section>

      <section>
        <h2>3. Propiedad Intelectual y Agradecimientos</h2>
        <p>Las fotografías mostradas son propiedad de sus respectivos autores en Unsplash y se utilizan conforme a sus términos de licencia. Los iconos son provistos por Lucide Icons.</p>
      </section>

      <section>
        <h2>4. Exclusión de Responsabilidad</h2>
        <p>El software se proporciona "tal cual", sin garantías de ningún tipo expresas o implícitas. El desarrollador no será responsable de ninguna reclamación, daño o pérdida derivada de su uso.</p>
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
  .text-link {
    color: #38bdf8 !important;
    text-decoration: underline !important;
  }
</style>
