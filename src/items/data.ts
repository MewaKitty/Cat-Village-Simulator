export const items: {
    id: string,
    name: string,
    research: number,
    sell?: number,
    buy?: number,
    usable?: true,
    building?: true
}[] = [
    {
        "id": "wood",
        "name": "Wood",
        "research": 1,
        "sell": 1,
        "buy": 2
    },
    {
        "id": "water_cup",
        "name": "Water Cup",
        "research": 1
    },
    {
        "id": "basic_den",
        "name": "Basic Den",
        "research": 2,
        "building": true
    },
    {
        "id": "wooden_plank",
        "name": "Wooden Plank",
        "research": 3
    },
    {
        "id": "wooden_den",
        "name": "Wooden Den",
        "research": 5,
        "building": true
    },
    {
        "id": "stone",
        "name": "Stone",
        "research": 5
    },
    {
        "id": "stone_bricks",
        "name": "Stone Bricks",
        "research": 10
    },
    {
        "id": "stone_house",
        "name": "Stone House",
        "research": 20,
        "building": true
    },
    {
        "id": "wood_press",
        "name": "Wood Press",
        "research": 10
    },
];
export const itemUse: Record<string, () => void> = {
};
