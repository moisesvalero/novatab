<script>
  import { linksStore, getFaviconUrl } from '$lib/stores/linksStore';
  import { Plus, Trash2, Edit2, X } from '@lucide/svelte';

  let links = $derived($linksStore);

  let isModalOpen = $state(false);
  let editingId = $state(null);
  let inputTitle = $state('');
  let inputUrl = $state('');

  function openAddModal() {
    editingId = null;
    inputTitle = '';
    inputUrl = '';
    isModalOpen = true;
  }

  function openEditModal(link, e) {
    e.preventDefault();
    e.stopPropagation();
    editingId = link.id;
    inputTitle = link.title;
    inputUrl = link.url;
    isModalOpen = true;
  }

  function handleSave() {
    if (!inputUrl.trim()) return;
    if (editingId) {
      linksStore.updateLink(editingId, inputTitle, inputUrl);
    } else {
      linksStore.addLink(inputTitle, inputUrl);
    }
    isModalOpen = false;
  }

  function handleDelete(id, e) {
    e.preventDefault();
    e.stopPropagation();
    linksStore.removeLink(id);
    if (editingId === id) {
      isModalOpen = false;
    }
  }

  function handleFaviconError(e) {
    e.target.src = 'https://www.google.com/s2/favicons?domain=google.com&sz=128';
  }
</script>

<div class="quicklinks-container animate-fade-in">
  <div class="grid">
    {#each links as link (link.id)}
      <div class="card-wrapper">
        <a 
          href={link.url} 
          class="link-card glass-panel" 
          title={link.title}
        >
          <div class="icon-box">
            <img 
              src={getFaviconUrl(link.url)} 
              alt={link.title} 
              onerror={handleFaviconError}
              loading="lazy"
            />
          </div>
          <span class="link-title">{link.title}</span>

          <button 
            type="button"
            class="btn-edit" 
            onclick={(e) => openEditModal(link, e)}
            title="Editar acceso directo"
          >
            <Edit2 size={11} />
          </button>
        </a>
      </div>
    {/each}

    <button type="button" class="add-card glass-panel" onclick={openAddModal} title="Añadir acceso directo">
      <div class="icon-box add-box">
        <Plus size={18} />
      </div>
      <span class="link-title">Añadir</span>
    </button>
  </div>
</div>

{#if isModalOpen}
  <div class="modal-backdrop" onclick={() => (isModalOpen = false)}>
    <div class="modal-content glass-card" onclick={(e) => e.stopPropagation()}>
      <div class="modal-header">
        <h3>{editingId ? 'Editar Acceso Directo' : 'Añadir Acceso Directo'}</h3>
        <button type="button" class="btn-close" onclick={() => (isModalOpen = false)}>
          <X size={16} />
        </button>
      </div>

      <div class="modal-body">
        <label>
          <span>Título</span>
          <input 
            type="text" 
            bind:value={inputTitle} 
            placeholder="Ej: YouTube" 
            autocomplete="off"
          />
        </label>

        <label>
          <span>Enlace (URL)</span>
          <input 
            type="url" 
            bind:value={inputUrl} 
            placeholder="https://youtube.com" 
            autocomplete="off"
          />
        </label>
      </div>

      <div class="modal-footer">
        {#if editingId}
          <button type="button" class="btn-delete" onclick={(e) => handleDelete(editingId, e)}>
            <Trash2 size={14} /> Borrar
          </button>
        {/if}
        <button type="button" class="btn-save" onclick={handleSave}>
          Guardar
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .quicklinks-container {
    width: 100%;
    max-width: 680px;
    margin: 0 auto 1.4rem auto;
    z-index: 10;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
    gap: 12px;
    justify-content: center;
  }

  .card-wrapper {
    position: relative;
  }

  .link-card, .add-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px 8px;
    height: 80px;
    position: relative;
    overflow: hidden;
  }

  .link-card:hover, .add-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  }

  .icon-box {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 6px;
    transition: transform 0.2s ease;
  }

  .link-card:hover .icon-box {
    transform: scale(1.06);
  }

  .icon-box img {
    width: 22px;
    height: 22px;
    border-radius: 5px;
    object-fit: contain;
  }

  .add-box {
    background: rgba(56, 189, 248, 0.18);
    color: #38bdf8;
    border: 1px dashed rgba(56, 189, 248, 0.5);
  }

  .link-title {
    font-size: 0.78rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.95);
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }

  .btn-edit {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.4);
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease, transform 0.2s ease;
  }

  .link-card:hover .btn-edit {
    opacity: 1;
  }

  .btn-edit:hover {
    background: rgba(56, 189, 248, 0.8);
    transform: scale(1.1);
  }

  /* Modal */
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(12px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }

  .modal-content {
    width: 100%;
    max-width: 380px;
    padding: 20px;
    background: rgba(18, 24, 38, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 18px;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .modal-header h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #ffffff;
  }

  .btn-close {
    color: rgba(255, 255, 255, 0.6);
    padding: 4px;
    border-radius: 50%;
  }

  .btn-close:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.1);
  }

  .modal-body label {
    display: flex;
    flex-direction: column;
    margin-bottom: 14px;
    font-size: 0.82rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
  }

  .modal-body span {
    margin-bottom: 4px;
  }

  .modal-body input {
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: #ffffff;
    font-size: 0.9rem;
  }

  .modal-body input:focus {
    border-color: #38bdf8;
    background: rgba(255, 255, 255, 0.15);
  }

  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }

  .btn-save {
    padding: 8px 16px;
    background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);
    color: #ffffff;
    font-weight: 600;
    border-radius: 8px;
    font-size: 0.88rem;
  }

  .btn-save:hover {
    opacity: 0.95;
    transform: translateY(-1px);
  }

  .btn-delete {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 8px 14px;
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.4);
    font-weight: 500;
    border-radius: 8px;
    font-size: 0.82rem;
    margin-right: auto;
  }

  .btn-delete:hover {
    background: rgba(239, 68, 68, 0.35);
  }
</style>
