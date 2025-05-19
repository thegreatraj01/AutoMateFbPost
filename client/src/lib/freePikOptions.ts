import {
    Square,
    RectangleHorizontal,
    RectangleVertical,
    Smartphone,
    Monitor,
    Image as ImageIcon,
    LayoutGrid,
    LucideIcon,
} from "lucide-react";

export interface AspectRatioOption {
    label: string;
    value: string;
    icon: LucideIcon;
}


// Array for Freepik Flux API aspect ratios with label and icon
export const fluxAspectRatios: AspectRatioOption[] = [
    { label: "1:1", value: "square_1_1", icon: Square },
    { label: "4:3", value: "classic_4_3", icon: Monitor },
    { label: "3:4", value: "traditional_3_4", icon: RectangleVertical },
    { label: "16:9", value: "widescreen_16_9", icon: RectangleHorizontal },
    { label: "9:16", value: "social_story_9_16", icon: Smartphone },
    { label: "3:2", value: "standard_3_2", icon: RectangleHorizontal },
    { label: "2:3", value: "portrait_2_3", icon: RectangleVertical },
    { label: "2:1", value: "horizontal_2_1", icon: RectangleHorizontal },
    { label: "1:2", value: "vertical_1_2", icon: RectangleVertical },
    { label: "4:5", value: "social_post_4_5", icon: ImageIcon }
];

// Array for Freepik Classic Fast API aspect ratios with label and icon
export const classicFastAspectRatios: AspectRatioOption[] = [
    { label: "1:1", value: "square_1_1", icon: Square },
    { label: "4:3", value: "classic_4_3", icon: Monitor },
    { label: "3:4", value: "traditional_3_4", icon: RectangleVertical },
    { label: "16:9", value: "widescreen_16_9", icon: RectangleHorizontal },
    { label: "9:16", value: "social_story_9_16", icon: Smartphone },
    { label: "20:9", value: "smartphone_horizontal_20_9", icon: RectangleHorizontal },
    { label: "9:20", value: "smartphone_vertical_9_20", icon: RectangleVertical },
    { label: "3:2", value: "standard_3_2", icon: RectangleHorizontal },
    { label: "2:3", value: "portrait_2_3", icon: RectangleVertical },
    { label: "2:1", value: "horizontal_2_1", icon: RectangleHorizontal },
    { label: "1:2", value: "vertical_1_2", icon: RectangleVertical },
    { label: "5:4", value: "social_5_4", icon: LayoutGrid },
    { label: "4:5", value: "social_post_4_5", icon: ImageIcon }
];


export const FREEPIK_FLUX_OPTIONS = {

    aspect_ratios: [
        "square_1_1",
        "classic_4_3",
        "traditional_3_4",
        "widescreen_16_9",
        "social_story_9_16",
        "standard_3_2",
        "portrait_2_3",
        "horizontal_2_1",
        "vertical_1_2",
        "social_post_4_5"
    ],
    // styling.effects.color
    color_effects: [
        "softhue",
        "b&w",
        "goldglow",
        "vibrant",
        "coldneon"
    ],

    // styling.effects.framing
    framing_effects: [
        "portrait",
        "lowangle",
        "midshot",
        "wideshot",
        "tiltshot",
        "aerial"
    ],

    // styling.effects.lightning
    lightning_effects: [
        "iridescent",
        "dramatic",
        "goldenhour",
        "longexposure",
        "indoorlight",
        "flash",
        "neon"
    ]
};

export const FREEPIK_CLASSIC_FAST_OPTIONS = {
    aspect_ratios: [
        "square_1_1",
        "classic_4_3",
        "traditional_3_4",
        "widescreen_16_9",
        "social_story_9_16",
        "smartphone_horizontal_20_9",
        "smartphone_vertical_9_20",
        "standard_3_2",
        "portrait_2_3",
        "horizontal_2_1",
        "vertical_1_2",
        "social_5_4",
        "social_post_4_5"
    ],
    // styling.style
    styles: [
        "photo",
        "digital-art",
        "3d",
        "painting",
        "low-poly",
        "pixel-art",
        "anime",
        "cyberpunk",
        "comic",
        "vintage",
        "cartoon",
        "vector",
        "studio-shot",
        "dark",
        "sketch",
        "mockup",
        "2000s-pone",
        "70s-vibe",
        "watercolor",
        "art-nouveau",
        "origami",
        "surreal",
        "fantasy",
        "traditional-japan"
    ],
    // styling.effects.color
    color_effects: [
        "b&w",
        "pastel",
        "sepia",
        "dramatic",
        "vibrant",
        "orange&teal",
        "film-filter",
        "split",
        "electric",
        "pastel-pink",
        "gold-glow",
        "autumn",
        "muted-green",
        "deep-teal",
        "duotone",
        "terracotta&teal",
        "red&blue",
        "cold-neon",
        "burgundy&blue"
    ],

    // styling.effects.lightning
    lightning_effects: [
        "studio",
        "warm",
        "cinematic",
        "volumetric",
        "golden-hour",
        "long-exposure",
        "cold",
        "iridescent",
        "dramatic",
        "hardlight",
        "redscale",
        "indoor-light"
    ],
    //styling.effects.framing
    framing_effects: [
        "portrait",
        "macro",
        "panoramic",
        "aerial-view",
        "close-up",
        "cinematic",
        "high-angle",
        "low-angle",
        "symmetry",
        "fish-eye",
        "first-person"
    ],
    // styling.colors
    colors: [
        {
            "color": "#FF5733",
            "weight": 1
        },
        {
            "color": "#33FF57",
            "weight": 1
        }
    ]
};