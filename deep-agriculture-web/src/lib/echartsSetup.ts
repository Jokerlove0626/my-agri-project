// src/lib/echartsSetup.ts
import * as echarts from 'echarts/core'; // 引入 ECharts 核心模块
// 按需引入图表类型：饼图、折线图、柱状图、地图
import { PieChart, LineChart, BarChart, MapChart } from 'echarts/charts';
// 按需引入 ECharts 组件：提示框、图例、网格、工具箱、视觉映射等
import {
  TooltipComponent,
  LegendComponent,
  GridComponent,
  ToolboxComponent,
  VisualMapComponent,
  TitleComponent,
  DatasetComponent
} from 'echarts/components';
// 引入渲染器：Canvas 渲染器
import { CanvasRenderer } from 'echarts/renderers';

// --- 注册必须的组件和图表 ---
// 注意：这里仍然需要 MapChart 和 VisualMapComponent 等地图相关组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  ToolboxComponent,
  VisualMapComponent, // 地图热力需要
  PieChart,
  LineChart,
  BarChart,
  MapChart, // 地图图表类型需要
  CanvasRenderer
]);

/**
 * 检查指定的 ECharts 地图是否已注册。
 * @param mapName 要检查的地图名称 (例如 'china')
 * @returns 如果地图已注册则返回 true，否则返回 false。
 */
export const checkMapRegistered = (mapName: string): boolean => {
    // echarts.getMap 可以获取已注册的地图数据
    return !!echarts.getMap(mapName);
};

// 导出配置好的 echarts 实例，供其他组件使用
export { echarts };