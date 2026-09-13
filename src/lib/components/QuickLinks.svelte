<script>
  import { flip } from 'svelte/animate';
  import { linksStore, getFaviconUrl } from '$lib/stores/linksStore';
  import { Plus, Trash2, Edit2, X } from '@lucide/svelte';

  let links = $derived($linksStore);

  let isModalOpen = $state(false);
  let editingId = $state(null);
  let inputTitle = $state('');
  let inputUrl = $state('');

  // Drag & drop state
  let draggedId = $state(null);
  let activeDragId = $state(null);
  let dragOverId = $state(null);
  let wasDragging = false;
  let dragResetTimer = null;

  // Touch handling state
  let touchStartX = 0;
  let touchStartY = 0;
  let isTouchMoving = false;
  let touchSourceId = null;

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

  function handleKeydown(e) {
    if (e.key === 'Escape' && isModalOpen) {
      isModalOpen = false;
    }
  }

  function handleModalSubmit(e) {
    e.preventDefault();
    handleSave();
  }

  // --- Drag and Drop Logic ---
  function handleDragStart(e, id) {
    draggedId = id;
    wasDragging = true;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', id);
    }
    // Defer visual state so browser drag ghost captures the opaque card
    requestAnimationFrame(() => {
      activeDragId = id;
    });
  }

  function handleDragOver(e, id) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    if (draggedId && draggedId !== id) {
      dragOverId = id;
    }
  }

  function handleDragLeave(e, id) {
    if (dragOverId === id && !e.currentTarget.contains(e.relatedTarget)) {
      dragOverId = null;
    }
  }

  function handleDrop(e, targetId) {
    e.preventDefault();
    if (draggedId && draggedId !== targetId) {
      linksStore.reorderLinks(draggedId, targetId);
    }
    finishDrag();
  }

  function handleDragEnd() {
    finishDrag();
  }

  function finishDrag() {
    draggedId = null;
    activeDragId = null;
    dragOverId = null;
    clearTimeout(dragResetTimer);
    dragResetTimer = setTimeout(() => {
      wasDragging = false;
    }, 180);
  }

  function handleLinkClick(e) {
    if (wasDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  function handleCardKeydown(e, id, index) {
    if (e.altKey && e.key === 'ArrowLeft') {
      e.preventDefault();
      if (index > 0) {
        linksStore.reorderLinks(id, links[index - 1].id);
      }
    } else if (e.altKey && e.key === 'ArrowRight') {
      e.preventDefault();
      if (index < links.length - 1) {
        linksStore.reorderLinks(id, links[index + 1].id);
      }
    }
  }

  // --- Touch Support for Mobile / Tablets ---
  function handleTouchStart(e, id) {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchSourceId = id;
    isTouchMoving = false;
  }

  function handleTouchMove(e) {
    if (!touchSourceId || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;

    if (!isTouchMoving && Math.hypot(dx, dy) > 10) {
      isTouchMoving = true;
      wasDragging = true;
      draggedId = touchSourceId;
      activeDragId = touchSourceId;
    }

    if (isTouchMoving) {
      if (e.cancelable) e.preventDefault();
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      const targetWrapper = el?.closest('[data-id], .add-card');
      if (targetWrapper) {
        const targetId = targetWrapper.getAttribute('data-id') || (targetWrapper.classList.contains('add-card') ? '__end__' : null);
        if (targetId && targetId !== draggedId) {
          dragOverId = targetId;
        } else {
          dragOverId = null;
        }
      } else {
        dragOverId = null;
      }
    }
  }

  function handleTouchEnd() {
    if (isTouchMoving && draggedId && dragOverId && draggedId !== dragOverId) {
      linksStore.reorderLinks(draggedId, dragOverId);
    }
    touchSourceId = null;
    isTouchMoving = false;
    finishDrag();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="quicklinks-container">
  <div class="grid" role="list" aria-label="Accesos directos favoritos">
    {#each links as link, index (link.id)}
      <div 
        class="card-wrapper"
        class:is-dragging={activeDragId === link.id}
        class:drag-over={dragOverId === link.id}
        data-id={link.id}
        draggable="true"
        role="listitem"
        aria-roledescription="acceso directo reordenable"
        ondragstart={(e) => handleDragStart(e, link.id)}
        ondragover={(e) => handleDragOver(e, link.id)}
        ondragleave={(e) => handleDragLeave(e, link.id)}
        ondrop={(e) => handleDrop(e, link.id)}
        ondragend={handleDragEnd}
        ontouchstart={(e) => handleTouchStart(e, link.id)}
        ontouchmove={handleTouchMove}
        ontouchend={handleTouchEnd}
        animate:flip={{ duration: 250 }}
      >
        <a 
          href={link.url} 
          class="link-card glass-panel" 
          title="{link.title} (Arrastra para reordenar o Alt+Flechas)"
          onclick={handleLinkClick}
          onkeydown={(e) => handleCardKeydown(e, link.id, index)}
        >
          <div class="icon-box">
            <img 
              src={getFaviconUrl(link.url)} 
              alt={link.title} 
              onerror={handleFaviconError}
              loading="lazy"
              draggable="false"
            />
          </div>
          <span class="link-title">{link.title}</span>

          <button 
            type="button"
            class="btn-edit" 
            onclick={(e) => openEditModal(link, e)}
            onmousedown={(e) => e.stopPropagation()}
            title="Editar acceso directo"
            aria-label="Editar acceso directo {link.title}"
            draggable="false"
          >
            <Edit2 size={11} />
          </button>
        </a>
      </div>
    {/each}

    <button 
      type="button" 
      class="add-card glass-panel" 
      class:drag-over={dragOverId === '__end__'}
      onclick={openAddModal} 
      ondragover={(e) => handleDragOver(e, '__end__')}
      ondragleave={(e) => handleDragLeave(e, '__end__')}
      ondrop={(e) => handleDrop(e, '__end__')}
      title="Añadir acceso directo" 
      aria-label="Añadir acceso directo"
    >
      <div class="icon-box add-box">
        <Plus size={18} />
      </div>
      <span class="link-title">Añadir</span>
    </button>
  </div>
</div>

{#if isModalOpen}
  <div 
    class="modal-backdrop animate-fade-in" 
    onclick={(e) => { if (e.target === e.currentTarget) isModalOpen = false; }}
    role="presentation"
  >
    <div 
      class="modal-content glass-card animate-modal" 
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabindex="-1"
    >
      <div class="modal-header">
        <h3 id="modal-title">{editingId ? 'Editar Acceso Directo' : 'Añadir Acceso Directo'}</h3>
        <button type="button" class="btn-close" onclick={() => (isModalOpen = false)} aria-label="Cerrar modal">
          <X size={18} />
        </button>
      </div>

      <form onsubmit={handleModalSubmit}>
        <div class="modal-body">
          <label>
            <span>Título</span>
            <input 
              type="text" 
              bind:value={inputTitle} 
              placeholder="Ej: YouTube" 
              autocomplete="off"
              required
            />
          </label>

          <label>
            <span>Enlace (URL)</span>
            <input 
              type="text" 
              bind:value={inputUrl} 
              placeholder="youtube.com o https://..." 
              autocomplete="off"
              required
            />
          </label>
        </div>

        <div class="modal-footer">
          {#if editingId}
            <button type="button" class="btn-delete" onclick={(e) => handleDelete(editingId, e)}>
              <Trash2 size={14} /> Borrar
            </button>
          {/if}
          <button type="button" class="btn-cancel" onclick={() => (isModalOpen = false)}>
            Cancelar
          </button>
          <button type="submit" class="btn-save">
            Guardar
          </button>
        </div>
      </form>
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
    user-select: none;
    cursor: grab;
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
    touch-action: manipulation;
  }

  .card-wrapper:active {
    cursor: grabbing;
  }

  .card-wrapper.is-dragging {
    opacity: 0.35;
    transform: scale(0.94);
    cursor: grabbing;
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
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease;
  }

  .link-card:hover, .add-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  }

  .card-wrapper.drag-over .link-card,
  .add-card.drag-over {
    border-color: rgba(56, 189, 248, 0.85);
    box-shadow: 0 0 16px rgba(56, 189, 248, 0.4), 0 8px 24px rgba(0, 0, 0, 0.35);
    transform: scale(1.05);
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
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.68);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    box-sizing: border-box;
  }

  .modal-content {
    width: 100%;
    max-width: 400px;
    padding: 24px;
    background: rgba(18, 24, 38, 0.94);
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 20px;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
    position: relative;
    outline: none;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
  }

  .modal-header h3 {
    font-size: 1.15rem;
    font-weight: 600;
    color: #ffffff;
    letter-spacing: -0.01em;
  }

  .btn-close {
    color: rgba(255, 255, 255, 0.6);
    padding: 6px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .btn-close:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.12);
  }

  .modal-body label {
    display: flex;
    flex-direction: column;
    margin-bottom: 16px;
    font-size: 0.85rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.85);
  }

  .modal-body span {
    margin-bottom: 6px;
  }

  .modal-body input {
    width: 100%;
    box-sizing: border-box;
    min-width: 0;
    padding: 11px 14px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 10px;
    color: #ffffff;
    font-size: 0.92rem;
    transition: all 0.2s ease;
  }

  .modal-body input:focus {
    border-color: #38bdf8;
    background: rgba(255, 255, 255, 0.14);
    box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2);
  }

  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 22px;
  }

  .btn-cancel {
    padding: 9px 16px;
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.85);
    font-weight: 500;
    border-radius: 9px;
    font-size: 0.88rem;
    transition: all 0.2s ease;
  }

  .btn-cancel:hover {
    background: rgba(255, 255, 255, 0.18);
    color: #ffffff;
  }

  .btn-save {
    padding: 9px 18px;
    background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);
    color: #ffffff;
    font-weight: 600;
    border-radius: 9px;
    font-size: 0.88rem;
    box-shadow: 0 4px 14px rgba(56, 189, 248, 0.35);
    transition: all 0.2s ease;
  }

  .btn-save:hover {
    opacity: 0.95;
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(56, 189, 248, 0.45);
  }

  .btn-delete {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 9px 14px;
    background: rgba(239, 68, 68, 0.18);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.35);
    font-weight: 500;
    border-radius: 9px;
    font-size: 0.84rem;
    margin-right: auto;
    transition: all 0.2s ease;
  }

  .btn-delete:hover {
    background: rgba(239, 68, 68, 0.3);
  }
</style>
