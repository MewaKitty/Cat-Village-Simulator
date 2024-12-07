import { game } from "./game.ts"
import { updateInventoryItem } from "./items/update.ts"
import { items } from "./items/data.ts"

export const getTotalAssignedLand = () => {
    const nonItem = Object.values(game.landAssignedTypes).reduce((l, c) => l + c, 0)
    let itemForm = 0;
    for (const [id, count] of Object.entries(game.inventory)) {
        const itemData = items.find(item => item.id === id)
        if (!itemData || !itemData.building) continue
        itemForm += count
    };
    return nonItem + itemForm
}

export const landAssign: Record<string, (amount: number) => void> = {
    "grass_den": (amount) => {
        game.comfort += 1 * amount;
    },
    "basic_den": (amount) => {
        game.comfort += 2 * amount;
    },
    "wooden_den": (amount) => {
        game.comfort += 5 * amount;
    },
    "stone_house": (amount) => {
        game.comfort += 10 * amount;
    },
}
const landUnassign: Record<string, (amount: number) => void> = {
    "grass_den": (amount) => {
        game.comfort -= 1 * amount;
    },
    "basic_den": (amount) => {
        game.comfort -= 2 * amount;
    },
    "wooden_den": (amount) => {
        game.comfort -= 5 * amount;
    },
    "stone_house": (amount) => {
        game.comfort -= 10 * amount;
    },
}

interface AssignmentType {
    name: string,
    id: string
}
const landAssignmentTypes: AssignmentType[] = [
    {
        "name": "Food Stockpiles",
        "id": "food_stockpiles"
    },
    {
        "name": "Research Library",
        "id": "research_library"
    },
    {
        "name": "Grass Den",
        "id": "grass_den"
    },
]
export const createAssignmentType = (assignmentType: AssignmentType, fromItem: boolean) => {
    const assignmentTypeDiv = document.createElement("div");
    const nameAndCount = document.createElement("span")
    nameAndCount.textContent = assignmentType.name + ": "
    const countSpan = document.createElement("span");
    countSpan.textContent = fromItem ? "" : "0"
    if (fromItem) countSpan.classList.add("assignmentItemCount");
    if (fromItem) {
        countSpan.id = "inventory." + assignmentType.id;
    }
    countSpan.dataset.assignmentId = assignmentType.id;
    nameAndCount.appendChild(countSpan)
    assignmentTypeDiv.appendChild(nameAndCount);
    const minusButton = document.createElement("button");
    minusButton.textContent = fromItem ? "Demolish" : "-";
    minusButton.classList.add("assignmentItemDemolish");
    minusButton.dataset.id = assignmentType.id;
    minusButton.addEventListener("click", () => {
        if (fromItem) {
            if (game.inventory[assignmentType.id] <= 0) return;
            game.inventory[assignmentType.id] -= 1;
            updateInventoryItem(assignmentType.id);
        } else {
            if (!game.landAssignedTypes[assignmentType.id]) return;
            game.landAssignedTypes[assignmentType.id] -= 1;
            countSpan.textContent = game.landAssignedTypes[assignmentType.id] + "";
            if (game.landAssignedTypes[assignmentType.id] === 0) minusButton.disabled = true;
            document.getElementById("availableLandAssignmentsSpan")!.textContent = "Available land assignments: " + (game.landAssignments - getTotalAssignedLand());
        };
        landUnassign[assignmentType.id]?.(1);
    });
    assignmentTypeDiv.appendChild(minusButton);
    if (!fromItem) {
        const plusButton = document.createElement("button");
        plusButton.textContent = "+";
        plusButton.addEventListener("click", () => {
            if (game.landAssignments - getTotalAssignedLand() <= 0) return;
            game.landAssignedTypes[assignmentType.id] ??= 0;
            game.landAssignedTypes[assignmentType.id] += 1;
            countSpan.textContent = game.landAssignedTypes[assignmentType.id] + "";
            minusButton.disabled = false;
            document.getElementById("availableLandAssignmentsSpan")!.textContent = "Available land assignments: " + (game.landAssignments - getTotalAssignedLand()); 
            landAssign[assignmentType.id]?.(1);   
        })
        assignmentTypeDiv.appendChild(plusButton);
    }
    document.getElementById("landAssignmentsList")!.appendChild(assignmentTypeDiv);
}
for (const assignmentType of landAssignmentTypes) {
    createAssignmentType(assignmentType, false);
}
