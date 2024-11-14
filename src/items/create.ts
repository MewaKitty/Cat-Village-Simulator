import { createAssignmentType } from "../assignments.ts"
import { updateInventoryItem } from "./updateInventoryItem.ts"
import { items, itemUse } from "./data.ts"
import { game } from "../game.ts"

const sellAmounts = [1, 10, 100];

export const createInventoryElem = (id: string) => {
    const itemData = items.find(item => item.id === id);
    if (itemData?.building) return createAssignmentType(itemData, true)
    const itemLi = document.createElement("li");
    itemLi.id = "inventory." + id + ".item";
    const itemTopInfo = document.createElement("div")
    itemTopInfo.textContent = `${items.find(item => item.id === id)?.name} (${items.find(item => item.id === id)?.research} research each): `;
    const itemSpan = document.createElement("span");
    itemSpan.classList.add("inventoryItemAmount");
    itemSpan.id = "inventory." + id;
    itemTopInfo.appendChild(itemSpan);
    itemLi.appendChild(itemTopInfo);
    const sellRow = document.createElement("div")
    if (itemData?.usable) {
        const useButton = document.createElement("button");
        useButton.textContent = "Use";
        useButton.addEventListener("click", () => {
            if (game.inventory[id] > 0) {
                itemUse[id]?.();
                game.inventory[id] -= 1;
                itemSpan.style.setProperty("--num", game.inventory[id] + "");
                itemSpan.setAttribute("aria-label", game.inventory[id] + "");
                if (game.inventory[id] === 0) {
                    itemLi.remove();
                };
            };
        });
        sellRow.appendChild(useButton);
    };
    for (const sellAmount of sellAmounts) {
        const analyzeButton = document.createElement("button");
        analyzeButton.textContent = "Analyze " + sellAmount + "x";
        analyzeButton.classList.add("analyzeButton")
        analyzeButton.dataset.sellAmount = sellAmount + "";
        analyzeButton.addEventListener("click", () => {
            if (game.inventory[id] >= sellAmount) {
                game.inventory[id] -= sellAmount;
                game.researchPoints += sellAmount * (itemData?.research ?? 0);
                updateInventoryItem(id);
            };
        });
        sellRow.appendChild(analyzeButton);
    }
    itemLi.appendChild(sellRow);
    document.getElementById("inventoryList")?.appendChild(itemLi);
};
