import { game } from "../game.ts"
import { landAssign } from "../assignments.ts"
import { updateInventoryItem } from "./update.ts"
import { items } from "./data.ts"

export const addInventoryItem = (itemId: string, amount: number) => {
    const itemData = items.find(item => item.id === itemId)
    game.inventory[itemId] += amount
    if (itemData?.building) {
        landAssign[itemId]?.(amount);
    }
    updateInventoryItem(itemId)
}