<script lang="ts">
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabase';
  import { lang } from '$lib/i18n';
  
  let { session = $bindable(null), onStartDateChange = () => {} }: { session: any; onStartDateChange?: (date: string) => void } = $props();
  
  let showPanel = $state(false);
  let isMobile = $state(false);
  
  let currentLang = $state<'fr' | 'en'>('fr');
  lang.subscribe(l => currentLang = l);
  
  const translations = {
    fr: { settings: 'Menu', signOut: 'Déconnexion', doneCards: 'Cartes terminées' },
    en: { settings: 'Menu', signOut: 'Sign Out', doneCards: 'Done Cards' }
  };
  
  function t(key: keyof typeof translations.fr): string {
    return translations[currentLang][key];
  }
  
  function togglePanel() {
    showPanel = !showPanel;
  }
  
  function handleDoneCards() {
    showPanel = false;
    goto('/done');
  }
  
  async function handleLogout() {
    await supabase.auth.signOut();
    showPanel = false;
  }
  
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.prefs-panel')) {
      showPanel = false;
    }
  }
  
  function handleResize() {
    isMobile = window.innerWidth < 768;
  }
</script>

<svelte:window onclick={handleClickOutside} onresize={handleResize} />

{#if session}
  <div class="relative prefs-panel">
    <button onclick={togglePanel} class="p-2 hover:opacity-80 flex items-center">
      {#if isMobile}
        <svg class="w-6 h-6 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      {:else}
        {#if session.user.user_metadata.avatar_url}
          <img 
            src={session.user.user_metadata.avatar_url} 
            alt="Profile" 
            class="w-8 h-8 rounded-full"
          />
        {:else}
          <span class="text-sm font-medium text-gray-200">
            {session.user.user_metadata.name || session.user.email}
          </span>
        {/if}
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      {/if}
    </button>
    
    {#if showPanel}
      <div class="absolute right-0 mt-2 w-56 sm:w-64 bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-3 sm:p-4 z-50">
        {#if isMobile}
          <p class="text-xs text-gray-400 mb-3">{session.user.user_metadata.name || session.user.email}</p>
        {:else}
          <h3 class="font-semibold text-gray-200 mb-4">{t('settings')}</h3>
        {/if}
        
        <div class="space-y-2 sm:space-y-4">
          <button 
            onclick={handleDoneCards}
            class="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm rounded-lg flex items-center gap-2"
          >
            <span>✓</span> {t('doneCards')}
          </button>
          
          <hr class="border-gray-700" />
          
          <button 
            onclick={handleLogout}
            class="w-full px-3 py-2 text-left text-xs sm:text-sm text-red-400 hover:bg-red-900/20 rounded-lg"
          >
            {t('signOut')}
          </button>
        </div>
      </div>
    {/if}
  </div>
{:else}
  <button
    onclick={() => supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'https://eempmhfxsmrpzkvabplp.supabase.co/auth/v1/callback' }
    })}
    class="px-2 sm:px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold rounded-lg transition-colors flex items-center gap-2 border border-gray-600 text-xs sm:text-sm"
  >
    <svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
    <span class="hidden sm:inline">Google</span>
  </button>
{/if}