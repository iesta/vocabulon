<script lang="ts">
  const { packs = [], selectedPackId = null, onSelectPack } = $props<{
    packs: any[];
    selectedPackId?: number | null;
    onSelectPack: (id: number) => void;
  }>();
</script>

<div class="pack-list">
  {#each packs as pack}
    <div 
      class="pack-item {selectedPackId === pack.id ? 'selected' : ''}"
      on:click={() => onSelectPack(pack.id)}
    >
      <div class="pack-info">
        <h4>{pack.name}</h4>
        <p>{pack.description}</p>
      </div>
      <div class="pack-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: {pack.progress}%"></div>
        </div>
        <span>{pack.progress}%</span>
      </div>
    </div>
  {/each}
</div>

<style>
  .pack-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .pack-item {
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
  }
  .pack-item:hover {
    background-color: #f3f4f6;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  .pack-item.selected {
    background-color: #dbeafe;
    border-color: #3b82f6;
  }
  .pack-info h4 {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
  .pack-info p {
    font-size: 0.875rem;
    color: #6b7280;
  }
  .pack-progress {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  .progress-bar {
    flex-grow: 1;
    height: 0.5rem;
    background-color: #e5e7eb;
    border-radius: 0.25rem;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    background-color: #10b981;
    transition: width 0.3s;
  }
</style>
