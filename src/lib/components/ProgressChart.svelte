<script lang="ts">
  const { progress = 0, title = 'Progress' } = $props<{
    progress?: number;
    title?: string;
  }>();
</script>

<div class="progress-chart">
  <h3>{title}</h3>
  <div class="chart-container">
    <!-- Circular progress chart -->
    <svg 
      class="progress-circle" 
      width="120" 
      height="120" 
      viewBox="0 0 120 120"
    >
      <circle 
        class="progress-bg" 
        cx="60" 
        cy="60" 
        r="54" 
        stroke-width="12" 
        fill="none"
      />
      <circle 
        class="progress-fill"
        cx="60" 
        cy="60" 
        r="54" 
        stroke-width="12" 
        fill="none"
        stroke-dasharray="339.292"
        stroke-dashoffset="{339.292 * (1 - progress / 100)}"
        transform="rotate(-90 60 60)"
      />
      <text 
        x="60" 
        y="65" 
        text-anchor="middle" 
        class="progress-text"
      >
        {progress}%
      </text>
    </svg>
    
    <div class="progress-stats">
      <div class="stat">
        <span class="stat-label">Completed</span>
        <span class="stat-value">{progress}%</span>
      </div>
      <div class="stat">
        <span class="stat-label">Remaining</span>
        <span class="stat-value">{100 - progress}%</span>
      </div>
    </div>
  </div>
</div>

<style>
  .progress-chart {
    text-align: center;
  }
  .progress-chart h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 1rem;
  }
  .chart-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  .progress-circle {
    transform: rotate(0deg);
  }
  .progress-bg {
    stroke: #e5e7eb;
  }
  .progress-fill {
    stroke: #3b82f6;
    stroke-linecap: round;
    transition: stroke-dashoffset 0.5s ease;
  }
  .progress-text {
    font-size: 1.5rem;
    font-weight: bold;
    fill: #1f2937;
  }
  .progress-stats {
    display: flex;
    gap: 1.5rem;
  }
  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .stat-label {
    font-size: 0.875rem;
    color: #6b7280;
  }
  .stat-value {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
  }
</style>
