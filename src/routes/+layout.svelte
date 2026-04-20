<script lang="ts">
  import './layout.css';
  import favicon from '$lib/assets/favicon.svg';

  let { children } = $props();
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <meta name="theme-color" content="#9333ea" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="Vocabulon" />
  <meta name="description" content="French learning flashcard app" />
  
  <link rel="icon" href="/icon.png" />
  <link rel="manifest" href="/manifest.json" />
  <link rel="apple-touch-icon" href="/icon.png" />
  
  <script>document.documentElement.classList.add('dark');</script>
</svelte:head>
<div class="dark">
  {@render children()}
</div>