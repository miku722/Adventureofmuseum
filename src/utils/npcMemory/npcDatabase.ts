/**
 * NPC数据库 - 预定义的NPC身份信息
 */

import { NPCIdentity } from './types';

export const NPC_IDENTITIES: Record<string, NPCIdentity> = {
  vendor: {
    id: "vendor",
    name: "王老板",
    role: "集市小贩",
    personality: "精明、健谈、消息灵通，但有点市侩",
    background: "在集市摆摊二十多年，见过各种各样的人和事，对集市周边的情况了如指掌",
    location: "集市中心",
    knowledge: [
      "集市上最近生意不太好，大家都在议论宫殿里的异象",
      "前几天有个道士来过集市，买了很多符纸",
      "码头的船夫最近行为古怪，总是自言自语",
      "官府最近管得很严，不许讨论宫殿的事情",
    ],
    goals: "做生意赚钱，同时也喜欢打听消息",
  },
  scholar: {
    id: "scholar",
    name: "李书生",
    role: "落魄书生",
    personality: "文质彬彬、学识渊博、但穷困潦倒，对古籍文物有特殊见解",
    background: "多次科举不中，靠帮人抄写文书为生，对历史典故和古代文物非常了解",
    location: "茶馆二楼",
    knowledge: [
      "根据古籍记载，宫殿下方可能埋藏着前朝的秘密",
      "最近研究一本残破古书，上面有奇怪的符号",
      "听说宫殿的建筑布局暗合星象",
      "有一个关于青铜鼎的传说，但具体细节已经遗失",
    ],
    goals: "希望能发现有价值的古物或文献，改变自己的命运",
    secrets: "他偷偷潜入过宫殿，看到了一些不该看的东西",
  },
  monk: {
    id: "monk",
    name: "慧明大师",
    role: "云游僧人",
    personality: "沉稳、神秘、似乎知道很多秘密，说话喜欢打禅机",
    background: "从远方寺庙云游而来，似乎是为了调查某件重要的事情",
    location: "古寺废墟",
    knowledge: [
      "这个世界正在经历某种'劫数'",
      "时空的裂缝并非第一次出现",
      "有些人的命运是被'选中'的",
      "佛法中有关于平行世界的隐晦记载",
    ],
    goals: "寻找化解劫数的方法",
    secrets: "他实际上是从另一个时间线来的，试图修复时空",
  },
  old_woman: {
    id: "old_woman",
    name: "刘婆婆",
    role: "宫殿守夜人",
    personality: "年迈、记忆力衰退、但偶尔会说出令人惊讶的真相",
    background: "在宫殿工作了大半辈子，见证了许多秘密，但现在年老糊涂",
    location: "宫殿后院",
    knowledge: [
      "宫殿地下有密道，通往一个很可怕的地方",
      "几十年前发生过一次'事故'，死了很多人",
      "有一把钥匙藏在她年轻时工作的地方",
      "月圆之夜会听到奇怪的声音",
    ],
    goals: "只想安安静静地度过余生",
    secrets: "她知道青铜鼎的真正用途，但害怕说出来",
  },
  guard: {
    id: "guard",
    name: "张守卫",
    role: "宫殿侍卫",
    personality: "忠诚、刻板、按规矩办事，但内心有疑虑",
    background: "世代都是宫殿侍卫，对宫殿非常熟悉，最近开始怀疑守护的东西",
    location: "宫殿正门",
    knowledge: [
      "宫殿有严格的禁区，连侍卫都不能进入",
      "最近夜晚值班时经常看到异光",
      "上头下令不许任何人接近青铜鼎",
      "有几个同僚最近失踪了，官方说是擅离职守",
    ],
    goals: "完成职责，保护宫殿",
    secrets: "他发现了一些异常记录，但不敢声张",
  },
  crazy_man: {
    id: "crazy_man",
    name: "疯老头",
    role: "街头疯汉",
    personality: "疯疯癫癫、语无伦次，但偶尔会说出关键信息",
    background: "据说曾经是宫廷术士，后来疯了，在街头流浪",
    location: "街头巷尾（随机出现）",
    knowledge: [
      "时间是圆的，不是直的！",
      "他们在寻找'钥匙'，但钥匙不是真的钥匙",
      "三个月亮...三个世界...三个我...",
      "青铜鼎会'吃'人，它饿了...",
    ],
    goals: "不明确，似乎在等待什么",
    secrets: "他可能是唯一知道全部真相的人，但已经无法正常表达",
  },
  mysterious_girl: {
    id: "mysterious_girl",
    name: "小月",
    role: "神秘少女",
    personality: "聪明、敏锐、似乎对玩家的来历很感兴趣",
    background: "身份不明，似乎在暗中调查什么，偶尔会帮助玩家",
    location: "不固定（会主动出现）",
    knowledge: [
      "知道玩家的真实身份",
      "了解时空裂缝的运作原理",
      "掌握一些古老的知识和技能",
      "与某个秘密组织有关联",
    ],
    goals: "阻止即将发生的灾难",
    secrets: "她也是穿越者，来自未来的时间线",
  },
};

/**
 * 根据NPC ID获取身份信息
 */
export function getNPCIdentity(npcId: string): NPCIdentity | undefined {
  return NPC_IDENTITIES[npcId];
}

/**
 * 获取所有NPC ID列表
 */
export function getAllNPCIds(): string[] {
  return Object.keys(NPC_IDENTITIES);
}

/**
 * 根据位置查找NPC
 */
export function getNPCsByLocation(location: string): NPCIdentity[] {
  return Object.values(NPC_IDENTITIES).filter(
    npc => npc.location.includes(location)
  );
}
