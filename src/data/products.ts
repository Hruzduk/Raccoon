export const locales = ["uk", "en", "fr"] as const;
export type Locale = (typeof locales)[number];

export type Silk = "satin" | "twill" | "silk";

export type Copy = Record<Locale, string>;

export type ProductSize = {
  id: string;
  widthCm: number;
  heightCm: number;
  priceUah: number;
  /** Наявність до першого замовлення. Далі кількість живе в data/store.json. */
  initialStock: number;
};

export type Product = {
  slug: string;
  silk: Silk;
  freehand: boolean;
  bothSides: boolean;
  name: Copy;
  description: Copy;
  colors: [string, string, string];
  /** Покладіть файли в public/products і вкажіть шляхи, наприклад /products/protea.jpg */
  images: string[];
  sizes: ProductSize[];
};

export function stockKey(slug: string, sizeId: string) {
  return `${slug}:${sizeId}`;
}

function size(width: number, height: number, priceUah: number, initialStock = 1): ProductSize {
  return {
    id: `${width}x${height}`,
    widthCm: width,
    heightCm: height,
    priceUah,
    initialStock,
  };
}

/**
 * Чернетка каталогу з публікацій @shovkana.
 * Назви робочі: у підписах хустки описані, але не названі.
 * Ціни й розміри взяті з тих підписів. Наявність стоїть 1,
 * бо кожен пост був про хустку, яку можна було замовити.
 * Якщо екземпляр уже проданий, поставте initialStock: 0
 * або змініть кількість у data/store.json після першого замовлення.
 * Пости без опису малюнка сюди не потрапили, щоб не здвоювати позиції.
 */
