<script lang="ts">
  const { word, showFrench = true, onFlip } = $props<{
    word: any;
    showFrench?: boolean;
    onFlip: () => void;
  }>();
</script>

<div 
  class="flashcard-container" 
  on:click={onFlip}
>
  {#if showFrench}
    <div class="french-side">
      <h3>FRENCH</h3>
      <p>{word?.french}</p>
    </div>
  {:else}
    <div class="english-side">
      <h3>ENGLISH</h3>
      <p>{word?.english}</p>
    </div>
  {/if}
</div>

<style>
  .flashcard-container {
    cursor: pointer;
  }
  .french-side, .english-side {
    padding: 2rem;
    text-align: center;
  }
</style>
