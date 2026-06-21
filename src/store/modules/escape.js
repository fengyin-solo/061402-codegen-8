import { defineStore } from 'pinia';

export default defineStore('escape', {
  state: () => ({
    resources: {
      food: 0,
      water: 0,
      wood: 0,
      rope: 0,
      cloth: 0,
      metal: 0
    },
    blueprints: {
      hull: { name: '船体图纸', collected: false, location: 'cave', icon: '📐' },
      sail: { name: '船帆图纸', collected: false, location: 'wreck', icon: '📏' },
      rudder: { name: '船舵图纸', collected: false, location: 'jungle', icon: '📊' },
      navigation: { name: '航海图', collected: false, location: 'lighthouse', icon: '🗺️' }
    },
    raft: {
      hull: { name: '船体', progress: 0, required: 100, material: 'wood', materialCost: 5, icon: '🛶' },
      sail: { name: '船帆', progress: 0, required: 100, material: 'cloth', materialCost: 3, icon: '⛵' },
      rudder: { name: '船舵', progress: 0, required: 100, material: 'metal', materialCost: 2, icon: '🎯' },
      rope: { name: '绳索', progress: 0, required: 100, material: 'rope', materialCost: 4, icon: '🪢' }
    },
    supplies: {
      food: { name: '口粮储备', current: 0, required: 200, icon: '🍖' },
      water: { name: '淡水储备', current: 0, required: 200, icon: '💧' },
      medicine: { name: '急救药品', current: 0, required: 10, icon: '💊' }
    },
    mapLocations: [
      { id: 'camp', name: '营地', icon: '🏕️', explored: true, type: 'safe', description: '你的安全基地', loot: null },
      { id: 'forest', name: '丛林深处', icon: '🌴', explored: false, type: 'jungle', description: '茂密的丛林，可能藏有图纸和资源', loot: { wood: 20, cloth: 10, blueprint: 'rudder' } },
      { id: 'beach', name: '海岸线', icon: '🏖️', explored: false, type: 'coast', description: '漫长的海岸线，能找到漂流物', loot: { wood: 15, rope: 15, food: 10 } },
      { id: 'cave', name: '神秘洞穴', icon: '🕳️', explored: false, type: 'cave', description: '阴暗的洞穴，危险与宝藏并存', loot: { metal: 20, blueprint: 'hull', water: 20 } },
      { id: 'wreck', name: '沉船残骸', icon: '🚢', explored: false, type: 'wreck', description: '一艘搁浅的旧船，或许有可用之物', loot: { metal: 15, cloth: 15, blueprint: 'sail', food: 20 } },
      { id: 'mountain', name: '高山溪流', icon: '⛰️', explored: false, type: 'mountain', description: '山上有清澈的溪流和矿石', loot: { metal: 10, water: 30, rope: 10 } },
      { id: 'lighthouse', name: '废弃灯塔', icon: '🗼', explored: false, type: 'lighthouse', description: '年久失修的灯塔，顶部有...', loot: { cloth: 10, blueprint: 'navigation', water: 10 } },
      { id: 'swamp', name: '沼泽地带', icon: '🌿', explored: false, type: 'swamp', description: '危险的沼泽，谨慎前行', loot: { rope: 20, food: 15, medicine: 3 } },
      { id: 'ruins', name: '古老遗迹', icon: '🏛️', explored: false, type: 'ruins', description: '神秘的古代遗迹', loot: { metal: 25, cloth: 20, medicine: 5 } }
    ],
    logs: [
      { time: '00:00', content: '航海逃生计划已启动！你必须收集图纸、修复木筏、储备补给才能离开这座岛屿。', type: 'system' }
    ],
    gameCompleted: false,
    exploringId: null,
    buildingId: null
  }),

  getters: {
    blueprintCount: (state) => {
      return Object.values(state.blueprints).filter(b => b.collected).length;
    },
    blueprintTotal: (state) => Object.keys(state.blueprints).length,
    blueprintProgress: (state) => {
      const total = Object.keys(state.blueprints).length;
      const collected = Object.values(state.blueprints).filter(b => b.collected).length;
      return Math.round((collected / total) * 100);
    },
    raftProgress: (state) => {
      const parts = Object.values(state.raft);
      const total = parts.reduce((sum, p) => sum + p.required, 0);
      const current = parts.reduce((sum, p) => sum + p.progress, 0);
      return Math.round((current / total) * 100);
    },
    raftCompleted: (state) => {
      return Object.values(state.raft).every(p => p.progress >= p.required);
    },
    suppliesProgress: (state) => {
      const items = Object.values(state.supplies);
      const total = items.reduce((sum, s) => sum + s.required, 0);
      const current = items.reduce((sum, s) => sum + Math.min(s.current, s.required), 0);
      return Math.round((current / total) * 100);
    },
    suppliesCompleted: (state) => {
      return Object.values(state.supplies).every(s => s.current >= s.required);
    },
    exploredCount: (state) => state.mapLocations.filter(l => l.explored).length,
    totalLocations: (state) => state.mapLocations.length,
    canEscape: (state) => {
      const allBlueprints = Object.values(state.blueprints).every(b => b.collected);
      const allRaft = Object.values(state.raft).every(p => p.progress >= p.required);
      const allSupplies = Object.values(state.supplies).every(s => s.current >= s.required);
      return allBlueprints && allRaft && allSupplies;
    },
    overallProgress: (state) => {
      const bp = Object.values(state.blueprints).filter(b => b.collected).length / Object.keys(state.blueprints).length;
      const raftParts = Object.values(state.raft);
      const raft = raftParts.reduce((sum, p) => sum + p.progress, 0) / raftParts.reduce((sum, p) => sum + p.required, 0);
      const supplyItems = Object.values(state.supplies);
      const supply = supplyItems.reduce((sum, s) => sum + Math.min(s.current, s.required), 0) / supplyItems.reduce((sum, s) => sum + s.required, 0);
      return Math.round(((bp + raft + supply) / 3) * 100);
    }
  },

  actions: {
    addLog(content, type = 'info') {
      const now = new Date();
      const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      this.logs.push({ time, content, type });
      if (this.logs.length > 50) {
        this.logs.shift();
      }
    },

    exploreLocation(locationId) {
      const location = this.mapLocations.find(l => l.id === locationId);
      if (!location) return false;
      if (location.explored) return false;
      if (this.exploringId) return false;

      this.exploringId = locationId;
      this.addLog(`正在探索 ${location.icon} ${location.name}...`, 'action');

      return true;
    },

    completeExploration(locationId) {
      const location = this.mapLocations.find(l => l.id === locationId);
      if (!location) return null;

      location.explored = true;
      this.exploringId = null;

      const result = {
        location: location,
        resources: {},
        blueprint: null,
        dangerous: false
      };

      if (location.type === 'swamp' || location.type === 'cave') {
        if (Math.random() < 0.3) {
          result.dangerous = true;
          this.resources.food = Math.max(0, this.resources.food - 10);
          this.resources.water = Math.max(0, this.resources.water - 10);
          this.addLog(`在 ${location.name} 遭遇了危险！损失了一些食物和淡水。`, 'danger');
        }
      }

      if (location.loot) {
        for (const [key, value] of Object.entries(location.loot)) {
          if (key === 'blueprint') {
            if (this.blueprints[value] && !this.blueprints[value].collected) {
              this.blueprints[value].collected = true;
              result.blueprint = this.blueprints[value];
              this.addLog(`🎉 发现了 ${this.blueprints[value].icon} ${this.blueprints[value].name}！`, 'success');
            }
          } else {
            const gain = Math.floor(value * (0.7 + Math.random() * 0.6));
            this.resources[key] = (this.resources[key] || 0) + gain;
            result.resources[key] = gain;
          }
        }

        const gained = Object.entries(result.resources)
          .map(([k, v]) => `${this.getResourceName(k)}+${v}`)
          .join('，');
        if (gained) {
          this.addLog(`探索 ${location.name} 获得：${gained}`, 'success');
        }
      }

      return result;
    },

    cancelExploration() {
      this.exploringId = null;
    },

    getResourceName(key) {
      const names = {
        food: '食物',
        water: '淡水',
        wood: '木材',
        rope: '绳索',
        cloth: '布料',
        metal: '金属',
        medicine: '药品'
      };
      return names[key] || key;
    },

    buildRaftPart(partId) {
      const part = this.raft[partId];
      if (!part) return false;
      if (part.progress >= part.required) return false;
      if (this.buildingId) return false;

      const blueprintKey = partId === 'rope' ? null : partId;
      if (blueprintKey && !this.blueprints[blueprintKey]?.collected) {
        this.addLog(`需要先收集 ${this.blueprints[blueprintKey]?.name || '对应图纸'} 才能建造！`, 'warning');
        return false;
      }

      if ((this.resources[part.material] || 0) < part.materialCost) {
        this.addLog(`${this.getResourceName(part.material)}不足！需要${part.materialCost}个。`, 'warning');
        return false;
      }

      this.resources[part.material] -= part.materialCost;
      this.buildingId = partId;
      this.addLog(`开始建造 ${part.icon} ${part.name}...`, 'action');

      return true;
    },

    completeBuildPart(partId) {
      const part = this.raft[partId];
      if (!part) return;

      const increment = 10 + Math.floor(Math.random() * 10);
      part.progress = Math.min(part.progress + increment, part.required);
      this.buildingId = null;

      this.addLog(`${part.icon} ${part.name} 建造进度：${part.progress}%`, 'info');

      if (part.progress >= part.required) {
        this.addLog(`✅ ${part.name} 建造完成！`, 'success');
      }
    },

    cancelBuild() {
      this.buildingId = null;
    },

    addSupply(type, amount) {
      if (!this.supplies[type]) return false;

      const resourceKey = type === 'medicine' ? 'food' : type;
      if ((this.resources[resourceKey] || 0) < amount) {
        this.addLog(`${this.getResourceName(resourceKey)}不足！`, 'warning');
        return false;
      }

      this.resources[resourceKey] -= amount;
      this.supplies[type].current = Math.min(
        this.supplies[type].current + amount,
        this.supplies[type].required
      );

      this.addLog(`储备了 ${amount} ${this.supplies[type].name}，当前：${this.supplies[type].current}/${this.supplies[type].required}`, 'info');

      if (this.supplies[type].current >= this.supplies[type].required) {
        this.addLog(`🎒 ${this.supplies[type].name} 储备充足！`, 'success');
      }

      return true;
    },

    gatherResource(type) {
      const gatherMap = {
        food: { amount: [5, 15], time: 3000, risk: false },
        water: { amount: [5, 15], time: 3000, risk: false },
        wood: { amount: [3, 10], time: 5000, risk: false },
        rope: { amount: [2, 6], time: 6000, risk: false },
        cloth: { amount: [2, 6], time: 6000, risk: false },
        metal: { amount: [1, 4], time: 8000, risk: true }
      };

      const config = gatherMap[type];
      if (!config) return null;

      if (config.risk && Math.random() < 0.15) {
        this.resources.food = Math.max(0, this.resources.food - 5);
        this.resources.water = Math.max(0, this.resources.water - 5);
        this.addLog(`采集${this.getResourceName(type)}时受了点伤，消耗了一些体力。`, 'danger');
      }

      const [min, max] = config.amount;
      const amount = min + Math.floor(Math.random() * (max - min + 1));
      this.resources[type] = (this.resources[type] || 0) + amount;
      this.addLog(`采集获得 ${this.getResourceName(type)} x${amount}`, 'success');

      return { amount, time: config.time };
    },

    craftMedicine() {
      if ((this.resources.food || 0) < 20) {
        this.addLog('食物不足！制作急救药品需要20食物。', 'warning');
        return false;
      }
      if ((this.resources.water || 0) < 10) {
        this.addLog('淡水不足！制作急救药品需要10淡水。', 'warning');
        return false;
      }
      if ((this.resources.cloth || 0) < 5) {
        this.addLog('布料不足！制作急救药品需要5布料。', 'warning');
        return false;
      }

      this.resources.food -= 20;
      this.resources.water -= 10;
      this.resources.cloth -= 5;

      const medicine = 1 + Math.floor(Math.random() * 2);
      this.resources.medicine = (this.resources.medicine || 0) + medicine;
      this.addLog(`💊 制作了 ${medicine} 份急救药品！`, 'success');

      return medicine;
    },

    tryEscape() {
      if (!this.canEscape) {
        this.addLog('逃生条件未满足！请确保图纸收集完毕、木筏建造完成、补给储备充足。', 'warning');
        return false;
      }
      this.gameCompleted = true;
      this.addLog('🎉🎉🎉 恭喜！你成功离开了荒岛，航海逃生计划圆满完成！', 'success');
      return true;
    },

    resetGame() {
      this.resources = { food: 0, water: 0, wood: 0, rope: 0, cloth: 0, metal: 0 };
      Object.keys(this.blueprints).forEach(k => this.blueprints[k].collected = false);
      Object.keys(this.raft).forEach(k => this.raft[k].progress = 0);
      Object.keys(this.supplies).forEach(k => this.supplies[k].current = 0);
      this.mapLocations.forEach(l => { if (l.id !== 'camp') l.explored = false; });
      this.logs = [{ time: '00:00', content: '航海逃生计划已重新启动！', type: 'system' }];
      this.gameCompleted = false;
      this.exploringId = null;
      this.buildingId = null;
    }
  }
});
