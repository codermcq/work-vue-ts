<template>
  <div class="dashboard">
    <!-- 顶栏 -->
    <header class="topbar">
      <div class="topbar-left">
        <h2 class="topbar-title">工单管理</h2>
        <el-tag :type="authStore.isAdmin ? 'danger' : 'info'" size="small">
          {{ authStore.user?.username }}（{{
            authStore.isAdmin ? "管理员" : "普通用户"
          }}）
        </el-tag>
      </div>
      <div class="topbar-right">
        <el-button :icon="Refresh" @click="handleRefresh">刷新</el-button>
        <el-button type="danger" plain @click="handleLogout"
          >退出登录</el-button
        >
      </div>
    </header>

    <!-- 主内容区：自然高度 + 页面滚动 -->
    <main class="main-content">
      <!-- 工单表格 -->
      <el-card class="content-card">
        <template #header>
          <span class="card-title">工单列表</span>
        </template>

        <el-table
          :data="tableData"
          v-loading="tableLoading"
          stripe
          style="width: 100%"
        >
          <template #empty>
            <el-empty description="暂无工单数据" :image-size="80" />
          </template>
          <el-table-column prop="id" label="ID" width="80" align="center" />
          <el-table-column prop="project" label="Project" min-width="180" />
          <el-table-column label="Overtime" width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="row.overtime ? 'danger' : 'success'" size="small">
                {{ row.overtime ? "Yes" : "No" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="hours"
            label="Hours"
            width="100"
            align="center"
            sortable
          />
          <el-table-column
            prop="created_at"
            label="Created At"
            width="180"
            align="center"
          />
          <el-table-column
            v-if="authStore.isAdmin"
            label="操作"
            width="100"
            align="center"
            fixed="right"
          >
            <template #default="{ row }">
              <el-popconfirm
                title="确认删除该工单？"
                confirm-button-text="确认"
                cancel-button-text="取消"
                @confirm="handleDelete(row.id)"
              >
                <template #reference>
                  <el-button type="danger" size="small" link>Delete</el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-wrap">
          <el-pagination
            v-model:current-page="tablePage"
            v-model:page-size="tablePageSize"
            :page-sizes="[2, 3, 5, 10]"
            :total="tableTotal"
            layout="total, sizes, prev, pager, next"
            background
            small
            @size-change="handleTablePageSizeChange"
            @current-change="handleTablePageChange"
          />
        </div>
      </el-card>

      <!-- 图表区域 -->
      <el-card class="content-card">
        <template #header>
          <div class="card-header-row">
            <span class="card-title">Project Hours Distribution</span>
            <el-pagination
              v-if="chartTotal > 0"
              v-model:current-page="chartPage"
              :page-size="chartPageSize"
              :page-sizes="[2, 3, 5, 10]"
              :total="chartTotal"
              layout="sizes, prev, pager, next"
              background
              small
              @size-change="handleChartPageSizeChange"
              @current-change="handleChartPageChange"
            />
          </div>
        </template>

        <div v-loading="chartLoading" class="chart-wrapper">
          <div
            v-if="!chartLoading && chartData.length === 0"
            class="chart-empty-state"
          >
            <el-empty description="暂无工单数据" :image-size="80" />
          </div>
          <div
            v-show="chartData.length > 0"
            ref="chartRef"
            class="chart-container"
          />
        </div>

        <div v-if="!chartLoading && chartData.length > 0" class="chart-summary">
          当前页 {{ chartData.length }} 条工单 · 共 {{ chartTotal }} 条
        </div>
      </el-card>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Refresh } from "@element-plus/icons-vue";
import { useAuthStore } from "@/stores/auth";
import { getOrders, deleteOrder } from "@/api/orders";
import type { WorkOrder } from "@/types";
import * as echarts from "echarts";

const router = useRouter();
const authStore = useAuthStore();

// ---- 表格状态 ----
const tableData = ref<WorkOrder[]>([]);
const tableLoading = ref(false);
const tablePage = ref(1);
const tablePageSize = ref(3);
const tableTotal = ref(0);

// ---- 图表状态 ----
const chartData = ref<WorkOrder[]>([]);
const chartLoading = ref(false);
const chartPage = ref(1);
const chartPageSize = ref(3);
const chartTotal = ref(0);

// ---- ECharts 实例 ----
const chartRef = ref<HTMLDivElement>();
let chart: echarts.ECharts | null = null;

// ---- 聚合 + 渲染 ----
function aggregateOrders(orders: WorkOrder[]) {
  const map = new Map<string, number>();
  orders.forEach((o) =>
    map.set(o.project, (map.get(o.project) || 0) + o.hours),
  );
  return Array.from(map.entries()).map(([project, hours]) => ({
    project,
    hours: Math.round(hours * 10) / 10,
  }));
}

function renderChart() {
  initChart();
  if (!chart) return;
  const data = aggregateOrders(chartData.value);
  if (data.length === 0) {
    chart.clear();
    return;
  }

  chart.setOption(
    {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        top: 40,
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: data.map((d) => d.project),
        axisLabel: { rotate: 0, fontSize: 12, color: "#606266" },
        boundaryGap: true,
      },
      yAxis: {
        type: "value",
        name: "Hours",
        minInterval: 1,
        axisLabel: { fontSize: 12, color: "#909399" },
      },
      series: [
        {
          type: "bar",
          data: data.map((d) => d.hours),
          itemStyle: { color: "#1890ff", borderRadius: [4, 4, 0, 0] },
          barWidth: "50%",
          label: {
            show: true,
            position: "top",
            fontSize: 12,
            color: "#303133",
          },
          emphasis: { itemStyle: { color: "#40a9ff" } },
        },
      ],
    },
    true,
  );
  chart.resize();
}

