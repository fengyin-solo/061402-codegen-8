<template>
  <div class="escape-container">
    <div class="escape-header">
      <div class="header-title">
        <h1>⛵ 航海逃生计划</h1>
        <p>收集图纸 · 修复木筏 · 储备补给 · 逃离荒岛</p>
      </div>
      <div class="header-actions">
        <button class="nav-btn back-btn" @click="goBack">
          🏝️ 返回海岛
        </button>
        <el-button type="warning" plain @click="showResetConfirm = true">
          <i class="el-icon-refresh-left" /> 重置计划
        </el-button>
      </div>
    </div>

    <div class="overall-progress">
      <div class="progress-label">
        <span>总进度</span>
        <span class="progress-percent">{{ escapeStore.overallProgress }}%</span>
      </div>
      <el-progress
        :percentage="escapeStore.overallProgress"
        :stroke-width="18"
        color="#67c23a"
        :format="() => ''"
      />
      <div class="progress-steps">
        <div class="step-item" :class="{ done: escapeStore.blueprintProgress === 100 }">
          <span class="step-icon">📐</span>
          <span>图纸 {{ escapeStore.blueprintCount }}/{{ escapeStore.blueprintTotal }}</span>
        </div>
        <div class="step-line" :class="{ done: escapeStore.raftProgress === 100 }" />
        <div class="step-item" :class="{ done: escapeStore.raftProgress === 100 }">
          <span class="step-icon">🛶</span>
          <span>木筏 {{ escapeStore.raftProgress }}%</span>
        </div>
        <div class="step-line" :class="{ done: escapeStore.suppliesProgress === 100 }" />
        <div class="step-item" :class="{ done: escapeStore.suppliesProgress === 100 }">
          <span class="step-icon">🎒</span>
          <span>补给 {{ escapeStore.suppliesProgress }}%</span>
        </div>
        <div class="step-line" :class="{ done: escapeStore.canEscape }" />
        <div class="step-item" :class="{ done: escapeStore.canEscape }">
          <span class="step-icon">🌊</span>
          <span>起航</span>
        </div>
      </div>
    </div>

    <div class="escape-main">
      <div class="left-panel">
        <div class="panel-card resources-panel">
          <div class="panel-title">
            <h3>📦 资源仓库</h3>
          </div>
          <div class="resource-grid">
            <div class="resource-item" v-for="(res, key) in escapeStore.resources" :key="key">
              <div class="resource-icon">{{ resourceIcons[key] }}</div>
              <div class="resource-info">
                <div class="resource-name">{{ resourceNames[key] }}</div>
                <div class="resource-value">{{ res }}</div>
              </div>
            </div>
          </div>
          <div class="gather-section">
            <h4>⛏️ 采集资源</h4>
            <div class="gather-grid">
              <el-button
                v-for="g in gatherList"
                :key="g.key"
                size="small"
                :disabled="!!gathering || !!escapeStore.exploringId || !!escapeStore.buildingId"
                @click="doGather(g.key)"
              >
                {{ g.icon }} {{ g.name }}
              </el-button>
            </div>
            <el-button
              size="small"
              type="primary"
              :disabled="!!gathering || !!escapeStore.exploringId || !!escapeStore.buildingId"
              @click="doCraftMedicine"
            >
              💊 制作药品
            </el-button>
          </div>
        </div>

        <div class="panel-card blueprints-panel">
          <div class="panel-title">
            <h3>📐 图纸收集</h3>
            <el-tag size="small" :type="escapeStore.blueprintProgress === 100 ? 'success' : 'info'">
              {{ escapeStore.blueprintCount }} / {{ escapeStore.blueprintTotal }}
            </el-tag>
          </div>
          <el-progress
            :percentage="escapeStore.blueprintProgress"
            :stroke-width="10"
            color="#e6a23c"
            style="margin-bottom: 15px;"
          />
          <div class="blueprint-list">
            <div
              v-for="(bp, key) in escapeStore.blueprints"
              :key="key"
              class="blueprint-item"
              :class="{ collected: bp.collected }"
            >
              <div class="bp-icon">{{ bp.icon }}</div>
              <div class="bp-info">
                <div class="bp-name">{{ bp.name }}</div>
                <div class="bp-status">
                  <span v-if="bp.collected" class="collected-text">✅ 已收集</span>
                  <span v-else class="hint-text">🔍 {{ locationNames[bp.location] || '未知地点' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="center-panel">
        <div class="panel-card map-panel">
          <div class="panel-title">
            <h3>🗺️ 岛屿地图</h3>
            <el-tag size="small" type="success">
              已探索 {{ escapeStore.exploredCount }} / {{ escapeStore.totalLocations }}
            </el-tag>
          </div>
          <div class="map-container">
            <div class="map-grid">
              <div
                v-for="loc in escapeStore.mapLocations"
                :key="loc.id"
                class="map-cell"
                :class="{
                  explored: loc.explored,
                  exploring: escapeStore.exploringId === loc.id,
                  camp: loc.type === 'safe'
                }"
                @click="handleExplore(loc)"
              >
                <div class="cell-icon">{{ loc.icon }}</div>
                <div class="cell-name">{{ loc.name }}</div>
                <div v-if="escapeStore.exploringId === loc.id" class="explore-loading">
                  <i class="el-icon-loading" />
                </div>
              </div>
            </div>
          </div>
          <div class="map-hint">
            <span v-if="selectedLocation">
              <strong>{{ selectedLocation.name }}：</strong>{{ selectedLocation.description }}
            </span>
            <span v-else>点击未探索的区域开始冒险</span>
          </div>
        </div>

        <div class="panel-card build-panel">
          <div class="panel-title">
            <h3>🛠️ 木筏建造</h3>
            <el-tag size="small" :type="escapeStore.raftProgress === 100 ? 'success' : 'warning'">
              {{ escapeStore.raftProgress }}%
            </el-tag>
          </div>
          <el-progress
            :percentage="escapeStore.raftProgress"
            :stroke-width="10"
            color="#409eff"
            style="margin-bottom: 15px;"
          />
          <div class="raft-grid">
            <div
              v-for="(part, key) in escapeStore.raft"
              :key="key"
              class="raft-part"
              :class="{
                completed: part.progress >= part.required,
                building: escapeStore.buildingId === key
              }"
            >
              <div class="part-header">
                <span class="part-icon">{{ part.icon }}</span>
                <span class="part-name">{{ part.name }}</span>
                <span v-if="needBlueprint[key]" class="bp-required" :class="{ ok: escapeStore.blueprints[key]?.collected }">
                  {{ escapeStore.blueprints[key]?.collected ? '✅ 图纸已获得' : '🔒 需要图纸' }}
                </span>
              </div>
              <el-progress
                :percentage="Math.round((part.progress / part.required) * 100)"
                :stroke-width="8"
                :color="part.progress >= part.required ? '#67c23a' : '#409eff'"
              />
              <div class="part-footer">
                <span class="part-progress">{{ part.progress }} / {{ part.required }}</span>
                <el-button
                  size="small"
                  type="primary"
                  :disabled="part.progress >= part.required || !!escapeStore.buildingId || !!escapeStore.exploringId || !!gathering || (key !== 'rope' && !escapeStore.blueprints[key]?.collected)"
                  @click="doBuild(key)"
                >
                  建造 ({{ resourceIcons[part.material] }}x{{ part.materialCost }})
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <div class="panel-card supplies-panel">
          <div class="panel-title">
            <h3>🎒 补给储备</h3>
            <el-tag size="small" :type="escapeStore.suppliesProgress === 100 ? 'success' : 'danger'">
              {{ escapeStore.suppliesProgress }}%
            </el-tag>
          </div>
          <el-progress
            :percentage="escapeStore.suppliesProgress"
            :stroke-width="10"
            color="#f56c6c"
            style="margin-bottom: 15px;"
          />
          <div class="supplies-list">
            <div
              v-for="(sup, key) in escapeStore.supplies"
              :key="key"
              class="supply-item"
              :class="{ completed: sup.current >= sup.required }"
            >
              <div class="supply-icon">{{ sup.icon }}</div>
              <div class="supply-info">
                <div class="supply-name">{{ sup.name }}</div>
                <div class="supply-bar">
                  <div
                    class="supply-bar-inner"
                    :style="{ width: Math.min(100, (sup.current / sup.required * 100)) + '%' }"
                  />
                </div>
                <div class="supply-text">{{ sup.current }} / {{ sup.required }}</div>
              </div>
              <el-input-number
                v-model="supplyAmounts[key]"
                :min="1"
                :max="sup.required - sup.current"
                size="small"
                :disabled="sup.current >= sup.required || !!escapeStore.buildingId || !!escapeStore.exploringId || !!gathering"
                style="width: 100px;"
              />
              <el-button
                size="small"
                type="success"
                :disabled="sup.current >= sup.required || !!escapeStore.buildingId || !!escapeStore.exploringId || !!gathering"
                @click="doAddSupply(key)"
              >
                储备
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <div class="right-panel">
        <div class="panel-card escape-action-panel">
          <div class="escape-section">
            <div class="escape-btn-wrap">
              <el-button
                type="success"
                size="large"
                :disabled="!escapeStore.canEscape"
                @click="doTryEscape"
                class="escape-btn"
              >
                <span style="font-size: 20px;">🌊 扬帆起航</span>
              </el-button>
              <div class="escape-conditions">
                <div class="condition-item" :class="{ ok: escapeStore.blueprintProgress === 100 }">
                  <span>{{ escapeStore.blueprintProgress === 100 ? '✅' : '⬜' }}</span>
                  <span>收集全部图纸</span>
                </div>
                <div class="condition-item" :class="{ ok: escapeStore.raftProgress === 100 }">
                  <span>{{ escapeStore.raftProgress === 100 ? '✅' : '⬜' }}</span>
                  <span>木筏建造完成</span>
                </div>
                <div class="condition-item" :class="{ ok: escapeStore.suppliesProgress === 100 }">
                  <span>{{ escapeStore.suppliesProgress === 100 ? '✅' : '⬜' }}</span>
                  <span>补给储备充足</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="panel-card log-panel">
          <div class="panel-title">
            <h3>📜 航海日志</h3>
            <el-tag size="small" type="info">实时进度</el-tag>
          </div>
          <div class="log-list" ref="logListRef">
            <div
              v-for="(log, index) in escapeStore.logs"
              :key="index"
              class="log-item"
              :class="'log-' + log.type"
            >
              <span class="log-time">{{ log.time }}</span>
              <span class="log-content">{{ log.content }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="showResetConfirm"
      title="确认重置"
      width="400px"
    >
      <p>确定要重置航海逃生计划吗？所有进度将被清除。</p>
      <template #footer>
        <el-button @click="showResetConfirm = false">取消</el-button>
        <el-button type="primary" @click="doReset">确认重置</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="showVictory"
      title="🎉 逃生成功！"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="victory-content">
        <div class="victory-icon">🎊</div>
        <h2>恭喜你成功逃离荒岛！</h2>
        <p>经过艰苦的收集、建造和准备，你终于驾驶着亲手打造的木筏，扬起风帆，驶向了远方的地平线...</p>
        <p>新的冒险正在等待着你！</p>
      </div>
      <template #footer>
        <el-button type="primary" @click="doResetFromVictory">再来一次</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useEscapeStore } from '../../store';

