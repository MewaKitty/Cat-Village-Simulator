import { createAssignmentType } from "../assignments.ts"
import { game } from "../game.ts"
import { landAssign } from "../assignments.ts"

const sellAmounts = [1, 10, 100];

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
const itemUse: Record<string, () => void> = {
};


export const addInventoryItem = (itemId: string, amount: number) => {
    const itemData = items.find(item => item.id === itemId)
    game.inventory[itemId] += amount
    if (itemData?.building) {
        landAssign[itemId]?.(amount);
    }
}
export const updateInventoryItem = (itemId: string) => {
    const itemSpan = document.getElementById("inventory." + itemId)!;
    itemSpan.style.setProperty("--num", game.inventory[itemId] + "");
    itemSpan.setAttribute("aria-label", game.inventory[itemId] + "");
}
