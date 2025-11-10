import { NPC, Clue, GameItem } from "../types/game";

// 关卡一的所有NPC
export const chapter1NPCs: Record<string, NPC> = {
  boatman: {
    id: "boatman",
    name: "饥饿的船夫",
    role: "船夫",
    location: "dock",
    dialogue: [
      "别烦我... 饿得前胸贴后背了。",
      "官府今天不知道怎么回事，还没发粮...",
      "没力气，开不了船。",
    ],
    currentDialogueIndex: 0,
  },

  vendor: {
    id: "vendor",
    name: "推车小贩",
    role: "小贩",
    location: "market",
    dialogue: [
      "包子嘞！热乎乎的包子嘞！",
      "客官要几个？一文钱一个！",
    ],
    currentDialogueIndex: 0,
    givesItem: {
      id: "bun",
      name: "包子",
      description: "热乎乎的包子，看起来很普通",
      icon: "🥟",
      type: "food",
    },
  },

  beggar: {
    id: "beggar",
    name: "永远饥饿的乞丐",
    role: "乞丐（异常）",
    location: "market_corner",
    dialogue: [
      "好饿... 根本吃不饱...",
      "给我吃的... 给我吃的...",
      "（他周围堆满了食物残渣，但依旧瘦骨嶙峋）",
    ],
    currentDialogueIndex: 0,
    isAwakened: false,
  },

  beggarAwakening: {
    id: "beggar",
    name: "青铜鼎的残影",
    role: "文物异常",
    location: "market_corner",
    dialogue: [
      "饿... 我好饿...",
      "（他抱着头，痛苦地嘶吼）",
      "我... 我是... 鼎？",
      "（青铜光芒从他身上散发出来）",
      "我想起来了... 我是'国之重器'！",
      "我的职责不是索取... 而是供养...",
      "（光芒愈发耀眼，乞丐的形态开始变化）",
      "谢谢你... 让我想起了自己的使命...",
    ],
    currentDialogueIndex: 0,
    isAwakened: true,
  },

  scholar: {
    id: "scholar",
    name: "儒生",
    role: "私塾先生",
    location: "school",
    dialogue: [
      "哦？你问那个奇怪的乞丐？",
      "唉，世风日下啊...",
      "不过，说起'吃不饱'，老夫倒想起一句古话。",
      "食者，非为果腹，亦为'礼'也。",
      "古人'钟鸣鼎食'，那'鼎'可不是吃饭的碗！",
      "它是国之重器，是用来盛放祭品，敬天法祖的！",
      "若有人只知索取不知供养，便是忘了'鼎'的本分了。",
    ],
    currentDialogueIndex: 0,
    givesClue: {
      id: "clue_ding_ritual",
      title: "鼎 = 礼器",
      content: "鼎不是吃饭的器皿，而是国之重器，用来盛放祭品，敬天法祖。",
      source: "儒生",
    },
  },

  monk: {
    id: "monk",
    name: "化缘僧侣",
    role: "僧人",
    location: "market",
    dialogue: [
      "阿弥陀佛。",
      "施主所说之人，贪念过重，已非人，乃一'器'也。",
      "他只知索取，却忘了自己本应'盛放'与'供养'的本分。",
      "他已不是一个'容器'，只是一个永恒的'缺口'。",
      "若要度化他，需让他想起自己的真实身份。",
    ],
    currentDialogueIndex: 0,
    givesClue: {
      id: "clue_vessel",
      title: "异常者 = 器皿",
      content: "那个乞丐已经不是人，而是一个忘记了'供养'本分的器皿。",
      source: "僧侣",
    },
  },

  guard: {
    id: "guard",
    name: "守城官兵",
    role: "官兵",
    location: "government",
    dialogue: [
      "站住！官府重地，闲人勿进！",
      "什么？你问官粮为什么没发？",
      "别提了！本要运往宫中祭祀大典的一尊国宝青铜鼎被盗！",
      "现在全城戒严！",
      "所有祭祀用的贡品（食物）都堆在仓库，运不出去！",
      "码头那帮船工的粮食自然也耽搁了！",
      "唉，也不知道那国宝去哪了...",
    ],
    currentDialogueIndex: 0,
    givesClue: {
      id: "clue_missing_ding",
      title: "青铜鼎失踪",
      content: "祭祀用的国宝青铜鼎被盗，所有贡品食物都堆积在仓库无法运出。",
      source: "守城官兵",
    },
  },

  boatmanAfterAwakening: {
    id: "boatman",
    name: "船夫",
    role: "船夫",
    location: "dock",
    dialogue: [
      "天呐！这... 这是官府仓库里的'贡品'！",
      "你怎么拿到的？不管了！",
      "吃饱了！恩人，您要去哪？",
      "我马上开船！",
    ],
    currentDialogueIndex: 0,
  },
};

// 唤醒青铜鼎后获得的能力
export const bronzeDingAbility = {
  id: "supply_power",
  name: "历史回响：供养",
  description: "凭空具现化出高品质的食物（贡品）。来自青铜鼎的力量。",
  icon: "✨",
};

// 给船夫的贡品食物
export const tributeFood: GameItem = {
  id: "tribute_food",
  name: "祭祀贡品",
  description: "官府仓库中的高品质食物，原本用于祭祀大典",
  icon: "🍱",
  type: "food",
};
