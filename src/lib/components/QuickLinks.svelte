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
              on:error={handleFaviconError}
              loading="lazy"
            />
          </div>
          <span class="link-title">{link.title}</span>

          <button 
            type="button"
            class="btn-edit" 
            on:click={(e) => openEditModal(link, e)}
            title="Editar acceso directo"
          >
            <Edit2 size={13} />
          </button>
        </a>
      </div>
    {/each}

    <button type="button" class="add-card glass-panel" on:click={openAddModal} title="Añadir acceso directo">
      <div class="icon-box add-box">
        <Plus size={22} />
      </div>
      <span class="link-title">Añadir</span>
    </button>
  </div>
</div>

{#if isModalOpen}
  <div class="modal-backdrop" on:click={() => (isModalOpen = false)}>
    <div class="modal-content glass-card" on:click={(e) => e.stopPropagation()}>
      <div class="modal-header">
        <h3>{editingId ? 'Editar Acceso Directo' : 'Añadir Acceso Directo'}</h3>
        <button type="button" class="btn-close" on:click={() => (isModalOpen = false)}>
          <X size={18} />
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
          <button type="button" class="btn-delete" on:click={(e) => handleDelete(editingId, e)}>
            <Trash2 size={16} /> Borrar
          </button>
        {/if}
        <button type="button" class="btn-save" on:click={handleSave}>
          Guardar
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .quicklinks-container {
    width: 100%;
    max-width: 820px;
    margin: 0 auto 2rem auto;
    z-index: 10;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 16px;
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
    padding: 16px 12px;
    height: 105px;
    position: relative;
    overflow: hidden;
  }

  .link-card:hover, .add-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
  }

  .icon-box {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
    transition: transform 0.2s ease;
  }

  .link-card:hover .icon-box {
    transform: scale(1.08);
  }

  .icon-box img {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    object-fit: contain;
  }

  .add-box {
    background: rgba(56, 189, 248, 0.2);
    color: #38bdf8;
    border: 1px dashed rgba(56, 189, 248, 0.5);
  }

  .link-title {
    font-size: 0.85rem;
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
    top: 6px;
    right: 6px;
    width: 22px;
    height: 22px;
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
    transform: scale(1.15);
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
    max-width: 420px;
    padding: 24px;
    background: rgba(18, 24, 38, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .modal-header h3 {
    font-size: 1.2rem;
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
    margin-bottom: 16px;
    font-size: 0.88rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
  }

  .modal-body span {
    margin-bottom: 6px;
  }

  .modal-body input {
    padding: 12px 14px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    color: #ffffff;
    font-size: 0.95rem;
  }

  .modal-body input:focus {
    border-color: #38bdf8;
    background: rgba(255, 255, 255, 0.15);
  }

  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
  }

  .btn-save {
    padding: 10px 20px;
    background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);
    color: #ffffff;
    font-weight: 600;
    border-radius: 10px;
    font-size: 0.92rem;
  }

  .btn-save:hover {
    opacity: 0.95;
    transform: translateY(-1px);
  }

  .btn-delete {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.4);
    font-weight: 500;
    border-radius: 10px;
    font-size: 0.88rem;
    margin-right: auto;
  }

  .btn-delete:hover {
    background: rgba(239, 68, 68, 0.35);
  }
</style>