const router = useRouter();
const escapeStore = useEscapeStore();

const goBack = () => {
  router.push('/');
};

const logListRef = ref(null);
const showResetConfirm = ref(false);
const showVictory = ref(false);
const selectedLocation = ref(null);
const gathering = ref(null);

const supplyAmounts = reactive({
  food: 10,
  water: 10,
  medicine: 1
});

const resourceIcons = {
  food: '🍖',
  water: '💧',
  wood: '🪵',
  rope: '🪢',
  cloth: '🧵',
  metal: '⚙️',
  medicine: '💊'
};

const resourceNames = {
  food: '食物',
  water: '淡水',
  wood: '木材',
  rope: '绳索',
  cloth: '布料',
  metal: '金属'
};

const locationNames = {
  cave: '神秘洞穴',
  wreck: '沉船残骸',
  jungle: '丛林深处',
  lighthouse: '废弃灯塔'
};

const needBlueprint = {
  hull: true,
  sail: true,
  rudder: true
};

const gatherList = [
  { key: 'food', name: '食物', icon: '🍖' },
  { key: 'water', name: '淡水', icon: '💧' },
  { key: 'wood', name: '木材', icon: '🪵' },
  { key: 'rope', name: '绳索', icon: '🪢' },
  { key: 'cloth', name: '布料', icon: '🧵' },
  { key: 'metal', name: '金属', icon: '⚙️' }
];

