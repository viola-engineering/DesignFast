<script setup lang="ts">
interface FeatureRow {
  feature: string
  free: string
  starter: string
  pro: string
  isCategory?: boolean
}

defineProps<{
  rows: FeatureRow[]
}>()
</script>

<template>
  <div class="table-wrapper">
    <table class="compare-table">
      <thead>
        <tr>
          <th scope="col">Feature</th>
          <th scope="col">Free</th>
          <th scope="col" class="featured-col">Starter</th>
          <th scope="col">Pro</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(row, index) in rows" :key="index">
          <tr v-if="row.isCategory" class="cat-row">
            <td colspan="4">{{ row.feature }}</td>
          </tr>
          <tr v-else>
            <td>{{ row.feature }}</td>
            <td>{{ row.free }}</td>
            <td class="featured-col">{{ row.starter }}</td>
            <td>{{ row.pro }}</td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-wrapper {
  overflow-x: auto;
  padding: 0 var(--sp-page);
}

.compare-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--sz-small);
}

.compare-table th,
.compare-table td {
  text-align: left;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--rule);
}

.compare-table th {
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-size: var(--sz-micro);
  color: var(--ink-light);
  background-color: rgba(16, 14, 11, 0.02);
}

.compare-table th:first-child {
  text-align: left;
}

.compare-table th:not(:first-child) {
  text-align: center;
  min-width: 120px;
}

.compare-table td:not(:first-child) {
  text-align: center;
  color: var(--ink-light);
}

.featured-col {
  background-color: rgba(204, 50, 9, 0.04);
}

.cat-row td {
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-size: var(--sz-micro);
  color: var(--ink);
  background-color: rgba(16, 14, 11, 0.04);
  padding: 0.75rem 1.25rem;
}
</style>
