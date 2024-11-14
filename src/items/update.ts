import { game } from "../game.ts"

export const updateInventoryItem = (itemId: string) => {
    const itemSpan = document.getElementById("inventory." + itemId)!;
    itemSpan.style.setProperty("--num", game.inventory[itemId] + "");
    itemSpan.setAttribute("aria-label", game.inventory[itemId] + "");
}