export const products: Product[] = [
  {
    slug: "protea",
    silk: "silk",
    freehand: true,
    bothSides: false,
    name: { uk: "Протея", en: "Protea", fr: "Protée" },
    description: {
      uk: "Хустка у техніці вільного розпису з протеями. Такі роботи з’являються нечасто: плавні переходи відтінків народжуються з натхнення, і малюнок хочеться розглядати.",
      en: "A freehand scarf with proteas. These pieces are rare in the workshop: the colour shifts come from the moment of painting, and the drawing asks to be looked at closely.",
      fr: "Un carré en peinture libre, avec des protées. Ces pièces sont rares dans l’atelier : les passages de couleur naissent dans le geste, et le dessin se regarde de près.",
    },
    colors: ["#c45b6a", "#e7a08a", "#6e3048"],
    images: [],
    sizes: [size(80, 80, 4700)],
  },
  {
    slug: "vivid",
    silk: "satin",
    freehand: false,
    bothSides: false,
    name: { uk: "Смілива", en: "Vivid", fr: "Vive" },
    description: {
      uk: "Яскрава хустка з характером. Вона не для того, щоб лишатися непоміченою: на сірому пальті чи простому одязі саме вона збирає погляд.",
      en: "A bright scarf with a strong character. It is not made to go unnoticed: on a grey coat or a plain outfit, it is the piece that catches the eye.",
      fr: "Un carré vif, avec du caractère. Il n’est pas fait pour passer inaperçu : sur un manteau gris ou une tenue simple, c’est lui qui attire le regard.",
    },
    colors: ["#5b2a78", "#e23d6d", "#1d3a6e"],
    images: [],
    sizes: [size(80, 80, 4300)],
  },
  {
    slug: "waves",
    silk: "satin",
    freehand: false,
    bothSides: false,
    name: { uk: "Хвилі", en: "Waves", fr: "Vagues" },
    description: {
      uk: "Теплі відтінки рожевого, бордового й золотавого лягають м’якими хвилями. Кожен перехід зроблений пензлем і фарбою, а не друком.",
      en: "Warm pink, burgundy and gold fall in soft waves. Every transition is brush and dye, not a print.",
      fr: "Des roses, des bordeaux et des ors chauds tombent en vagues douces. Chaque passage est du pinceau et de la teinture, pas une impression.",
    },
    colors: ["#c46b7a", "#8a3040", "#d4a24a"],
    images: [],
    sizes: [size(68, 68, 3900)],
  },
  {
    slug: "depth",
    silk: "twill",
    freehand: false,
    bothSides: false,
    name: { uk: "Глибина", en: "Depth", fr: "Profondeur" },
    description: {
      uk: "Стримане, багатогранне поєднання відтінків. Хустка для міста, зустрічей і щоденних образів, коли кольору має бути рівно стільки, скільки потрібно.",
      en: "A restrained, many-layered mix of shades. A scarf for the city, for meetings and for ordinary days, when the colour should be exactly enough.",
      fr: "Un accord de tons retenu et nuancé. Un carré pour la ville, les rendez-vous et les jours ordinaires, quand la couleur doit être juste assez.",
    },
    colors: ["#3d4c63", "#8a7d72", "#2a2428"],
    images: [],
    sizes: [size(68, 68, 3900)],
  },
  {
    slug: "both-sides",
    silk: "silk",
    freehand: false,
    bothSides: true,
    name: { uk: "Двобічна", en: "Both sides", fr: "Double face" },
    description: {
      uk: "Малюнок є з обох сторін, тож хустку можна повертати як завгодно. На шиї, на плечах, на сумці чи у волоссі вона лишається малюнком, а не виворотом.",
      en: "The drawing is on both sides, so the scarf can be turned any way. At the neck, on the shoulders, on a bag or in the hair, you still see the painting.",
      fr: "Le dessin est des deux côtés, le carré se tourne donc comme on veut. Au cou, sur les épaules, sur un sac ou dans les cheveux, on voit toujours la peinture.",
    },
    colors: ["#7d4e5a", "#e6d2c4", "#3f2a33"],
    images: [],
    sizes: [size(68, 68, 3900)],
  },
  {
    slug: "accent",
    silk: "silk",
    freehand: false,
    bothSides: false,
    name: { uk: "Акцент", en: "Accent", fr: "Accent" },
    description: {
      uk: "Маленька хустинка, яка змінює простий одяг. На шиї, у волоссі або на ручці сумки — деталь на один день і на інший настрій.",
      en: "A small scarf that changes a plain outfit. At the neck, in the hair or on a bag handle — a detail for today, and another mood tomorrow.",
      fr: "Un petit carré qui change une tenue simple. Au cou, dans les cheveux ou sur l’anse d’un sac : un détail pour aujourd’hui, une autre humeur demain.",
    },
    colors: ["#d86a4a", "#f2c14e", "#6b2d3c"],
    images: [],
    sizes: [size(53, 53, 1900)],
  },
  {
    slug: "pearls",
    silk: "satin",
    freehand: false,
    bothSides: false,
    name: { uk: "Перлини", en: "Pearls", fr: "Perles" },
    description: {
      uk: "Розпис народився з образу перлин: у кожної своя форма і свій відблиск. Хустка про ту саму неповторність, яку шовк тримає на світлі.",
      en: "The painting began from pearls: each one has its own shape and its own glint. The scarf is about that same singularity, held in the light of the silk.",
      fr: "La peinture est née des perles : chacune a sa forme et son éclat. Le carré parle de cette même singularité, tenue dans la lumière de la soie.",
    },
    colors: ["#f3e6d8", "#c9a27a", "#8a6a52"],
    images: [],
    sizes: [size(68, 68, 3900)],
  },
  {
    slug: "still",
    silk: "twill",
    freehand: false,
    bothSides: false,
    name: { uk: "Тиша", en: "Still", fr: "Calme" },
    description: {
      uk: "Спокійна палітра, яку легко поєднати з сорочкою, джинсами чи сукнею. Шовк легкий, м’який і добре драпірується. Цей дизайн уже носять у різних розмірах — у каталозі зараз той, що був у публікації.",
      en: "A calm palette that sits easily with a shirt, jeans or a dress. The silk is light, soft and drapes well. This design is already worn in more than one size — the catalogue shows the size from the post.",
      fr: "Une palette calme, facile avec une chemise, un jean ou une robe. La soie est légère, souple, et elle drape bien. Ce dessin existe déjà en plusieurs tailles — le catalogue montre celle de la publication.",
    },
    colors: ["#cbb9a6", "#8d8a84", "#e7dfd4"],
    images: [],
    sizes: [size(68, 68, 3900)],
  },
  {
    slug: "meadow",
    silk: "twill",
    freehand: false,
    bothSides: false,
    name: { uk: "Луг", en: "Meadow", fr: "Prairie" },
    description: {
      uk: "Метелик, джміль і жуки складені в орнамент на глибокому рожевому тлі. Деталі хочеться розглядати: кожна лінія проведена вручну.",
      en: "A butterfly, a bumblebee and beetles woven into an ornament on a deep pink ground. The details ask for a closer look: every line is drawn by hand.",
      fr: "Un papillon, un bourdon et des insectes se rejoignent en ornement sur un rose profond. Les détails se regardent de près : chaque trait est fait à la main.",
    },
    colors: ["#e36a8a", "#2f6b3a", "#f2b5c4"],
    images: [],
    sizes: [size(68, 68, 3900)],
  },
  {
    slug: "azure",
    silk: "satin",
    freehand: false,
    bothSides: false,
    name: { uk: "Лазур", en: "Azure", fr: "Azur" },
    description: {
      uk: "Глибокі сині, блакитні й фіолетові відтінки із золотавими акцентами. Атлас м’яко світиться, і хустка однаково доречна в будень і на свято.",
      en: "Deep blues, pale blues and violets with gold accents. The satin catches a soft light, and the scarf belongs both to an ordinary day and to a celebration.",
      fr: "Des bleus profonds, des bleus clairs et des violets, avec des accents d’or. Le satin prend une lumière douce, et le carré va aussi bien un jour ordinaire qu’un jour de fête.",
    },
    colors: ["#1e3a6e", "#6a8fd4", "#c6a15a"],
    images: [],
    sizes: [size(60, 60, 3200)],
  },
  {
    slug: "sheen",
    silk: "satin",
    freehand: false,
    bothSides: false,
    name: { uk: "Перелив", en: "Sheen", fr: "Lueur" },
    description: {
      uk: "Невелика атласна хустина, яка м’яко переливається на світлі і гарно драпірується. Річ, яку хочеться носити не один сезон.",
      en: "A small satin scarf that shifts softly in the light and drapes well. A piece meant to be worn for more than one season.",
      fr: "Un petit carré de satin qui change doucement à la lumière et drape bien. Une pièce à porter plus d’une saison.",
    },
    colors: ["#d7c4b0", "#f7f1ea", "#b08968"],
    images: [],
    sizes: [size(55, 55, 2900)],
  },
  {
    slug: "bloom",
    silk: "satin",
    freehand: true,
    bothSides: false,
    name: { uk: "Квітка", en: "Bloom", fr: "Fleur" },
    description: {
      uk: "Вільний розпис, у якому на шовку з’являється живопис. М’які переливи переходять у пелюстки, і кожен мазок лишає глибину, якої немає в друці.",
      en: "Freehand painting, where the silk becomes a picture. Soft shifts of colour turn into petals, and each stroke keeps a depth a print does not have.",
      fr: "Peinture libre, où la soie devient un tableau. Les couleurs glissent vers des pétales, et chaque touche garde une profondeur que l’impression n’a pas.",
    },
    colors: ["#e8b4c8", "#f6d7c3", "#a85a78"],
    images: [],
    sizes: [size(68, 68, 3900)],
  },
  {
    slug: "story",
    silk: "twill",
    freehand: false,
    bothSides: false,
    name: { uk: "Історія", en: "Story", fr: "Histoire" },
    description: {
      uk: "Велика хустка саржевого плетіння. Такі речі не купують на один вихід: вони повертаються в образи знову і лишаються в особистій колекції.",
      en: "A large twill scarf. These are not bought for a single outing: they return to outfits again and stay in a personal collection.",
      fr: "Un grand carré de sergé. On ne l’achète pas pour une seule sortie : il revient dans les tenues et reste dans une collection personnelle.",
    },
    colors: ["#6e4a3a", "#c4a574", "#2c2420"],
    images: [],
    sizes: [size(80, 80, 4300)],
  },
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function lowestPrice(product: Product) {
  return Math.min(...product.sizes.map((item) => item.priceUah));
}

export function formatSize(widthCm: number, heightCm: number) {
  return `${widthCm}×${heightCm}`;
}