const scrollLog = () => {
  nextTick(() => {
    if (logListRef.value) {
      logListRef.value.scrollTop = logListRef.value.scrollHeight;
    }
  });
};

watch(() => escapeStore.logs.length, () => {
  scrollLog();
});

const handleExplore = (loc) => {
  selectedLocation.value = loc;
  if (loc.explored) {
    if (loc.type === 'safe') {
      ElMessage.info('这里是你的营地，安全但没有可探索的内容');
    } else {
      ElMessage.info(`${loc.name} 已经探索过了');
    }
    return;
  }
  if (escapeStore.exploringId || escapeStore.buildingId || gathering.value) {
    ElMessage.warning('请等待当前操作完成');
    return;
  }

  ElMessageBox.confirm(
    `确定要探索 ${loc.icon} ${loc.name} 吗？\n${loc.description}`,
    '开始探索',
    {
      confirmButtonText: '出发',
      cancelButtonText: '再想想',
      type: 'info'
    }
  ).then(() => {
    if (escapeStore.exploreLocation(loc.id)) {
      setTimeout(() => {
        escapeStore.completeExploration(loc.id);
        ElMessage.success(`探索完成：${loc.name}`);
      }, 3000 + Math.random() * 2000);
    }
  }).catch(() => {
    escapeStore.cancelExploration();
  });
};

const doBuild = (partId) => {
  if (escapeStore.buildRaftPart(partId)) {
    setTimeout(() => {
      escapeStore.completeBuildPart(partId);
    }, 2000);
  }
};

const doGather = (type) => {
  gathering.value = type;
  const result = escapeStore.gatherResource(type);
  if (result) {
    setTimeout(() => {
      gathering.value = null;
      if (result) {
        ElMessage.success(`采集完成：${resourceNames[type]} x${result.amount}`);
      }
    }, result.time);
  } else {
    gathering.value = null;
  }
};

const doCraftMedicine = () => {
  gathering.value = 'medicine';
  const result = escapeStore.craftMedicine();
  setTimeout(() => {
    gathering.value = null;
    if (result) {
      ElMessage.success(`制作完成：急救药品 x${result}`);
    }
  }, 4000);
};

const doAddSupply = (type) => {
  const amount = supplyAmounts[type] || 1;
  escapeStore.addSupply(type, amount);
};

const doTryEscape = () => {
  if (escapeStore.tryEscape()) {
    showVictory.value = true;
  } else {
    ElMessage.warning('逃生条件尚未满足！');
  }
};

const doReset = () => {
  escapeStore.resetGame();
  showResetConfirm.value = false;
  ElMessage.info('已重置航海逃生计划');
};

const doResetFromVictory = () => {
  escapeStore.resetGame();
  showVictory.value = false;
};

onMounted(() => {
  scrollLog();
});
</script>

<style scoped>
.escape-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 20px;
  color: #e0e0e0;
}

.escape-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0 10px;
}

.header-title h1 {
  font-size: 36px;
  margin: 0 0 8px 0;
  color: #fff;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
}

.header-title p {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  letter-spacing: 2px;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.nav-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.back-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
}

.overall-progress {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 25px 30px;
  margin-bottom: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-weight: 600;
  color: #333;
  font-size: 16px;
}

.progress-percent {
  font-size: 28px;
  color: #67c23a;
  font-weight: bold;
}

.progress-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  gap: 8px;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #999;
  min-width: 80px;
}

.step-item.done {
  color: #67c23a;
  font-weight: 600;
}

.step-icon {
  font-size: 24px;
}

.step-line {
  flex: 1;
  height: 3px;
  background: #e0e0e0;
  border-radius: 2px;
  min-width: 30px;
}

.step-line.done {
  background: linear-gradient(90deg, #67c23a, #85ce61);
}

.escape-main {
  display: grid;
  grid-template-columns: 280px 1fr 320px;
  gap: 20px;
  max-width: 1600px;
  margin: 0 auto;
}

.panel-card {
  background: rgba(255, 255, 255, 0.97);
  border-radius: 14px;
  padding: 22px;
  margin-bottom: 20px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
}

.panel-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.panel-title h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.resource-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  border-radius: 10px;
  border: 1px solid #e6ebff;
}

.resource-icon {
  font-size: 28px;
  margin-right: 10px;
}

.resource-name {
  font-size: 12px;
  color: #666;
}

.resource-value {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
}

.gather-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
}

.gather-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.blueprint-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.blueprint-item {
  display: flex;
  align-items: center;
  padding: 14px;
  background: #f5f7fa;
  border-radius: 10px;
  border: 2px solid #e4e7ed;
  transition: all 0.3s;
}

.blueprint-item.collected {
  background: linear-gradient(135deg, #f0f9eb 0%, #e1f3d8 100%);
  border-color: #c2e7b0;
}

.bp-icon {
  font-size: 32px;
  margin-right: 14px;
}

.bp-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.collected-text {
  color: #67c23a;
  font-size: 12px;
  font-weight: 600;
}

.hint-text {
  color: #e6a23c;
  font-size: 12px;
}

.map-container {
  padding: 15px;
  background: linear-gradient(135deg, #e8f4fa 0%, #d4e8f4 100%);
  border-radius: 12px;
  margin-bottom: 15px;
}

.map-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.map-cell {
  aspect-ratio: 1;
  background: #fff;
  border: 3px solid #c0c4cc;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.map-cell:hover:not(.explored) {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.map-cell.explored {
  background: linear-gradient(135deg, #e1f3d8 0%, #c2e7b0 100%);
  border-color: #67c23a;
}

.map-cell.exploring {
  animation: pulse 1.5s infinite;
  border-color: #409eff;
}

.map-cell.camp {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  border-color: #e6a23c;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.4); }
  50% { box-shadow: 0 0 0 10px rgba(64, 158, 255, 0); }
}

.cell-icon {
  font-size: 36px;
  margin-bottom: 6px;
}

.cell-name {
  font-size: 12px;
  color: #333;
  font-weight: 500;
}

.explore-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
  color: #409eff;
  background: rgba(255, 255, 255, 0.9);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-hint {
  font-size: 13px;
  color: #606266;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  min-height: 42px;
  display: flex;
  align-items: center;
}

.raft-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.raft-part {
  padding: 16px;
  background: #f8f9ff;
  border-radius: 12px;
  border: 2px solid #e6ebff;
  transition: all 0.3s;
}

.raft-part.completed {
  background: linear-gradient(135deg, #f0f9eb 0%, #e1f3d8 100%);
  border-color: #c2e7b0;
}

.raft-part.building {
  border-color: #409eff;
  animation: building-pulse 1s infinite;
}

@keyframes building-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.2); }
  50% { box-shadow: 0 0 0 5px rgba(64, 158, 255, 0); }
}

.part-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  gap: 8px;
  flex-wrap: wrap;
}

.part-icon {
  font-size: 24px;
}

.part-name {
  font-weight: 600;
  color: #333;
  font-size: 15px;
}

.bp-required {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: #fef0f0;
  color: #f56c6c;
}

.bp-required.ok {
  background: #f0f9eb;
  color: #67c23a;
}

.part-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.part-progress {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.supplies-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.supply-item {
  display: grid;
  grid-template-columns: 40px 1fr 100px 70px;
  gap: 12px;
  align-items: center;
  padding: 14px;
  background: #fafafa;
  border-radius: 10px;
  border: 2px solid #ebeef5;
  transition: all 0.3s;
}

.supply-item.completed {
  background: linear-gradient(135deg, #f0f9eb 0%, #e1f3d8 100%);
  border-color: #c2e7b0;
}

.supply-icon {
  font-size: 32px;
  text-align: center;
}

.supply-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

.supply-bar {
  height: 8px;
  background: #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 4px;
}

.supply-bar-inner {
  height: 100%;
  background: linear-gradient(90deg, #f56c6c, #f78989);
  transition: width 0.5s ease;
  border-radius: 4px;
}

.supply-item.completed .supply-bar-inner {
  background: linear-gradient(90deg, #67c23a, #85ce61);
}

.supply-text {
  font-size: 12px;
  color: #909399;
}

.escape-action-panel {
  background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
  border: 2px solid #f5d58e;
}

.escape-section {
  text-align: center;
}

.escape-btn {
  width: 100%;
  margin-bottom: 20px;
  padding: 18px;
  font-weight: 600;
  border-radius: 14px;
}

.escape-conditions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: left;
}

.condition-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  font-size: 13px;
  color: #909399;
}

.condition-item.ok {
  color: #67c23a;
  font-weight: 500;
}

.log-list {
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  padding: 10px;
  background: #fafbfc;
}

.log-item {
  display: flex;
  gap: 10px;
  padding: 8px 10px;
  margin-bottom: 6px;
  background: #fff;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.5;
  border-left: 3px solid #dcdfe6;
}

.log-time {
  font-weight: 600;
  color: #909399;
  white-space: nowrap;
  min-width: 45px;
}

.log-content {
  color: #606266;
  flex: 1;
}

.log-system {
  border-left-color: #909399;
  background: #f4f4f5;
}

.log-action {
  border-left-color: #409eff;
  background: #ecf5ff;
}

.log-action .log-time {
  color: #409eff;
}

.log-success {
  border-left-color: #67c23a;
  background: #f0f9eb;
}

.log-success .log-time {
  color: #67c23a;
}

.log-warning {
  border-left-color: #e6a23c;
  background: #fdf6ec;
}

.log-warning .log-time {
  color: #e6a23c;
}

.log-danger {
  border-left-color: #f56c6c;
  background: #fef0f0;
}

.log-danger .log-time {
  color: #f56c6c;
}

.log-info .log-time {
  color: #409eff;
}

.victory-content {
  text-align: center;
  padding: 20px;
}

.victory-icon {
  font-size: 80px;
  margin-bottom: 20px;
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.victory-content h2 {
  margin: 0 0 20px 0;
  color: #67c23a;
  font-size: 24px;
}

.victory-content p {
  margin: 0 0 12px 0;
  color: #606266;
  line-height: 1.8;
  font-size: 14px;
}

@media (max-width: 1200px) {
  .escape-main {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .escape-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .header-title h1 {
    font-size: 28px;
  }

  .progress-steps {
    flex-wrap: wrap;
  }

  .raft-grid {
    grid-template-columns: 1fr;
  }

  .supply-item {
    grid-template-columns: 40px 1fr;
  }

  .map-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .gather-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
