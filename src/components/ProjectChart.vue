<template>
  <div class="chart-card">
    <div class="chart-header">
      <h3 class="chart-title">Project Hours Distribution</h3>
      <el-pagination
        v-if="total > 0"
        small
        layout="prev, pager, next"
        :total="total"
        :page-size="pageSize"
        :current-page="page"
        @current-change="$emit('update:page', $event)"
      />
    </div>

    <div v-loading="loading" class="chart-body">
      <div v-if="!loading && orders.length === 0" class="chart-empty">
        <el-empty description="暂无工单数据" />
      </div>
      <div
        v-show="orders.length > 0"
        ref="chartRef"
        class="chart-container"
      />
    </div>

    <div class="chart-footer">
      {{ orders.length > 0 ? `当前页 ${orders.length} 条工单 · 共 ${total} 条` : '暂无数据' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { WorkOrder } from '@/types'

const props = defineProps<{
  orders: WorkOrder[]
  loading: boolean
  page: number
  pageSize: number
  total: number
}>()

defineEmits<{
  'update:page': [page: number]
}>()

const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

function aggregateOrders(orders: WorkOrder[]): { project: string; hours: number }[] {
  const map = new Map<string, number>()
  orders.forEach(o => {
    map.set(o.project, (map.get(o.project) || 0) + o.hours)
  })
  return Array.from(map.entries()).map(([project, hours]) => ({
    project,
    hours: Math.round(hours * 10) / 10,
  }))
}

function renderChart(orders: WorkOrder[]) {
  if (!chart) return

  const data = aggregateOrders(orders)

  if (data.length === 0) {
    chart.clear()
    return
  }

  chart.setOption(
    {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: 40,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: data.map(d => d.project),
        axisLabel: {
          rotate: 0,
          fontSize: 12,
          color: '#606266',
        },
        boundaryGap: true,
      },
      yAxis: {
        type: 'value',
        name: 'Hours',
        minInterval: 1,
        axisLabel: {
          fontSize: 12,
          color: '#909399',
        },
      },
      series: [
        {
          type: 'bar',
          data: data.map(d => d.hours),
          itemStyle: {
            color: '#1890ff',
            borderRadius: [4, 4, 0, 0],
          },
          barWidth: '50%',
          label: {
            show: true,
            position: 'top',
            fontSize: 12,
            color: '#303133',
            formatter: '{c}',
          },
          emphasis: {
            itemStyle: { color: '#40a9ff' },
          },
        },
      ],
    },
    true,
  )
}

function handleResize() {
  chart?.resize()
}

watch(
  () => props.orders,
  (val) => {
    nextTick(() => renderChart(val))
  },
  { deep: true },
)

onMounted(() => {
  if (chartRef.value) {
    chart = echarts.init(chartRef.value)
    window.addEventListener('resize', handleResize)
    if (props.orders.length > 0) {
      renderChart(props.orders)
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
  chart = null
})
</script>

<style scoped>
.chart-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.chart-body {
  position: relative;
  min-height: 350px;
}

.chart-container {
  width: 100%;
  height: 350px;
}

.chart-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.chart-footer {
  text-align: center;
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}
</style>
