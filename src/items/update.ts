import { game } from "../game.ts"
import { createInventoryElem } from "./create.ts"

export const updateInventoryItem = (itemId: string) => {
    createInventoryElem(itemId)
    const itemSpan = document.getElementById("inventory." + itemId)!;
    itemSpan.style.setProperty("--num", game.inventory[itemId] + "");
    itemSpan.setAttribute("aria-label", game.inventory[itemId] + "");
}
