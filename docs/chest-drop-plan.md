# 宝箱掉落接口计划（装备）

## 目标
- 前 4 次点击：消耗次数 + 星级成长。
- 第 5 次点击：触发一次装备掉落。
- 掉落结果由两段概率决定：
  1. 按当前星级抽品级（C/B/A/S）。
  2. 按部位权重抽类型（武器/上衣/鞋子/首饰）。

## 概率方案

### 1) 星级 -> 品级概率（总和=100%）
| 星级 | C | B | A | S |
|---|---:|---:|---:|---:|
| 1星 | 95% | 5% | 0% | 0% |
| 2星 | 80% | 18% | 2% | 0% |
| 3星 | 60% | 30% | 9% | 1% |
| 4星 | 35% | 40% | 20% | 5% |
| 5星 | 5% | 40% | 40% | 15% |

### 2) 部位权重（总和=100%）
| 部位 | 权重 |
|---|---:|
| 武器 `EquipmentType.Weapon` | 38% |
| 上衣 `EquipmentType.Armor` | 34% |
| 鞋子 `EquipmentType.Shoes` | 18% |
| 首饰 `EquipmentType.Jewelry` | 10% |

说明：满足“武器+上衣更高、鞋子偏低、首饰最低”。

## 接口设计（解耦模块）

落地文件：
- `assets/src/config/EquipmentDropConfig.ts`（概率配置）
- `assets/src/manager/EquipmentCatalogMgr.ts`（集中读取装备配置 + 缓存 candidatesByType）
- `assets/src/manager/EquipmentDropMgr.ts`（掉落逻辑）

```ts
interface IChestDropInput {
  star: 1 | 2 | 3 | 4 | 5;
  candidatesByType: Partial<Record<EquipmentType, IEquipmentConfig[]>>;
  randomFn?: () => number;
}

interface IChestDropResult {
  equipmentId: number;      // equipment.*.json 中的 id
  equipmentType: number;    // EquipmentType
  grade: number;            // EquipmentGradeType
  star: number;             // 本次开箱星级
  uid: string;              // 生成唯一 uid
}
```

流程（模块解耦）：
1. `EquipmentCatalogMgr.init()` 统一读取 `equipment.*.json`（相对路径导入），初始化并缓存 `candidatesByType`。
2. `EquipmentDropMgr.roll(...)` 只消费入参，不负责配置读取。
3. 抽样过程：
   - 使用 `star` 在“星级->品级概率表”中抽 `grade`。
   - 使用“部位权重”抽 `equipmentType`。
   - 从入参 `candidatesByType[equipmentType]` 随机 1 条配置，得到 `equipmentId`。
4. 外层流程生成 `uid`，写入 `Core.userInfo.equipments`，再进入“与当前佩戴装备对比/替换”流程。

## 接入点
- 位置：`assets/src/components/mainCanvas/chestAnimation/chestAnimation.ts`
- 方法：`handleOpenRewardTodo()`
- 实施：
  - 第 5 次点击时，先调用 `EquipmentCatalogMgr.init()`（复用缓存）。
  - 然后调用 `EquipmentDropMgr.roll(...)`。
  - `chestAnimation` 只消费结果，不包含配置读取、概率和加权抽样细节。
  - UI 层展示“新装备 vs 当前佩戴装备”。

## 可调参数建议
- 后续只调两张表，不改代码逻辑：
  - 星级品级表（控制高品质产出速度）
  - 部位权重表（控制武器/防具/首饰分布）