// ---- 加载表格数据 ----
async function loadTableData() {
  tableLoading.value = true;
  try {
    const res = await getOrders({
      page: tablePage.value,
      pageSize: tablePageSize.value,
    });
    if (res.code === 0) {
      tableData.value = res.data.list;
      tableTotal.value = res.data.total;
    }
  } catch (err: any) {
    ElMessage.error(err.message || "加载工单失败");
  } finally {
    tableLoading.value = false;
  }
}

// ---- 加载图表数据 ----
async function loadChartData() {
  chartLoading.value = true;
  try {
    const res = await getOrders({
      page: chartPage.value,
      pageSize: chartPageSize.value,
    });
    if (res.code === 0) {
      chartData.value = res.data.list;
      chartTotal.value = res.data.total;
    }
  } catch (err: any) {
    ElMessage.error(err.message || "加载图表数据失败");
  } finally {
    chartLoading.value = false;
    nextTick(() => renderChart());
  }
}

// ---- 加载所有 ----
async function loadAll() {
  await Promise.all([loadTableData(), loadChartData()]);
}

// ---- 表格分页 ----
function handleTablePageChange() {
  loadTableData();
}
function handleTablePageSizeChange() {
  tablePage.value = 1;
  loadTableData();
}

// ---- 图表分页 ----
function handleChartPageChange() {
  loadChartData();
}
function handleChartPageSizeChange() {
  chartPage.value = 1;
  loadChartData();
}

// ---- 删除 ----
async function handleDelete(id: string) {
  try {
    const res = await deleteOrder(id);
    if (res.code === 0) {
      ElMessage.success("删除成功");
      await loadTableData();
      if (tableData.value.length === 0 && tablePage.value > 1) {
        tablePage.value--;
        await loadTableData();
      }
      await loadChartData();
      if (chartData.value.length === 0 && chartPage.value > 1) {
        chartPage.value--;
        await loadChartData();
      }
    }
  } catch (err: any) {
    ElMessage.error(err.message || "删除失败");
  }
}

// ---- 刷新 ----
function handleRefresh() {
  loadAll();
}

// ---- 退出 ----
function handleLogout() {
  authStore.logout();
  ElMessage.info("已退出登录");
  router.push("/login");
}

// ---- ECharts resize ----
function handleResize() {
  chart?.resize();
}

function initChart() {
  if (chartRef.value && !chart) {
    chart = echarts.init(chartRef.value);
    window.addEventListener("resize", handleResize);
  }
}

// ---- 初始化 ----
onMounted(() => {
  initChart();
  loadAll();
});

// ---- 清理 ----
onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  chart?.dispose();
  chart = null;
});
</script>

<style scoped>
.dashboard {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
}

/* 顶栏 */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 24px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
  z-index: 10;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.topbar-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 主内容区：页面级滚动 */
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

/* 卡片：自然高度 + 间距 */
.content-card {
  margin-bottom: 24px;
}

.content-card:last-child {
  margin-bottom: 0;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* 图表 */
.chart-wrapper {
  position: relative;
  min-height: 350px;
}

.chart-container {
  width: 100%;
  height: 350px;
}

.chart-empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 350px;
}

.chart-summary {
  text-align: center;
  color: #909399;
  font-size: 12px;
  margin-top: 8px;
}
</style>
